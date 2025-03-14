const { cmd, commands } = require("../command");
const gTTS = require("gtts");
const fs = require("fs");
const path = require("path");

cmd(
  {
    pattern: "tts",
    alias: ["text2voice", "voice"],
    desc: "Convert text to speech and send as audio",
    category: "utility",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }
  ) => {
    try {
      let text = q || (quoted && quoted.text) || "";
      if (!text) {
        return reply("Please provide text to convert to speech! Example: .tts Hello world");
      }

      // Define the temp directory and audio file path
      const tempDir = path.join(__dirname, "../temp");
      const audioPath = path.join(tempDir, `tts_${Date.now()}.mp3`);

      // Create the temp directory if it doesn’t exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true }); // recursive: true creates parent dirs if needed
      }

      // Initialize and save the TTS audio
      const tts = new gTTS(text, "en");
      await new Promise((resolve, reject) => {
        tts.save(audioPath, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // Send the audio file as a voice message
      await robin.sendMessage(
        from,
        { audio: { url: audioPath }, mimetype: "audio/mp4", ptt: true },
        { quoted: mek }
      );

      // Clean up the temporary file
      fs.unlinkSync(audioPath);

      reply("Text converted to voice successfully! ❄️");
    } catch (e) {
      console.error(e);
      reply(`Error: ${e.message || e}`);
    }
  }
);
