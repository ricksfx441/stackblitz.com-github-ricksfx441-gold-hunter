// Registry 11 agent GOLD HUNTER. Izin = allowlist; semua yang tidak tercantum DITOLAK (default deny).
// Mengubah file ini = mengubah izin, wajib persetujuan Owner.
const a = (id, name, role, duties, access) => ({
  id, name, role, duties, status: 'OFFLINE', // belum ada mesin agent yang berjalan
  access: { folder: [], file: [], api: [], database: [], component: [], ...access },
});

export const agents = [
  a('head', 'Head Agent', 'Pengambil keputusan akhir', 'Menerima kandidat dari Risk Manager, memutuskan teruskan atau batal, menyusun laporan.',
    { folder: ['/reports/*'], api: ['signals.read', 'risk.read', 'reports.write'], database: ['decisions'], component: ['dashboard.head'] }),
  a('market', 'Market Analyst', 'Analisa tren dan konteks XAU/USD', 'Membaca data market dan berita, menentukan bias besar.',
    { folder: ['/analysis/market/*'], api: ['marketdata.read', 'news.read'], database: ['analysis_market'], component: ['dashboard.market'] }),
  a('smc', 'SMC Analyst', 'Analisa struktur SMC', 'Memetakan struktur, liquidity, dan zona (order block, FVG).',
    { folder: ['/analysis/smc/*'], api: ['marketdata.read'], database: ['analysis_smc'], component: ['dashboard.smc'] }),
  a('signal', 'Signal Analyst', 'Penyusun kandidat sinyal', 'Menggabungkan hasil Market, SMC, dan Scalping menjadi kandidat entry dengan SL dan TP.',
    { folder: ['/signals/*'], api: ['analysis.read', 'signals.write'], database: ['signals'], component: ['dashboard.signal'] }),
  a('risk', 'Risk Manager', 'Penjaga risiko', 'Memvalidasi SL/TP, menegakkan batas drawdown, dan memveto kandidat yang melanggar aturan.',
    { folder: ['/risk/*'], api: ['signals.read', 'account.read', 'risk.write'], database: ['risk_rules', 'risk_checks'], component: ['dashboard.risk'] }),
  a('mt5', 'MT5 Execution Agent', 'Monitoring dan eksekusi MT5 (hanya jika diizinkan Owner)', 'Membaca status akun MT5; eksekusi hanya atas izin khusus Owner.',
    { folder: ['/mt5/*'], api: ['mt5.status.read'], database: ['mt5_status'], component: ['dashboard.mt5'] }),
  a('telegram', 'Telegram Operator', 'Pengirim notifikasi', 'Mengirim sinyal dan laporan yang sudah disetujui ke Telegram.',
    { folder: ['/outbox/*'], api: ['telegram.send', 'reports.read'], database: ['outbox'], component: ['dashboard.telegram'] }),
  a('news', 'News Analyst', 'Pemantau berita', 'Mengumpulkan berita dan jadwal rilis data, lalu memberi tahu Market Analyst.',
    { folder: ['/analysis/news/*'], api: ['news.read'], database: ['news'], component: ['dashboard.news'] }),
  a('backtest', 'Backtest Analyst', 'Penguji strategi', 'Menjalankan backtest dan membuat laporan (win rate, profit factor, drawdown, out-of-sample, grade A-D/U).',
    { folder: ['/backtest/*', '/reports/backtest/*'], api: ['historical.read'], database: ['backtests'], component: ['dashboard.backtest'] }),
  a('system', 'System Engineer', 'Perawat sistem', 'Memantau kesehatan sistem dan memperbaiki error di wilayah kerjanya sendiri dengan laporan.',
    { folder: ['/system/*', '/logs/*'], api: ['health.read'], database: ['system_health'], component: ['dashboard.system'] }),
  a('scalp', 'Scalping Analyst', 'Analisa entry timeframe rendah', 'Mencari zona entry M1/M5/M15 yang searah bias besar.',
    { folder: ['/analysis/scalp/*'], api: ['marketdata.read'], database: ['analysis_scalp'], component: ['dashboard.scalp'] }),
];
