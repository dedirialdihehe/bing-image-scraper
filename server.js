import express from "express";
import { chromium } from "playwright";

const app = express();

app.get("/search", async (req, res) => {

  const q = req.query.q;

  if (!q) {
    return res.json({
      success: false
    });
  }

  let browser;

  try {

    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(
      "https://www.bing.com/images/search?q=" +
      encodeURIComponent(q),
      {
        waitUntil: "domcontentloaded"
      }
    );

    await page.waitForTimeout(3000);

    const images = await page.$$eval(
      ".mimg",
      els =>
        els
          .map(x => x.src || x.dataset.src)
          .filter(Boolean)
          .slice(0, 20)
    );

    if (browser?.close) {
      await browser.close();
    }

    return res.json({
      success: true,
      total: images.length,
      images
    });

  } catch (e) {

    try {
      if (browser?.close) {
        await browser.close();
      }
    } catch {}

    return res.json({
      success: false,
      error: e.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("SCRAPER ON " + PORT);
});
