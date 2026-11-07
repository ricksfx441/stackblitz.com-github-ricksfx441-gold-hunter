import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
process.env.AUDIT_FILE = path.join(os.tmpdir(), `gh-audit-${Date.now()}.jsonl`);
const { check, recentAudit } = await import('./guard.js');

let fail = 0;
const t = (name, got, want) => { const ok = got === want; if (!ok) fail++; console.log(`${ok ? 'LULUS' : 'GAGAL'}  ${name}`); };

t('folder di allowlist diizinkan', check('risk', 'folder', '/risk/rules.json').allowed, true);
t('api di allowlist diizinkan', check('telegram', 'api', 'telegram.send').allowed, true);
t('folder tidak di allowlist ditolak', check('risk', 'folder', '/signals/x.json').allowed, false);
t('api milik agent lain ditolak', check('market', 'api', 'telegram.send').allowed, false);
t('agent tidak dikenal ditolak', check('hacker', 'api', 'news.read').allowed, false);
t('path traversal ditolak', check('risk', 'folder', '/risk/../owner/keys').allowed, false);
t('area Owner ditolak', check('head', 'file', '/owner/secret.txt').allowed, false);
t('perubahan izin oleh agent ditolak', check('system', 'permissions', 'head').allowed, false);
t('jenis akses acak ditolak', check('head', 'root', '/').allowed, false);

const denies = recentAudit(100).filter((e) => e.decision === 'DENY').length;
t('semua penolakan tercatat di audit log (7 penolakan)', denies, 7);
fs.rmSync(process.env.AUDIT_FILE, { force: true });
console.log(fail ? `\n${fail} tes gagal` : '\nSemua tes lulus');
process.exit(fail ? 1 : 0);
