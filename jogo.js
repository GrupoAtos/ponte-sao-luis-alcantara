// Jogo "Construa a ponte": o visitante decide cada fase da obra (que aparece na maquete 3D) e depois administra o pedágio.
// Simulação simplificada, com valores ilustrativos na ordem de grandeza do estudo (R$ 13–18 bi, 6 a 7 anos de obra).
(() => {
  const ORCAMENTO = 16, PRAZO = 90, ANOS = 30, SITE = 'https://pontesaoluisbaixada.com.br/';
  const $ = (s, r = document) => r.querySelector(s);
  const bi = v => 'R$ ' + v.toFixed(1).replace('.', ',') + ' bi';
  const mi = v => 'R$ ' + Math.round(v / 1e6).toLocaleString('pt-BR') + ' mi';
  const num = v => Math.round(v).toLocaleString('pt-BR');
  const sinal = (v, f) => (v > 0 ? '+' : '−') + f(Math.abs(v));
  const espera = ms => new Promise(r => setTimeout(r, ms / (window.__jogoVel || 1)));
  const cena = () => window.__cena;

  document.head.insertAdjacentHTML('beforeend', `<style>
  #jogar { position:fixed; left:50%; bottom:78px; transform:translateX(-50%); z-index:5; background:#ffb347; color:#1a1a1a; font-weight:800; font-size:15px;
    padding:12px 20px; border-radius:999px; border:2px solid rgba(255,255,255,.55); box-shadow:0 6px 22px rgba(0,0,0,.4); cursor:pointer; white-space:nowrap; animation:jpulso 2.4s infinite; }
  #jogar:hover { background:#ffc670; color:#1a1a1a; }
  @keyframes jpulso { 0%,100% { box-shadow:0 6px 22px rgba(0,0,0,.4), 0 0 0 0 rgba(255,179,71,.55); } 50% { box-shadow:0 6px 22px rgba(0,0,0,.4), 0 0 0 12px rgba(255,179,71,0); } }
  @media (max-width:1150px){ #jogar { left:auto; right:100px; bottom:140px; transform:none; } }
  @media (max-width:600px){ #jogar { right:auto; left:16px; bottom:72px; font-size:14px; padding:10px 14px; } }
  body.jogando .panel, body.jogando #hide, body.jogando #irpara, body.jogando #dica, body.jogando #apoiar, body.jogando #jogar,
  body.jogando #escala, body.jogando #nav, body.jogando #bussola { display:none !important; }
  #jogo { position:fixed; inset:0; z-index:8; pointer-events:none; font-size:14px; line-height:1.45; }
  #jogo > * { pointer-events:auto; }
  #jtopo { position:absolute; left:12px; right:12px; top:12px; display:flex; flex-wrap:wrap; gap:8px; align-items:stretch; }
  #jtopo .f, #jtopo .i { background:rgba(15,29,43,.92); border:1px solid rgba(255,255,255,.12); border-radius:10px; padding:6px 12px; backdrop-filter:blur(8px); }
  #jtopo .f { font-weight:700; color:#ffb347; display:flex; align-items:center; }
  #jtopo .i { font-size:11px; color:#9db3c4; min-width:86px; }
  #jtopo .i b { display:block; font-size:15px; color:#fff; font-variant-numeric:tabular-nums; }
  #jtopo .i.ruim b { color:#ff7b6b; } #jtopo .i.bom b { color:#7fe0a0; }
  #jtopo button { margin-left:auto; }
  #jcard { position:absolute; left:12px; bottom:12px; width:440px; max-width:calc(100vw - 24px); max-height:calc(100vh - 150px); overflow:auto; box-sizing:border-box;
    background:rgba(15,29,43,.95); border:1px solid rgba(255,255,255,.14); border-radius:16px; padding:18px 18px 16px; box-shadow:0 18px 50px rgba(0,0,0,.5); backdrop-filter:blur(8px); }
  #jcard.meio { left:50%; top:50%; bottom:auto; transform:translate(-50%,-50%); width:560px; max-height:calc(100vh - 40px); }
  #jcard .k { color:#ffb347; font-size:11.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
  #jcard h2 { font-size:21px; line-height:1.2; margin:4px 0 8px; color:#fff; }
  #jcard p { margin:0 0 10px; color:#d5e0e8; }
  #jcard .sab { font-size:12.5px; color:#9db3c4; border-left:3px solid #ffb347; padding-left:10px; }
  #jcard .op { display:block; width:100%; text-align:left; margin:8px 0 0; padding:11px 12px; border-radius:11px; background:#1d3346; border:1px solid rgba(255,255,255,.14); font-size:14px; color:#fff; }
  #jcard .op:hover { background:#27445c; color:#fff; border-color:#ffb347; }
  #jcard .op b { display:block; } #jcard .op span { display:block; color:#b9c8d4; font-size:12.5px; margin-top:2px; }
  #jcard .op i { display:block; font-style:normal; font-size:12px; color:#ffcf8a; margin-top:4px; }
  #jcard .ac { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
  #jcard .ac button, #jcard .ac a { font-size:15px; font-weight:700; padding:11px 16px; border-radius:10px; border:0; cursor:pointer; text-decoration:none; }
  #jcard .pri { background:#ffb347; color:#1a1a1a; } #jcard .apo { background:#e2711d; color:#fff; } #jcard .sec { background:#1d3346; color:#fff; }
  #jcard .bar { height:10px; border-radius:6px; background:rgba(255,255,255,.12); overflow:hidden; margin:10px 0 6px; }
  #jcard .bar i { display:block; height:100%; width:0; background:linear-gradient(90deg,#ffb347,#ff7a1a); }
  #jcard .ev { border-radius:10px; padding:10px 12px; margin:10px 0 0; background:rgba(255,107,90,.14); border:1px solid rgba(255,107,90,.4); }
  #jcard .ev.boa { background:rgba(127,224,160,.12); border-color:rgba(127,224,160,.4); }
  #jcard label { display:grid; grid-template-columns:1fr auto; gap:0 10px; margin:10px 0 0; font-weight:600; color:#fff; }
  #jcard label input { grid-column:1 / 3; width:100%; accent-color:#ffb347; margin:4px 0 0; }
  #jcard label output { color:#ffb347; font-variant-numeric:tabular-nums; }
  #jcard table { width:100%; border-collapse:collapse; font-size:13px; margin:8px 0 0; }
  #jcard td { padding:4px 0; border-top:1px solid rgba(255,255,255,.08); color:#d5e0e8; } #jcard td:last-child { text-align:right; color:#fff; font-weight:600; font-variant-numeric:tabular-nums; }
  #jcard .nota { font-size:11px; color:#8ea3b3; margin:12px 0 0; }
  #jcard .est { font-size:30px; letter-spacing:4px; color:#ffb347; margin:2px 0 6px; }
  @media (max-width:600px){ #jtopo { left:8px; right:8px; top:8px; gap:5px; } #jtopo .f { width:100%; box-sizing:border-box; font-size:13px; } #jtopo .i { flex:1; min-width:0; padding:5px 8px; font-size:10px; } #jtopo .i b { font-size:13px; }
    #jtopo button { position:absolute; right:6px; top:4px; padding:3px 8px; }
    #jcard, #jcard.meio { left:8px; right:8px; bottom:8px; top:auto; transform:none; width:auto; max-width:none; max-height:56vh; padding:14px; font-size:13.5px; } #jcard h2 { font-size:18px; } }
  </style>`);

  // ---------- fases da obra ----------
  // cada opção: c = custo (R$ bi), m = meses, a = apoio popular, q = qualidade, r = risco de imprevisto
  const FASES = [
    { n:'Estudos, projeto e licença', oque:'Antes de qualquer máquina: sondagens do fundo da baía, projeto de engenharia, estudo de impacto ambiental e consulta às comunidades.',
      sab:'O traçado tem 12,7 km sobre a Baía de São Marcos. As boias laranja marcam o eixo da ponte.',
      exec:'Barcos de sondagem percorrem o eixo da ponte…',
      ops:[
        { t:'Projeto básico, com pressa', d:'Poucas sondagens. Começa logo, mas o fundo da baía pode guardar surpresas.', c:0.5, m:12, r:25, semSondagem:1 },
        { t:'Projeto executivo e sondagens em toda a baía', d:'Sabe-se onde está a rocha antes de cravar a primeira estaca.', c:0.9, m:20, q:8, r:-5 },
        { t:'Projeto completo e consulta ampla às comunidades', d:'Ouve pescadores, quilombolas e moradores das duas margens antes da licença.', c:1.1, m:24, a:14, q:8, r:-10, consulta:1 },
      ] },
    { n:'Canteiros e acessos', oque:'Monta-se a base da obra: canteiros, cais de serviço, fábrica de peças de concreto e as vias que ligam a ponte à Av. dos Holandeses e ao Anel do Contorno de Alcântara.',
      sab:'Em Alcântara, a via nova de 2,8 km contorna a cidade e não cruza o centro histórico tombado.',
      exec:'Abrindo os acessos e montando os canteiros…',
      ops:[
        { t:'Um canteiro só, em São Luís', d:'Mais barato agora. Todo o material atravessa a baía de balsa, e a obra anda mais devagar.', c:0.5, m:7, ritmo:1.15 },
        { t:'Canteiros nas duas margens e fábrica de pré-moldados', d:'Duas frentes de trabalho. As fases seguintes ficam mais rápidas.', c:0.8, m:9, ritmo:0.88 },
        { t:'Duas margens, fábrica e capacitação de mão de obra local', d:'Além das duas frentes, forma e contrata trabalhadores de Alcântara e da Baixada.', c:0.95, m:10, a:12, ritmo:0.9 },
      ] },
    { n:'Fundações no mar', oque:'Balsas-guindaste cravam estacas de grande diâmetro até a rocha, pilar por pilar, das margens para o meio da baía. Sobre elas nascem os blocos que vão sustentar a ponte.',
      sab:'A maré em São Luís passa de 6 metros de variação, uma das maiores do Brasil. Ela dita o horário de trabalho das balsas.',
      exec:'Balsas cravando estacas, das margens para o centro…',
      ops:[
        { t:'Uma frente de balsas', d:'Ritmo seguro, sem pressa.', c:2.9, m:17 },
        { t:'Duas frentes de balsas, uma em cada margem', d:'Mais equipamento alugado, menos tempo no mar.', c:3.3, m:12 },
        { t:'Estacas mais curtas para economizar', d:'Reduz o custo, mas aumenta o risco de reforço mais tarde e a ponte dura menos.', c:2.5, m:14, q:-15, r:30 },
      ] },
    { n:'Pilares e torres', oque:'Os pilares sobem em concreto até a altura do tabuleiro. No centro, as duas torres do vão estaiado chegam a 240 metros, mais altas que qualquer prédio de São Luís.',
      sab:'O vão central precisa de 80 m de altura livre para os navios que vão ao Porto do Itaqui e à Ponta da Madeira.',
      exec:'Pilares e torres subindo com formas trepantes…',
      ops:[
        { t:'Concreto convencional', d:'Mais barato. No ar salgado da baía, vai exigir mais manutenção.', c:2.3, m:13, q:-10 },
        { t:'Concreto de alto desempenho contra a maresia', d:'Protege o aço por dentro. Manutenção menor durante décadas.', c:2.7, m:13, q:15 },
        { t:'Alto desempenho e turno noturno', d:'Mesma qualidade, com a obra rodando 24 horas.', c:3.0, m:9, q:12 },
      ] },
    { n:'Viadutos de acesso', oque:'São quase 11 km de tabuleiro entre as margens e o vão central. As peças avançam de pilar em pilar, a partir das duas margens.',
      sab:'O tabuleiro leva 4 faixas de carro e 2 linhas de trem de passageiros lado a lado.',
      exec:'Treliças lançadeiras avançando pilar a pilar…',
      ops:[
        { t:'Concretar no local, com escoramento', d:'Método tradicional: barato e lento.', c:3.6, m:20 },
        { t:'Vigas pré-moldadas lançadas por treliça', d:'As peças vêm prontas da fábrica e são içadas no lugar.', c:4.0, m:14 },
        { t:'Aduelas pré-moldadas com duas treliças', d:'O método mais rápido, usado nas grandes pontes marítimas.', c:4.4, m:10, q:5 },
      ] },
    { n:'Vão central estaiado', oque:'A parte mais delicada: o tabuleiro cresce para os dois lados de cada torre ao mesmo tempo, em equilíbrio, e cada novo trecho é pendurado por um par de estais. No fim, as duas metades se encontram no meio.',
      sab:'O vão livre é de 700 m. Os cabos de aço (estais) transferem o peso do tabuleiro para as torres.',
      exec:'Balanços sucessivos: o tabuleiro avança e os estais são tensionados…',
      ops:[
        { t:'Ritmo normal', d:'Um trecho por semana de cada lado.', c:2.5, m:13 },
        { t:'Monitoramento de vento e estais com proteção tripla', d:'Sensores param o içamento quando o vento aperta. Cabos mais duráveis.', c:2.9, m:14, q:15, r:-15, vento:1 },
        { t:'Ritmo acelerado', d:'Dois trechos por semana. Ganha tempo e aumenta o risco.', c:2.7, m:9, r:25 },
      ] },
    { n:'Acabamento e sistemas', oque:'Asfalto, trilhos, barreiras, iluminação, sinalização náutica e aérea, estações de trem e o sistema de pedágio.',
      sab:'A estação de São Luís fica na cabeceira, integrada aos ônibus da Av. dos Holandeses.',
      exec:'Pavimentação, trilhos, iluminação e estações…',
      ops:[
        { t:'Praça de pedágio com cabines', d:'Mais barata de instalar. Gera fila e custa mais para operar.', c:1.3, m:7, a:-5, cabines:1 },
        { t:'Pedágio eletrônico, sem cancela', d:'Câmeras e etiquetas leem a placa com o carro em movimento.', c:1.5, m:7, a:4 },
        { t:'Pedágio eletrônico, ciclovia e mirante turístico', d:'A ponte vira também um ponto de visita, com vista da baía e de Alcântara.', c:1.7, m:8, a:12, turismo:0.05 },
      ] },
  ];
  const EVENTOS = {
    0:[{ se:s => !s.consulta, t:'A licença ambiental foi questionada na Justiça por falta de consulta às comunidades.', m:4, a:-6 }],
    1:[{ t:'Desapropriações na cabeceira de São Luís demoraram mais que o previsto.', m:2, c:0.1 }],
    2:[{ se:s => s.semSondagem, certo:1, t:'Sem sondagens suficientes, a rocha apareceu 15 m mais funda que o previsto. As estacas tiveram de ser alongadas.', c:0.6, m:4 },
       { t:'Marés de sizígia, com mais de 6 m de variação, pararam as balsas por semanas.', m:2 }],
    3:[{ t:'O inverno maranhense veio forte: chuva pesada de janeiro a junho atrasou as concretagens.', m:2 }],
    4:[{ t:'O aço ficou mais caro com a alta do dólar.', c:0.3 },
       { boa:1, t:'A equipe bateu recorde: um vão inteiro lançado a cada três dias.', m:-2 }],
    5:[{ se:s => !s.vento, t:'Os ventos fortes do segundo semestre interromperam os içamentos várias vezes.', m:3, c:0.1 },
       { se:s => s.vento, boa:1, certo:1, t:'O monitoramento de vento evitou paradas de emergência: nenhum dia perdido por acidente.', m:-1 }],
    6:[{ boa:1, t:'A cidade acompanhou os testes de carga com trens e caminhões. A expectativa cresceu.', a:5 }],
  };

  // ---------- estado e interface ----------
  let S, raiz, topo, card, vivo = 0;
  const novo = () => ({ custo:0, meses:0, apoio:58, qual:50, risco:0, ritmo:1, turismo:0, fase:0, log:[] });

  function montar(){
    raiz = document.createElement('div'); raiz.id = 'jogo';
    raiz.innerHTML = '<div id="jtopo"></div><div id="jcard"></div>';
    document.body.appendChild(raiz); topo = $('#jtopo', raiz); card = $('#jcard', raiz);
    document.body.classList.add('jogando');
    document.getElementById('intro')?.remove();
    try { sessionStorage.setItem('introVisto', '1'); } catch {}
    cena().trem.visible = true;
  }
  function sair(){
    vivo++; raiz?.remove(); raiz = null; document.body.classList.remove('jogando');
    const c = cena(); c.obra.set(null); c.obra.trafego(1); c.setView('geral');
  }
  const ind = (rot, val, cls = '') => `<div class="i ${cls}">${rot}<b>${val}</b></div>`;
  function placarObra(){
    topo.innerHTML = `<div class="f">Fase ${Math.min(S.fase + 1, 7)} de 7 · ${FASES[Math.min(S.fase, 6)].n}</div>` +
      ind('Gasto (meta ' + ORCAMENTO + ' bi)', bi(S.custo), S.custo > ORCAMENTO ? 'ruim' : '') +
      ind('Prazo (meta ' + PRAZO + ' meses)', S.meses + ' meses', S.meses > PRAZO ? 'ruim' : '') +
      ind('Apoio popular', Math.round(S.apoio) + '%', S.apoio < 40 ? 'ruim' : S.apoio > 70 ? 'bom' : '') +
      ind('Qualidade', Math.round(S.qual), S.qual < 40 ? 'ruim' : S.qual > 70 ? 'bom' : '') +
      '<button id="jsair">Sair</button>';
    $('#jsair', topo).onclick = sair;
  }
  function tela(html, meio = false){ card.className = meio ? 'meio' : ''; card.innerHTML = html; card.scrollTop = 0; }
  // anima a obra na maquete de p0 a p1
  function animar(p0, p1, ms, aoPasso){
    const meu = vivo, t0 = performance.now(); ms /= window.__jogoVel || 1;
    return new Promise(res => {
      (function passo(){
        if (meu !== vivo) return;
        const k = Math.min(1, (performance.now() - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        cena().obra.set(p0 + (p1 - p0) * e); if (k > 0 && k < 1) cena().obra.acompanhar(p0 + (p1 - p0) * e); aoPasso?.(k);
        k < 1 ? requestAnimationFrame(passo) : res();
      })();
    });
  }
  const efeitos = o => [o.c ? sinal(o.c, bi) : '', o.m ? sinal(o.m, v => v + (v === 1 ? ' mês' : ' meses')) : '',
    o.a ? 'apoio ' + sinal(o.a, v => v) : '', o.q ? 'qualidade ' + sinal(o.q, v => v) : '', o.r > 0 ? 'mais risco' : o.r < 0 ? 'menos risco' : ''].filter(Boolean).join(' · ');

  // ---------- telas ----------
  function inicio(){
    montar(); S = novo(); const c = cena(); c.obra.set(0); c.obra.vista(0, 1.2);
    topo.innerHTML = '<div class="f">Construa a ponte</div><button id="jsair">Sair</button>'; $('#jsair', topo).onclick = sair;
    tela(`<div class="k">Jogo · simulação</div><h2>Você comanda a obra da ponte São Luís–Alcântara</h2>
      <p>São <b>7 fases</b>, dos estudos à inauguração. Em cada uma você toma uma decisão e vê a ponte nascer na maquete. Depois, administra o <b>pedágio</b> e o <b>trem</b> por 30 anos.</p>
      <table><tr><td>Orçamento de referência</td><td>${bi(ORCAMENTO)}</td></tr><tr><td>Prazo de referência</td><td>${PRAZO} meses (7,5 anos)</td></tr><tr><td>Seu desafio</td><td>entregar no prazo, sem estourar o caixa e com o povo ao seu lado</td></tr></table>
      <div class="ac"><button class="pri" id="jgo">Começar a obra</button><button class="sec" id="jver">Só assistir às fases</button></div>
      <p class="nota">Simulação simplificada, com valores ilustrativos na ordem de grandeza do estudo. Não é projeto de engenharia nem proposta oficial.</p>`, true);
    $('#jgo').onclick = () => fase(0); $('#jver').onclick = assistir;
  }
  function fase(i){
    S.fase = i; placarObra(); cena().obra.vista(i);
    const F = FASES[i];
    tela(`<div class="k">Fase ${i + 1} de 7</div><h2>${F.n}</h2><p>${F.oque}</p><p class="sab">${F.sab}</p>` +
      F.ops.map((o, k) => `<button class="op" data-k="${k}"><b>${o.t}</b><span>${o.d}</span><i>${efeitos({ ...o, m: i > 1 && i < 6 ? Math.round(o.m * S.ritmo) : o.m })}</i></button>`).join(''));
    card.querySelectorAll('.op').forEach(b => b.onclick = () => executar(i, F.ops[b.dataset.k]));
  }
  async function executar(i, o){
    const meu = vivo, F = FASES[i], meses = i > 1 && i < 6 ? Math.round(o.m * S.ritmo) : o.m, m0 = S.meses, c0 = S.custo;
    Object.assign(S, { semSondagem: S.semSondagem || o.semSondagem, consulta: S.consulta || o.consulta, vento: S.vento || o.vento, cabines: S.cabines || o.cabines });
    if (o.ritmo) S.ritmo = o.ritmo; if (o.turismo) S.turismo = o.turismo;
    S.risco += o.r || 0; S.apoio = Math.max(0, Math.min(100, S.apoio + (o.a || 0))); S.qual = Math.max(0, Math.min(100, S.qual + (o.q || 0)));
    tela(`<div class="k">Fase ${i + 1} · em execução</div><h2>${F.n}</h2><p>${F.exec}</p><div class="bar"><i></i></div><p class="nota" id="jmes"></p>`);
    const barra = $('.bar i', card), jm = $('#jmes', card);
    await animar(i, i + 1, 6500, k => { barra.style.width = (k * 100) + '%';
      S.meses = Math.round(m0 + meses * k); S.custo = c0 + o.c * k; jm.textContent = 'Mês ' + S.meses + ' da obra'; if ((k * 60 | 0) % 6 === 0) placarObra(); });
    if (meu !== vivo) return;
    S.meses = m0 + meses; S.custo = c0 + o.c;
    // imprevisto
    const pool = (EVENTOS[i] || []).filter(e => !e.se || e.se(S)), certo = pool.find(e => e.certo);
    const ev = certo || (Math.random() < 0.3 + S.risco / 120 ? pool.filter(e => !e.boa)[0] : Math.random() < 0.35 ? pool.filter(e => e.boa)[0] : null);
    if (ev){ S.custo += ev.c || 0; S.meses += ev.m || 0; S.apoio = Math.max(0, Math.min(100, S.apoio + (ev.a || 0))); }
    placarObra();
    tela(`<div class="k">Fase ${i + 1} concluída</div><h2>${F.n}: pronto</h2>
      <table><tr><td>Custo da fase</td><td>${bi(S.custo - c0)}</td></tr><tr><td>Duração</td><td>${S.meses - m0} meses</td></tr></table>` +
      (ev ? `<div class="ev ${ev.boa ? 'boa' : ''}"><b>${ev.boa ? 'Boa notícia' : 'Imprevisto'}</b><br>${ev.t}<br><small>${efeitos(ev)}</small></div>` : '') +
      `<div class="ac"><button class="pri" id="jprox">${i < 6 ? 'Próxima fase: ' + FASES[i + 1].n : 'Inaugurar a ponte'}</button></div>`);
    $('#jprox').onclick = () => i < 6 ? fase(i + 1) : inaugurar();
  }
  const estrelas = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  function notaObra(){
    let n = 1;
    if (S.custo <= ORCAMENTO * 1.1) n++; if (S.custo <= ORCAMENTO) n++;
    if (S.meses <= PRAZO * 1.1) n++; if (S.meses <= PRAZO) n++;
    if (S.qual < 40) n--; if (S.apoio < 40) n--;
    return Math.max(1, Math.min(5, n));
  }
  async function inaugurar(){
    const meu = vivo; S.fase = 7;
    topo.innerHTML = '<div class="f">Inauguração</div><button id="jsair">Sair</button>'; $('#jsair', topo).onclick = sair;
    tela(`<div class="k">Dia da inauguração</div><h2>A ponte está aberta</h2><p>Os primeiros carros e o primeiro trem cruzam a Baía de São Marcos. A travessia que levava horas de ferryboat agora leva cerca de 15 minutos.</p><div class="bar"><i></i></div>`);
    cena().obra.vista(7); const barra = $('.bar i', card);
    await animar(7, 8, 5000, k => { barra.style.width = (k * 100) + '%'; });
    if (meu !== vivo) return;
    cena().obra.set(null); S.notaObra = notaObra();
    tela(`<div class="k">Resultado da obra</div><div class="est">${estrelas(S.notaObra)}</div><h2>${S.custo <= ORCAMENTO && S.meses <= PRAZO ? 'No prazo e dentro do orçamento' : S.custo > ORCAMENTO && S.meses > PRAZO ? 'Entregue, mas com atraso e estouro' : S.custo > ORCAMENTO ? 'Entregue no prazo, acima do orçamento' : 'Entregue dentro do orçamento, com atraso'}</h2>
      <table><tr><td>Custo final</td><td>${bi(S.custo)} (meta ${bi(ORCAMENTO)})</td></tr><tr><td>Prazo</td><td>${S.meses} meses · ${(S.meses / 12).toFixed(1).replace('.', ',')} anos</td></tr>
      <tr><td>Apoio popular</td><td>${Math.round(S.apoio)}%</td></tr><tr><td>Qualidade da obra</td><td>${Math.round(S.qual)} de 100</td></tr></table>
      <p class="sab" style="margin-top:12px">No mundo real, pontes desse porte costumam passar do orçamento. A Salvador–Itaparica foi de R$ 5,3 bi para R$ 11,6 bi ao longo dos anos.</p>
      <div class="ac"><button class="pri" id="jped">Agora administre o pedágio</button></div>`, true);
    $('#jped').onclick = concessao;
  }

  // ---------- operação: pedágio e trem ----------
  const DECISOES = {
    5:  { t:'Moradores da Baixada pedem desconto de 50% no pedágio.', sim:'Dar o desconto', nao:'Manter a tarifa cheia', f:s => { s.desconto = 1; }, ef:'receita de carros −12% · aprovação +10' },
    10: { t:'Os engenheiros recomendam a manutenção preventiva dos estais e das juntas.', custo:60e6, sim:'Fazer agora (R$ 60 mi)', nao:'Adiar', f:s => { s.preventiva = 1; }, ef:'evita reparo de emergência mais adiante' },
    15: { t:'Os lançamentos em Alcântara atraem turistas. Vale abrir um centro de visitantes na cabeceira?', custo:30e6, sim:'Investir (R$ 30 mi)', nao:'Não investir', f:s => { s.turismo += 0.08; }, ef:'movimento +8% daqui em diante' },
    20: { t:'O asfalto e os trilhos chegaram ao fim da vida útil.', custo:90e6, sim:'Renovar tudo (R$ 90 mi)', nao:'Fazer remendos', f:s => { s.renovou = 1; }, ef:'sem a renovação: custo de operação +20% e aprovação em queda' },
    25: { t:'O trem anda lotado nos horários de pico.', custo:50e6, sim:'Comprar mais trens (R$ 50 mi)', nao:'Deixar como está', f:s => { s.tremBonus = 0.3; }, ef:'passageiros +30%' },
  };
  function previsao(s, y){
    const g = Math.pow(1.035, y - 1) * (1 + s.turismo), humor = s.aprov < 35 ? 0.85 : 1;
    const carros = 11200 * g * Math.exp(-s.pc / 40) * humor, cam = 1900 * g * Math.exp(-s.pt / 110) * humor, pax = 7000 * g * Math.exp(-s.pf / 14) * (1 + (s.tremBonus || 0));
    const receita = 365 * (carros * s.pc * (s.desconto ? 0.88 : 1) + cam * s.pt + pax * s.pf);
    const opex = 38e6 * (1 + (55 - s.qual) / 120) * (s.cabines ? 1.15 : 1) * Math.pow(1.01, y - 1) * (y > 20 && !s.renovou ? 1.2 : 1);
    const alvo = 78 - Math.max(0, s.pc - 15) * 1.3 - Math.max(0, s.pf - 5) * 1.6 - Math.max(0, s.pt - 60) * 0.08 + (s.desconto ? 10 : 0) + (s.bonusApoio || 0) - (y > 20 && !s.renovou ? 8 : 0);
    return { veic: carros + cam, pax, receita, opex, lucro: receita - opex, alvo: Math.max(0, Math.min(100, alvo)) };
  }
  function placarOp(p){
    const falta = Math.max(0, S.divida - S.pago);
    topo.innerHTML = `<div class="f">Concessão · ano ${S.ano} de ${ANOS}</div>` + ind('Veículos por dia', num(p.veic)) + ind('Passageiros de trem/dia', num(p.pax)) +
      ind('Financiamento pago', Math.min(100, Math.round(S.pago / S.divida * 100)) + '%', falta === 0 ? 'bom' : S.pago < 0 ? 'ruim' : '') +
      ind('Aprovação', Math.round(S.aprov) + '%', S.aprov < 35 ? 'ruim' : S.aprov > 65 ? 'bom' : '') + '<button id="jsair">Sair</button>';
    $('#jsair', topo).onclick = sair;
  }
  function concessao(){
    Object.assign(S, { ano:0, pc:25, pt:75, pf:8, aprov: Math.max(35, Math.min(80, S.apoio)), pago:0, quitou:0, bonusApoio: S.turismo ? 4 : 0,
      divida: 2.4e9 + Math.max(0, S.custo - ORCAMENTO) * 0.3e9 });
    cena().obra.set(null); cena().setView('vao');
    topo.innerHTML = '<div class="f">Concessão</div><button id="jsair">Sair</button>'; $('#jsair', topo).onclick = sair;
    tela(`<div class="k">Segunda parte</div><h2>Agora você opera a ponte por 30 anos</h2>
      <p>O pedágio sozinho não paga uma obra de ${bi(S.custo)}. Como nas grandes pontes brasileiras, a maior parte veio de dinheiro público, numa parceria público-privada.</p>
      <p>A sua concessionária financiou <b>${bi(S.divida / 1e9)}</b>${S.custo > ORCAMENTO ? ' (o estouro do orçamento aumentou a sua parte)' : ''}. Você define as tarifas, cuida da manutenção e precisa <b>quitar o financiamento em 30 anos sem perder o apoio da população</b>.</p>
      <div class="ac"><button class="pri" id="jop">Definir as tarifas</button></div>`, true);
    $('#jop').onclick = rodada;
  }
  function rodada(){
    const y = S.ano + 1, D = DECISOES[S.ano]; let escolha = D ? null : 0;
    const html = () => { const p = previsao(S, y); placarOp(p);
      return `<table><tr><td>Receita prevista no ano ${y}</td><td>${mi(p.receita)}</td></tr><tr><td>Operação e manutenção</td><td>${mi(p.opex)}</td></tr>
        <tr><td>Sobra para pagar o financiamento</td><td style="color:${p.lucro < 0 ? '#ff7b6b' : '#7fe0a0'}">${mi(p.lucro)}</td></tr><tr><td>Aprovação tende a</td><td>${Math.round(p.alvo)}%</td></tr></table>`; };
    tela(`<div class="k">Anos ${y} a ${y + 4}</div><h2>Tarifas da ponte</h2>` +
      (D ? `<div class="ev boa" id="jdec"><b>Decisão</b><br>${D.t}<br><small>${D.ef}</small><div class="ac" style="margin-top:8px"><button class="sec" data-e="1">${D.sim}</button><button class="sec" data-e="0">${D.nao}</button></div></div>` : '') +
      `<label>Carro <output id="opc"></output><input type="range" id="ipc" min="0" max="80" step="1" value="${S.pc}"></label>
       <label>Caminhão <output id="opt"></output><input type="range" id="ipt" min="0" max="250" step="5" value="${S.pt}"></label>
       <label>Passagem do trem <output id="opf"></output><input type="range" id="ipf" min="0" max="30" step="1" value="${S.pf}"></label>
       <div id="jprev"></div><div class="ac"><button class="pri" id="jrun">Operar 5 anos</button></div>`);
    const atual = () => { S.pc = +$('#ipc').value; S.pt = +$('#ipt').value; S.pf = +$('#ipf').value;
      $('#opc').textContent = 'R$ ' + S.pc; $('#opt').textContent = 'R$ ' + S.pt; $('#opf').textContent = 'R$ ' + S.pf; $('#jprev').innerHTML = html(); };
    card.querySelectorAll('input').forEach(i => i.oninput = atual); atual();
    const run = $('#jrun');
    if (D){ run.disabled = true; run.style.opacity = .45;
      card.querySelectorAll('#jdec button').forEach(b => b.onclick = () => { escolha = +b.dataset.e;
        card.querySelectorAll('#jdec button').forEach(x => { x.style.outline = x === b ? '2px solid #ffb347' : ''; x.style.opacity = x === b ? 1 : .5; });
        run.disabled = false; run.style.opacity = 1; }); }
    run.onclick = () => { if (D && escolha){ D.f(S); S.pago -= D.custo || 0; } operar(); };
  }
  async function operar(){
    const meu = vivo, c = cena(), VISTAS = ['sobrevoo', 'dirigir', 'trem', 'vao', 'sl', 'geral'], linhas = [];
    c.setView(VISTAS[(S.ano / 5) % VISTAS.length]);
    tela(`<div class="k">Operando</div><h2 id="jano"></h2><div class="bar"><i></i></div><div id="jlin"></div>`);
    for (let k = 0; k < 5; k++){
      const y = ++S.ano, p = previsao(S, y); let lucro = p.lucro, nota = '';
      if (y === 17 && !S.preventiva){ lucro -= 220e6; S.aprov -= 12; nota = 'Um estai rompeu por corrosão. Reparo de emergência de R$ 220 mi e ponte parcialmente fechada por semanas.'; }
      else if (y === 8 || y === 23) nota = 'Festejo do Divino em Alcântara bateu recorde de travessias.';
      else if (y === 13) nota = 'Novos bairros e pousadas surgem em Alcântara com a travessia rápida.';
      S.pago += lucro; S.aprov += (p.alvo - S.aprov) * 0.35; S.aprov = Math.max(0, Math.min(100, S.aprov));
      if (!S.quitou && S.pago >= S.divida) S.quitou = y;
      c.obra.trafego(p.veic / 9000); placarOp(p);
      $('#jano').textContent = 'Ano ' + y + ': ' + (lucro >= 0 ? 'sobra de ' : 'prejuízo de ') + mi(Math.abs(lucro));
      $('.bar i', card).style.width = Math.max(0, Math.min(100, S.pago / S.divida * 100)) + '%';
      if (nota) linhas.push(`<div class="ev ${nota.startsWith('Um estai') ? '' : 'boa'}"><b>Ano ${y}</b><br>${nota}</div>`);
      if (S.quitou === y) linhas.push(`<div class="ev boa"><b>Ano ${y}</b><br>Financiamento quitado.</div>`);
      $('#jlin').innerHTML = linhas.join('');
      await espera(1100); if (meu !== vivo) return;
    }
    if (S.aprov < 20) return fim('cassada');
    if (S.ano >= ANOS) return fim();
    card.insertAdjacentHTML('beforeend', `<div class="ac"><button class="pri" id="jmais">Próximos 5 anos</button></div>`);
    card.scrollTop = card.scrollHeight; $('#jmais').onclick = rodada;
  }
  function fim(motivo){
    const c = cena(); c.setView('geral'); c.obra.trafego(1);
    let n = S.notaObra + (motivo ? -2 : S.quitou ? (S.quitou <= 22 ? 1 : 0) : -1) + (S.aprov >= 60 ? 1 : S.aprov < 35 ? -1 : 0);
    n = Math.max(1, Math.min(5, n));
    const titulo = motivo ? 'A concessão foi retomada pelo governo' : S.quitou ? 'Financiamento quitado no ano ' + S.quitou : 'Faltou caixa para quitar o financiamento';
    const cargo = ['Estagiário de obra', 'Mestre de obras', 'Engenheiro de campo', 'Diretor de obra', 'Lenda da Baixada'][n - 1];
    const texto = `Construí a ponte São Luís–Alcântara em ${(S.meses / 12).toFixed(1).replace('.', ',')} anos por ${bi(S.custo)} e ${motivo ? 'perdi a concessão no ano ' + S.ano : S.quitou ? 'paguei o financiamento no ano ' + S.quitou : 'não consegui pagar o financiamento'}. Nota ${n}/5. Tente fazer melhor:`;
    topo.innerHTML = '<div class="f">Fim de jogo</div><button id="jsair">Sair</button>'; $('#jsair', topo).onclick = sair;
    tela(`<div class="k">Resultado final</div><div class="est">${estrelas(n)}</div><h2>${titulo}</h2>
      <p>${motivo ? 'Com a aprovação abaixo de 20%, a população foi às ruas e o contrato foi rompido.' : 'Seu título: <b>' + cargo + '</b>.'}</p>
      <table><tr><td>Obra</td><td>${bi(S.custo)} · ${S.meses} meses</td></tr><tr><td>Financiamento</td><td>${Math.max(0, Math.min(100, Math.round(S.pago / S.divida * 100)))}% pago de ${bi(S.divida / 1e9)}</td></tr>
      <tr><td>Aprovação final</td><td>${Math.round(S.aprov)}%</td></tr></table>
      <p style="margin-top:12px">No jogo, a ponte depende de você. Na vida real, ela depende de muita gente pedindo. <b>Seu apoio leva um minuto.</b></p>
      <div class="ac"><a class="apo" href="apoie.html">♥ Apoiar a ponte de verdade</a><button class="pri" id="jshare">Compartilhar resultado</button><button class="sec" id="jde">Jogar de novo</button><button class="sec" id="jexp">Explorar a maquete</button></div>
      <p class="nota">Simulação simplificada, com valores ilustrativos. Detalhes de custo e financiamento estão no <a href="estudo.html" style="color:#ffb347">estudo</a>.</p>`, true);
    $('#jde').onclick = () => { sair(); inicio(); }; $('#jexp').onclick = sair;
    $('#jshare').onclick = async e => {
      const url = SITE + '?jogo';
      try { if (navigator.share) return await navigator.share({ title:'Construa a ponte São Luís–Alcântara', text:texto, url }); } catch { return; }
      try { await navigator.clipboard.writeText(texto + ' ' + url); e.target.textContent = 'Texto copiado'; }
      catch { window.open('https://wa.me/?text=' + encodeURIComponent(texto + ' ' + url), '_blank', 'noopener'); }
    };
  }
  // ---------- só assistir: as 7 fases em sequência ----------
  async function assistir(){
    const meu = vivo, c = cena();
    for (let i = 0; i < 7; i++){
      topo.innerHTML = `<div class="f">Fase ${i + 1} de 7 · ${FASES[i].n}</div><button id="jsair">Sair</button>`; $('#jsair', topo).onclick = sair;
      tela(`<div class="k">Fase ${i + 1} de 7</div><h2>${FASES[i].n}</h2><p>${FASES[i].oque}</p><p class="sab">${FASES[i].sab}</p><div class="bar"><i></i></div>`);
      c.obra.vista(i); const barra = $('.bar i', card);
      await animar(i, i + 1, 8000, k => { barra.style.width = (k * 100) + '%'; });
      if (meu !== vivo) return;
    }
    topo.innerHTML = '<div class="f">Inauguração</div><button id="jsair">Sair</button>'; $('#jsair', topo).onclick = sair;
    c.obra.vista(7); await animar(7, 8, 2500); if (meu !== vivo) return; c.obra.set(null);
    tela(`<div class="k">Ponte pronta</div><h2>Da primeira sondagem à inauguração</h2><p>Na vida real, esse caminho leva de 6 a 7 anos de obra, depois dos estudos e da licença. Agora tente você: decida cada fase e administre o pedágio.</p>
      <div class="ac"><button class="pri" id="jgo">Jogar</button><a class="apo" href="apoie.html">♥ Apoiar a ponte</a><button class="sec" id="jexp">Explorar a maquete</button></div>`, true);
    $('#jgo').onclick = () => { sair(); inicio(); }; $('#jexp').onclick = sair;
  }

  // ---------- entradas ----------
  const bt = document.createElement('button'); bt.id = 'jogar'; bt.textContent = '▶ Jogue: construa a ponte'; bt.onclick = inicio; document.body.appendChild(bt);
  document.getElementById('introJogar')?.addEventListener('click', inicio);
  if (/[?&#]jogo\b/.test(location.search + location.hash)) inicio();
})();
