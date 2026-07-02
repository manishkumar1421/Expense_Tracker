// ---- State ----
let expenses = JSON.parse(localStorage.getItem('ledger-expenses')) || [];

// ---- DOM refs ----
const form = document.getElementById('expenseForm');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const entryList = document.getElementById('entryList');
const emptyState = document.getElementById('emptyState');
const totalAmountEl = document.getElementById('totalAmount');
const totalCountEl = document.getElementById('totalCount');
const topCategoryEl = document.getElementById('topCategory');
const breakdownBars = document.getElementById('breakdownBars');
const clearAllBtn = document.getElementById('clearAll');

const CATEGORY_COLORS = {
  'Food': '#bc6c25',
  'Travel': '#1d3557',
  'Books & Stationery': '#6a4c93',
  'Entertainment': '#c9184a',
  'Rent': '#1b4332',
  'Other': '#6c757d'
};

// ---- Persist ----
function save(){
  localStorage.setItem('ledger-expenses', JSON.stringify(expenses));
}

// ---- Render ----
function render(){
  // Entry list
  entryList.innerHTML = '';
  if(expenses.length === 0){
    entryList.appendChild(emptyState);
  } else {
    // newest first
    [...expenses].reverse().forEach(exp => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="entry-desc">${escapeHTML(exp.desc)}</span>
        <span class="entry-cat">${escapeHTML(exp.category)}</span>
        <span class="entry-amount">₹${exp.amount.toLocaleString('en-IN')}</span>
        <button class="entry-delete" data-id="${exp.id}" aria-label="Delete entry">✕</button>
      `;
      entryList.appendChild(li);
    });
  }

  // Totals
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  totalAmountEl.textContent = `₹${total.toLocaleString('en-IN')}`;
  totalCountEl.textContent = expenses.length;

  // Category breakdown
  const byCategory = {};
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  const categories = Object.entries(byCategory).sort((a,b) => b[1]-a[1]);
  topCategoryEl.textContent = categories.length ? categories[0][0] : '—';

  breakdownBars.innerHTML = '';
  if(categories.length === 0){
    breakdownBars.innerHTML = '<p class="bars-empty">Nothing to break down yet.</p>';
  } else {
    const max = categories[0][1];
    categories.forEach(([cat, amt]) => {
      const row = document.createElement('div');
      row.className = 'bar-row';
      const pct = Math.max(4, Math.round((amt/max)*100));
      row.innerHTML = `
        <span class="cat-name">${escapeHTML(cat)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${CATEGORY_COLORS[cat] || '#bc6c25'}"></div></div>
        <span class="cat-amount">₹${amt.toLocaleString('en-IN')}</span>
      `;
      breakdownBars.appendChild(row);
    });
  }
}

function escapeHTML(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Events ----
form.addEventListener('submit', e => {
  e.preventDefault();
  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if(!desc || !amount || amount <= 0) return;

  expenses.push({
    id: Date.now().toString(),
    desc,
    amount,
    category,
    date: new Date().toISOString()
  });

  save();
  render();
  form.reset();
  descInput.focus();
});

entryList.addEventListener('click', e => {
  if(e.target.classList.contains('entry-delete')){
    const id = e.target.dataset.id;
    expenses = expenses.filter(exp => exp.id !== id);
    save();
    render();
  }
});

clearAllBtn.addEventListener('click', () => {
  if(expenses.length === 0) return;
  if(confirm('Clear all entries? This cannot be undone.')){
    expenses = [];
    save();
    render();
  }
});

// ---- Init ----
render();
