// Uji aturan keamanan Firestore di emulator (tanpa menyentuh data asli).
// Jalankan: cd tests && npm install && npm run test:rules (Node 18+ dan Firebase CLI diperlukan).
const { test, before, beforeEach, after } = require('node:test');
const fs = require('fs');
const path = require('path');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, getDocs, collection, query, where, serverTimestamp } = require('firebase/firestore');

const BASE = 'artifacts/posyandu-ilp-mawar-cikulak/public/data';
const TODAY = '2026-11-04';
let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-posyandu',
    firestore: { rules: fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8080 }
  });
});
after(async () => { await env.cleanup(); });

const seed = async (schedule = { isOpen: true }) => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, `${BASE}/settings/schedule`), schedule);
    await setDoc(doc(db, `${BASE}/settings/credentials`), { admin: '123' });
    await setDoc(doc(db, `${BASE}/participants/ILP-AAA11`), { name: 'Siti', posyandu: 'mawar1', status: 'aktif' });
    await setDoc(doc(db, `${BASE}/participants/ILP-BBB22`), { name: 'Budi', posyandu: 'mawar2' });
    await setDoc(doc(db, `${BASE}/participants/ILP-CCC33`), { name: 'Pindah', posyandu: 'mawar1', status: 'pindah' });
    await setDoc(doc(db, `${BASE}/cadres/KDR-AAA11`), { name: 'Kader', posyandu: 'mawar1' });
    await setDoc(doc(db, `${BASE}/cadres/KDR-BBB22`), { name: 'Kader Mawar 2', posyandu: 'mawar2' });
    await setDoc(doc(db, `${BASE}/cadres/KDR-EEE55`), { name: 'Kader Mawar 5', posyandu: 'mawar5' });
    await setDoc(doc(db, `${BASE}/complaints/ADU-ABCDEFGHJK`), { name: 'Warga', posyandu: 'mawar1', message: 'tes', date: TODAY, reply: '' });
  });
};
beforeEach(() => seed());

const pub = () => env.unauthenticatedContext().firestore();
const staff = (id) => env.authenticatedContext('u-' + id, { email: `${id}@posyandu.invalid` }).firestore();
const anon = () => env.authenticatedContext('anon1').firestore(); // login anonim lama (tanpa email)

const absen = (personId, posyandu, over = {}) => {
  const type = personId.startsWith('KDR') ? 'cadre' : 'participant';
  return { personId, type, posyandu, date: TODAY, time: '08:00', via: 'mandiri', timestamp: serverTimestamp(), ...over };
};
const absenDoc = (db, personId) => doc(db, `${BASE}/attendances/ATT-${TODAY}-${personId}`);

test('publik tidak bisa membaca data warga, kader, kehadiran', async () => {
  await assertFails(getDoc(doc(pub(), `${BASE}/participants/ILP-AAA11`)));
  await assertFails(getDocs(collection(pub(), `${BASE}/participants`)));
  await assertFails(getDocs(collection(pub(), `${BASE}/cadres`)));
  await assertFails(getDocs(collection(pub(), `${BASE}/attendances`)));
  await assertFails(getDocs(collection(pub(), `${BASE}/health`)));
});

test('sesi anonim lama (tanpa email petugas) tidak punya akses', async () => {
  await assertFails(getDocs(collection(anon(), `${BASE}/participants`)));
  await assertFails(setDoc(doc(anon(), `${BASE}/participants/ILP-ZZZ99`), { name: 'x', posyandu: 'mawar1' }));
});

test('publik hanya bisa baca jadwal; sandi lama tidak terbaca', async () => {
  await assertSucceeds(getDoc(doc(pub(), `${BASE}/settings/schedule`)));
  await assertFails(getDoc(doc(pub(), `${BASE}/settings/credentials`)));
  await assertFails(getDoc(doc(staff('admin'), `${BASE}/settings/credentials`)));
});

test('hanya admin boleh mengubah jadwal', async () => {
  await assertFails(setDoc(doc(pub(), `${BASE}/settings/schedule`), { isOpen: true }));
  await assertFails(setDoc(doc(staff('mawar1'), `${BASE}/settings/schedule`), { isOpen: true }));
  await assertSucceeds(setDoc(doc(staff('admin'), `${BASE}/settings/schedule`), { isOpen: true }));
});

test('absen mandiri: kartu valid berhasil, ganda ditolak', async () => {
  const db = pub();
  await assertSucceeds(setDoc(absenDoc(db, 'ILP-AAA11'), absen('ILP-AAA11', 'mawar1')));
  await assertFails(setDoc(absenDoc(db, 'ILP-AAA11'), absen('ILP-AAA11', 'mawar1')));
});

