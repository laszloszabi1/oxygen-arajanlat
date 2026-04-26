// ============================================
// OXYGEN RESORT — INTERAKTÍV ÁRAJÁNLAT
// ============================================

const state = {
  plan: null,        // 1 / 2 / 3
  modules: {},       // pl. { efactura: 500, channel: 2500 }
  monthlyMaint: 0,
};

const PLAN_DATA = {
  1: { price: 2000, label: '1. csomag — Egyszerű weboldal',     payment: '50% előleg + 50% indításkor', maint: null },
  2: { price: 4100, label: '2. csomag — Weboldal + Események',  payment: '50% előleg + 50% indításkor', maint: '6 hónap karbantartás benne' },
  3: { price: 9400, label: '3. csomag — Teljes Hotel Management', payment: '30% + 40% + 30% (3 részlet)', maint: '2 év full-extra karbantartás benne' },
};

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
};

// ============================================
const fmt = (n) => n.toLocaleString('hu-HU').replace(/\./g, ' ');

function selectPlan(planNum) {
  state.plan = planNum;

  els.planCards.forEach((card) => {
    card.classList.toggle('selected', Number(card.dataset.plan) === planNum);
  });

  // Optional modules: ONLY for Plan 2 (Plan 3 has them all included)
  if (planNum === 2) {
    els.optionalSection.classList.add('visible');
  } else {
    els.optionalSection.classList.remove('visible');
    els.moduleInputs.forEach((inp) => { inp.checked = false; });
    state.modules = {};
    state.monthlyMaint = 0;
  }

  if (planNum === 2) {
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
    els.selectedPlanLabel.textContent = PLAN_DATA[state.plan].label;
  } else {
    els.selectedPlanLabel.textContent = '— válasszon csomagot —';
  }

  const moduleSum = Object.values(state.modules).reduce((a, b) => a + b, 0);
  els.modulesTotal.textContent = `+${fmt(moduleSum)} EUR`;

  const planPrice = state.plan ? PLAN_DATA[state.plan].price : 0;
  const total = planPrice + moduleSum;

  els.totalAmount.textContent = total > 0 ? `${fmt(total)} EUR` : '— EUR';

  if (state.monthlyMaint > 0) {
    els.monthlyInfo.textContent = `+ ${state.monthlyMaint} EUR/hó (hosszabbított karbantartás)`;
  } else if (state.plan === 1) {
    els.monthlyInfo.textContent = 'Esemény-kezelés Szabolcs által: 50 EUR/hó (opcionális)';
  } else if (state.plan === 2) {
    els.monthlyInfo.textContent = '6 hó karbantartás benne';
  } else if (state.plan === 3) {
    els.monthlyInfo.textContent = '2 év full-extra karbantartás benne';
  } else {
    els.monthlyInfo.textContent = '';
  }
}

// ============================================
els.selectBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    selectPlan(Number(btn.dataset.plan));
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

updateSummary();

const urlPlan = new URLSearchParams(window.location.search).get('plan');
if (urlPlan && [1, 2, 3].includes(Number(urlPlan))) {
  selectPlan(Number(urlPlan));
}
