import express from "express";
import { chromium } from "playwright";

const app = express();

app.get("/search", async (req, res) => {

  const q = req.query.q;

  if (!q) {
    return res.json({
      success:false
    });
  }

  let browser;

  try {

    browser =
      await chromium.launch({
        headless:true
      });

    const page =
      await browser.newPage();

    await page.goto(
      "https://www.bing.com/images/search?q=" +
      encodeURIComponent(q),
      {
        waitUntil:"domcontentloaded",
        timeout:30000
      }
    );

    await page.waitForTimeout(2500);

    const images =
      await page.$$eval(
        ".mimg",
        els =>
          els
            .map(x =>
              x.src ||
              x.getAttribute("data-src")
            )
            .filter(Boolean)
            .filter(x =>
              x.startsWith("http")
            )
            .slice(0, 20)
      );

    await browser.close();

    return res.json({
      success:true,
      total:images.length,
      images
    });

  } catch (e) {

    if (browser) {
      await browser.close();
    }

    return res.json({
      success:false,
      error:e.message
    });

  }

});

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    "SCRAPER ON " + PORT
  );
});
