const fs = require("fs");
const puppeteer = require("puppeteer");
const path  = require("path")


const url_list = JSON.parse(fs.readFileSync("./config/urls.json", "utf-8"));
const config = JSON.parse(fs.readFileSync("./config/config.json", "utf-8"));
const REPORTS_DIR = './reports';
const INDEX_FILE = path.join(REPORTS_DIR, 'index.html');


// Store performance results for all URLs
const performanceResults = {};

async function runLighthouse(url, title) {
  const { default: lighthouse } = await import("lighthouse");

  const DESKTOP_EMULATION_METRICS = {
    mobile: false,
    width: 1550,
    height: 940,
    deviceScaleFactor: 1,
    disabled: false
    // onlyCategories: ["performance", "accessibility", "best-practices"]
  };

  const options = {
    logLevel: 'info',
    output: 'html',
    port: 9223,
    formFactor: "desktop",
    screenEmulation: DESKTOP_EMULATION_METRICS
  };

  const result = await lighthouse(url, options);

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  const reportHtml = result.report;
  const html_reportname = `lighthouse-${title}-${timestamp}.html`;

  const individual_url_performance_html = path.join(REPORTS_DIR, html_reportname);

  console.log(`Lighthouse report for ${result.lhr.requestedUrl} is getting generated...`);

  // Collect category scores for this URL
  const categoryScores = {};
  for (const cathegory in result.lhr.categories) {
    const score = result.lhr.categories[cathegory].score * 100;
    categoryScores[cathegory] = score;
    console.log(`Category: ${cathegory}, Score: ${score}`);
  }
  // Store in performanceResults
  performanceResults[url] = categoryScores;

  console.log(`Lighthouse report for ${result.lhr.finalDisplayedUrl} generated successfully above.`);

  fs.writeFileSync(individual_url_performance_html, reportHtml);
  console.log(`Lighthouse report saved: ${individual_url_performance_html}`);
  return {"filepath":html_reportname,"categoryScores": categoryScores};
}

/**
 * Wait until the page title equals the expected title
 * @param {object} page - Puppeteer Page object
 * @param {string} expectedTitle - The exact title to wait for
 * @param {number} timeout - (optional) Max time in ms to wait (default 30s)
 */
async function waitForPageTitle(page, expectedTitle, timeout = 30000) {
    try {
  await page.waitForFunction(
    title => document.title === title,
    { timeout },
    expectedTitle
  );
} catch (error) {
  console.error(`Error waiting for page title: ${error.message}`);
  throw new Error(`Last seen title: "${await page.title()}" with url "${await page.url()}". Expected was: "${expectedTitle}"`);
}
  console.log(`✅ Page title matched: "${expectedTitle}"`);
}

async function getColor(score, category , threshold) {
  return score[category] >= threshold[category] ? 'green' : 'red';
}

(async () => {                       
  if (!fs.existsSync("./reports")) { 
    fs.mkdirSync("./reports");       
  }

  const browser = await puppeteer.launch({  
    headless: true,                          
    args: ["--remote-debugging-port=9223"],  
  });

  const page = await browser.newPage();
  
  await page.setViewport({
  width: 1550,
  height: 940,
});

  // Login
  await page.goto(config.url, {              
    waitUntil: "networkidle2",              
  });                                       

  await page.locator("#username").fill(config.username)
  await page.locator("#password").fill(config.password)
  const element = await page.waitForSelector('::-p-xpath(//button[@data-testid="login-button"])');
  await element.click()
  await page.waitForNavigation({           
    waitUntil: "networkidle2",              
  });

  console.log("Logged in successfully");
  await waitForPageTitle(page, config.title, 30000);
  let base_url = await page.url()
  let rows = '';
  // Run Lighthouse on each URL
  for (const data of url_list.urls) {
      let threshold = data["thresholds"];
      if (!threshold) {
        // Default: always green if no threshold provided
        threshold = {
          performance: -Infinity,
          accessibility: -Infinity,
          "best-practices": -Infinity
        };
      }
      let url = data["url"];
      var final_url = base_url + url;
      await page.goto(final_url, {
        waitUntil: "domcontentloaded",
        timeout: 60000
      });

      var page_title = await page.title();
      console.log(`Running Lighthouse for ${url}`);
      console.log(`Running Lighthouse for page title ${page_title}`);
      var result = await runLighthouse(final_url, page_title);
    
      rows += `
      <tr>
        <td><a href="${result["filepath"]}" target="_blank">${final_url}</a></td>
        <td><div class="circle ${await getColor(result["categoryScores"],'performance', threshold)}">${result["categoryScores"]["performance"]}</div></td>
        <td><div class="circle ${await getColor(result["categoryScores"],'accessibility',threshold)}">${result["categoryScores"]["accessibility"]}</div></td>
        <td><div class="circle ${await getColor(result["categoryScores"],'best-practices',threshold)}">${result["categoryScores"]["best-practices"]}</div></td>
      </tr>
    `;

    }

  // Write performance results to JSON file
  const perfOutputFile = './reports/performance-results.json';
  fs.writeFileSync(perfOutputFile, JSON.stringify(performanceResults, null, 2));
  console.log(`Performance results saved: ${perfOutputFile}`);
  const resultant_html =  await html_skeleton(rows)
  fs.writeFileSync(INDEX_FILE, resultant_html, 'utf-8');


  await browser.close();
})();

async function html_skeleton(rows) {
// build HTML index
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Lighthouse Summary Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
    th { background-color: #f2f2f2; }
    .circle {
      width: 40px; height: 40px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: auto;
      color: white; font-weight: bold;
    }
    .green { background-color: #4CAF50; }
    .red { background-color: #f44336; }
  </style>
</head>
<body>
  <h1>Lighthouse Summary</h1>
  <table>
    <tr>
      <th>Page</th>
      <th>Performance</th>
      <th>Accessibility</th>
      <th>Best Practices</th>
    </tr>
    ${rows}
  </table>
</body>
</html>
`;
return html;
}
  