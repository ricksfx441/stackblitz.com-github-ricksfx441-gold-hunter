import './style.css';

const NA = 'DATA TIDAK TERSEDIA';
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const get = async (url) => { const r = await fetch(url); if (!r.ok) throw new Error(r.status); return r.json(); };

function stat(label, value, fmt = (v) => v) {
  const box = el('div', 'stat');
  box.append(el('span', '', label));
  box.append(el('strong', value == null || value === 'OFFLINE' ? 'na' : '', value == null ? NA : fmt(value)));
  return box;
}

async function render() {
  const stats = document.getElementById('stats');
  const agentsBox = document.getElementById('agents');
  const auditBox = document.getElementById('audit');
  try {
    const [s, agents, audit] = await Promise.all([get('/api/status'), get('/api/agents'), get('/api/audit')]);
    stats.replaceChildren(
      stat('Harga XAU/USD', s.price),
      stat('Saldo', s.balance),
      stat('Profit / loss', s.profit),
      stat('Win rate', s.winRate, (v) => v + '%'),
      stat('Drawdown (batas ' + s.settings.drawdownLimitPct + '%)', s.drawdown, (v) => v + '%'),
      stat('MT5', s.mt5),
      stat('Telegram', s.telegram),
    );
    agentsBox.replaceChildren(...agents.map((a) => {
      const row = el('div', 'row');
      const name = el('div'); name.append(el('b', '', a.name), el('small', '', a.role));
      row.append(name, el('div', '', a.duties + ' (' + a.permissionCount + ' izin)'), el('span', 'pill', a.status));
      return row;
    }));
    auditBox.replaceChildren(...(audit.length ? audit.slice().reverse().map((e) => {
      const l = el('div', 'log');
      l.append(el('span', e.decision === 'DENY' ? 'deny' : 'allow', e.decision), document.createTextNode(` ${e.agent} ${e.type} ${e.resource} (${e.reason})`));
      return l;
    }) : [el('div', 'empty', 'Belum ada catatan.')]));
  } catch {
    stats.replaceChildren(el('div', 'na', 'OFFLINE: server GOLD HUNTER tidak terhubung. Jalankan npm run dev.'));
    agentsBox.replaceChildren(); auditBox.replaceChildren();
  }
}
render();
setInterval(render, 10000);
