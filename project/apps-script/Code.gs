/* GIRLS XI: приймає заявку з форми сайту, додає рядок у Google Sheets і надсилає повідомлення в Telegram.
   Скрипт створюється зі самої таблиці (Розширення → Apps Script), тож ID таблиці не потрібен.
   Секрети лежать у Налаштування проєкту → Властивості скрипту: TELEGRAM_TOKEN, TELEGRAM_CHAT_ID. У код їх не вписувати. */

var SHEET_NAME = 'Заявки';
var HEADERS = ['Дата', "Ім'я батьків", "Ім'я гравчині", 'Вік', 'Програма', 'Телефон', "Спосіб зв'язку", 'Email', 'Коментар', 'Джерело', 'Статус', 'Відповідальна'];
var STATUSES = ['Нова', 'Зателефонували', 'Записана на пробне', 'Прийшла', 'Вступила', 'Відмова'];

/* Кольори сайту (project/tokens.css) */
var C = { primary: '#334A38', accent: '#F6C2D0', muted: '#CAC4BF', field: '#F6F6F6', white: '#FFFFFF', black: '#000000' };
var WIDTHS = [140, 170, 170, 70, 130, 150, 150, 210, 300, 150, 180, 170];
var ROWS = 1000;

/* Запустіть вручну: створить аркуш, шапку, випадаючий список «Статус» і оформлення. Можна запускати повторно. */
function setup() {
  var sheet = getSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build();
  sheet.getRange(2, HEADERS.indexOf('Статус') + 1, ROWS - 1, 1).setDataValidation(rule);
  style_(sheet);
}

function style_(sheet) {
  var cols = HEADERS.length;
  if (sheet.getMaxRows() < ROWS) sheet.insertRowsAfter(sheet.getMaxRows(), ROWS - sheet.getMaxRows());
  if (sheet.getMaxColumns() > cols) sheet.deleteColumns(cols + 1, sheet.getMaxColumns() - cols);
  sheet.setHiddenGridlines(true);
  sheet.setTabColor(C.primary);

  var all = sheet.getRange(1, 1, ROWS, cols);
  all.setFontFamily('Manrope').setFontSize(10).setFontColor(C.black).setVerticalAlignment('middle').setBackground(null);
  sheet.getBandings().forEach(function (b) { b.remove(); });
  var band = all.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
  band.setHeaderRowColor(C.primary).setFirstRowColor(C.white).setSecondRowColor(C.field);

  var head = sheet.getRange(1, 1, 1, cols);
  head.setFontColor(C.white).setFontWeight('bold').setFontSize(11).setHorizontalAlignment('left');
  sheet.setRowHeight(1, 46);
  sheet.setRowHeights(2, ROWS - 1, 34);

  var body = sheet.getRange(2, 1, ROWS - 1, cols);
  body.setBorder(null, null, true, null, null, null, C.muted, SpreadsheetApp.BorderStyle.SOLID);
  body.setWrap(true).setHorizontalAlignment('left');
  sheet.getRange(2, 1, ROWS - 1, 1).setNumberFormat('dd.MM.yyyy HH:mm').setFontColor(C.primary);
  sheet.getRange(2, HEADERS.indexOf('Вік') + 1, ROWS - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, HEADERS.indexOf('Телефон') + 1, ROWS - 1, 1).setNumberFormat('@').setFontWeight('bold');
  sheet.getRange(2, HEADERS.indexOf('Статус') + 1, ROWS - 1, 1).setHorizontalAlignment('center').setFontWeight('bold');
  for (var i = 0; i < cols; i++) sheet.setColumnWidth(i + 1, WIDTHS[i]);

  var st = sheet.getRange(2, HEADERS.indexOf('Статус') + 1, ROWS - 1, 1);
  var look = {
    'Нова': [C.accent, C.black],
    'Зателефонували': [C.muted, C.black],
    'Записана на пробне': [C.white, C.primary],
    'Прийшла': [C.primary, C.white],
    'Вступила': [C.primary, C.accent],
    'Відмова': [C.field, C.muted]
  };
  sheet.setConditionalFormatRules(STATUSES.map(function (s) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s).setBackground(look[s][0]).setFontColor(look[s][1]).setRanges([st]).build();
  }));
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ ok: true }); /* пастка для ботів: приховане поле заповнене */

    var name = clean_(d.name), player = clean_(d.player), phone = clean_(d.phone);
    if (!name || !player || phone.replace(/\D/g, '').length !== 12) return json_({ ok: false, error: 'invalid' });

    var source = clean_(d.camp) ? 'Кемп: ' + clean_(d.camp) : 'Сайт';
    var row = [new Date(), name, player, clean_(d.age), clean_(d.interest), "'" + phone, clean_(d.contact), clean_(d.email), clean_(d.message), source, 'Нова', ''];
    getSheet_().appendRow(row);
    row[5] = phone;
    notify_(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function clean_(v) {
  return String(v == null ? '' : v).trim().slice(0, 1000);
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function notify_(r) {
  var p = PropertiesService.getScriptProperties();
  var token = p.getProperty('TELEGRAM_TOKEN'), chat = p.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chat) return;
  var lines = [
    '<b>Нова заявка · GIRLS XI</b>',
    'Батьки: ' + esc_(r[1]),
    'Гравчиня: ' + esc_(r[2]) + (r[3] ? ', ' + esc_(r[3]) : ''),
    'Програма: ' + esc_(r[4] || '—'),
    'Телефон: ' + esc_(r[5]),
    "Зв'язок: " + esc_(r[6] || '—'),
    'Email: ' + esc_(r[7] || '—'),
    'Коментар: ' + esc_(r[8] || '—'),
    'Джерело: ' + esc_(r[9]),
  ];
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chat, text: lines.join('\n'), parse_mode: 'HTML' }),
    muteHttpExceptions: true,
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
