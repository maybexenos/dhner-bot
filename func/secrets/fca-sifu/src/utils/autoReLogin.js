"use strict";

const utils = require('./index');

class AutoReLoginManager {
    constructor() {
        this.credentials = null;
        this.loginOptions = null;
        this.loginCallback = null;
        this.isReLoggingIn = false;
        this.pendingRequests = [];
        this.maxRetries = 5;
        this.retryCount = 0;
        this.onReLoginSuccess = null;
        this.onReLoginFailure = null;
        this.enabled = false;
        this.reLoginInterval = 1000 * 60 * 60 * 24;
        this.sessionMonitorInterval = null;
        this.sessionCheckInterval = 1000 * 60 * 120;
        this._retryResetTimer = null;
        this._apiRef = null;
    }

    setCredentials(credentials, options, callback) {
        this.credentials = credentials;
        this.loginOptions = options || {};
        this.loginCallback = callback;
        this.enabled = true;
    }

    startSessionMonitoring(api) {
        if (api) this._apiRef = api;
        const activeApi = api || this._apiRef;

        if (this.sessionMonitorInterval) {
            clearInterval(this.sessionMonitorInterval);
        }

        if (!this.enabled || !activeApi) return;

        this.sessionMonitorInterval = setInterval(async () => {
            if (this.isReLoggingIn) return;

            try {
                const isValid = typeof activeApi.isSessionValid === 'function'
                    ? await activeApi.isSessionValid()
                    : true;
                if (!isValid) {
                    utils.warn("AutoReLogin", "Session health check failed, triggering automatic re-login");
                    await this.handleSessionExpiry(activeApi, 'https://www.facebook.com', "Session expired during monitoring");
                }
            } catch (error) {
                utils.error("AutoReLogin", "Session monitoring error:", error && error.message ? error.message : error);
            }
        }, this.sessionCheckInterval);

        utils.log("AutoReLogin", `Session monitoring started (interval: ${this.sessionCheckInterval}ms)`);
    }

    stopSessionMonitoring() {
        if (this.sessionMonitorInterval) {
            clearInterval(this.sessionMonitorInterval);
            this.sessionMonitorInterval = null;
            utils.log("AutoReLogin", "Session monitoring stopped");
        }
    }

    isEnabled() {
        return this.enabled && this.credentials !== null;
    }

    _scheduleRetryReset(delayMs) {
        if (this._retryResetTimer) return;
        const ms = delayMs || 1000 * 60 * 30;
        this._retryResetTimer = setTimeout(() => {
            this._retryResetTimer = null;
            if (this.retryCount >= this.maxRetries) {
                utils.log("AutoReLogin", "Re-login retry count reset after cool-down period. Will attempt re-login again on next session expiry.");
                this.retryCount = 0;
            }
        }, ms);
    }

