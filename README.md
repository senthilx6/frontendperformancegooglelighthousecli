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
config.json [not the actual , an example one]
```bash

{
    "url": "https://dentalhospital9801.myfreshworks.com/",
    "username": "senthilccp9102@gmail.com",
    "password": "testautomation19201202"
}
```
url.json [not the actual , an example one]
```bash
{
    "urls" : [
"takeaway/v1/customers/",
"takeaway/v1/settings",
"takeaway/v1/products",
]
}
```

node run-lighthouse.js
