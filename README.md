# 812 House — leasing site

One-page leasing site for 812 W 1st St, Chico (fourplex next to Chico State).
Live at https://812-house.com (GitHub Pages).

- `index.html` / `styles.css` — the site
- `images/` — web-optimized photos & floor plans (sources in Google Drive: Properties/CIC - 812 W 1st St)
- `apps-script/` — Google Apps Script web app that receives inquiry-form posts,
  appends to the "812 House — Leasing Inquiries" Google Sheet, and emails madannep@gmail.com.
  Deploy with `clasp push -f && clasp deploy`.

When a unit is live on TenantCloud, uncomment the TenantCloud block near the bottom of `index.html`
and paste the listing URL.
