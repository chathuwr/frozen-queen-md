const { cmd } = require("../command");

cmd(
  {
    pattern: "ping",
    alias: ["test"],
    react: "🏓",
    desc: "Check if FrozenQueen bot is online, measure response time, and show speed",
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

      // Send the ping response and wait for it to complete
      await reply("*FrozenQueen Pong!* 🏓"); // Send initial response

      // Calculate the response time after the reply is sent
      const responseTime = Date.now() - startTime;

      // Determine speed based on response time
      let speed;
      if (responseTime < 100) {
        speed = "Fast ⚡";
      } else if (responseTime < 500) {
        speed = "Normal 🌟";
      } else {
        speed = "Slow 🐢";
      }

      // Send the detailed response with time and speed
      await reply(`*FrozenQueen Ping Stats!* ❄️\n*Response Time:* ${responseTime}ms\n*Speed:* ${speed}`);
    } catch (e) {
      console.error("FrozenQueen Ping error:", e);
      reply(`*❌ FrozenQueen Error:* ${e.message || "Something went wrong. Please try again later."}`);
    }
  }
);
