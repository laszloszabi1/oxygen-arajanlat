// ============================================
// OXYGEN RESORT — INTERAKTÍV ÁRAJÁNLAT
// ============================================

const state = {
  plan: null,        // 1 / 2 / 3
  modules: {},       // { efactura: 1500, channel: 2500, extramaint: 0 }
  monthlyMaint: 0,   // a hosszabbított karbantartáshoz
};

const PLAN_DATA = {
  1: { price: 2000, label: '1. csomag — Egyszerű weboldal',           payment: '50% előleg + 50% launch-kor',                maint: null },
  2: { price: 4100, label: '2. csomag — Weboldal + Események',        payment: '50% előleg + 50% launch-kor',                maint: '3 hónap karbantartás benne' },
  3: { price: 9400, label: '3. csomag — Teljes Hotel Management',     payment: '30% + 40% + 30% (3 részlet)',                maint: '2 év karbantartás benne' },
};

// ============================================
// DOM REFS
// ============================================
const els = {
  planCards: document.querySelectorAll('.plan'),
  selectBtns: document.querySelectorAll('.select-btn'),
  optionalSection: document.getElementById('optional-section'),
  moduleInputs: document.querySelectorAll('input[data-module]'),
  selectedPlanLabel: document.getElementById('selected-plan-label'),
  modulesTotal: document.getElementById('modules-total'),
  totalAmount: document.getElementById('total-amount'),
  monthlyInfo: document.getElementById('monthly-info'),
  pdfBtn: document.getElementById('pdf-btn'),
  acceptBtn: document.getElementById('accept-btn'),
};

// ============================================
// HELPERS
// ============================================
const fmt = (n) => n.toLocaleString('hu-HU').replace(/\./g, ' ');

function selectPlan(planNum) {
  state.plan = planNum;

  els.planCards.forEach((card) => {
    card.classList.toggle('selected', Number(card.dataset.plan) === planNum);
  });

  if (planNum === 3) {
    els.optionalSection.classList.add('visible');
  } else {
    els.optionalSection.classList.remove('visible');
    els.moduleInputs.forEach((inp) => { inp.checked = false; });
    state.modules = {};
    state.monthlyMaint = 0;
  }

  if (planNum === 3) {
    setTimeout(() => {
      els.optionalSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  updateSummary();
}

function toggleModule(input) {
  const moduleId = input.dataset.module;
  const price = Number(input.dataset.price) || 0;
  const monthly = Number(input.dataset.monthly) || 0;

  if (input.checked) {
    state.modules[moduleId] = price;
    if (monthly) state.monthlyMaint += monthly;
  } else {
    delete state.modules[moduleId];
    if (monthly) state.monthlyMaint -= monthly;
  }

  updateSummary();
}

function updateSummary() {
  if (state.plan) {
    const p = PLAN_DATA[state.plan];
    els.selectedPlanLabel.textContent = p.label;
  } else {
    els.selectedPlanLabel.textContent = '— válasszon csomagot —';
  }

  const moduleSum = Object.values(state.modules).reduce((a, b) => a + b, 0);
  els.modulesTotal.textContent = `+${fmt(moduleSum)} EUR`;

  const planPrice = state.plan ? PLAN_DATA[state.plan].price : 0;
  const total = planPrice + moduleSum;

  if (total > 0) {
    els.totalAmount.textContent = `${fmt(total)} EUR`;
  } else {
    els.totalAmount.textContent = '— EUR';
  }

  if (state.monthlyMaint > 0) {
    els.monthlyInfo.textContent = `+ ${state.monthlyMaint} EUR/hó (hosszabbított karbantartás)`;
  } else if (state.plan === 1) {
    els.monthlyInfo.textContent = 'Karbantartás opcionálisan: 50 EUR/hó';
  } else if (state.plan === 2) {
    els.monthlyInfo.textContent = '3 hónap karbantartás benne';
  } else if (state.plan === 3) {
    els.monthlyInfo.textContent = '2 év karbantartás benne';
  } else {
    els.monthlyInfo.textContent = '';
  }

  if (state.plan) {
    els.acceptBtn.classList.remove('disabled');
    els.acceptBtn.href = buildAcceptMailto();
  } else {
    els.acceptBtn.classList.add('disabled');
    els.acceptBtn.href = '#';
  }
}

function buildAcceptMailto() {
  const p = PLAN_DATA[state.plan];
  const moduleSum = Object.values(state.modules).reduce((a, b) => a + b, 0);
  const total = p.price + moduleSum;

  const moduleNames = {
    efactura: 'e-Factura B2B (+1500 EUR)',
    channel: 'Channel Manager (+2500 EUR)',
    extramaint: 'Hosszabbított karbantartás (50 EUR/hó a 2 év után)',
  };
  const selectedModules = Object.keys(state.modules).map((k) => moduleNames[k]).filter(Boolean);

  const subject = `Oxygen Resort — Elfogadjuk az ajánlatot · ${p.label}`;
  const body = [
    'Kedves Szabolcs,',
    '',
    'Az alábbi csomagot választottuk:',
    '',
    `• Csomag: ${p.label}`,
    `• Csomag ára: ${fmt(p.price)} EUR`,
    selectedModules.length ? `• Opcionális modulok:\n${selectedModules.map(m => '   - ' + m).join('\n')}` : '• Opcionális modulok: nincs',
    `• Összesen: ${fmt(total)} EUR`,
    `• Fizetés: ${p.payment}`,
    p.maint ? `• Karbantartás: ${p.maint}` : '',
    '',
    'Kérjük, küldjék át a szerződést.',
    '',
    'Üdvözlettel,',
    'Anna · Oxygen Resort',
  ].filter(Boolean).join('\n');

  return `mailto:laszloszabi2023@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ============================================
// EVENT BINDINGS
// ============================================
els.selectBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const planNum = Number(btn.dataset.plan);
    selectPlan(planNum);
  });
});

els.moduleInputs.forEach((inp) => {
  inp.addEventListener('change', () => toggleModule(inp));
});

els.pdfBtn.addEventListener('click', () => {
  if (!state.plan) {
    alert('Kérjük, először válasszon csomagot.');
    return;
  }
  window.print();
});

els.acceptBtn.classList.add('disabled');
updateSummary();

// Pre-select Plan 3 if URL has ?plan=3
const urlPlan = new URLSearchParams(window.location.search).get('plan');
if (urlPlan && [1, 2, 3].includes(Number(urlPlan))) {
  selectPlan(Number(urlPlan));
}
