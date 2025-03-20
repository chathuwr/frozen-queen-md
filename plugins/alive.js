const { cmd, commands } = require('../command')
const config = require('../config');
const os = require('os');

cmd({
    pattern: "alive",
    alias: ["queen"],
    react: "❄️",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async(robin, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
    try {  
        // Send presence update
        await robin.sendPresenceUpdate('recording', from);

        // Send voice note if AUTO_VOICE is true
        if (config.AUTO_VOICE === "true") {
            await robin.sendMessage(from, { 
                audio: { 
                    url: "https://github.com/chathurahansaka1/help/raw/refs/heads/main/audio/WhatsApp%20Audio%202025-03-18%20at%203.25.32%20AM.mpeg" 
                }, 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: mek });
        }

        // Send sticker if AUTO_STICKER is true
        if (config.AUTO_STICKER === "true") {
            await robin.sendMessage(from, {
                sticker: { 
                    url: "https://github.com/chathurahansaka1/help/raw/refs/heads/main/sticker/cebf62bc-2fe8-444d-9416-282ccaf826c2.webp"
                },
                package: '❄️Frozen Queen❄️'
            }, { quoted: mek });
        }

        // Get dynamic values from config functions
        const ramUsage = config.getRAMUsage();
        const sriLankanTime = config.getSriLankanTime();
        const sriLankanDate = config.getSriLankanDate();
        const uptime = config.getUptime();
        const botSpeed = config.getBotSpeed();

        // Prepare the alive message with dynamic values
        const aliveMessage = config.ALIVE_MSG
            .replace("{RAM_USAGE}", ramUsage)
            .replace("{SRI_LANKAN_TIME}", sriLankanTime)
            .replace("{SRI_LANKAN_DATE}", sriLankanDate)
            .replace("{UPTIME}", uptime)
            .replace("{BOT_SPEED}", botSpeed);

        // Send the final message with image
        await robin.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: aliveMessage
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});
