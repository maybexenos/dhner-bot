module.exports = {
        config: {
                name: "role",
                version: "1.0",
                author: "NeoKEX",
                countDown: 5,
                role: 2,
                description: {
                        vi: "Quản lý vai trò người dùng",
                        en: "Manage user roles"
                },
                category: "admin",
                guide: {
                        vi: '   {pn} [view: -v] <uid: @tag>: Xem vai trò của người dùng'
                                + '\n   {pn} [set: -s] <uid: @tag> <role>: Đặt vai trò cho người dùng'
                                + '\n   {pn} [list: -l]: Liệt kê tất cả vai trò'
                                + '\n   {pn} [info: -i]: Xem thông tin về hệ thống vai trò',
                        en: '   {pn} [view: -v] <uid: @tag>: View user role'
                                + '\n   {pn} [set: -s] <uid: @tag> <role>: Set user role'
                                + '\n   {pn} [list: -l]: List all roles'
                                + '\n   {pn} [info: -i]: View role system information'
                }
        },

        langs: {
                vi: {
                        roleInfo: "📋 Hệ thống vai trò:\n"
                                + "• Role 0: Tất cả người dùng\n"
                                + "• Role 1: Quản trị viên nhóm\n"
                                + "• Role 2: Admin bot (có thể set 0-2)\n"
                                + "• Role 3: Người dùng cao cấp (tự động khi có 2000+ tiền)\n"
                                + "• Role 4: Nhà phát triển bot (chỉ dev mới set được)\n"
                                + "\n! Lưu ý: Role 3 tự động dựa vào số dư, không nên set thủ công",
                        currentRole: "👤 Vai trò hiện tại của %1: Role %2",
                        roleSet: "✓ Đã đặt vai trò của %1 thành Role %2",
                        invalidRole: "! Vai trò không hợp lệ. Vui lòng chọn từ 0-2 (admin chỉ có thể set 0-2)",
                        noPermission: "! Bạn không có quyền đặt vai trò này.\nRole 3-4 chỉ developer mới set được.",
                        missingId: "! Vui lòng nhập ID hoặc tag người dùng",
                        roleList: " Danh sách người dùng có vai trò tùy chỉnh:\n%1"
                },
                en: {
                        roleInfo: "📋 Role System:\n"
                                + "• Role 0: All users\n"
                                + "• Role 1: Group administrators\n"
                                + "• Role 2: Bot admins (can set 0-2)\n"
                                + "• Role 3: Premium users (auto at 2000+ balance)\n"
                                + "• Role 4: Bot developers (only devs can set)\n"
                                + "\n! Note: Role 3 is auto-based on balance, don't set manually",
                        currentRole: "👤 Current role of %1: Role %2",
                        roleSet: "✓ Set role of %1 to Role %2",
                        invalidRole: "! Invalid role. Choose 0-2 (admins can only set 0-2)",
                        noPermission: "! You don't have permission to set this role.\nOnly developers can set roles 3-4.",
                        missingId: "! Enter ID or tag user",
                        roleList: " List of users with custom roles:\n%1"
                }
        },

        onStart: async function ({ message, args, usersData, event, getLang, role }) {
                switch (args[0]) {
                        case "view":
                        case "-v": {
                                let uid = event.senderID;
                                if (args[1]) {
                                        if (Object.keys(event.mentions).length > 0)
                                                uid = Object.keys(event.mentions)[0];
                                        else if (event.messageReply)
                                                uid = event.messageReply.senderID;
                                        else if (!isNaN(args[1]))
                                                uid = args[1];
                                }
                                const userData = await usersData.get(uid);
                                const userName = await usersData.getName(uid);
                                let userRole = 0;
                                
                                if (userData.data && userData.data.customRole)
                                        userRole = userData.data.customRole;
                                
                                if (userData.money >= 2000 && userRole < 3)
                                        userRole = 3;
                                
                                const botDevelopers = global.SizuBot.config.botDevelopers || [];
                                if (botDevelopers.includes(uid))
                                        userRole = 4;
                                
                                const adminBot = global.SizuBot.config.adminBot || [];
                                if (adminBot.includes(uid) && userRole < 2)
                                        userRole = 2;
                                
                                return message.reply(getLang("currentRole", userName, userRole));
                        }
                        case "set":
                        case "-s": {
                                if (!args[1])
                                        return message.reply(getLang("missingId"));
                                
                                let uid;
                                if (Object.keys(event.mentions).length > 0)
                                        uid = Object.keys(event.mentions)[0];
                                else if (event.messageReply)
                                        uid = event.messageReply.senderID;
                                else if (!isNaN(args[1]))
                                        uid = args[1];
                                else
                                        return message.reply(getLang("missingId"));
                                
                                const newRole = parseInt(args[2] || args[args.length - 1]);
                                
                                if (isNaN(newRole) || newRole < 0 || newRole > 4)
                                        return message.reply(getLang("invalidRole"));
                                
                                const botDevelopers = global.SizuBot.config.botDevelopers || [];
                                const isDeveloper = botDevelopers.includes(event.senderID);
                                
                                if (!isDeveloper && newRole === 4)
                                        return message.reply(getLang("noPermission"));
                                
                                if (!isDeveloper && newRole >= 3)
                                        return message.reply(getLang("noPermission"));
                                
                                if (role < 2 && newRole >= 2)
                                        return message.reply(getLang("noPermission"));
                                
                                try {
                                        const userData = await usersData.get(uid);
                                        if (!userData.data)
                                                userData.data = {};
                                        userData.data.customRole = newRole;
                                        await usersData.set(uid, userData);
                                        const userName = await usersData.getName(uid);
                                        return message.reply(getLang("roleSet", userName, newRole));
                                } catch (err) {
                                        console.error("Error setting role:", err);
                                        return message.reply("× Error setting role: " + err.message);
                                }
                        }
                        case "list":
                        case "-l": {
                                const allUsers = global.db.allUserData;
                                const usersWithRoles = allUsers.filter(u => u.data && u.data.customRole && u.data.customRole > 0);
                                
                                if (usersWithRoles.length === 0)
                                        return message.reply("No users with custom roles");
                                
                                const roleList = await Promise.all(usersWithRoles.map(async u => {
                                        const name = await usersData.getName(u.userID);
                                        return `• ${name} (${u.userID}): Role ${u.data.customRole}`;
                                }));
                                
                                return message.reply(getLang("roleList", roleList.join("\n")));
                        }
                        case "info":
                        case "-i":
                                return message.reply(getLang("roleInfo"));
                        default:
                                return message.SyntaxError();
                }
        }
};