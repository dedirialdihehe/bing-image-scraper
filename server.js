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
