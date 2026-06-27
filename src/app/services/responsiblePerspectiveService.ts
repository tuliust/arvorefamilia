export const RESPONSIBLE_PERSPECTIVE_STORAGE_KEY = 'arvorefamilia:responsible-perspective';
export const RESPONSIBLE_PERSPECTIVE_CHANGED_EVENT = 'arvorefamilia:responsible-perspective-changed';

export type ResponsiblePerspective = {
  pessoaId: string;
  nomeCompleto: string;
  falecido: boolean;
  role?: string | null;
};

function readStoredPerspective(): ResponsiblePerspective | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(RESPONSIBLE_PERSPECTIVE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ResponsiblePerspective>;
    if (!parsed.pessoaId || !parsed.nomeCompleto) return null;

    return {
      pessoaId: parsed.pessoaId,
      nomeCompleto: parsed.nomeCompleto,
      falecido: parsed.falecido === true,
      role: parsed.role ?? null,
    };
  } catch {
    return null;
  }
}

function emitPerspectiveChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(RESPONSIBLE_PERSPECTIVE_CHANGED_EVENT));
}

export function getResponsiblePerspective() {
  return readStoredPerspective();
}

export function setResponsiblePerspective(perspective: ResponsiblePerspective) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(RESPONSIBLE_PERSPECTIVE_STORAGE_KEY, JSON.stringify(perspective));
  emitPerspectiveChanged();
}

export function clearResponsiblePerspective() {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(RESPONSIBLE_PERSPECTIVE_STORAGE_KEY);
  emitPerspectiveChanged();
}

export function subscribeResponsiblePerspective(callback: (perspective: ResponsiblePerspective | null) => void) {
  if (typeof window === 'undefined') return () => undefined;

  const handleChange = () => callback(readStoredPerspective());
  window.addEventListener(RESPONSIBLE_PERSPECTIVE_CHANGED_EVENT, handleChange);
  window.addEventListener('storage', handleChange);

  return () => {
    window.removeEventListener(RESPONSIBLE_PERSPECTIVE_CHANGED_EVENT, handleChange);
    window.removeEventListener('storage', handleChange);
  };
}
