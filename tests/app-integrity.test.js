const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const readme = fs.readFileSync(path.join(root, 'docs', 'README-PENGEMBANGAN-v9.md'), 'utf8');

test('versi aplikasi dan service worker konsisten', () => {
  assert.match(html, /const APP_VERSION = '9\.0-beta3'/);
  assert.match(sw, /posyandu-ilp-v16/);
});

test('menu agenda dan modul tujuan terhubung', () => {
  assert.match(html, /activeTab === 'ilp-followup'/);
  assert.match(html, /<FollowUpWorkspace[\s\S]*onGo=\{handleTabChange\}/);
  assert.match(html, /const exportAgenda = \(\) => exportToExcel/);
  for (const target of ['ilp-anc', 'ilp-immun', 'ilp-home', 'ilp-referral']) {
    assert.ok(html.includes(`'${target}'`), `missing target ${target}`);
  }
});

test('cache lokal dipisahkan berdasarkan role dan UID akun Firebase', () => {
  assert.match(html, /accountCacheKey = \(role, uid, key\)/);
  assert.match(html, /pos_ilp_account_/);
  assert.match(html, /cacheHydratedAccount/);
  assert.match(html, /getAccountLocal\(sid, u\.uid/);
  assert.match(html, /setAccountLocal\(role, user\.uid, 'pos_ilp_cadre_tasks'/);
  assert.match(html, /migrateLegacyCacheForAccount\(sid, u\.uid\)/);
});

test('antrean offline terikat pada role dan dapat dicoba ulang', () => {
  assert.match(html, /ownerRole/);
  assert.match(html, /ownerUid/);
  assert.match(html, /accountOutboxKey\(role, uid\)/);
  assert.match(html, /revision:/);
  assert.match(html, /sameDocQueued/);
  assert.match(html, /const flushOutbox = async/);
  assert.match(html, /addEventListener\('online'/);
  assert.match(html, /Coba sinkronkan/);
  assert.match(html, /pendingSync: safePendingSync/);
});

test('koleksi modul dan backup lama tetap ada', () => {
  for (const col of ['anc', 'immunizations', 'home_visits', 'referrals', 'logistics', 'education']) {
    assert.ok(html.includes(`'${col}'`), `missing collection ${col}`);
  }
  for (const field of ['cadres', 'participants', 'attendances', 'healthRecords', 'complaints']) {
    assert.ok(html.includes(field), `missing legacy data ${field}`);
  }
});

test('backup JSON menyertakan tugas kader dan metadata skema', () => {
  assert.match(html, /cadreTasks, pendingSync: safePendingSync/);
  assert.match(html, /skemaBackup: 3/);
  assert.match(html, /const getAccountPendingOutbox = \(role, uid\) =>/);
});

test('service worker shell masih memiliki halaman utama dan manifest', () => {
  assert.match(sw, /'\.\/index\.html'/);
  assert.match(sw, /'\.\/manifest\.webmanifest'/);
});

test('panduan v9 menyatakan batasan sinkronisasi dan laporan', () => {
  assert.match(readme, /Antrean offline tetap berada pada perangkat\/browser/i);
  assert.match(readme, /bukan pengganti pengujian browser/i);
});


test('rekap bulanan ILP tersedia untuk petugas dan admin', () => {
  assert.match(html, /activeTab === 'ilp-monthly'/);
  assert.match(html, /<MonthlyReportWorkspace[\s\S]*posyanduList=\{POSYANDU_LIST\}/);
  assert.match(html, /type="month"/);
  assert.match(html, /selectedPos === 'all' \|\| r\.posyandu === selectedPos/);
  assert.match(html, /const exportReport = \(\) =>/);
  assert.match(html, /window\.print\(\)/);
  assert.match(html, /Proporsi hadir dihitung dari sasaran hadir unik/);
});

test('laporan bulanan tidak menampilkan daftar nama warga', () => {
  assert.match(html, /Laporan cetak tidak menampilkan daftar nama warga/);
  assert.match(html, /Rincian sasaran menurut siklus hidup/);
});


test('ekspor CSV mempertahankan nilai angka nol', () => {
  assert.match(html, /e \?\? ''/);
});


test('fitur v9 tugas kader dan pengingat WhatsApp tersedia', () => {
  assert.match(html, /activeTab === 'cadre-tasks'/);
  assert.match(html, /<CadreTaskWorkspace/);
  assert.match(html, /activeTab === 'wa-reminder'/);
  assert.match(html, /<WhatsAppReminderWorkspace/);
  assert.match(html, /cadre_tasks/);
  assert.match(html, /wa\.me\//);
  assert.match(html, /tidak mengirim pesan otomatis/i);
});

test('koleksi tugas kader dibatasi aturan Firestore menurut posyandu', () => {
  const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
  assert.match(rules, /'cadre_tasks'/);
  assert.match(rules, /canReadOld\(\)/);
  assert.match(rules, /canWriteNew\(\)/);
});

test('aturan Firestore memvalidasi kader penanggung jawab tugas', () => {
  const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
  assert.match(rules, /function taskAssigneeMatchesPosyandu\(appId\)/);
  assert.match(rules, /moduleCollection != 'cadre_tasks' \|\| taskAssigneeMatchesPosyandu\(appId\)/);
});


test('backup hanya menyertakan antrean akun admin yang sedang aktif', () => {
  assert.match(html, /pendingSync=\{getAccountPendingOutbox\(role, user\?\.uid\)\}/);
  assert.match(html, /pendingSyncScope: 'akun-admin-yang-sedang-masuk'/);
  assert.match(html, /filter\(x => x && x\.ownerRole === 'admin'\)/);
});

test('grafik pertumbuhan balita menggunakan umur saat pemeriksaan', () => {
  assert.match(html, /const ageMonthsAtDate = \(birthDate, examDate\)/);
  assert.match(html, /function GrowthTrendChart/);
  assert.match(html, /Grafik pertumbuhan balita/);
  assert.match(html, /ageMonths: ageMonthsAtDate\(participant\.birthDate, r\.date\)/);
  assert.match(html, /bukan penilaian status gizi atau diagnosis/);
});
