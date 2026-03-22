"use strict";
const utils = require('../utils');
const mqtt = require('mqtt');
const websocket = require('websocket-stream');
const HttpsProxyAgent = require('https-proxy-agent');
const EventEmitter = require('events');
const { parseDelta } = require('./mqttDeltaValue');
const { globalAutoReLoginManager } = require('../utils/autoReLogin');

let form = {};
let getSeqID;

const topics = [
    "/ls_req", "/ls_resp", "/legacy_web", "/webrtc", "/rtc_multi", "/onevc", "/br_sr", "/sr_res",
    "/t_ms", "/thread_typing", "/orca_typing_notifications", "/notify_disconnect",
    "/orca_presence", "/inbox", "/mercury", "/messaging_events",
    "/orca_message_notifications", "/pp", "/webrtc_response"
];
const MQTT_MAX_BACKOFF = 30000;
const MQTT_JITTER_MAX = 1000;
const MQTT_QUICK_CLOSE_WINDOW_MS = 2000;
const MQTT_QUICK_CLOSE_THRESHOLD = 3;

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getRandomReconnectTime() {
    const min = 26 * 60 * 1000;
    const max = 60 * 60 * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculate(previousTimestamp, currentTimestamp){
    return Math.floor(previousTimestamp + (currentTimestamp - previousTimestamp) + 300);
}

function computeBackoffDelay(ctx, baseDelay, maxBackoff, jitterMax) {
    const attempt = ctx._reconnectAttempts || 0;
    const base = Number.isFinite(baseDelay) && baseDelay > 0 ? baseDelay : 2000;
    const max = Number.isFinite(maxBackoff) && maxBackoff > 0 ? maxBackoff : MQTT_MAX_BACKOFF;
    const jitterCap = Number.isFinite(jitterMax) && jitterMax >= 0 ? jitterMax : MQTT_JITTER_MAX;
    const backoff = Math.min(base * Math.pow(1.6, attempt), max);
    const jitter = Math.floor(Math.random() * jitterCap);
    return Math.round(backoff + jitter);
}

/**
 * @param {Object} ctx
 * @param {Object} api
 * @param {string} threadID
 */
function markAsRead(ctx, api, threadID) {
    if (ctx.globalOptions.autoMarkRead && threadID) {
        api.markAsRead(threadID, (err) => {
            if (err) utils.error("autoMarkRead", err);
        });
    }
}

/**
 * @param {Object} defaultFuncs
 * @param {Object} api
 * @param {Object} ctx
 * @param {Function} globalCallback
 */
async function listenMqtt(defaultFuncs, api, ctx, globalCallback, scheduleReconnect) {
    function isEndingLikeError(msg) {
        return /No subscription existed|client disconnecting|socket hang up|ECONNRESET/i.test(msg || "");
    }
    function guard(label, fn) {
        return (...args) => {
            try {
                return fn(...args);
            } catch (err) {
                utils.error("MQTT", `${label} handler error:`, err && err.message ? err.message : err);
            }
        };
    }

    if (ctx._reconnectTimer) {
        clearTimeout(ctx._reconnectTimer);
        ctx._reconnectTimer = null;
    }
    if (ctx._tmsTimeout) {
        clearTimeout(ctx._tmsTimeout);
        ctx._tmsTimeout = null;
    }
    if (ctx._mqttWatchdog) {
        clearInterval(ctx._mqttWatchdog);
        ctx._mqttWatchdog = null;
    }
    if (ctx.mqttClient) {
        try { ctx.mqttClient.removeAllListeners(); } catch (_) { }
        try { ctx.mqttClient.end(true); } catch (_) { }
    }

    const chatOn = ctx.globalOptions.online;
    const region = ctx.region;
    const foreground = false;
    const sessionID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1;
    const cid = ctx.clientID;
    const cachedUA = ctx.globalOptions.cachedUserAgent || ctx.globalOptions.userAgent;
    const username = {
        u: ctx.userID,
        s: sessionID,
        chat_on: chatOn,
        fg: false,
        d: cid,
        ct: 'websocket',
        aid: 219994525426954,
        aids: null,
        mqtt_sid: '',
        cp: 3,
        ecp: 10,
        st: [],
        pm: [],
        dc: '',
        no_auto_fg: true,
        gas: null,
        pack: [],
        p: null,
        php_override: ""
    };
    const cookies = ctx.jar.getCookiesSync('https://www.facebook.com').join('; ');
    let host;
    if (ctx.mqttEndpoint) {
        host = `${ctx.mqttEndpoint}&sid=${sessionID}&cid=${cid}`;
    } else if (region) {
        host = `wss://edge-chat.facebook.com/chat?region=${region.toLowerCase()}&sid=${sessionID}&cid=${cid}`;
    } else {
        host = `wss://edge-chat.facebook.com/chat?sid=${sessionID}&cid=${cid}`;
    }

    utils.log("Connecting to MQTT...", host);

    const cachedSecChUa = ctx.globalOptions.cachedSecChUa || '"Google Chrome";v="136", "Not;A=Brand";v="99", "Chromium";v="136"';
    const cachedSecChUaPlatform = ctx.globalOptions.cachedSecChUaPlatform || '"Windows"';
    const cachedLocale = ctx.globalOptions.cachedLocale || 'en-US,en;q=0.9';

    // Generate a unique client ID per session like a real browser would
    const mqttClientId = 'mqttwsclient_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const options = {
        clientId: mqttClientId,
        protocolId: 'MQIsdp',
        protocolVersion: 3,
        username: JSON.stringify(username),
        clean: true,
        wsOptions: {
            headers: {
                'Cookie': cookies,
                'Origin': 'https://www.facebook.com',
                'User-Agent': cachedUA,
                'Referer': 'https://www.facebook.com/',
                'Host': 'edge-chat.facebook.com',
                'Connection': 'Upgrade',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
                'Upgrade': 'websocket',
                'Sec-WebSocket-Version': '13',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': cachedLocale,
                'Sec-Ch-Ua': cachedSecChUa,
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': cachedSecChUaPlatform,
                'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits'
            },
            origin: 'https://www.facebook.com',
            protocolVersion: 13,
            binaryType: 'arraybuffer'
        },
        keepalive: 60,
        reschedulePings: true,
        connectTimeout: 10000,
        reconnectPeriod: 0
    };

    if (ctx.globalOptions.proxy) options.wsOptions.agent = new HttpsProxyAgent(ctx.globalOptions.proxy);
    ctx._mqttLastConnectAttemptAt = Date.now();
    const mqttClient = new mqtt.Client(_ => websocket(host, options.wsOptions), options);
    mqttClient.publishSync = mqttClient.publish.bind(mqttClient);
    mqttClient.publish = (topic, message, opts = {}, callback = () => {}) => new Promise((resolve, reject) => {
            mqttClient.publishSync(topic, message, opts, (err, data) => {
            if (err) {
                callback(err);
                reject(err);
            }
            callback(null, data);
            resolve(data);
        });
    });
    ctx.mqttClient = mqttClient;

    mqttClient.on('error', guard("error", (err) => {
        const msg = String(err && err.message ? err.message : err || "");

        if ((ctx._ending || ctx._cycling) && isEndingLikeError(msg)) {
            utils.log("MQTT", "Expected error during shutdown: " + msg);
            return;
        }

        if (ctx._tmsTimeout) {
            clearTimeout(ctx._tmsTimeout);
            ctx._tmsTimeout = null;
        }
        if (ctx._mqttWatchdog) {
            clearInterval(ctx._mqttWatchdog);
            ctx._mqttWatchdog = null;
        }
        ctx._mqttConnected = false;

        if (/Not logged in|Not logged in\.|blocked the login|checkpoint|401|403/i.test(msg)) {
            try { mqttClient.end(true); } catch (_) { }
            try { if (ctx._autoCycleTimer) clearInterval(ctx._autoCycleTimer); } catch (_) { }
            emitAuthError(/blocked|checkpoint/i.test(msg) ? "login_blocked" : "not_logged_in", msg);
            return;
        }

        utils.error("MQTT error:", msg);
        try { mqttClient.end(true); } catch (_) { }

        if (ctx._ending || ctx._cycling) return;

        if (ctx.globalOptions.autoReconnect) {
            const baseDelay = (ctx._mqttOpt && ctx._mqttOpt.reconnectDelayMs) || 2000;
            ctx._reconnectAttempts = (ctx._reconnectAttempts || 0) + 1;
            const d = computeBackoffDelay(ctx, baseDelay, MQTT_MAX_BACKOFF, MQTT_JITTER_MAX);
            utils.warn("MQTT", `Auto-reconnecting in ${d}ms (attempt ${ctx._reconnectAttempts}) due to error`);
            scheduleReconnect(d);
        } else {
            globalCallback({ type: "stop_listen", error: msg || "Connection refused" });
        }
    }));

    mqttClient.on('connect', guard("connect", async () => {
        if (!ctx._mqttConnected) {
            utils.log("MQTT connected successfully");
            ctx._mqttConnected = true;
        }
        ctx._cycling = false;
        ctx._reconnectAttempts = 0;
        ctx._mqttQuickCloseCount = 0;
        if (ctx._reconnectTimer) {
            clearTimeout(ctx._reconnectTimer);
            ctx._reconnectTimer = null;
        }
        ctx.loggedIn = true;
        ctx._lastMqttMessageAt = Date.now();
        if (ctx._mqttWatchdog) {
            clearInterval(ctx._mqttWatchdog);
            ctx._mqttWatchdog = null;
        }
        const watchdogInterval = (ctx._mqttOpt && ctx._mqttOpt.watchdogIntervalMs) || 60000;
        const staleMs = (ctx._mqttOpt && ctx._mqttOpt.staleMs) || 300000;
        ctx._mqttWatchdog = setInterval(() => {
            if (ctx._ending || ctx._cycling || !ctx.globalOptions.autoReconnect) return;
            const last = ctx._lastMqttMessageAt || 0;
            if (last && Date.now() - last > staleMs) {
                utils.warn("MQTT", `No MQTT activity for ${Date.now() - last}ms, cycling connection`);
                try { mqttClient.end(true); } catch (_) { }
                scheduleReconnect((ctx._mqttOpt && ctx._mqttOpt.reconnectDelayMs) || 2000);
            }
        }, watchdogInterval);

        mqttClient.subscribe(topics, { qos: 1 });

        const queue = { 
            sync_api_version: 11, 
            max_deltas_able_to_process: 200, 
            delta_batch_size: 200, 
            encoding: "JSON", 
            entity_fbid: ctx.userID,
            initial_titan_sequence_id: ctx.lastSeqId,
            device_params: null
        };

        let topic;
        if (ctx.syncToken) {
            topic = "/messenger_sync_get_diffs";
            queue.last_seq_id = ctx.lastSeqId;
            queue.sync_token = ctx.syncToken;
        } else {
            topic = "/messenger_sync_create_queue";
        }

        mqttClient.publish(topic, JSON.stringify(queue), { qos: 1, retain: false });
        mqttClient.publish("/foreground_state", JSON.stringify({ foreground: chatOn }), { qos: 1 });
        mqttClient.publish("/set_client_settings", JSON.stringify({ make_user_available_when_in_foreground: true }), { qos: 1 });

        const tmsTimeoutDelay = 10000;
        ctx._tmsTimeout = setTimeout(() => {
            ctx._tmsTimeout = null;
            if (ctx._ending || ctx._cycling) return;
            if (!ctx.globalOptions.autoReconnect) {
                utils.warn("MQTT", "t_ms timeout but autoReconnect is disabled");
                return;
            }
            utils.warn("MQTT", `t_ms timeout after ${tmsTimeoutDelay}ms, will cycle connection`);
            try { mqttClient.end(true); } catch (_) { }
            const baseDelay = (ctx._mqttOpt && ctx._mqttOpt.reconnectDelayMs) || 2000;
            scheduleReconnect(baseDelay);
        }, tmsTimeoutDelay);

        ctx.tmsWait = function() {
            if (ctx._tmsTimeout) {
                clearTimeout(ctx._tmsTimeout);
                ctx._tmsTimeout = null;
            }
            if (ctx.globalOptions.emitReady) {
                globalCallback(null, { type: "ready", timestamp: Date.now() });
            }
            delete ctx.tmsWait;
        };
    }));

    mqttClient.on('message', guard("message", async (topic, message, _packet) => {
        try {
            ctx._lastMqttMessageAt = Date.now();
            let jsonMessage = Buffer.isBuffer(message) ? Buffer.from(message).toString() : message;
            try { jsonMessage = JSON.parse(jsonMessage); } catch (_) { jsonMessage = {}; }

            if (jsonMessage.type === "jewel_requests_add") {
                globalCallback(null, { 
                    type: "friend_request_received", 
                    actorFbId: jsonMessage.from.toString(), 
                    timestamp: Date.now().toString() 
                });
            } else if (jsonMessage.type === "jewel_requests_remove_old") {
                globalCallback(null, { 
                    type: "friend_request_cancel", 
                    actorFbId: jsonMessage.from.toString(), 
                    timestamp: Date.now().toString() 
                });
            } else if (topic === "/t_ms") {
                if (ctx.tmsWait && typeof ctx.tmsWait === "function") ctx.tmsWait();

                if (jsonMessage.firstDeltaSeqId && jsonMessage.syncToken) {
                    ctx.lastSeqId = jsonMessage.firstDeltaSeqId;
                    ctx.syncToken = jsonMessage.syncToken;
                }
                if (jsonMessage.lastIssuedSeqId) {
                    ctx.lastSeqId = parseInt(jsonMessage.lastIssuedSeqId);
                }

                if (jsonMessage.deltas) {
                    for (const delta of jsonMessage.deltas) {
                        parseDelta(defaultFuncs, api, ctx, globalCallback, { delta });
                    }
                }
            } else if (topic === "/thread_typing" || topic === "/orca_typing_notifications") {
                const typ = {
                    type: "typ",
                    isTyping: !!jsonMessage.state,
                    from: jsonMessage.sender_fbid.toString(),
                    threadID: utils.formatID((jsonMessage.thread || jsonMessage.sender_fbid).toString())
                };
                globalCallback(null, typ);
            } else if (topic === "/orca_presence") {
                if (!ctx.globalOptions.updatePresence && jsonMessage.list) {
                    for (const data of jsonMessage.list) {
                        globalCallback(null, { 
                            type: "presence", 
                            userID: String(data.u), 
                            timestamp: data.l * 1000, 
                            statuses: data.p 
                        });
                    }
                }
            }
        } catch (ex) {
            utils.error("MQTT message parse error:", ex && ex.message ? ex.message : ex);
        }
    }));

    mqttClient.on('close', guard("close", () => {
        utils.warn("MQTT", "Connection closed");
        if (ctx._tmsTimeout) {
            clearTimeout(ctx._tmsTimeout);
            ctx._tmsTimeout = null;
        }
        if (ctx._mqttWatchdog) {
            clearInterval(ctx._mqttWatchdog);
            ctx._mqttWatchdog = null;
        }
        ctx._mqttConnected = false;
        if (ctx._ending || ctx._cycling) return;
        if (!ctx._mqttConnected) {
            const now = Date.now();
            const lastAttempt = ctx._mqttLastConnectAttemptAt || 0;
            if (lastAttempt && now - lastAttempt <= MQTT_QUICK_CLOSE_WINDOW_MS) {
                ctx._mqttQuickCloseCount = (ctx._mqttQuickCloseCount || 0) + 1;
            } else {
                ctx._mqttQuickCloseCount = 0;
            }
            if (ctx._mqttQuickCloseCount >= MQTT_QUICK_CLOSE_THRESHOLD) {
                ctx._mqttQuickCloseCount = 0;
                if (!ctx._mqttReauthing && globalAutoReLoginManager && globalAutoReLoginManager.isEnabled && globalAutoReLoginManager.isEnabled()) {
                    ctx._mqttReauthing = true;
                    globalAutoReLoginManager.handleSessionExpiry(api, 'https://www.facebook.com', "MQTT quick close loop")
                        .then((ok) => {
                            ctx._mqttReauthing = false;
                            if (ok && ctx.globalOptions.autoReconnect) {
                                ctx._reconnectAttempts = 0;
                                scheduleReconnect((ctx._mqttOpt && ctx._mqttOpt.reconnectDelayMs) || 2000);
                            }
                        })
                        .catch(() => { ctx._mqttReauthing = false; });
                }
            }
        }

        if (ctx.globalOptions.autoReconnect) {
            ctx._reconnectAttempts = (ctx._reconnectAttempts || 0) + 1;
            const baseDelay = (ctx._mqttOpt && ctx._mqttOpt.reconnectDelayMs) || 2000;
            const d = computeBackoffDelay(ctx, baseDelay, MQTT_MAX_BACKOFF, MQTT_JITTER_MAX);
            utils.warn("MQTT", `Reconnecting in ${d}ms (attempt ${ctx._reconnectAttempts})`);
            scheduleReconnect(d);
        }
    }));

    mqttClient.on('disconnect', guard("disconnect", () => {
        utils.log("MQTT", "Disconnected");
        if (ctx._tmsTimeout) {
            clearTimeout(ctx._tmsTimeout);
            ctx._tmsTimeout = null;
        }
        if (ctx._mqttWatchdog) {
            clearInterval(ctx._mqttWatchdog);
            ctx._mqttWatchdog = null;
        }
        ctx._mqttConnected = false;
    }));

    mqttClient.on('offline', guard("offline", () => {
        utils.warn("MQTT", "Connection went offline");
        if (ctx._tmsTimeout) {
            clearTimeout(ctx._tmsTimeout);
            ctx._tmsTimeout = null;
        }
        if (ctx._mqttWatchdog) {
            clearInterval(ctx._mqttWatchdog);
            ctx._mqttWatchdog = null;
        }
        ctx._mqttConnected = false;
        if (!ctx._ending && !ctx._cycling && ctx.globalOptions.autoReconnect) {
            try { mqttClient.end(true); } catch (_) { }
        }
    }));
}

