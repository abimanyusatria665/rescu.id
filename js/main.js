const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((section) => revealObserver.observe(section));

const sections = document.querySelectorAll('main section[id]');
const links = document.querySelectorAll('.nav-links a:not(.nav-cta)');
const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach((section) => activeObserver.observe(section));

const calcIds = ['surplus', 'cost', 'days', 'reduction', 'rescue', 'price'];
const calc = Object.fromEntries(calcIds.map((id) => [id, document.getElementById(`calc-${id}`)]));
const calcValue = (id) => Math.max(0, Number(calc[id]?.value) || 0);
const formatRupiah = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
}).format(Math.max(0, Math.round(value)));

function calculateSavings() {
  if (!calc.surplus) return;
  const monthlySurplus = calcValue('surplus') * Math.min(31, calcValue('days'));
  const preventedQty = monthlySurplus * calcValue('reduction') / 100;
  const remainingQty = monthlySurplus - preventedQty;
  const soldQty = remainingQty * calcValue('rescue') / 100;
  const leftoverQty = remainingQty - soldQty;
  const productionSaving = preventedQty * calcValue('cost');
  const grossRevenue = soldQty * calcValue('price');
  const setText = (id, text) => { const node = document.getElementById(id); if (node) node.textContent = text; };
  setText('calc-reduction-out', `${Math.round(calcValue('reduction'))}%`);
  setText('calc-rescue-out', `${Math.round(calcValue('rescue'))}%`);
  setText('calc-total', formatRupiah(productionSaving + grossRevenue));
  const setMetricValue = (id, value) => { const node = document.getElementById(id); if (node?.firstChild) node.firstChild.nodeValue = value; };
  setMetricValue('calc-saving', formatRupiah(productionSaving));
  setText('calc-saving-qty', `${Math.round(preventedQty).toLocaleString('id-ID')} porsi/bulan dicegah`);
  setMetricValue('calc-revenue', formatRupiah(grossRevenue));
  setText('calc-sold-qty', `${Math.round(soldQty).toLocaleString('id-ID')} porsi/bulan terjual`);
  setMetricValue('calc-leftover', `${Math.round(leftoverQty).toLocaleString('id-ID')} porsi`);
}

calcIds.forEach((id) => calc[id]?.addEventListener('input', calculateSavings));
document.getElementById('calc-reset')?.addEventListener('click', () => {
  const defaults = { surplus: 20, cost: 18000, days: 26, reduction: 20, rescue: 50, price: 10000 };
  Object.entries(defaults).forEach(([id, value]) => { if (calc[id]) calc[id].value = value; });
  calculateSavings();
});
document.getElementById('calc-print')?.addEventListener('click', () => window.print());
calculateSavings();
