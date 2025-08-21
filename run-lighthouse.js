const fs = require("fs");
const puppeteer = require("puppeteer");


const url_list = JSON.parse(fs.readFileSync("./config/urls.json", "utf-8"));
const config = JSON.parse(fs.readFileSync("./config/config.json", "utf-8"));


async function runLighthouse(url, title) {
  const { default: lighthouse } = await import("lighthouse");

  const DESKTOP_EMULATION_METRICS = {
  mobile: false,
  width: 1550,
  height: 940,
  deviceScaleFactor: 1,
  disabled: false,
};

  const options = {logLevel: 'info', output: 'html', port: 9222 , 
    formFactor: "desktop" , emulatedUserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
screenEmulation : DESKTOP_EMULATION_METRICS};

//   const config = {
//   extends: 'lighthouse:default',
//   settings: {
//     onlyAudits: [
//       'first-meaningful-paint',
//       'speed-index',
//       'interactive',
//     ],
//   },
// }

  const result = await lighthouse(url, options);

const now = new Date();
const timestamp = now
  .toISOString()          // "2025-08-21T07:35:20.123Z"
  .replace(/[:.]/g, "-");
const reportHtml = result.report;
const filename = `./reports/lighthouse-${title}-${timestamp}.html`;

console.log('Printing the entire result object', result)

console.log('Performance score was', result.lhr.categories.performance.score * 100);

  fs.writeFileSync(filename, reportHtml);
  console.log(`Lighthouse report saved: ${filename}`);
}

(async () => {                       // 1) Define an anonymous async function and immediately invoke it.
  if (!fs.existsSync("./reports")) { // 2) If the 'reports' folder doesn't exist…
    fs.mkdirSync("./reports");       // 3) …create it. (Where Lighthouse HTML files will be saved.)
  }

  const browser = await puppeteer.launch({   // 4) Launch a headless Chromium via Puppeteer…
    headless: false,                          // 5) …in headless mode (no visible UI)…
    args: ["--remote-debugging-port=9222"],  // 6) …expose a DevTools port (so Lighthouse can attach).
  });

  const page = await browser.newPage();
  
  await page.setViewport({
  width: 1550,   // Full HD width
  height: 940,  // Full HD height
});// 7) Open a new tab.

  // Login
  await page.goto(config.url, {               // 8) Go to the login page…
    waitUntil: "networkidle2",               // 9) …wait until the network is "quiet":
  });                                        //    ≤2 network connections for ~500ms.

  await page.locator("#username").fill(config.username)
  await page.locator("#password").fill(config.password)
  const element = await page.waitForSelector('::-p-xpath(//button[@data-testid="login-button"])');
  await element.click()
  await page.waitForNavigation({             // 13) Wait for the post-login navigation to complete
    waitUntil: "networkidle2",               //     (again using "networkidle2").
  });

  console.log("Logged in successfully");
  let base_url = await page.url()
  // 14) Log a friendly message.

  // Run Lighthouse on each URL
  for (const url of url_list.urls) {
    var final_url = base_url +  url               // 15) Loop through each authenticated page URL…
    await page.goto(final_url, {                   // 16) Navigate to that page…
      waitUntil: "domcontentloaded",
      timeout: 60000            //     …wait for the page to settle.
    });

    console.log(`⚡ Running Lighthouse for ${url}`);
    var page_title = await page.title()
    await runLighthouse(final_url,page_title);       // 18) Run Lighthouse against the current page,
  }                                          //     using the existing browser session.

  await browser.close();                     // 19) Close the browser when done.
})();                                        // 20) ← The trailing () calls the function immediately.