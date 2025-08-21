# 🚀 Lighthouse Performance Testing for Multi-Tenant SaaS CRM

This project automates **frontend performance testing** using [Google Lighthouse](https://developers.google.com/web/tools/lighthouse) via CLI.  
It is designed for **multi-tenant SaaS CRM applications** where login is required before accessing pages.

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
git clone https://github.com/your-username/lighthouse-multitenant-crm-perf-test.git
cd lighthouse-multitenant-crm-perf-test


npm install



node run-lighthouse.js