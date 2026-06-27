import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

const DASHBOARD_PATHS = new Set(['/admin', '/admin/dashboard']);
const HIDDEN_STAT_SUBTITLES = new Set([
  '23 casamentos',
  'vinculos aguardando revisao',
  'usuarios cadastrados na plataforma',
]);

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function setReactTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const prototype = Object.getPrototypeOf(textarea);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

  if (descriptor?.set) {
    descriptor.set.call(textarea, value);
  } else {
    textarea.value = value;
  }

  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function removeStatSubtitles() {
  document.querySelectorAll<HTMLElement>('[data-admin-dashboard-page="true"] span').forEach((element) => {
    const text = normalizeText(element.textContent);
    if (HIDDEN_STAT_SUBTITLES.has(text) || /^\d+ casamentos$/.test(text)) {
      if (element.style.display !== 'none') element.style.display = 'none';
    }
  });
}

function renamePeopleContentAction() {
  document.querySelectorAll<HTMLElement>('[data-admin-dashboard-page="true"] h3').forEach((title) => {
    if (normalizeText(title.textContent) === 'conteudo de pessoas') {
      title.textContent = 'Textos automáticos';
    }
  });
}

function removeInviteCodeAsterisks() {
  const textarea = document.querySelector<HTMLTextAreaElement>('[data-admin-dashboard-page="true"] textarea');
  if (!textarea) return;

  const fixedValue = textarea.value.replace(/\n\n\*([^*\n]+)\*\n\nComo estamos/g, '\n\n$1\n\nComo estamos');
  if (fixedValue === textarea.value) return;

  setReactTextareaValue(textarea, fixedValue);
}

function applyDashboardTweaks(pathname: string) {
  if (!DASHBOARD_PATHS.has(pathname)) return;

  removeStatSubtitles();
  renamePeopleContentAction();
  removeInviteCodeAsterisks();
}

export function AdminDashboardRuntimeTweaks() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let frameId: number | null = null;

    const apply = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;

        try {
          applyDashboardTweaks(location.pathname);
        } catch (error) {
          console.warn('[AdminDashboardRuntimeTweaks] Ajustes do painel ignorados para evitar bloqueio da página:', error);
        }
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const handleClick = (event: MouseEvent) => {
      if (!DASHBOARD_PATHS.has(location.pathname)) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest('button');
      if (!button) return;
      if (!normalizeText(button.textContent).includes('solicitacoes de aprovacoes')) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      navigate('/aprovacoes');
    };

    document.addEventListener('click', handleClick, true);

    const timerIds = [
      window.setTimeout(apply, 80),
      window.setTimeout(apply, 250),
      window.setTimeout(apply, 700),
    ];

    return () => {
      observer.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      document.removeEventListener('click', handleClick, true);
      timerIds.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [location.pathname, navigate]);

  return null;
}
