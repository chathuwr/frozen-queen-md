const { cmd, commands } = require('../command');
const axios = require("axios");
const config = require('../config');

const GEMINI_API_KEY = config.GEMINI_API_KEY; // REPLACE WITH YOUR API KEY OF GEMINI
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

cmd({
  pattern: "gpt",
  alias: ["ai", "chatgpt"],
  react: '🤖',
  desc: "Ask anything to Google Gemini AI.",
  category: "ai",
  use: ".gemini <Your Question>",
  filename: __filename
}, async (conn, mek, msg, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    const text = args.join(" ");
    if (!text) {
      return reply("Hi, I am ❄️Frozen Queen❄️. Please give me a question to answer! 🫶");
    }

    const prompt = `My name is ${pushname}. Your name is Frozen Queen AI. You are a WhatsApp AI Bot created by the Frozen Queen Team. Answer in the language the person talking to you speaks. Respond naturally, as if you are human. Use meaningful emojis. My question is: ${text}`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const response = await axios.post(
      GEMINI_API_URL,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || !response.data.candidates || !response.data.candidates[0]?.content?.parts) {
      return reply("❌ Error in the answer. 😢");
    }

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    await reply(`${aiResponse}`);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    reply("❌ Error in the question. 😢");
  }
});
