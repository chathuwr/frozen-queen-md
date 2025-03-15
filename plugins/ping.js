const { cmd } = require("../command");

cmd(
  {
    pattern: "ping",
    alias: ["test"],
    react: "🏓",
    desc: "Check if FrozenQueen bot is online and measure response time",
    category: "utility",
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
      // Record the start time
      const startTime = Date.now();

      // Send the ping response with FrozenQueen branding
      await reply(`*FrozenQueen Pong!* 🏓\n*Response Time:* ${Date.now() - startTime}ms`);
    } catch (e) {
      console.error("Ping error:", e);
      reply(`*❌ FrozenQueen Error:* ${e.message || "Something went wrong. Please try again later."}`);
    }
  }
);
