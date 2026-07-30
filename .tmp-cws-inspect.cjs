"use strict";

const path = require("node:path");
const { chromium } = require(path.join(
  process.env.HOME,
  "Documents/Vaults/CodingVault/modelmind/node_modules/playwright"
));

(async () => {
  const browser = await chromium.connectOverCDP(process.env.PW_BROKER_CDP_URL);
  const context = browser.contexts()[0];
  const page = await context.newPage();
  try {
    await page.goto(
      "https://chrome.google.com/webstore/devconsole/b5b84c2d-a2c0-4f2d-8ab9-350f53a831fd/hpgdmjphjmohhblolojdcpmcbeangnfh/edit/privacy",
      { waitUntil: "domcontentloaded", timeout: 30000 }
    );
    await page.waitForTimeout(3000);
    console.log(JSON.stringify({
      url: page.url(),
      title: await page.title(),
      text: (await page.locator("body").innerText()).slice(0, 5000),
    }, null, 2));
  } finally {
    await page.close();
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
