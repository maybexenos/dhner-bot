module.exports = {
	config: {
		name: "onlyadminbox",
		aliases: ["onlyadbox", "adboxonly", "adminboxonly"],
		version: "1.5",
		author: "S1FU",
		countDown: 5,
		role: 1,
		description: {
			vi: "Quản lý quyền hạn sử dụng Bot trong nhóm",
			en: "Manage Bot usage permissions in the group"
		},
		category: "Hệ Thống",
		guide: {
			vi: "   『 {pn} on/off 』: Bật/Tắt chế độ chỉ Quản trị viên\n   『 {pn} noti on/off 』: Bật/Tắt thông báo cảnh báo",
			en: "   『 {pn} on/off 』: Enable/Disable Admin-only mode\n   『 {pn} noti on/off 』: Enable/Disable warning notifications"
		}
	},

	langs: {
		vi: {
			turnedOn: "『 🟢 』 ➜ Đã kích hoạt chế độ: 𝗢𝗡𝗟𝗬 𝗔𝗗𝗠𝗜𝗡.\n『 🛡️ 』 ➜ Hiện tại chỉ Quản trị viên mới có thể điều khiển Bot.",
			turnedOff: "『 🔴 』 ➜ Đã hủy bỏ chế độ: 𝗢𝗡𝗟𝗬 𝗔𝗗𝗠𝗜𝗡.\n『 👥 』 ➜ Tất cả thành viên đều có thể sử dụng Bot.",
			turnedOnNoti: "『 ✅ 』 ➜ Cấu hình: 𝗦𝗘𝗡𝗗 𝗡𝗢𝗧𝗜 đã được Bật.\n『 🔔 』 ➜ Bot sẽ gửi thông báo khi người dùng vi phạm quyền hạn.",
			turnedOffNoti: "『 ❌ 』 ➜ Cấu hình: 𝗦𝗘𝗡𝗗 𝗡𝗢𝗧𝗜 đã được Tắt.\n『 🔕 』 ➜ Bot sẽ im lặng khi người dùng không đủ quyền hạn.",
			syntaxError: "『 ⚠️ 』 ➜ Sai cú pháp! Vui lòng sử dụng:\n『 💡 』 ➜ {pn} [on | off] hoặc {pn} noti [on | off]"
		},
		en: {
			turnedOn: "『 🟢 』 ➜ Mode 𝗢𝗡𝗟𝗬 𝗔𝗗𝗠𝗜𝗡 has been Enabled.\n『 🛡️ 』 ➜ Only Group Admins can now interact with the Bot.",
			turnedOff: "『 🔴 』 ➜ Mode 𝗢𝗡𝗟𝗬 𝗔𝗗𝗠𝗜𝗡 has been Disabled.\n『 👥 』 ➜ All members can now use the Bot freely.",
			turnedOnNoti: "『 ✅ 』 ➜ Config: 𝗦𝗘𝗡𝗗 𝗡𝗢𝗧𝗜 is now ON.\n『 🔔 』 ➜ Bot will notify when non-admin users attempt to use commands.",
			turnedOffNoti: "『 ❌ 』 ➜ Config: 𝗦𝗘𝗡𝗗 𝗡𝗢𝗧𝗜 is now OFF.\n『 🔕 』 ➜ Bot will remain silent for non-admin interactions.",
			syntaxError: "『 ⚠️ 』 ➜ Invalid Syntax!\n『 💡 』 ➜ Use {pn} [on | off] or {pn} noti [on | off]"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {
		let isSetNoti = false;
		let value;
		let keySetData = "data.onlyAdminBox";
		let indexGetVal = 0;

		if (args[0] == "noti") {
			isSetNoti = true;
			indexGetVal = 1;
			keySetData = "data.hideNotiMessageOnlyAdminBox";
		}

		if (args[indexGetVal] == "on")
			value = true;
		else if (args[indexGetVal] == "off")
			value = false;
		else
			return message.reply(getLang("syntaxError"));

		// Logic: hideNoti = true nghĩa là KHÔNG thông báo, nên ta dùng !value khi người dùng chọn 'on'
		await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);

		const response = isSetNoti 
			? (value ? getLang("turnedOnNoti") : getLang("turnedOffNoti"))
			: (value ? getLang("turnedOn") : getLang("turnedOff"));

		return message.reply(`━━━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━━━`);
	}
};