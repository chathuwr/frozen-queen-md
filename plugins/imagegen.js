const { cmd, commands } = require("../command");

// Main Image Generation Command
cmd(
  {
    pattern: "gen",
    react: "🎨",
    desc: "Generate an image using AI",
    category: "image",
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
      // Check if a prompt is provided
      if (!q) return reply("Ex: `.generate a futuristic cityscape`");

      const prompt = q.trim();

      // Notify user of progress
      const processingMsg = await reply("🎨 *Processing Image Generation...*");

      // Handle reactions safely
      try {
        if (processingMsg && processingMsg.key) {
          await robin.sendMessage(from, { react: { text: "⏳", key: processingMsg.key } });
        }
      } catch (reactionError) {
        console.log("Reaction error:", reactionError);
      }

      // API configuration using Stable Diffusion or any other image generation API
      const API_URL = `https://stabledifffusion.com/imagen/${encodeURIComponent(prompt)}?width=1024&height=1024`;

      // Fetch image from API
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      // Check if the response is OK
      if (!response.ok) {
        // Try to react with error emoji
        try {
          if (processingMsg && processingMsg.key) {
            await robin.sendMessage(from, { react: { text: "❌", key: processingMsg.key } });
          }
        } catch (reactionError) {
          console.log("Reaction error:", reactionError);
        }
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const imageUrl = API_URL; // Directly use the URL as image source

      // Try to change reaction to success on the processing message
      try {
        if (processingMsg && processingMsg.key) {
          await robin.sendMessage(from, { react: { text: "✅", key: processingMsg.key } });
        }
      } catch (reactionError) {
        console.log("Reaction error:", reactionError);
      }

      // Send the generated image with the caption
      const imageMsg = await robin.sendMessage(
        from,
        {
          image: { url: imageUrl },
          caption: `*🎨 Generated Image 🎨*\n\n📝 *Prompt*: ${prompt}\n\n*Made with 💙 by CH*`,
        },
        { quoted: mek }
      );

      // Try to add reaction to the image message
      try {
        if (imageMsg && imageMsg.key) {
          await robin.sendMessage(from, { react: { text: "🎨", key: imageMsg.key } });
        }
      } catch (reactionError) {
        console.log("Reaction error:", reactionError);
      }

    } catch (e) {
      console.error("Error in image generation:", e); // Log full error for debugging
      return reply(`❌ Error: ${e.message || "Something went wrong. Please try again later."}`);
    }
  }
);

// Command to show help for image generation
cmd(
  {
    pattern: "genhelp",
    react: "ℹ️",
    desc: "Help for Image Generation",
    category: "image",
    filename: __filename,
  },
  async (robin, mek, m, { from, reply }) => {
    try {
      const helpText = `*🎨 Image Generation Help 🎨*

*Available Commands:*
• .generate [prompt] - Generate an image using AI
• .genhelp - Show this help message

*Example:*
.generate a futuristic cityscape

*Notes:*
- Make sure to provide a clear and descriptive prompt
- Images may take time to generate depending on complexity
- Some prompts may not generate the desired result

> *Made BY Frozen Queen team ❄️ *`;

      // Send help message with image
      const helpMsg = await robin.sendMessage(from, {
        image: { url: "https://github.com/chathurahansaka1/help/blob/main/src/f52f8647-b0fd-4f66-9cfa-00087fc06f9b.jpg?raw=true" },
        caption: helpText,
      });

      // Try to add reaction to the help message
      try {
        if (helpMsg && helpMsg.key) {
          await robin.sendMessage(from, { react: { text: "ℹ️", key: helpMsg.key } });
        }
      } catch (reactionError) {
        console.log("Reaction error:", reactionError);
      }
    } catch (e) {
      console.error("Error in image generation help command:", e);
      return reply(`❌ Error: ${e.message || "Something went wrong."}`);
    }
  }
);