const MQTT_DEFAULTS = { 
    cycleMs: 60 * 60 * 1000, 
    reconnectDelayMs: 2000, 
    autoReconnect: true,
    watchdogIntervalMs: 60000,
    staleMs: 300000,
    reconnectAfterStop: false 
};

function mqttConf(ctx, overrides) {
    ctx._mqttOpt = Object.assign({}, MQTT_DEFAULTS, ctx._mqttOpt || {}, overrides || {});
    if (typeof ctx._mqttOpt.autoReconnect === "boolean") {
        ctx.globalOptions.autoReconnect = ctx._mqttOpt.autoReconnect;
    }
    return ctx._mqttOpt;
}

module.exports = (defaultFuncs, api, ctx, opts) => {
    const identity = () => {};
    let globalCallback = identity;

    function emitAuthError(reason, detail) {
        try { if (ctx._autoCycleTimer) clearTimeout(ctx._autoCycleTimer); } catch (_) { }
        try { if (ctx._reconnectTimer) clearTimeout(ctx._reconnectTimer); } catch (_) { }
        try { ctx._ending = true; } catch (_) { }
        try { if (ctx.mqttClient) ctx.mqttClient.end(true); } catch (_) { }
        ctx.mqttClient = undefined;
        ctx.loggedIn = false;
        
        const msg = detail || reason;
        utils.error("AUTH", `Authentication error -> ${reason}: ${msg}`);
        
        if (typeof globalCallback === "function") {
            globalCallback({
                type: "account_inactive",
                reason: reason,
                error: msg,
                requiresReLogin: true,
                timestamp: Date.now()
            }, null);
        }
        try {
            if (globalAutoReLoginManager && globalAutoReLoginManager.isEnabled && globalAutoReLoginManager.isEnabled()) {
                globalAutoReLoginManager.handleSessionExpiry(api, 'https://www.facebook.com', "Session expired").then((ok) => {
                    if (ok && ctx._listeningActive && typeof api.listenMqtt === 'function') {
                        try {
                            if (typeof api.stopListening === 'function') {
                                try { api.stopListening(); } catch (_) {}
                            }
                            const cb = ctx._lastListenCallback || null;
                            if (cb) {
                                api.listenMqtt(cb);
                            } else {
                                api.listenMqtt();
                            }
                        } catch (_) {}
                    }
                }).catch(() => {});
            }
        } catch (_) {}
    }

    function installPostGuard() {
        if (ctx._postGuarded) return defaultFuncs.post;
        const rawPost = defaultFuncs.post && defaultFuncs.post.bind(defaultFuncs);
        if (!rawPost) return defaultFuncs.post;

        function postSafe(...args) {
            const lastArg = args[args.length - 1];
            const hasCallback = typeof lastArg === 'function';
            
            if (hasCallback) {
                const originalCallback = args[args.length - 1];
                args[args.length - 1] = function(err, ...cbArgs) {
                    if (err) {
                        const msg = (err && err.error) || (err && err.message) || String(err || "");
                        if (/Not logged in|Not logged in\.|blocked the login|checkpoint|security check|session.*expir|invalid.*session|authentication.*fail|auth.*fail/i.test(msg)) {
                            emitAuthError(
                                /blocked|checkpoint|security/i.test(msg) ? "login_blocked" : "not_logged_in",
                                msg
                            );
                        }
                    }
                    return originalCallback(err, ...cbArgs);
                };
                return rawPost(...args);
            } else {
                const result = rawPost(...args);
                if (result && typeof result.catch === 'function') {
                    return result.catch(err => {
                        const msg = (err && err.error) || (err && err.message) || String(err || "");
                        if (/Not logged in|Not logged in\.|blocked the login|checkpoint|security check|session.*expir|invalid.*session|authentication.*fail|auth.*fail/i.test(msg)) {
                            emitAuthError(
                                /blocked|checkpoint|security/i.test(msg) ? "login_blocked" : "not_logged_in",
                                msg
                            );
                        }
                        throw err;
                    });
                }
                return result;
            }
        }
        defaultFuncs.post = postSafe;
        ctx._postGuarded = true;
        utils.log("MQTT", "PostSafe guard installed for anti-automation detection");
        return postSafe;
    }

    function scheduleReconnect(delayMs) {
        const d = (ctx._mqttOpt && ctx._mqttOpt.reconnectDelayMs) || 2000;
        const ms = typeof delayMs === "number" ? delayMs : d;
        if (ctx._ending) return;
        if (ctx._reconnectTimer) return;
        utils.warn("MQTT", `Will reconnect in ${ms}ms`);
        ctx._reconnectTimer = setTimeout(() => {
            ctx._reconnectTimer = null;
            getSeqIDWrapper();
        }, ms);
    }

    let conf = mqttConf(ctx, opts);
    installPostGuard();

    getSeqID = async () => {
        try {
            form = {
                av: ctx.globalOptions.pageID,
                queries: JSON.stringify({
                    o0: {
                        doc_id: "3336396659757871",
                        query_params: {
                            limit: 1,
                            before: null,
                            tags: ["INBOX"],
                            includeDeliveryReceipts: false,
                            includeSeqID: true
                        }
                    }
                })
            };
            utils.log("MQTT", "Getting sequence ID...");
            ctx.t_mqttCalled = false;
            const resData = await defaultFuncs.post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form).then(utils.parseAndCheckLogin(ctx, defaultFuncs));
            
            if (utils.getType(resData) !== "Array") {
                throw { error: "Not logged in" };
            }
            if (!Array.isArray(resData) || !resData.length) {
                throw { error: "getSeqID: empty response" };
            }
            
            const lastRes = resData[resData.length - 1];
            if (lastRes && lastRes.successful_results === 0) {
                throw { error: "getSeqID: no successful results" };
            }
            
            const syncSeqId = resData[0] && resData[0].o0 && resData[0].o0.data && resData[0].o0.data.viewer && resData[0].o0.data.viewer.message_threads && resData[0].o0.data.viewer.message_threads.sync_sequence_id;
            if (syncSeqId) {
                ctx.lastSeqId = syncSeqId;
                ctx._cycling = false;
                utils.log("MQTT", "getSeqID ok -> listenMqtt()");
                listenMqtt(defaultFuncs, api, ctx, globalCallback, scheduleReconnect);
            } else {
                throw { error: "getSeqID: no sync_sequence_id found" };
            }
        } catch (err) {
            const detail = (err && err.detail && err.detail.message) ? ` | detail=${err.detail.message}` : "";
            const msg = ((err && err.error) || (err && err.message) || String(err || "")) + detail;
            
            if (/Not logged in/i.test(msg)) {
                utils.error("MQTT", "Auth error in getSeqID: Not logged in");
                return emitAuthError("not_logged_in", msg);
            }
            if (/blocked the login|checkpoint|security check|session.*expir|invalid.*session|authentication.*fail|auth.*fail|login.*block|account.*lock|verification.*requir/i.test(msg)) {
                utils.error("MQTT", "Auth error in getSeqID: Session/Login blocked");
                return emitAuthError("login_blocked", msg);
            }
            
            utils.error("MQTT", "getSeqID error:", msg);
            if (ctx.globalOptions.autoReconnect) {
                const baseDelay = (ctx._mqttOpt && ctx._mqttOpt.reconnectDelayMs) || 2000;
                ctx._reconnectAttempts = (ctx._reconnectAttempts || 0) + 1;
                const d = computeBackoffDelay(ctx, baseDelay, MQTT_MAX_BACKOFF, MQTT_JITTER_MAX);
                utils.warn("MQTT", `getSeqID failed, will retry in ${d}ms`);
                scheduleReconnect(d);
            }
        }
    };

    function getSeqIDWrapper() {
        utils.log("MQTT", "getSeqID call");
        return getSeqID()
            .then(() => { 
                utils.log("MQTT", "getSeqID done");
                ctx._cycling = false;
            })
            .catch(e => { 
                utils.error("MQTT", `getSeqID error: ${e && e.message ? e.message : e}`);
                if (ctx.globalOptions.autoReconnect) {
                    ctx._reconnectAttempts = (ctx._reconnectAttempts || 0) + 1;
                    const baseDelay = (ctx._mqttOpt && ctx._mqttOpt.reconnectDelayMs) || 2000;
                    scheduleReconnect(computeBackoffDelay(ctx, baseDelay, MQTT_MAX_BACKOFF, MQTT_JITTER_MAX));
                }
            });
    }

    function isConnected() {
        return !!(ctx.mqttClient && ctx.mqttClient.connected);
    }

    function unsubAll(cb) {
        if (!isConnected()) return cb && cb();
        let pending = topics.length;
        if (!pending) return cb && cb();
        let fired = false;
        topics.forEach(t => {
            ctx.mqttClient.unsubscribe(t, () => {
                if (--pending === 0 && !fired) { 
                    fired = true; 
                    cb && cb(); 
                }
            });
        });
    }

    function endQuietly(next) {
        const finish = () => {
            try { 
                ctx.mqttClient && ctx.mqttClient.removeAllListeners(); 
            } catch (_) { }
            if (ctx._tmsTimeout) {
                clearTimeout(ctx._tmsTimeout);
                ctx._tmsTimeout = null;
            }
            if (ctx._reconnectTimer) {
                clearTimeout(ctx._reconnectTimer);
                ctx._reconnectTimer = null;
            }
            if (ctx._mqttWatchdog) {
                clearInterval(ctx._mqttWatchdog);
                ctx._mqttWatchdog = null;
            }
            ctx.mqttClient = undefined;
            ctx.lastSeqId = null;
            ctx.syncToken = undefined;
            ctx.t_mqttCalled = false;
            ctx._ending = false;
            ctx._mqttConnected = false;
            next && next();
        };
        try {
            if (ctx.mqttClient) {
                if (isConnected()) { 
                    try { 
                        ctx.mqttClient.publish("/browser_close", "{}"); 
                    } catch (_) { } 
                }
                ctx.mqttClient.end(true, finish);
            } else finish();
        } catch (_) { 
            finish(); 
        }
    }

    function delayedReconnect() {
        const d = conf.reconnectDelayMs;
        utils.log("MQTT", `Reconnect in ${d}ms`);
        setTimeout(() => getSeqIDWrapper(), d);
    }

    function forceCycle() {
        if (ctx._cycling) return;
        ctx._cycling = true;
        ctx._ending = true;
        utils.warn("MQTT", "Force cycle begin");
        unsubAll(() => endQuietly(() => delayedReconnect()));
    }

    return (callback) => {
        class MessageEmitter extends EventEmitter {
            stopListening(callback2) {
                const cb = callback2 || function() {};
                utils.log("MQTT", "Stop requested");
                globalCallback = identity;
                ctx._listeningActive = false;

                if (ctx._autoCycleTimer) {
                    clearInterval(ctx._autoCycleTimer);
                    ctx._autoCycleTimer = null;
                    utils.log("MQTT", "Auto-cycle cleared");
                }

                if (ctx._reconnectTimer) {
                    clearTimeout(ctx._reconnectTimer);
                    ctx._reconnectTimer = null;
                    utils.log("MQTT", "Reconnect timer cleared");
                }

                if (ctx._tmsTimeout) {
                    clearTimeout(ctx._tmsTimeout);
                    ctx._tmsTimeout = null;
                    utils.log("MQTT", "TMS timeout cleared");
                }
                if (ctx._mqttWatchdog) {
                    clearInterval(ctx._mqttWatchdog);
                    ctx._mqttWatchdog = null;
                    utils.log("MQTT", "Watchdog cleared");
                }

                ctx._ending = true;
                ctx._reconnectAttempts = 0;
                unsubAll(() => endQuietly(() => {
                    utils.log("MQTT", "Stopped successfully");
                    cb();
                    conf = mqttConf(ctx, conf);
                    if (conf.reconnectAfterStop) delayedReconnect();
                }));
            }

            async stopListeningAsync() {
                return new Promise(resolve => { 
                    this.stopListening(resolve); 
                });
            }
        }

        const msgEmitter = new MessageEmitter();

        globalCallback = callback || function(error, message) {
            if (error) { 
                utils.error("MQTT", "Emit error");
                return msgEmitter.emit("error", error); 
            }
            if (message && (message.type === "message" || message.type === "message_reply")) {
                markAsRead(ctx, api, message.threadID);
            }
            msgEmitter.emit("message", message);
        };

        ctx._listeningActive = true;
        ctx._lastListenCallback = callback || null;

        conf = mqttConf(ctx, conf);

        if (!ctx.firstListen) ctx.lastSeqId = null;
        ctx.syncToken = undefined;
        ctx.t_mqttCalled = false;

        if (ctx._autoCycleTimer) {
            clearTimeout(ctx._autoCycleTimer);
            ctx._autoCycleTimer = null;
        }

        function scheduleAutoCycle() {
            const base = conf.cycleMs;
            if (!base || base <= 0) return;
            const jitter = Math.floor(base * (0.2 + Math.random() * 0.4));
            const next = base + (Math.random() > 0.5 ? jitter : -jitter);
            ctx._autoCycleTimer = setTimeout(() => {
                ctx._autoCycleTimer = null;
                forceCycle();
                scheduleAutoCycle();
            }, next);
            utils.log("MQTT", `Auto-cycle scheduled: ${next}ms`);
        }
        if (conf.cycleMs && conf.cycleMs > 0) {
            scheduleAutoCycle();
        } else {
            utils.log("MQTT", "Auto-cycle disabled");
        }

        if (!ctx.firstListen || !ctx.lastSeqId) {
            getSeqIDWrapper();
        } else {
            utils.log("MQTT", "Starting listenMqtt");
            listenMqtt(defaultFuncs, api, ctx, globalCallback, scheduleReconnect);
        }

        if (ctx.firstListen) {
            api.markAsReadAll().catch(err => {
                utils.error("Failed to mark all messages as read on startup:", err);
            });
        }

        ctx.firstListen = false;

        api.stopListening = msgEmitter.stopListening;
        api.stopListeningAsync = msgEmitter.stopListeningAsync;
        return msgEmitter;
    };
};
