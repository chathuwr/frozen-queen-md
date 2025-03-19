const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

// Dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Rest of your code remains the same
cmd({
  pattern: "git",
  react: "💻",
  desc: "Get GitHub user information",
  category: "tools",
  filename: __filename,
},
async (robin, mek, m, { from, quoted, q, reply }) => {
  try {
    if (!q) return reply("Example: ```.git octocat``` (username)");

    const username = q.trim();
    if (!username) return reply("❌ Please provide a GitHub username.");

    // Fetch user info
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: { "User-Agent": "Frozen-Queen-Bot" },
    });
    if (!userResponse.ok) return reply(`❌ Error: User not found (${userResponse.status})`);
    const user = await userResponse.json();

    // Send user info
    const userInfo = `
*❄️ GitHub User Info ❄️*
👤 *Username:* ${user.login}
📛 *Name:* ${user.name || "N/A"}
🌐 *Profile:* ${user.html_url}
📝 *Bio:* ${user.bio || "N/A"}
🏢 *Company:* ${user.company || "N/A"}
📍 *Location:* ${user.location || "N/A"}
📊 *Public Repos:* ${user.public_repos}
👥 *Followers:* ${user.followers}
📢 *Following:* ${user.following}
    `;
    await robin.sendMessage(from, {
      image: { url: user.avatar_url },
      caption: userInfo
    }, { quoted: mek });

    return reply("*Thanks for using ❄️ Frozen Queen ❄️*");
  } catch (e) {
    console.error("Error in git command:", e);
    reply(`❌ Error: ${e.message}`);
  }
});
