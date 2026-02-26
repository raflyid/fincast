export const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export const fmtShort = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}jt`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}rb`;
  return `${n}`;
};

export const formatAmountDisplay = (raw) => {
  if (!raw) return '';
  const num = raw.replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseAmount = (display) =>
  parseInt((display || '').replace(/\./g, '') || '0');

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
export const MONTHS_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export const fmtDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = MONTHS_SHORT[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
};

export function buildDailyData(transactions) {
  const days = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    const day = isNaN(d.getTime()) ? 1 : d.getUTCDate();
    if (!days[day]) days[day] = { day: String(day), income: 0, expense: 0 };
    if (t.type === 'income') days[day].income += Number(t.amount);
    else days[day].expense += Number(t.amount);
  });
  return Object.values(days).sort((a, b) => parseInt(a.day) - parseInt(b.day));
}
