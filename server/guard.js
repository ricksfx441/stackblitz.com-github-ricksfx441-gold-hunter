import fs from 'node:fs';
import path from 'node:path';
import { agents } from './agents.js';

const TYPES = ['folder', 'file', 'api', 'database', 'component'];
const OWNER_PATHS = ['/owner']; // tidak pernah boleh diakses agent, apa pun isi allowlist
const auditFile = () => process.env.AUDIT_FILE || path.join(process.cwd(), 'data', 'audit.log.jsonl');

function normPath(p) {
  if (typeof p !== 'string' || p.includes('\0') || p.split(/[\\/]/).includes('..')) return null;
  return path.posix.normalize('/' + p.replace(/\\/g, '/'));
}
function matches(rule, res) {
  if (rule.endsWith('/*')) { const base = rule.slice(0, -2); return res === base || res.startsWith(base + '/'); }
  return rule === res;
}
function log(entry) {
  fs.mkdirSync(path.dirname(auditFile()), { recursive: true });
  fs.appendFileSync(auditFile(), JSON.stringify({ time: new Date().toISOString(), ...entry }) + '\n');
}

// Mengembalikan { allowed, reason }. Semua keputusan dicatat di audit log.
export function check(agentId, type, resource) {
  const decide = (allowed, reason) => { log({ agent: agentId, type, resource, decision: allowed ? 'ALLOW' : 'DENY', reason }); return { allowed, reason }; };
  const agent = agents.find((x) => x.id === agentId);
  if (!agent) return decide(false, 'agent tidak dikenal');
  if (!TYPES.includes(type)) return decide(false, 'jenis akses tidak dikenal (termasuk perubahan izin)');
  let res = resource;
  if (type === 'folder' || type === 'file') {
    res = normPath(resource);
    if (!res) return decide(false, 'path tidak valid');
    if (OWNER_PATHS.some((o) => matches(o + '/*', res))) return decide(false, 'area Owner');
  } else if (typeof res !== 'string') return decide(false, 'resource tidak valid');
  const rules = agent.access[type] || [];
  return rules.some((r) => matches(r, res)) ? decide(true, 'ada di allowlist') : decide(false, 'tidak ada di allowlist (default deny)');
}

export function recentAudit(n = 50) {
  if (!fs.existsSync(auditFile())) return [];
  return fs.readFileSync(auditFile(), 'utf8').trim().split('\n').filter(Boolean).slice(-n).map((l) => JSON.parse(l));
}
