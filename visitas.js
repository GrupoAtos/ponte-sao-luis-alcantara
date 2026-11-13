// Conta a visita (um visitante por dia por conexão, sem cookies e sem guardar o IP) e mostra os totais na página.
(() => {
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdG1pZ3VvZ3lqZnVjem5ld2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMDIyODQsImV4cCI6MjA2NzY3ODI4NH0.L9jdJ3NYKr3JXTQkPGuoKIFz80TIpAJAFtX1bbYsoCQ';
  const pagina = document.currentScript.dataset.pagina || 'maquete';
  if (navigator.webdriver || /bot|crawl|spider|lighthouse/i.test(navigator.userAgent)) return;
  const fmt = new Intl.NumberFormat('pt-BR');
  fetch('https://uotmiguogyjfucznewaj.supabase.co/rest/v1/rpc/ponte_visita', {
    method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_pagina: pagina }),
  }).then(r => r.ok ? r.json() : null).then(d => {
    if (!d) return;
    for (const k of ['visitantes', 'hoje', 'apoios'])
      document.querySelectorAll(`[data-n="${k}"]`).forEach(e => { e.textContent = fmt.format(d[k]); });
    document.querySelectorAll('[data-quando-contar]').forEach(e => { e.hidden = false; });
  }).catch(() => {});
})();