    async handleSessionExpiry(api, fbLink, ERROR_RETRIEVING) {
        if (!this.isEnabled()) {
            utils.warn("AutoReLogin", "Auto re-login not enabled. Credentials not stored.");
            return false;
        }

        if (this._apiRef === null && api) this._apiRef = api;

        if (this.isReLoggingIn) {
            utils.log("AutoReLogin", "Re-login already in progress. Queuing request...");
            return new Promise((resolve, reject) => {
                this.pendingRequests.push({ resolve, reject });
            });
        }

        if (this.retryCount >= this.maxRetries) {
            utils.error("AutoReLogin", `Maximum re-login attempts (${this.maxRetries}) exceeded. Will retry after cool-down.`);
            this._scheduleRetryReset(1000 * 60 * 30);
            if (this.onReLoginFailure) {
                this.onReLoginFailure(new Error("Max re-login retries exceeded"));
            }
            return false;
        }

        this.isReLoggingIn = true;
        this.retryCount++;
        utils.log("AutoReLogin", `Starting automatic re-login (attempt ${this.retryCount}/${this.maxRetries})...`);

        try {
            await this.pauseAPIRequests();

            const loginHelperModel = require('../engine/models/loginHelper');
            const setOptionsModel = require('../engine/models/setOptions');
            const buildAPIModel = require('../engine/models/buildAPI');

            await new Promise((resolve, reject) => {
                loginHelperModel(
                    this.credentials,
                    this.loginOptions,
                    (loginError, newApi) => {
                        if (loginError) {
                            reject(loginError);
                            return;
                        }

                        if (api) {
                            api.ctx = newApi.ctx;
                            api.defaultFuncs = newApi.defaultFuncs;

                            if (api.tokenRefreshManager) {
                                api.tokenRefreshManager.resetFailureCount();
                            }
                        }

                        resolve(newApi);
                    },
                    setOptionsModel,
                    buildAPIModel,
                    api,
                    fbLink,
                    ERROR_RETRIEVING
                );
            });

            utils.log("AutoReLogin", "Re-login successful! Session restored.");
            this.retryCount = 0;
            this.isReLoggingIn = false;

            if (this._retryResetTimer) {
                clearTimeout(this._retryResetTimer);
                this._retryResetTimer = null;
            }

            this.resolvePendingRequests(true);

            if (this.onReLoginSuccess) {
                this.onReLoginSuccess();
            }

            try {
                if (api && api.listenMqtt && api.ctx && api.ctx._listeningActive) {
                    try {
                        if (typeof api.stopListening === 'function') {
                            try { api.stopListening(); } catch (_) {}
                        }
                        const cb = api.ctx._lastListenCallback || null;
                        if (cb) {
                            api.listenMqtt(cb);
                        } else {
                            api.listenMqtt();
                        }
                    } catch (_) {}
                }
            } catch (_) {}

            this.startSessionMonitoring(api);

            return true;
        } catch (error) {
            utils.error("AutoReLogin", `Re-login failed:`, error && error.message ? error.message : error);
            this.isReLoggingIn = false;

            if (this.retryCount >= this.maxRetries) {
                this.resolvePendingRequests(false);
                this._scheduleRetryReset(1000 * 60 * 30);
                if (this.onReLoginFailure) {
                    this.onReLoginFailure(error);
                }
                return false;
            }

            const backoffDelay = Math.min(60000, Math.pow(2, this.retryCount) * 2000);
            utils.log("AutoReLogin", `Retrying re-login in ${backoffDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));

            return await this.handleSessionExpiry(api, fbLink, ERROR_RETRIEVING);
        }
    }

    async pauseAPIRequests() {
        utils.log("AutoReLogin", "Pausing API requests during re-login...");
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    resolvePendingRequests(success) {
        utils.log("AutoReLogin", `Resolving ${this.pendingRequests.length} pending requests (success: ${success})`);

        this.pendingRequests.forEach(({ resolve, reject }) => {
            if (success) {
                resolve(true);
            } else {
                reject(new Error("Re-login failed"));
            }
        });

        this.pendingRequests = [];
    }

    setReLoginSuccessCallback(callback) {
        this.onReLoginSuccess = callback;
    }

    setReLoginFailureCallback(callback) {
        this.onReLoginFailure = callback;
    }

    updateAppState(appState) {
        if (!this.credentials) return;
        if (!Array.isArray(appState) || appState.length === 0) return;
        if (!this.credentials.appState || Array.isArray(this.credentials.appState) || typeof this.credentials.appState === "string") {
            this.credentials.appState = appState;
        }
    }

    disable() {
        this.enabled = false;
        this.stopSessionMonitoring();
        this.credentials = null;
        this.loginOptions = null;
        this.loginCallback = null;
        if (this._retryResetTimer) {
            clearTimeout(this._retryResetTimer);
            this._retryResetTimer = null;
        }
        utils.log("AutoReLogin", "Auto re-login disabled and credentials cleared");
    }

    reset() {
        this.retryCount = 0;
        this.isReLoggingIn = false;
        this.pendingRequests = [];
        if (this._retryResetTimer) {
            clearTimeout(this._retryResetTimer);
            this._retryResetTimer = null;
        }
    }
}

const globalAutoReLoginManager = new AutoReLoginManager();

module.exports = {
    AutoReLoginManager,
    globalAutoReLoginManager
};
