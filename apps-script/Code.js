var SHEET_ID = '1zGyaZyz24R91_rZl1nzvRwSxnHZ7_kROiHsDa4R895Y';
var NOTIFY_EMAIL = 'madannep@gmail.com';

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var name = String(p.name || '').slice(0, 200);
    var email = String(p.email || '').slice(0, 200);
    var phone = String(p.phone || '').slice(0, 50);
    var units = String(p.units || '').slice(0, 200);
    var movein = String(p.movein || '').slice(0, 100);
    var message = String(p.message || '').slice(0, 2000);

    // honeypot: real users never fill this
    if (p.company) return json({ ok: true });
    if (!name && !email && !phone) return json({ ok: false, error: 'empty' });

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    sheet.appendRow([new Date(), name, email, phone, units, movein, message, '812-house.com']);

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: '812 House inquiry: ' + (name || email || phone),
      body:
        'New leasing inquiry from 812-house.com\n\n' +
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Phone: ' + phone + '\n' +
        'Unit interest: ' + units + '\n' +
        'Desired move-in: ' + movein + '\n\n' +
        'Message:\n' + message + '\n\n' +
        'All inquiries: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit'
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
}
