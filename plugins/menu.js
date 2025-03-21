const { cmd, commands } = require("../command");
const config = require('../config');

// Store pending menu requests
const pendingMenus = new Map();

// Emoji reactions for each command category
const categoryReactions = {
  main: "👑",
  download: "📥",
  group: "👥",
  owner: "🔒",
  convert: "🔄",
  search: "🔍",
  ai: "🤖",
  fun: "🎮",
  sticker: "🎭",
  tools: "🛠️"
};

cmd(
  {
    pattern: "menu",
    alias: ["getmenu", "list"],
    react: "🌬️",
    desc: "Get command list",
    category: "main",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      // Categorize commands with 100+ commands
      let menu = {
        main: [
          "alive", "help", "menu", "ping", "info", "status", "support", "rules", 
          "report", "donate", "script", "dev", "owner", "profile", "uptime"
        ],
        download: [
          "song", "video", "yt", "ytmp3", "ytmp4", "play", "playlist", "spotify",
          "spotifydl", "igdl", "instadl", "fbdl", "tiktok", "twitter", "gitclone"
        ],
        group: [
          "add", "kick", "promote", "demote", "groupinfo", "tagall", "hidetag",
          "settitle", "setdesc", "setpp", "mute", "unmute", "link", "revoke"
        ],
        owner: [
          "shutdown", "restart", "update", "setvar", "getvar", "delvar", "block",
          "unblock", "join", "leave", "broadcast", "eval", "term", "prefix"
        ],
        convert: [
          "sticker", "toimg", "tovideo", "tomp3", "tourl", "tts", "attp",
          "emojimix", "carbon", "enhance", "remini", "blur", "circle"
        ],
        search: [
          "google", "yts", "lyrics", "weather", "dictionary", "wiki", "github",
          "image", "imdb", "news", "anime", "manga", "pinterest"
        ],
        ai: [
          "ai", "chatgpt", "gpt", "dalle", "imagine", "bard", "gemini", "blackbox"
        ],
        fun: [
          "joke", "meme", "quote", "fact", "truth", "dare", "ship", "gay",
          "howgay", "simprate", "stupidrate", "handsomerate", "poll"
        ],
        sticker: [
          "sticker", "s", "stickermeme", "steal", "emojimix", "attp", "ttp"
        ],
        tools: [
          "calculator", "translate", "tts", "currency", "shorturl", "qr", "ocr",
          "removebg", "scan", "encode", "decode", "ipinfo", "password"
        ]
      };
      
      // Format main menu
      const mainMenu = `╭────༺❄️༻────╮
   ༺ FROZEN-QUEEN-MD ༻
   ༺❅ THE ROYAL ICE KINGDOM ❅༻
╰────༺❄️༻────╯

╔══════ஓ๑❄️๑ஓ══════╗
     ✧･ﾟ: ✧･ﾟ: BOT MENU :･ﾟ✧:･ﾟ✧
╚══════ஓ๑❄️๑ஓ══════╝

┊ ༄ᶦᶰᶠᵒ❆ 👑 Hello ${pushname || "Ice Wielder"}

╔══•ೋ❅ COMMAND CATEGORIES ❅ೋ•══╗
┊ ༄ᶦᶰᶠᵒ❆ ${categoryReactions.main} 1 ➢ Main Commands
┊ ༄ᶦᶰᶠᵒ❆ ${categoryReactions.download} 2 ➢ Download Commands
┊ ༄ᶦᶰᶠᵒ❆ ${categoryReactions.group} 3 ➢ Group Commands
┊ ༄ᶦᶰᶠᵒ❆ ${categoryReactions.owner} 4 ➢ Owner Commands
┊ ༄ᶦᶰᶠᵒ❆ ${categoryReactions.convert} 5 ➢ Convert Commands
┊ ༄ᶦᶰᶠᵒ❆ ${categoryReactions.search} 6 ➢ Search Commands
┊ ༄ᶦᶰᶠᵒ❆ ${categoryReactions.ai} 7 ➢ AI Commands
┊ ༄ᶦᶰᶠᵒ❆ ${categoryReactions.fun} 8 ➢ Fun Commands
┊ ༄ᶦᶰᶠᵒ❆ ${categoryReactions.sticker} 9 ➢ Sticker Commands
┊ ༄ᶦᶰᶠᵒ❆ ${categoryReactions.tools} 10 ➢ Tools Commands
╚══════༺❅❄️❅༻══════╝

  ┈┈┈┈┈┈༻❄️༺┈┈┈┈┈┈
     ✧･ﾟ: ✧･ﾟ: THE COLD NEVER BOTHERED ME ANYWAY :･ﾟ✧:･ﾟ✧

Reply to this message with a number (1-10) to view commands`;

      // Create a forwarded message appearance
      const forwardingScore = Math.floor(Math.random() * 5) + 1; // Random forwarding score between 1-5
      
      // Send the main menu with forwarded attribute
      const sentMsg = await robin.sendMessage(
        from,
        {
          image: {
            url: "https://raw.githubusercontent.com/chathurahansaka1/help/ec4f09d2db8155a1a8fe01dd69043172922e82ac/src/239a768b-9285-451a-b812-2575a322aa5b.jpg",
          },
          caption: mainMenu,
          contextInfo: {
            isForwarded: true,
            forwardingScore: forwardingScore,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363025046789867@newsletter", // Replace with your channel JID
              newsletterName: "FROZEN-QUEEN UPDATES", // Replace with your channel name
              newsletterLink: "https://whatsapp.com/channel/120363025046789867", // Replace with your channel link
              serverMessageId: Date.now().toString(),
            }
          }
        },
        { quoted: mek }
      );
      
      // React to the sent message
      await robin.sendMessage(from, { react: { text: "❄️", key: sentMsg.key } });
      
      // Get message ID to track replies
      const messageID = sentMsg.key.id;
      
      // Store the menu with the message ID
      pendingMenus.set(messageID, {
        menu,
        from,
        mek,
        time: Date.now() // Add timestamp to potentially clean up old menus later
      });
      
      // Function to generate category menu
      function generateCategoryMenu(categoryNumber, menu) {
        const categories = ['main', 'download', 'group', 'owner', 'convert', 'search', 'ai', 'fun', 'sticker', 'tools'];
        const categoryTitles = ['Main Commands', 'Download Commands', 'Group Commands', 'Owner Commands', 
                               'Convert Commands', 'Search Commands', 'AI Commands', 'Fun Commands', 
                               'Sticker Commands', 'Tools Commands'];
        
        const categoryIndex = categoryNumber - 1;
        if (categoryIndex < 0 || categoryIndex >= categories.length) {
          return null;
        }
        
        const category = categories[categoryIndex];
        const title = categoryTitles[categoryIndex];
        const reaction = categoryReactions[category];
        
        // Format commands with prefixes and reactions
        let commandList = '';
        for (const cmd of menu[category]) {
          commandList += `┊ ༄ᶦᶰᶠᵒ❆ ${reaction} .${cmd}\n`;
        }
        
        return `╭────༺❄️༻────╮
   ༺ FROZEN-QUEEN-MD ༻
   ༺❅ THE ROYAL ICE KINGDOM ❅༻
╰────༺❄️༻────╯

╔══════ஓ๑❄️๑ஓ══════╗
     ✧･ﾟ: ✧･ﾟ: ${title.toUpperCase()} :･ﾟ✧:･ﾟ✧
╚══════ஓ๑❄️๑ஓ══════╝

${commandList}
  ┈┈┈┈┈┈༻❄️༺┈┈┈┈┈┈

╔══•ೋ❅ USAGE INFO ❅ೋ•══╗
┊ ༄ᶦᶰᶠᵒ❆ Type .help <command> for details
┊ ༄ᶦᶰᶠᵒ❆ Example: .help sticker
╚══════༺❅❄️❅༻══════╝

  ┈┈┈┈┈┈༻❄️༺┈┈┈┈┈┈
     ✧･ﾟ: ✧･ﾟ: THE COLD NEVER BOTHERED ME ANYWAY :･ﾟ✧:･ﾟ✧

Type .menu to return to main menu`;
      }
      
      // Listen for replies to menus
      robin.ev.on("messages.upsert", async (messageUpdate) => {
        try {
          const mekInfo = messageUpdate.messages[0];
          if (!mekInfo.message) return;
          
          // Check if this is a reply to one of our menu messages
          const replyStanzaId = mekInfo.message.extendedTextMessage?.contextInfo?.stanzaId;
          const replyChatId = mekInfo.message.extendedTextMessage?.contextInfo?.participant;
          
          // If this is a reply and we have this menu stored
          if (replyStanzaId && pendingMenus.has(replyStanzaId)) {
            const menuData = pendingMenus.get(replyStanzaId);
            
            // Make sure it's a reply in the same chat
            if (mekInfo.key.remoteJid === menuData.from) {
              const userReply = mekInfo.message.extendedTextMessage?.text || '';
              const userChoice = parseInt(userReply.trim());
              
              // Check if reply is a valid menu choice
              if (userChoice >= 1 && userChoice <= 10) {
                // React to user's message with the category's emoji
                const category = Object.keys(categoryReactions)[userChoice - 1];
                await robin.sendMessage(menuData.from, { react: { text: categoryReactions[category], key: mekInfo.key } });
                
                // Generate the category menu
                const categoryMenu = generateCategoryMenu(userChoice, menuData.menu);
                
                if (categoryMenu) {
                  // Send the selected menu to the user with forwarded appearance
                  await robin.sendMessage(
                    menuData.from,
                    {
                      image: {
                        url: "https://raw.githubusercontent.com/chathurahansaka1/help/ec4f09d2db8155a1a8fe01dd69043172922e82ac/src/239a768b-9285-451a-b812-2575a322aa5b.jpg",
                      },
                      caption: categoryMenu,
                      contextInfo: {
                        isForwarded: true,
                        forwardingScore: forwardingScore,
                        forwardedNewsletterMessageInfo: {
                          newsletterJid: "120363025046789867@newsletter", // Replace with your channel JID
                          newsletterName: "FROZEN-QUEEN UPDATES", // Replace with your channel name
                          newsletterLink: "https://whatsapp.com/channel/120363025046789867", // Replace with your channel link
                          serverMessageId: Date.now().toString(),
                        }
                      }
                    },
                    { quoted: mekInfo }
                  );
                }
              }
            }
          }
        } catch (err) {
          console.log("Error in message listener:", err);
        }
      });
      
      // Optional: Set up a cleanup mechanism for old menu entries (e.g., after 1 hour)
      setTimeout(() => {
        const now = Date.now();
        for (const [key, value] of pendingMenus.entries()) {
          if (now - value.time > 3600000) { // 1 hour in milliseconds
            pendingMenus.delete(key);
          }
        }
      }, 3600000); // Run cleanup every hour
      
    } catch (e) {
      console.log(e);
      await robin.sendMessage(from, { react: { text: "❌", key: mek.key } });
      await reply(`❌ *An error occurred:* ${e.message || "Error!"}`);
    }
  }
);
