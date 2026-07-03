const ACTIVITY_CLEAR_CUTOFF_KEY = 'arvorefamilia:admin-activity-clear-cutoff';

function isAdminDashboardPath() {
  return window.location.pathname === '/admin' || window.location.pathname === '/admin/';
}

function parseBrazilianDateTime(value: string): number | null {
  const match = value.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/);
  if (!match) return null;

  const [, day, month, year, hour, minute] = match;
  const timestamp = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function applyDashboardActivityCutoff() {
  if (!isAdminDashboardPath()) return;

  const cutoff = window.localStorage.getItem(ACTIVITY_CLEAR_CUTOFF_KEY);
  if (!cutoff) return;

  const cutoffTime = new Date(cutoff).getTime();
  if (!Number.isFinite(cutoffTime)) return;

  const title = Array.from(document.querySelectorAll<HTMLElement>('h2,h3,[data-slot="card-title"]'))
    .find((element) => (element.textContent ?? '').trim() === 'Histórico de Atividades');
  const card = title?.closest<HTMLElement>('.rounded-lg, .rounded-xl, [class*="Card"]') ?? title?.parentElement?.parentElement;
  if (!card) return;

  const content = Array.from(card.querySelectorAll<HTMLElement>('div,p')).find((element) => {
    const text = (element.textContent ?? '').trim();
    return text.includes('Notificação criada') || text.includes('Primeiro acesso') || text.includes('Nenhuma atividade registrada') || text.includes('Carregando');
  })?.closest<HTMLElement>('[class*="space-y"], [class*="flex-1"]');

  if (!content || (content.textContent ?? '').includes('Carregando')) return;

  const activityItems = Array.from(content.querySelectorAll<HTMLElement>(':scope > div > div, :scope > div'))
    .filter((element) => parseBrazilianDateTime(element.textContent ?? '') !== null);

  activityItems.forEach((item) => {
    const itemTime = parseBrazilianDateTime(item.textContent ?? '');
    if (itemTime !== null && itemTime <= cutoffTime) item.remove();
  });

  const remainingItems = Array.from(content.querySelectorAll<HTMLElement>(':scope > div > div, :scope > div'))
    .filter((element) => parseBrazilianDateTime(element.textContent ?? '') !== null);

  if (remainingItems.length === 0 && !(content.textContent ?? '').includes('Nenhuma atividade registrada')) {
    content.innerHTML = '<p class="text-sm text-gray-500">Nenhuma atividade registrada.</p>';
  }
}

window.addEventListener('DOMContentLoaded', applyDashboardActivityCutoff);
window.addEventListener('popstate', applyDashboardActivityCutoff);
window.addEventListener('storage', applyDashboardActivityCutoff);
window.setInterval(applyDashboardActivityCutoff, 800);
applyDashboardActivityCutoff();

export {};