test('absen mandiri: kader valid berhasil', async () => {
  await assertSucceeds(setDoc(absenDoc(pub(), 'KDR-AAA11'), absen('KDR-AAA11', 'mawar1')));
});

test('absen mandiri: ditolak bila posyandu salah / kartu tak terdaftar / warga non-aktif', async () => {
  await assertFails(setDoc(absenDoc(pub(), 'ILP-AAA11'), absen('ILP-AAA11', 'mawar2')));
  await assertFails(setDoc(absenDoc(pub(), 'ILP-NOPE1'), absen('ILP-NOPE1', 'mawar1')));
  await assertFails(setDoc(absenDoc(pub(), 'ILP-CCC33'), absen('ILP-CCC33', 'mawar1')));
});

test('absen mandiri: ditolak bila posyandu ditutup, ada field tambahan, atau id dokumen tidak sesuai', async () => {
  await seed({ isOpen: false });
  await assertFails(setDoc(absenDoc(pub(), 'ILP-AAA11'), absen('ILP-AAA11', 'mawar1')));
  await seed();
  await assertFails(setDoc(absenDoc(pub(), 'ILP-AAA11'), absen('ILP-AAA11', 'mawar1', { name: 'Palsu' })));
  await assertFails(setDoc(doc(pub(), `${BASE}/attendances/ATT-bebas`), absen('ILP-AAA11', 'mawar1')));
});

test('publik tidak bisa mengubah atau menghapus kehadiran', async () => {
  await assertSucceeds(setDoc(absenDoc(pub(), 'ILP-AAA11'), absen('ILP-AAA11', 'mawar1')));
  await assertFails(setDoc(absenDoc(pub(), 'ILP-AAA11'), absen('ILP-AAA11', 'mawar1', { time: '09:00' })));
});

test('petugas mawar1 hanya melihat data posyandunya', async () => {
  const db = staff('mawar1');
  await assertSucceeds(getDocs(query(collection(db, `${BASE}/participants`), where('posyandu', '==', 'mawar1'))));
  await assertFails(getDocs(collection(db, `${BASE}/participants`)));                       // tanpa filter
  await assertFails(getDocs(query(collection(db, `${BASE}/participants`), where('posyandu', '==', 'mawar2'))));
  await assertFails(getDoc(doc(db, `${BASE}/participants/ILP-BBB22`)));
  await assertSucceeds(getDoc(doc(db, `${BASE}/participants/ILP-AAA11`)));
});

test('admin melihat semua data', async () => {
  await assertSucceeds(getDocs(collection(staff('admin'), `${BASE}/participants`)));
});

test('petugas tidak bisa menulis untuk posyandu lain', async () => {
  const db = staff('mawar1');
  await assertSucceeds(setDoc(doc(db, `${BASE}/participants/ILP-NEW11`), { name: 'Baru', posyandu: 'mawar1' }));
  await assertFails(setDoc(doc(db, `${BASE}/participants/ILP-NEW22`), { name: 'Baru', posyandu: 'mawar2' }));
  await assertFails(setDoc(doc(db, `${BASE}/participants/ILP-BBB22`), { name: 'Ubah', posyandu: 'mawar2' }));
  await assertFails(setDoc(doc(db, `${BASE}/participants/ILP-AAA11`), { name: 'Pindahkan', posyandu: 'mawar2' }));
});

test('pengaduan: publik bisa kirim dan baca lewat kode, tidak bisa daftar atau membalas', async () => {
  const db = pub();
  const body = (over = {}) => ({ name: 'Ani', posyandu: 'mawar1', message: 'Halo', date: TODAY, reply: '', timestamp: serverTimestamp(), ...over });
  await assertSucceeds(setDoc(doc(db, `${BASE}/complaints/ADU-K7M4Q2XH9P`), body()));
  await assertFails(setDoc(doc(db, `${BASE}/complaints/ADU-K7M4Q2XH9Q`), body({ reply: 'sudah dibalas' })));
  await assertFails(setDoc(doc(db, `${BASE}/complaints/CMP-123`), body()));
  await assertSucceeds(getDoc(doc(db, `${BASE}/complaints/ADU-ABCDEFGHJK`)));
  await assertFails(getDoc(doc(db, `${BASE}/complaints/CMP-123`)));
  await assertFails(getDocs(collection(db, `${BASE}/complaints`)));
  await assertFails(setDoc(doc(db, `${BASE}/complaints/ADU-ABCDEFGHJK`), body({ reply: 'diubah' })));
});

