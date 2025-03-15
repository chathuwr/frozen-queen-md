const { cmd, commands } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

// Pastpaper Command (List Papers with Categories and Numbers)
cmd(
  {
    pattern: "pastpaper",
    react: "📑",
    desc: "List past papers from GovDoc by category with numbered options",
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

      // Start with the main page or a specific past papers page
      let url = "https://govdoc.lk/category/past-papers"; // Adjust if needed
      let response;
      try {
        response = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      } catch (e) {
        console.log(`Past papers page failed: ${e.message}. Falling back to main page.`);
        url = "https://govdoc.lk/";
        response = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      }

      const $ = cheerio.load(response.data);
      const allLinks = [];
      const categorizedPapers = {
        "Past Papers": [],
        "Syllabus": [],
        "Teacher Guides": [],
        "Text Books": [],
        "Others": []
      };

      // Scrape all links
      $("a[href]").each((index, element) => {
        const link = $(element).attr("href");
        const title = $(element).text().replace(/\s+/g, " ").trim() || `Item ${index + 1}`;
        if (link && link !== "javascript:void(0)") {
          const fullLink = link.startsWith("http") ? link : "https://govdoc.lk" + (link.startsWith("/") ? "" : "/") + link;
          allLinks.push({ link: fullLink, title });
        }
      });

      // Categorize links with improved logic
      allLinks.forEach(paper => {
        const titleLower = paper.title.toLowerCase();
        const linkLower = paper.link.toLowerCase();
        if (linkLower.includes("past-papers") || titleLower.includes("past papers") || titleLower.includes("g.c.e")) {
          categorizedPapers["Past Papers"].push(paper);
        } else if (linkLower.includes("/syllabus/")) {
          categorizedPapers["Syllabus"].push(paper);
        } else if (linkLower.includes("/teacher-guides/")) {
          categorizedPapers["Teacher Guides"].push(paper);
        } else if (linkLower.includes("/text-books/")) {
          categorizedPapers["Text Books"].push(paper);
        } else if (!linkLower.includes("login") && !linkLower.includes("register") && !linkLower.endsWith("govdoc.lk/")) {
          categorizedPapers["Others"].push(paper);
        }
      });

      // Filter by query if provided
      let filteredPapers = {};
      if (q) {
        const searchTerm = q.toLowerCase();
        Object.keys(categorizedPapers).forEach(category => {
          filteredPapers[category] = categorizedPapers[category].filter(paper =>
            paper.title.toLowerCase().includes(searchTerm) || paper.link.toLowerCase().includes(searchTerm)
          );
        });
      } else {
        filteredPapers = categorizedPapers;
      }

      // Count total papers
      const totalPapers = Object.values(filteredPapers).reduce((sum, papers) => sum + papers.length, 0);
      if (totalPapers < 1) {
        await reply(`*No papers found${q ? ` matching "${q}"` : ""}. Check logs for all links.*`);
        console.log("All links found:", allLinks);
        return;
      }

      await reply(`📑 *Found ${totalPapers} papers${q ? ` matching "${q}"` : ""}. Listing by category...*`);

      const config = {
        LOGO: "https://github.com/chathurahansaka1/help/blob/main/src/f52f8647-b0fd-4f66-9cfa-00087fc06f9b.jpg?raw=true",
        FOOTER: "> Powered by Frozen Queen Bot ❄️",
      };

      // Build sections for each category
      const sections = [];
      let globalIndex = 1;
      Object.keys(filteredPapers).forEach(category => {
        if (filteredPapers[category].length > 0) {
          const options = filteredPapers[category].map((paper) => ({
            title: `${globalIndex++}`,
            description: paper.title,
            rowId: `${prefix}pp ${paper.link} ${paper.title}`,
          }));
          sections.push({
            title: `_${category}_`,
            rows: options,
          });
        }
      });

      const listMessage = {
        caption: "🎬 *Frozen Queen Pastpaper-DL* 🎬",
        image: { url: config.LOGO },
        footer: config.FOOTER,
        title: `Select a paper to download 📲${q ? ` (Search: ${q})` : ""}`,
        buttonText: "*🔢 Reply with number*",
        sections,
      };

      await robin.sendMessage(from, listMessage, { quoted: mek });
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
      let paperBuffer = Buffer.from(downloadResponse.data);
      let contentType = downloadResponse.headers["content-type"] || "application/pdf";

      if (contentType.includes("html")) {
        const html = paperBuffer.toString("utf8");
        const $html = cheerio.load(html);

        let fileLink = $html("a[href*='.pdf']").attr("href") ||
                       $html("meta[http-equiv='refresh']").attr("content")?.match(/url=(.+)/)?.[1] ||
                       $html("a[href*='download']").attr("href") ||
                       $html("script").text().match(/location\.href\s*=\s*["'](.*\.pdf)["']/i)?.[1];

        if (!fileLink) {
          await reply(`*ERROR !!* No PDF link found. Preview: ${html.slice(0, 200)}`);
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
