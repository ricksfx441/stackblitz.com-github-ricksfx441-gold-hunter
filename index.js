import http from 'node:http';
import { agents } from './agents.js';
import { recentAudit } from './guard.js';

// Data yang belum punya sumber nyata bernilai null. Frontend menampilkan "DATA TIDAK TERSEDIA".
const status = {
  mt5: 'OFFLINE', telegram: 'OFFLINE', price: null, balance: null, profit: null, winRate: null, drawdown: null,
  settings: { drawdownLimitPct: 5 }, // pengaturan desain awal, hanya Owner yang boleh mengubah
};

const routes = {
  '/api/status': () => status,
  '/api/agents': () => agents.map(({ access, ...pub }) => ({ ...pub, permissionCount: Object.values(access).flat().length })),
  '/api/audit': () => recentAudit(50),
};

http.createServer((req, res) => {
  const handler = req.method === 'GET' && routes[new URL(req.url, 'http://x').pathname];
  if (!handler) { res.writeHead(404, { 'content-type': 'application/json' }); return res.end('{"error":"not found"}'); }
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(handler()));
}).listen(8787, () => console.log('GOLD HUNTER server di http://localhost:8787'));