test('pengaduan: petugas hanya mengelola milik posyandunya', async () => {
  await assertSucceeds(setDoc(doc(staff('mawar1'), `${BASE}/complaints/ADU-ABCDEFGHJK`), { name: 'Warga', posyandu: 'mawar1', message: 'tes', date: TODAY, reply: 'Terima kasih' }));
  await assertFails(setDoc(doc(staff('mawar2'), `${BASE}/complaints/ADU-ABCDEFGHJK`), { name: 'Warga', posyandu: 'mawar2', message: 'tes', date: TODAY, reply: 'x' }));
});


test('modul ILP tambahan: publik ditolak, kader dibatasi per posyandu, admin lintas posyandu', async () => {
  const pubDb = pub();
  await assertFails(getDocs(collection(pubDb, `${BASE}/anc`)));
  await assertFails(setDoc(doc(pubDb, `${BASE}/home_visits/VIS-1`), { posyandu: 'mawar1', name: 'Siti' }));

  const kader = staff('mawar1');
  await assertSucceeds(setDoc(doc(kader, `${BASE}/anc/ANC-1`), { posyandu: 'mawar1', name: 'Siti', date: TODAY, type: 'ANC' }));
  await assertFails(setDoc(doc(kader, `${BASE}/anc/ANC-2`), { posyandu: 'mawar2', name: 'Budi', date: TODAY, type: 'ANC' }));
  await assertSucceeds(getDocs(query(collection(kader, `${BASE}/anc`), where('posyandu', '==', 'mawar1'))));
  await assertFails(getDocs(collection(kader, `${BASE}/anc`)));
  await assertFails(getDocs(query(collection(kader, `${BASE}/anc`), where('posyandu', '==', 'mawar2'))));
  await assertFails(setDoc(doc(kader, `${BASE}/anc/ANC-1`), { posyandu: 'mawar2', name: 'Siti', date: TODAY, type: 'ANC' }));

  const admin = staff('admin');
  await assertSucceeds(setDoc(doc(admin, `${BASE}/immunizations/IMM-1`), { posyandu: 'mawar2', name: 'Budi', date: TODAY, type: 'MR' }));
  await assertSucceeds(getDocs(collection(admin, `${BASE}/immunizations`)));
});

test('tugas kader v9: publik ditolak, petugas terbatas pada Posyandu sendiri, admin lintas wilayah', async () => {
  const publicDb = pub();
  await assertFails(getDocs(collection(publicDb, `${BASE}/cadre_tasks`)));
  await assertFails(setDoc(doc(publicDb, `${BASE}/cadre_tasks/TASK-PUB`), { title: 'Tugas publik', posyandu: 'mawar1' }));

  const kader1 = staff('mawar1');
  await assertSucceeds(setDoc(doc(kader1, `${BASE}/cadre_tasks/TASK-1`), { title: 'Siapkan meja', assigneeId: 'KDR-AAA11', posyandu: 'mawar1', status: 'baru' }));
  await assertFails(setDoc(doc(kader1, `${BASE}/cadre_tasks/TASK-1`), { title: 'Alihkan penanggung jawab', assigneeId: 'KDR-BBB22', posyandu: 'mawar1', status: 'berjalan' }));
  await assertFails(setDoc(doc(kader1, `${BASE}/cadre_tasks/TASK-2`), { title: 'Tugas lintas wilayah', assigneeId: 'KDR-BBB22', posyandu: 'mawar2', status: 'baru' }));
  await assertFails(setDoc(doc(kader1, `${BASE}/cadre_tasks/TASK-INVALID-ASSIGNEE`), { title: 'Penanggung jawab salah', assigneeId: 'KDR-BBB22', posyandu: 'mawar1', status: 'baru' }));
  await assertFails(setDoc(doc(kader1, `${BASE}/cadre_tasks/TASK-NO-ASSIGNEE`), { title: 'Tanpa kader', posyandu: 'mawar1', status: 'baru' }));
  await assertSucceeds(getDocs(query(collection(kader1, `${BASE}/cadre_tasks`), where('posyandu', '==', 'mawar1'))));
  await assertFails(getDocs(collection(kader1, `${BASE}/cadre_tasks`)));

  const admin = staff('admin');
  await assertSucceeds(setDoc(doc(admin, `${BASE}/cadre_tasks/TASK-3`), { title: 'Monitoring Mawar 5', assigneeId: 'KDR-EEE55', posyandu: 'mawar5', status: 'baru' }));
  await assertSucceeds(getDocs(collection(admin, `${BASE}/cadre_tasks`)));
});
