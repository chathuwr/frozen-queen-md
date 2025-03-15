const { cmd, commands } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

// Pastpaper Command (List Papers with Search)
cmd(
  {
    pattern: "pastpaper",
    react: "📑",
    desc: "List or search past papers from GovDoc",
    category: "download",
    filename: __filename,
  },
  async (
    robin, // Bot instance
    mek,   // Message object
    m,     // Raw message
    { from, prefix, q, reply } // Destructured context
  ) => {
    try {
      await reply("📑 *Fetching past papers from GovDoc...*");

      const initialResponse = await axios.get("https://govdoc.lk/", {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      const cookies = initialResponse.headers["set-cookie"]?.join("; ") || "";
      const $ = cheerio.load(initialResponse.data);
      const papers = [];

      // Try broader selector first, then filter
      $("a[href]").each((index, element) => {
        let link = $(element).attr("href");
        const title = $(element).text().trim() || `Paper ${index + 1}`;

        // Check if it’s a download link
        if (link && link.includes("/download/")) {
          if (!link.startsWith("http")) {
            link = "https://govdoc.lk" + (link.startsWith("/") ? "" : "/") + link;
          }
          if (title && !title.match(/^\s*$/)) { // Exclude empty titles
            papers.push({ link, title });
          }
        }
      });

      console.log("Scraped papers:", papers);
      if (papers.length < 1) {
        await reply("*No downloadable past papers found on the main page. Check logs for details.*");
        return;
      }

      // Filter papers if query is provided
      let filteredPapers = papers;
      if (q) {
        const searchTerm = q.toLowerCase();
        filteredPapers = papers.filter(paper => 
          paper.title.toLowerCase().includes(searchTerm)
        );
        if (filteredPapers.length < 1) {
          await reply(`*No papers found matching "${q}"*`);
          return;
        }
      }

      await reply(`📑 *Found ${filteredPapers.length} papers${q ? ` matching "${q}"` : ""}. Listing...*`);

      const config = {
        LOGO: "https://github.com/chathurahansaka1/help/blob/main/src/f52f8647-b0fd-4f66-9cfa-00087fc06f9b.jpg?raw=true",
        FOOTER: "> Powered by Frozen Queen Bot ❄️",
      };

      const options = filteredPapers.map((paper, index) => ({
        title: `${index + 1}`,
        description: paper.title,
        rowId: `${prefix}pp ${paper.link} ${paper.title}`,
      }));

      const listMessage = {
        title: "_[Past Papers from GovDoc]_",
        rows: options,
      };

      const messageContent = {
        caption: "🎬 *Frozen Queen Pastpaper-DL* 🎬",
        image: { url: config.LOGO },
        footer: config.FOOTER,
        title: `Select a paper to download 📲${q ? ` (Search: ${q})` : ""}`,
        buttonText: "*🔢 Reply with number*",
        sections: [listMessage],
      };

      await robin.sendMessage(from, messageContent, { quoted: mek });
    } catch (error) {
      console.error("Error in pastpaper command:", error);
      return reply(`*ERROR !!* ${error.message || "Failed to fetch papers."}`);
    }
  }
);

// PP Command (Download Paper)
cmd(
  {
    pattern: "pp",
    react: "📥",
    desc: "Download a past paper from a link",
    category: "download",
    filename: __filename,
  },
  async (
    robin, // Bot instance
    mek,   // Message object
    m,     // Raw message
    { from, q, reply } // Destructured context
  ) => {
    try {
      if (!q || !q.startsWith("http")) {
        return reply("Please provide a valid paper URL (e.g., `.pp https://govdoc.lk/download/61a74d2723df0 <title>`)");
      }

      const [paperUrl, ...titleParts] = q.trim().split(" ");
      const paperTitle = titleParts.join(" ") || "Untitled Paper";

      await reply(`📥 *Fetching paper: ${paperTitle} (${paperUrl})...*`);

      const initialResponse = await axios.get("https://govdoc.lk/", {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      const cookies = initialResponse.headers["set-cookie"]?.join("; ") || "";

      const downloadResponse = await axios.get(paperUrl, {
        responseType: "arraybuffer",
        maxRedirects: 5,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Cookie: cookies,
          Referer: "https://govdoc.lk/",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      });

      let finalUrl = downloadResponse.request.res.responseUrl;
      console.log("Download response:", {
        url: finalUrl,
        headers: downloadResponse.headers,
        size: downloadResponse.data.length,
      });

      let paperBuffer = Buffer.from(downloadResponse.data);
      let contentType = downloadResponse.headers["content-type"] || "application/pdf";

      if (contentType.includes("html")) {
        const html = paperBuffer.toString("utf8");
        const $html = cheerio.load(html);

        let fileLink = $html("a[href*='.pdf']").attr("href") || 
                       $html("meta[http-equiv='refresh']").attr("content")?.match(/url=(.+)/)?.[1] || 
                       $html("a[href*='download']").attr("href") || 
                       $html("link[href*='.pdf']").attr("href") || 
                       $html("script").text().match(/location\.href\s*=\s*["'](.*\.pdf)["']/i)?.[1];

        if (!fileLink) {
          console.log("Full HTML content:", html);
          await reply(`*ERROR !!* No PDF link found. Full HTML logged. Preview: ${html.slice(0, 200)}`);
          return;
        }

        const pdfUrl = fileLink.startsWith("http") ? fileLink : "https://govdoc.lk" + (fileLink.startsWith("/") ? "" : "/") + fileLink;
        await reply(`📥 *Found PDF link: ${pdfUrl}. Downloading...*`);

        const pdfResponse = await axios.get(pdfUrl, {
          responseType: "arraybuffer",
          maxRedirects: 5,
          headers: {
            "User-Agent": "Mozilla/5.0",
            Cookie: cookies,
            Referer: paperUrl,
          },
        });

        finalUrl = pdfResponse.request.res.responseUrl;
        paperBuffer = Buffer.from(pdfResponse.data);
        contentType = pdfResponse.headers["content-type"] || "application/pdf";

        console.log("PDF response:", {
          url: finalUrl,
          headers: pdfResponse.headers,
          size: paperBuffer.length,
        });
      }

      if (!contentType.includes("pdf")) {
        const textPreview = paperBuffer.toString("utf8").slice(0, 200);
        return reply(`*ERROR !!* Received non-PDF content (type: ${contentType}). Preview: ${textPreview}`);
      }

      const contentDisposition = downloadResponse.headers["content-disposition"];
      const fileName = contentDisposition?.match(/filename="(.+)"/)?.[1] || `${paperTitle}.pdf`;

      await robin.sendMessage(
        from,
        {
          document: paperBuffer,
          mimetype: contentType,
          fileName: fileName,
          caption: `📥 *Paper Details*\nTitle: ${paperTitle}\nURL: ${finalUrl}\n> Downloaded by Frozen Queen Bot ❄️`,
        },
        { quoted: mek }
      );
    } catch (error) {
      console.error("Error in pp command:", error);
      return reply(`*ERROR !!* ${error.message || "Failed to download the paper."}`);
    }
  }
);

module.exports = commands; // Export the commands
