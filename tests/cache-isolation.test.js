const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class MemoryStorage {
  constructor() { this.data = new Map(); }
  get length() { return this.data.size; }
  key(index) { return [...this.data.keys()][index] ?? null; }
  getItem(key) { return this.data.has(String(key)) ? this.data.get(String(key)) : null; }
  setItem(key, value) { this.data.set(String(key), String(value)); }
  removeItem(key) { this.data.delete(String(key)); }
}

function loadCacheHelpers() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const start = html.indexOf('        const getSafeLocal =');
  const end = html.indexOf('\n\n        function exportToExcel', start);
  assert.ok(start >= 0 && end > start, 'cache helpers can be extracted from the app');
  const helperSource = html.slice(start, end);
  const storage = new MemoryStorage();
  const context = {
    localStorage: storage,
    LEGACY_LOCAL_DATA_KEYS: ['pos_ilp_cache_role', 'pos_ilp_cadre_tasks'],
    ACCOUNT_CACHE_DATA_KEYS: ['pos_ilp_cadre_tasks'],
    LEGACY_OUTBOX_KEY: 'pos_ilp_outbox',
    OUTBOX_ACCOUNT_PREFIX: 'pos_ilp_outbox_account_',
    clearLocalData() {
      ['pos_ilp_cache_role', 'pos_ilp_cadre_tasks'].forEach(k => storage.removeItem(k));
    }
  };
  vm.createContext(context);
  vm.runInContext(`${helperSource}\nglobalThis.helpers = { accountCacheKey, accountOutboxKey, getAccountLocal, setAccountLocal, migrateLegacyCacheForAccount, loadAccountOutbox, getAccountPendingOutbox, setLocal, getSafeLocal };`, context);
  return { storage, helpers: context.helpers };
}

test('cache tugas terpisah berdasarkan role dan UID Firebase', () => {
  const { helpers, storage } = loadCacheHelpers();
  helpers.setAccountLocal('mawar1', 'uid-A', 'pos_ilp_cadre_tasks', [{ id: 'A' }]);
  helpers.setAccountLocal('mawar1', 'uid-B', 'pos_ilp_cadre_tasks', [{ id: 'B' }]);
  helpers.setAccountLocal('mawar2', 'uid-C', 'pos_ilp_cadre_tasks', [{ id: 'C' }]);

  assert.deepEqual(JSON.parse(storage.getItem(helpers.accountCacheKey('mawar1', 'uid-A', 'pos_ilp_cadre_tasks'))), [{ id: 'A' }]);
  assert.deepEqual(JSON.parse(storage.getItem(helpers.accountCacheKey('mawar1', 'uid-B', 'pos_ilp_cadre_tasks'))), [{ id: 'B' }]);
  assert.deepEqual(JSON.parse(storage.getItem(helpers.accountCacheKey('mawar2', 'uid-C', 'pos_ilp_cadre_tasks'))), [{ id: 'C' }]);
});

test('cache Beta 1 hanya dimigrasikan ke role yang ditandai', () => {
  const { helpers, storage } = loadCacheHelpers();
  helpers.setLocal('pos_ilp_cache_role', 'mawar3');
  helpers.setLocal('pos_ilp_cadre_tasks', [{ id: 'legacy-task' }]);

  helpers.migrateLegacyCacheForAccount('mawar2', 'uid-2');
  assert.equal(storage.getItem(helpers.accountCacheKey('mawar2', 'uid-2', 'pos_ilp_cadre_tasks')), null);

  helpers.migrateLegacyCacheForAccount('mawar3', 'uid-3');
  assert.deepEqual(JSON.parse(storage.getItem(helpers.accountCacheKey('mawar3', 'uid-3', 'pos_ilp_cadre_tasks'))), [{ id: 'legacy-task' }]);
  assert.equal(storage.getItem('pos_ilp_cadre_tasks'), null, 'legacy shared cache is cleared after migration');
});

test('antrean offline dimigrasikan dan dipisahkan per akun', () => {
  const { helpers, storage } = loadCacheHelpers();
  helpers.setLocal('pos_ilp_outbox', [
    { ownerRole: 'mawar1', key: 'cadre_tasks:T1', revision: 'rev-1' },
    { ownerRole: 'mawar2', key: 'cadre_tasks:T2', revision: 'rev-2' },
    { ownerRole: 'mawar1', ownerUid: 'uid-lama', key: 'cadre_tasks:T3', revision: 'rev-3' }
  ]);

  const mawar1 = helpers.loadAccountOutbox('mawar1', 'uid-A');
  assert.equal(mawar1.length, 1);
  assert.equal(mawar1[0].ownerUid, 'uid-A');
  assert.deepEqual(JSON.parse(storage.getItem(helpers.accountOutboxKey('mawar1', 'uid-A'))), JSON.parse(JSON.stringify(mawar1)));

  const mawar2 = helpers.loadAccountOutbox('mawar2', 'uid-B');
  assert.equal(mawar2.length, 1);
  assert.equal(mawar2[0].ownerUid, 'uid-B');
  assert.equal(helpers.getAccountPendingOutbox('mawar1', 'uid-A').length, 1);
  assert.equal(helpers.getAccountPendingOutbox('mawar2', 'uid-B').length, 1);
  assert.equal(helpers.getAccountPendingOutbox('mawar1', 'uid-lama').length, 0);
  const legacy = JSON.parse(storage.getItem('pos_ilp_outbox'));
  assert.deepEqual(legacy.map(x => x.revision), ['rev-3'], 'legacy item with another UID is preserved, not adopted');
});

test('antrean akun lain dalam namespace yang sama tidak diadopsi', () => {
  const { helpers, storage } = loadCacheHelpers();
  const scopedKey = helpers.accountOutboxKey('mawar1', 'uid-current');
  helpers.setLocal(scopedKey, [
    { ownerRole: 'mawar1', ownerUid: 'uid-current', revision: 'mine', key: 'participants:P1' },
    { ownerRole: 'mawar1', ownerUid: 'uid-other', revision: 'other', key: 'participants:P2' },
    { ownerRole: 'mawar2', ownerUid: 'uid-current', revision: 'wrong-role', key: 'participants:P3' }
  ]);
  const loaded = helpers.loadAccountOutbox('mawar1', 'uid-current');
  assert.deepEqual(Array.from(loaded, x => x.revision), ['mine']);
  assert.deepEqual(Array.from(helpers.getAccountPendingOutbox('mawar1', 'uid-current'), x => x.revision), ['mine']);
  assert.equal(JSON.parse(storage.getItem(scopedKey)).length, 1, 'only verified owner items remain in active queue');
});
