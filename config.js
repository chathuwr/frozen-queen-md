const fs = require("fs");
if (fs.existsSync("config.env")) {
  require("dotenv").config({ path: "./config.env" });
}

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}

const now = new Date();

module.exports = {
  SESSION_ID: process.env.SESSION_ID || "MYRwkJoI#lkQ4RPKEG6LkP20VjHOmiafIEms_D_ryhJkIZdh9jN0",
  OWNER_NUM: process.env.OWNER_NUM || "94702560019",
  PREFIX: process.env.PREFIX || ".",
  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/chathurahansaka1/help/main/src/cdbe3771-c89d-4ee9-a7d6-254d0c321c8a.jpg",
  ALIVE_MSG: process.env.ALIVE_MSG || `
╔══════════════════════════════╗
║  🌟 *❄️Frozen Queen❄️ WHATSAPP BOT* 🌟  ║
╠══════════════════════════════╣
║                              ║
║ ▢ Hi there 🪄                ║
║ ▢ *Type:* Node.js           ║
║ ▢ *Version:* 2.0.0          ║
║ ▢ *Owner:* Chathura Hansaka ║
║ ▢ *Prefix:*  .             ║
║                              ║
╠═══ *SYSTEM INFO* ══════════╣
║ ▢ *RAM:*                    ║
║ ▢ *Uptime:*                 ║
║ ▢ *Platform:* Windows       ║
║ ▢ *CPU:* 10%                ║
║                              ║
╠═══ *TIME INFO* ════════════╣
║ ▢ *Time:* ${now.toLocaleTimeString()}   ║
║ ▢ *Date:* ${now.toLocaleDateString()}   ║
║                              ║
╠═══ *BOT STATS* ═════════════╣
║ ▢ *Commands:* 30+           ║
║ ▢ *Speed:*                  ║
║ ▢ *Status:* Active          ║
║                              ║
╚══════════════════════════════╝
> Made by Chathura
  `,
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
  MODE: process.env.MODE || "public",
  AUTO_VOICE: process.env.AUTO_VOICE || "true",
  AUTO_STICKER: process.env.AUTO_STICKER || "true",
  AUTO_REPLY : process.env.AUTO_REPLY || "true",
  AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS || "true",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY  || "AIzaSyBiSb7bbTIFpXsTntRAdyHYdqwjG_hVYy4",
  MOVIE_API_KEY:process.env.MOVIE_API_KEY || "sky|c9276ebad25fd135593f13cd0f699524c0bd828d",
  FB_API_KEY:process.env.FB_API_KEY || "sky|f4896be611207393334a47605181ea769d660c3d"
};

