// ============================================
// OXYGEN RESORT — OFERTĂ INTERACTIVĂ
// ============================================

const state = {
  plan: null,        // 1 / 2 / 3
  modules: {},       // { efactura: 1500, channel: 2500, extramaint: 0 }
  monthlyMaint: 0,   // pentru extramaint
};

const PLAN_DATA = {
  1: { price: 2000, label: 'Plan 1 — Site simplu', payment: '50% avans + 50% la lansare', maint: null },
  2: { price: 4100, label: 'Plan 2 — Site + Evenimente', payment: '50% avans + 50% la lansare', maint: '3 luni mentenanță inclusă' },
  3: { price: 9400, label: 'Plan 3 — Hotel Management complet', payment: '30% + 40% + 30% (3 tranșe)', maint: '2 ani mentenanță inclusă' },
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
const fmt = (n) => n.toLocaleString('ro-RO').replace(/,/g, ' ');

function selectPlan(planNum) {
  state.plan = planNum;

  // Update card visual states
  els.planCards.forEach((card) => {
    card.classList.toggle('selected', Number(card.dataset.plan) === planNum);
  });

  // Show optional modules ONLY if Plan 3 selected
  if (planNum === 3) {
    els.optionalSection.classList.add('visible');
  } else {
    els.optionalSection.classList.remove('visible');
    // Clear all modules if downgrading from Plan 3
    els.moduleInputs.forEach((inp) => { inp.checked = false; });
    state.modules = {};
    state.monthlyMaint = 0;
  }

  // Smooth scroll: if Plan 3, scroll to optional section
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
  // Selected plan label
  if (state.plan) {
    const p = PLAN_DATA[state.plan];
    els.selectedPlanLabel.textContent = p.label;
  } else {
    els.selectedPlanLabel.textContent = '— alegeți un pachet —';
  }

  // Modules total
  const moduleSum = Object.values(state.modules).reduce((a, b) => a + b, 0);
  els.modulesTotal.textContent = `+${fmt(moduleSum)} EUR`;

  // Grand total
  const planPrice = state.plan ? PLAN_DATA[state.plan].price : 0;
  const total = planPrice + moduleSum;

  if (total > 0) {
    els.totalAmount.textContent = `${fmt(total)} EUR`;
  } else {
    els.totalAmount.textContent = '— EUR';
  }

  // Monthly info
  if (state.monthlyMaint > 0) {
    els.monthlyInfo.textContent = `+ ${state.monthlyMaint} EUR/lună (mentenanță extinsă)`;
  } else if (state.plan === 1) {
    els.monthlyInfo.textContent = 'Mentenanță opțională: 50 EUR/lună';
  } else if (state.plan === 2) {
    els.monthlyInfo.textContent = '3 luni mentenanță incluse';
  } else if (state.plan === 3) {
    els.monthlyInfo.textContent = '2 ani mentenanță incluse';
  } else {
    els.monthlyInfo.textContent = '';
  }

  // Accept button state
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
    extramaint: 'Mentenanță extinsă (50 EUR/lună după 2 ani)',
  };
  const selectedModules = Object.keys(state.modules).map((k) => moduleNames[k]).filter(Boolean);

  const subject = `Oxygen Resort — Acceptă oferta · ${p.label}`;
  const body = [
    'Bună ziua,',
    '',
    'Am ales pachetul de mai jos:',
    '',
    `• Pachet: ${p.label}`,
    `• Preț pachet: ${fmt(p.price)} EUR`,
    selectedModules.length ? `• Module opționale:\n${selectedModules.map(m => '   - ' + m).join('\n')}` : '• Module opționale: niciunul',
    `• Total: ${fmt(total)} EUR`,
    `• Plată: ${p.payment}`,
    p.maint ? `• Mentenanță: ${p.maint}` : '',
    '',
    'Vă rog să-mi trimiteți contractul.',
    '',
    'Mulțumesc,',
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

// PDF button — triggers browser print dialog
els.pdfBtn.addEventListener('click', () => {
  if (!state.plan) {
    alert('Vă rog să selectați mai întâi un pachet.');
    return;
  }
  window.print();
});

// Disable accept button initially
els.acceptBtn.classList.add('disabled');
updateSummary();

// ============================================
// SUBTLE: pre-select Plan 3 if URL has ?plan=3
// ============================================
const urlPlan = new URLSearchParams(window.location.search).get('plan');
if (urlPlan && [1, 2, 3].includes(Number(urlPlan))) {
  selectPlan(Number(urlPlan));
}
