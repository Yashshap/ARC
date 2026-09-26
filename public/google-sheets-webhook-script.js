/**
 * ============================================================================
 * VITALSYNC FREE GOOGLE SHEETS LIVE CREATOR TRACKER BACKEND (APPS SCRIPT)
 * ============================================================================
 * How to set up in 60 seconds (100% Free Forever):
 * 1. Create a new Google Sheet at https://sheets.new
 * 2. Name the first tab: Redemptions
 * 3. In Row 1, add these headers:
 *    A1: timestamp | B1: code | C1: userId | D1: plan | E1: paid | F1: commission | G1: status
 * 4. Click Extensions -> Apps Script, paste this entire file, and click Save.
 * 5. Click Deploy -> New deployment -> Select type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Copy the Web App URL and paste it into `GOOGLE_SHEETS_API_URL` in `public/creator-portal.html`
 *    and into the Android app's subscription redemption webhook!
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Redemptions');
  var rows = sheet.getDataRange().getValues();
  var codeFilter = ((e && e.parameter && e.parameter.code) || '').toUpperCase().trim();

  var entries = [];
  for (var i = rows.length - 1; i >= 1; i--) {
    var row = rows[i];
    var rowCode = String(row[1] || '').toUpperCase().trim();
    if (!codeFilter || rowCode === codeFilter) {
      entries.push({
        time: String(row[0] || ''),
        code: rowCode,
        user: String(row[2] || 'VS-USER'),
        plan: String(row[3] || 'VitalSync Pro'),
        paid: Number(row[4] || 0),
        commission: Number(row[5] || 0),
        status: String(row[6] || 'Queued for Sunday UPI')
      });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, code: codeFilter, entries: entries }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Redemptions');
  var body = JSON.parse(e.postData.contents || '{}');

  var timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  var code = String(body.code || 'UNKNOWN').toUpperCase().trim();
  var userId = String(body.userId || ('VS-' + Math.floor(1000 + Math.random() * 9000)));
  var plan = String(body.plan || '90-Day Winter Arc Pass');
  var paid = Number(body.paid || 399);
  var rate = Number(body.rate || 30);
  var netAfterGoogle = Math.round(paid * 0.85);
  var commission = Math.round(netAfterGoogle * (rate / 100));
  var status = String(body.status || 'Verified • Sunday UPI Queue');

  sheet.appendRow([timestamp, code, userId, plan, paid, commission, status]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, code: code, commission: commission }))
    .setMimeType(ContentService.MimeType.JSON);
}
