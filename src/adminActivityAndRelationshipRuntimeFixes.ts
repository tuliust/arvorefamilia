const ACTIVITY_CLEAR_CUTOFF_KEY = 'arvorefamilia:admin-activity-clear-cutoff';

function isAdminDashboardPath() {
  return window.location.pathname === '/admin' || window.location.pathname === '/admin/';
}

function isNewPersonAdminPath() {
  return window.location.pathname === '/admin/pessoas/nova' || window.location.pathname === '/admin/pessoas/nova/';
}

function parseBrazilianDateTime(value: string): number | null {
  const match = value.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/);
  if (!match) return null;

  const [, day, month, year, hour, minute] = match;
  const timestamp = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export {};
