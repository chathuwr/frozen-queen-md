// git-plugin.js
const { cmd } = require('../command');
const fetch = require('node-fetch');
const fs = require('fs');

cmd({
  pattern: "git",
  react: "💻",
  desc: "Download a GitHub user's repository as a ZIP",
  category: "tools",
  filename: __filename,
},
async (robin, mek, m, { from, quoted, q, reply }) => {
  try {
    if (!q) return reply("Example: ```.git octocat my-repo``` (username and optional repo name)");

    const [username, repoName] = q.trim().split(" ");
    if (!username) return reply("❌ Please provide a GitHub username.");

    // Fetch user info
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: { "User-Agent": "Frozen-Queen-Bot" },
    });
    if (!userResponse.ok) return reply(`❌ Error: User not found (${userResponse.status})`);
    const user = await userResponse.json();

    // If no repo specified, get the first public repo
    if (!repoName) {
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`, {
        headers: { "User-Agent": "Frozen-Queen-Bot" },
      });
      if (!reposResponse.ok) return reply(`❌ Error: Could not fetch repos (${reposResponse.status})`);
      const repos = await reposResponse.json();

      if (repos.length === 0) return reply("❌ This user has no public repositories.");
      const defaultRepo = repos[0].name; // Use the first repo
      return await downloadAndSendRepo(username, defaultRepo, robin, from, mek, reply, user);
    }

    // If repo is specified, download it directly
    return await downloadAndSendRepo(username, repoName, robin, from, mek, reply, user);

  } catch (e) {
    console.error("Error in git command:", e);
    reply(`❌ Error: ${e.message}`);
  }
});

// Helper function to download and send repo as ZIP
async function downloadAndSendRepo(username, repoName, robin, from, mek, reply, user) {
  try {
    // Send user info first
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

    // Download repo ZIP
    const zipUrl = `https://github.com/${username}/${repoName}/archive/refs/heads/main.zip`;
    const zipResponse = await fetch(zipUrl);

    if (!zipResponse.ok) return reply(`❌ Error: Repository not found or inaccessible (${zipResponse.status})`);

    // Save the ZIP temporarily
    const zipPath = `./${repoName}-main.zip`;
    const buffer = Buffer.from(await zipResponse.arrayBuffer());
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
    console.error("Error downloading repo:", e);
    reply(`❌ Error: ${e.message}`);
  }
}
