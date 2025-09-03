# 🚀 Lighthouse Performance Testing

This project automates **frontend performance testing** using [Google Lighthouse](https://developers.google.com/web/tools/lighthouse) via CLI.  
I have taken example of an CRM application to study how Lighthouse Performance Testing works

The script:
- Logs in to your CRM app (via Puppeteer).
- Runs Lighthouse on a list of authenticated URLs.
- Generates **individual HTML performance reports** inside the `reports/` folder.

---

## 📦 Tech Stack
- [Node.js](https://nodejs.org/) (JavaScript runtime)
- [Puppeteer](https://pptr.dev/) (login & navigation automation)
- [Lighthouse](https://github.com/GoogleChrome/lighthouse) (performance audits)
- [Chrome Launcher](https://github.com/GoogleChrome/chrome-launcher) (used by Lighthouse)

---

## 🛠️ Setup Instructions

### 1. Clone the Repo
```bash
git clone https://github.com/your-username/frontendperformancegooglelighthousecli.git
cd frontendperformancegooglelighthousecli
npm install
```
### 2. Add the login and urls to tested in 
Under config folder create config.json
```bash

{
    "url": "https://dentalhospital9801.celario.com/",
    "username": "senthilccp9102@gmail.com",
    "password": "testautomation19201202"
    "title": "dentalCRM"   // used to it to pass to Puppeteer to wait for the title to be displayed after login , to ensure the lighthouse is able to take perforamnce of the below urls
}
```
and urls.json with threshold for each URL
```bash
{
    "urls" : [{
 "url" :"takeaway/v1/customers",
"thresholds": {"performance":75,"accessibility":85,"best-practices":60}},
{
 "url" :"takeaway/v1/settings",
"thresholds": {"performance":65,"accessibility":70,"best-practices":90}},
{
 "url" :"takeaway/v1/products",
"thresholds": {"performance":55,"accessibility":70,"best-practices":90}}
    ]
}
```

OR if you dont know the threshold , just want to mesaure the metrics then urls.json can have 
``` bash
{
    "urls" : ["takeaway/v1/customers","takeaway/v1/settings"]
}
```

### 3 .configs that can be passed to lighthouse
reference : https://github.com/GoogleChrome/lighthouse/blob/main/docs/readme.md#using-programmatically ,
https://github.com/GoogleChrome/lighthouse/blob/main/docs/configuration.md

```bash
configSettings: {
    output: 'html',
    maxWaitForFcp: 30000,
    maxWaitForLoad: 45000,
    pauseAfterFcpMs: 1000,
    pauseAfterLoadMs: 1000,
    networkQuietThresholdMs: 1000,
    cpuQuietThresholdMs: 1000,
    formFactor: 'desktop',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      requestLatencyMs: 562.5,
      downloadThroughputKbps: 1474.5600000000002,
      uploadThroughputKbps: 675,
      cpuSlowdownMultiplier: 4
    },
    throttlingMethod: 'simulate',
    screenEmulation: {
      mobile: false,
      width: 1550,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36',
    auditMode: false,
    gatherMode: false,
    clearStorageTypes: [
      'file_systems',
      'shader_cache',
      'service_workers',
      'cache_storage'
    ],
    disableStorageReset: false,
    debugNavigation: false,
    channel: 'node',
    usePassiveGathering: false,
    disableFullPageScreenshot: false,
    skipAboutBlank: false,
    blankPage: 'about:blank',
    ignoreStatusCode: false,
    locale: 'en-US',
    blockedUrlPatterns: null,
    additionalTraceCategories: null,
    extraHeaders: null,
    precomputedLanternData: null,
    onlyAudits: null,
    onlyCategories: null,
    skipAudits: null
  }
```

node run-lighthouse.js

### 4. Output

the perforamnce output will be generated as json file , and collated custom index.html which would have the performance percentage metrics for all the urls with hyperlink to individual reports

```bash
{
  "https://dentalhospital9801.myfreshworks.com/takeaway/v1/customers": {
    "performance": 15,
    "accessibility": 72,
    "best-practices": 70,
    "seo": 75
  },
  "https://dentalhospital9801.myfreshworks.com/takeaway/v1/settings": {
    "performance": 25,
    "accessibility": 85,
    "best-practices": 70,
    "seo": 75
  },
  "https://dentalhospital9801.myfreshworks.com/takeaway/v1/products": {
    "performance": 25,
    "accessibility": 67,
    "best-practices": 70,
    "seo": 75
  }
}


```
<img width="1778" height="430" alt="Screenshot 2025-08-22 at 5 13 12 PM" src="https://github.com/user-attachments/assets/49079801-2242-4fea-ba3d-7893f712babd" />
<img width="1270" height="837" alt="Screenshot 2025-08-22 at 5 18 48 PM" src="https://github.com/user-attachments/assets/70563129-a441-4671-b3d3-0d71a1583893" />

then we can expose the index.html and inidivual htmls to jenkins via archiveArtifacts and publishHtml , we can even make a custom logic inside the run-lighthouse.js validating if the percentage exceeds the user threshold , then at end of the job we can raise an custom expection and mark the build as failed , bu this we can block the dev PR from mergeing if the above is implemented as git checks

### 4. Assertion
[In progress] Support passing url.json as arugements
