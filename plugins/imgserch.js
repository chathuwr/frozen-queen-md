const { cmd, commands } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

const imageDownloaderCommand = {
  pattern: "pic",
  react: "🖼️",
  desc: "Image downloader",
  category: "download",
  use: ".pic car",
  filename: __filename
};

cmd(imageDownloaderCommand, async (robin, mek, m, { from, quoted, prefix, body, isCmd, command, query, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!query) {
      return reply("Please provide a search term (e.g., `.pic car`)");
    }

    let captionMessage = `[❄️ FROZEN QUEEN ❄️]\n\n ▏ *IMG-DOWNLOADER*\n\n ▏ *🎭 Requester: ${pushname}*\n ▏ *✏️ Search: ${query}*\n\n└──────◉`;

    const config = {
      LOGO: "https://github.com/chathurahansaka1/help/blob/main/src/f52f8647-b0fd-4f66-9cfa-00087fc06f9b.jpg?raw=true",
      FOOTER: "Powered by Frozen Queen Bot ❄️"
    };

    const button1 = {
      buttonId: `${prefix}imgno ${query}`,
      buttonText: { displayText: "Normal type images 🖼️" }
    };

    const button2 = {
      buttonId: `${prefix}imgdoc ${query}`,
      buttonText: { displayText: "Document type images 📁" }
    };

    const interactiveMeta = {
      title: "Click Here⎙",
      sections: [{
        title: "FROZEN QUEEN",
        rows: [
          { title: '', description: "Normal type images 🖼️", id: button1.buttonId },
          { title: '', description: "Document type images 📁", id: button2.buttonId }
        ]
      }]
    };

    const interactiveButton = {
      buttonId: "action",
      buttonText: { displayText: "Select an option" },
      type: 4,
      nativeFlowInfo: {
        name: "single_select",
        paramsJson: JSON.stringify(interactiveMeta)
      }
    };

    const imageMessage = {
      image: { url: config.LOGO },
      caption: captionMessage,
      footer: config.FOOTER,
      buttons: [button1, button2, interactiveButton],
      headerType: 1,
      viewOnce: true
    };

    const options = { quoted: mek };

    return await robin.sendMessage(from, imageMessage, options);
  } catch (error) {
    reply("*ERROR !!*");
    console.error(error);
  }
});

// Command to download image as normal type
cmd(
  {
    pattern: "imgno",
    react: "🖼️",
    desc: "Download image as normal type",
    category: "download",
    filename: __filename
  },
  async (robin, mek, m, { from, query, reply }) => {
    try {
      if (!query) {
        return reply("Please provide a search term (e.g., `.imgno car`)");
      }

      await reply(`🖼️ *Searching for images: ${query}...*`);

      const images = await searchImages(query);
      if (images.length === 0) {
        return reply(`*No images found for "${query}"*`);
      }

      const imageUrl = images[0]; // Take the first image
      await robin.sendMessage(
        from,
        {
          image: { url: imageUrl },
          caption: `[❄️ FROZEN QUEEN ❄️]\n\n ▏ *Image Result*\n ▏ *Search: ${query}*\n ▏ *Type: Normal*`
        },
        { quoted: mek }
      );
    } catch (error) {
      reply("*ERROR !!*");
      console.error(error);
    }
  }
);

// Command to download image as document type
cmd(
  {
    pattern: "imgdoc",
    react: "📁",
    desc: "Download image as document type",
    category: "download",
    filename: __filename
  },
  async (robin, mek, m, { from, query, reply }) => {
    try {
      if (!query) {
        return reply("Please provide a search term (e.g., `.imgdoc car`)");
      }

      await reply(`📁 *Searching for images: ${query}...*`);

      const images = await searchImages(query);
      if (images.length === 0) {
        return reply(`*No images found for "${query}"*`);
      }

      const imageUrl = images[0]; // Take the first image
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data);

      await robin.sendMessage(
        from,
        {
          document: imageBuffer,
          mimetype: response.headers["content-type"] || "image/jpeg",
          fileName: `${query}.jpg`,
          caption: `[❄️ FROZEN QUEEN ❄️]\n\n ▏ *Image Result*\n ▏ *Search: ${query}*\n ▏ *Type: Document*`
        },
        { quoted: mek }
      );
    } catch (error) {
      reply("*ERROR !!*");
      console.error(error);
    }
  }
);

// Helper function to search images (simple Google Images scrape)
async function searchImages(query) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
  const response = await axios.get(searchUrl, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const $ = cheerio.load(response.data);
  const images = [];

  $("img").each((i, elem) => {
    const src = $(elem).attr("src");
    if (src && src.startsWith("http") && !src.includes("google")) {
      images.push(src);
    }
  });

  return images.slice(0, 5); // Return up to 5 images
}

module.exports = commands; // Export the commands
