import express from "express";
import { chromium } from "playwright";

const app = express();

app.get("/search", async (req, res) => {
  const query = req.query.q;
  const limit = Number(req.query.limit) || 20;

  if (!query) {
    return res.json({
      success: false,
      error: "Missing query"
    });
  }

  try {
  const browser = await chromium.launch({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu"
  ]
});

    const page = await browser.newPage();

    await page.goto(
      `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`,
      {
        waitUntil: "domcontentloaded",
        timeout: 60000
      }
    );
await page.waitForSelector(".mimg");

const images = await page.evaluate((limit) => {
  return [...document.querySelectorAll(".mimg")]
        .map(img => img.src)
        .filter(src =>
          src &&
          src.startsWith("http")
        )
        .slice(0, limit);
    }, limit);

    await browser.close();

    res.json({
      success: true,
      total: images.length,
      images
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("SCRAPER ON " + PORT);
});
