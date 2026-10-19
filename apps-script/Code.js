var SHEET_ID = '1zGyaZyz24R91_rZl1nzvRwSxnHZ7_kROiHsDa4R895Y';
var NOTIFY_EMAIL = 'madannep@gmail.com';
// Bidwell Ops texts each new inquiry from the Quo line. BIDWELL_OPS_TOKEN
// lives in secret.js (untracked: this repo is public).
var BIDWELL_OPS_URL = 'https://lead-bot-sje5.onrender.com/api/inbound_lead';

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var name = String(p.name || '').slice(0, 200);
    var email = String(p.email || '').slice(0, 200);
    var phone = String(p.phone || '').slice(0, 50);
    var unitList = (e && e.parameters && e.parameters.units) || (p.units ? [p.units] : []);
    var units = String(unitList.join(', ')).slice(0, 200);
    var movein = String(p.movein || '').slice(0, 100);
    var message = String(p.message || '').slice(0, 2000);

    // honeypot: bots fill this, but never silently drop — flag instead
    var spamFlag = p.xq_verify || p.company ? ' [possible spam]' : '';
    if (!name && !email && !phone) return json({ ok: false, error: 'empty' });

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    sheet.appendRow([new Date(), name, email, phone, units, movein, message, '812-house.com' + spamFlag]);

    var texted = '';
    if (!spamFlag && phone) {
      try {
        var resp = UrlFetchApp.fetch(BIDWELL_OPS_URL, {
          method: 'post', contentType: 'application/json', muteHttpExceptions: true,
          headers: { 'X-Inbound-Token': BIDWELL_OPS_TOKEN },
          payload: JSON.stringify({ name: name, email: email, phone: phone, units: units,
                                    movein: movein, message: message, source: '812 sign',
                                    building: '812 W 1st St' })
        });
        texted = resp.getResponseCode() === 200 ? '\n\nSent to Bidwell Ops for a text from the Quo line.' :
                 '\n\nBidwell Ops handoff failed (' + resp.getResponseCode() + '); follow up manually.';
      } catch (fx) {
        texted = '\n\nBidwell Ops handoff failed (' + fx + '); follow up manually.';
      }
    }

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: '812 House inquiry: ' + (name || email || phone) + spamFlag,
      body:
        'New leasing inquiry from 812-house.com\n\n' +
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Phone: ' + phone + '\n' +
        'Unit interest: ' + units + '\n' +
        'Desired move-in: ' + movein + '\n\n' +
        'Message:\n' + message + '\n\n' +
        'All inquiries: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit' + texted
    });

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, service: '812 House inquiry handler' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor to grant permissions.
function authorize() {
  SpreadsheetApp.openById(SHEET_ID).getName();
  MailApp.getRemainingDailyQuota();
  UrlFetchApp.fetch('https://lead-bot-sje5.onrender.com/api/health');
}
