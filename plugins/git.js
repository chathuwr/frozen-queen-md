// git-plugin.js
const { cmd } = require('../command');
const fetch = require('node-fetch'); // Use node-fetch@2 for CommonJS
const fs = require('fs');

// Command to show GitHub user info only
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

// Command to download GitHub repo as ZIP
cmd({
  pattern: "gitclone",
  react: "📦",
  desc: "Download a GitHub repository as a ZIP",
  category: "tools",
  filename: __filename,
},
async (robin, mek, m, { from, quoted, q, reply }) => {
  try {
    if (!q) return reply("Example: ```.gitclone octocat hello-world``` (username repo-name)");

    const [username, repoName] = q.trim().split(" ");
    if (!username || !repoName) return reply("❌ Please provide both a GitHub username and repository name.");

    // Download repo ZIP
    const zipUrl = `https://github.com/${username}/${repoName}/archive/refs/heads/main.zip`;
    const zipResponse = await fetch(zipUrl);

    if (!zipResponse.ok) return reply(`❌ Error: Repository not found or inaccessible (${zipResponse.status})`);

    // Save the ZIP temporarily
    const zipPath = `./${repoName}-main.zip`;
    const buffer = Buffer.from(await zipResponse.buffer()); // node-fetch@2 uses buffer()
    fs.writeFileSync(zipPath, buffer);

    // Send the ZIP file
    await robin.sendMessage(from, {
      document: { url: zipPath },
      mimetype: "application/zip",
      fileName: `${repoName}-main.zip`,
      caption: `*❄️ Frozen Queen GIT DOWNLOADER ❄️*\n\n📦 *Repo:* ${repoName}\n👤 *User:* ${username}\n🔗 *URL:* https://github.com/${username}/${repoName}\n\n*Made by FROZEN QUEEN TEAM*`
    }, { quoted: mek });

    // Clean up the temporary file
    fs.unlinkSync(zipPath);

    return reply("*Thanks for using ❄️ Frozen Queen ❄️*");
  } catch (e) {
    console.error("Error in gitclone command:", e);
    reply(`❌ Error: ${e.message}`);
  }
});
