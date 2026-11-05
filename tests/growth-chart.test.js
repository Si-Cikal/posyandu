const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('        const ageMonthsAtDate = (birthDate, examDate) => {');
const end = html.indexOf('\n\n        function GrowthTrendChart', start);
assert.ok(start >= 0 && end > start, 'ageMonthsAtDate helper is present');
const helperSource = html.slice(start, end).trim();
const context = {};
vm.createContext(context);
vm.runInContext(`${helperSource}\nglobalThis.ageMonthsAtDate = ageMonthsAtDate;`, context);
const ageMonthsAtDate = context.ageMonthsAtDate;

test('umur saat pemeriksaan dihitung dalam bulan penuh', () => {
  assert.equal(ageMonthsAtDate('2024-01-15', '2024-01-15'), 0);
  assert.equal(ageMonthsAtDate('2024-01-15', '2024-02-14'), 0);
  assert.equal(ageMonthsAtDate('2024-01-15', '2024-02-15'), 1);
  assert.equal(ageMonthsAtDate('2020-02-29', '2021-02-28'), 12);
  assert.equal(ageMonthsAtDate('2020-02-29', '2021-03-01'), 12);
  assert.equal(ageMonthsAtDate('2024-01-31', '2024-02-29'), 1);
});

test('tanggal tidak valid atau pemeriksaan sebelum lahir tidak menghasilkan umur', () => {
  assert.equal(ageMonthsAtDate('2024-02-30', '2024-03-01'), null);
  assert.equal(ageMonthsAtDate('0001-01-01', '0001-02-01'), null);
  assert.equal(ageMonthsAtDate('2024-01-01', '2023-12-31'), null);
  assert.equal(ageMonthsAtDate('', '2024-01-01'), null);
  assert.equal(ageMonthsAtDate('2024-01-01', 'invalid'), null);
});
