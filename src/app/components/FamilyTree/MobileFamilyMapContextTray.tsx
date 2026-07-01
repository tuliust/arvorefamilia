import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { MobileFamilyMapToolbarAction } from './MobileFamilyMapToolbar';

interface MobileFamilyMapContextTrayProps {
  action: MobileFamilyMapToolbarAction;
  children: React.ReactNode;
  className?: string;
}

const GENERATION_TRAY_CARDS = [1, 2, 3, 4, 5, 6].map((generation) => ({
  generation,
  label: 'GERAÇÃO',
}));

function getGenerationNavigationButtons() {
  if (typeof document === 'undefined') return [];

  return Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      '[data-family-map-horizontal-mobile-root="true"] nav[aria-label^="Gera"] button'
    )
  );
}

function getGenerationFromButton(button: HTMLButtonElement) {
  return Number((button.textContent ?? '').match(/\d+/)?.[0]);
}

function getActiveGeneration() {
  const activeButton = getGenerationNavigationButtons()
    .find((button) => button.getAttribute('aria-current') === 'page');
  const generation = activeButton ? getGenerationFromButton(activeButton) : 5;

  return Number.isFinite(generation) ? generation : 5;
}

function countGenerationCards(generation: number) {
  if (typeof document === 'undefined') return generation === 5 ? 1 : 0;

  const count = document.querySelectorAll(
    `[data-family-map-horizontal-mobile-root="true"] [data-mobile-horizontal-generation="${generation}"][data-mobile-horizontal-card="true"]`
  ).length;

  return count || (generation === 5 ? 1 : 0);
}

function getGenerationCounts() {
  return Object.fromEntries(
    GENERATION_TRAY_CARDS.map(({ generation }) => [generation, countGenerationCards(generation)])
  ) as Record<number, number>;
}

function normalizeText(value: string | null | undefined) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function closeActiveToolbarTray() {
  if (typeof document === 'undefined') return;

  document
    .querySelector<HTMLButtonElement>('nav[data-mobile-family-map-toolbar="true"] button[aria-pressed="true"]')
    ?.click();
}

export const MobileFamilyMapContextTray = React.forwardRef<HTMLDivElement, MobileFamilyMapContextTrayProps>(
  function MobileFamilyMapContextTray({ action, children, className = '' }, ref) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [generationTrayState, setGenerationTrayState] = useState({
      enabled: false,
      activeGeneration: 5,
      counts: getGenerationCounts(),
    });

    const updateGenerationTrayState = useCallback(() => {
      const enabled = typeof window !== 'undefined' && action === 'zoom' && window.location.pathname === '/linha-geracional';

      setGenerationTrayState({
        enabled,
        activeGeneration: enabled ? getActiveGeneration() : 5,
        counts: getGenerationCounts(),
      });
    }, [action]);

    useEffect(() => {
      updateGenerationTrayState();

      if (action !== 'zoom' || typeof window === 'undefined') return undefined;

      const timeoutIds = [60, 180, 420].map((delay) => window.setTimeout(updateGenerationTrayState, delay));
      window.addEventListener('resize', updateGenerationTrayState, { passive: true });
      window.addEventListener('orientationchange', updateGenerationTrayState, { passive: true });

      return () => {
        timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
        window.removeEventListener('resize', updateGenerationTrayState);
        window.removeEventListener('orientationchange', updateGenerationTrayState);
      };
    }, [action, updateGenerationTrayState]);

    const setTrayRef = useCallback((node: HTMLDivElement | null) => {
      innerRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
        return;
      }

      if (ref) {
        ref.current = node;
      }
    }, [ref]);

    const handleGenerationClick = useCallback((generation: number) => {
      const target = getGenerationNavigationButtons()
        .find((button) => getGenerationFromButton(button) === generation);

      target?.click();
      window.setTimeout(updateGenerationTrayState, 80);
      window.setTimeout(closeActiveToolbarTray, 120);
    }, [updateGenerationTrayState]);

    const handleOpenFullGenerationMap = useCallback(() => {
      const hiddenFullMapButton = Array.from(
        innerRef.current?.querySelectorAll<HTMLButtonElement>('[data-mobile-family-map-context-hidden="true"] button') ?? []
      ).find((button) => normalizeText(button.textContent).includes('exibir mapa completo'));

      hiddenFullMapButton?.click();
    }, []);

    const hasFlatWhiteTrayBase = action === 'formato' || action === 'cor' || action === 'grupos' || action === 'zoom';
    const hasCenteredCompactTrayBase = action === 'cor' || action === 'grupos';

    const trayInsetClassName = hasFlatWhiteTrayBase
      ? 'inset-x-0 px-2'
      : action === 'cor'
        ? 'inset-x-3'
        : 'inset-x-2';

    const trayClassName = [
      'fixed z-[10001] md:hidden',
      trayInsetClassName,
      'top-[calc(env(safe-area-inset-top,0px)+8.15rem)]',
      hasFlatWhiteTrayBase ? 'bg-white/95 backdrop-blur' : '',
      hasCenteredCompactTrayBase ? 'flex min-h-[5.15rem] items-center' : '',
      action === 'formato' ? 'pb-2' : '',
      className,
    ].filter(Boolean).join(' ');

    const generationTrayClassName = [
      'fixed z-[10001] md:hidden inset-x-0 px-2',
      'top-[calc(env(safe-area-inset-top,0px)+8.15rem)]',
      'bg-white/95 pb-2 backdrop-blur',
    ].join(' ');

    if (generationTrayState.enabled) {
      return (
        <div
          ref={setTrayRef}
          className={generationTrayClassName}
          data-mobile-family-map-context-tray="true"
          data-mobile-family-map-context-action={action}
          data-tree-export-ignore="true"
        >
          <div className="hidden" aria-hidden="true" data-mobile-family-map-context-hidden="true">
            {children}
          </div>

          <div
            className="mx-auto flex max-w-md flex-col gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-2 pb-3 shadow-[0_14px_34px_rgba(15,23,42,0.14)] backdrop-blur"
            aria-label="Mapa da linha geracional"
            data-mobile-generation-map-compact-tray="true"
          >
            <div className="grid grid-cols-3 gap-1.5">
              {GENERATION_TRAY_CARDS.map((card) => {
                const active = generationTrayState.activeGeneration === card.generation;
                const count = generationTrayState.counts[card.generation] ?? 0;

                return (
                  <button
                    key={card.generation}
                    type="button"
                    aria-label={`${active ? 'Geração atual: ' : 'Abrir geração: '}Geração ${card.generation}`}
                    aria-current={active ? 'location' : undefined}
                    onClick={() => handleGenerationClick(card.generation)}
                    className={[
                      'flex min-h-[6.05rem] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border bg-white px-1.5 py-3 text-center shadow-sm transition active:scale-[0.99]',
                      active
                        ? 'border-cyan-600 bg-cyan-50 text-slate-950 ring-2 ring-cyan-600/60'
                        : 'border-slate-200 text-slate-900 hover:border-cyan-200 hover:bg-cyan-50/70',
                    ].join(' ')}
                  >
                    <span className="flex min-h-[1rem] w-full items-center justify-center text-[10.5px] font-black uppercase leading-none tracking-[-0.015em] text-current">
                      {card.label}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[13px] font-black text-slate-950 shadow-[0_7px_16px_rgba(15,23,42,0.10)]" aria-hidden="true">
                      {card.generation}
                    </span>
                    <span className="inline-flex max-w-full shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 px-1.5 py-0.5 text-[8.5px] font-black leading-none text-cyan-900">
                      {count} pessoa{count === 1 ? '' : 's'}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleOpenFullGenerationMap}
              className="flex min-h-10 w-full shrink-0 items-center justify-center rounded-xl border border-cyan-700 bg-cyan-700 px-3 text-sm font-black leading-none tracking-[-0.015em] text-white shadow-[0_10px_24px_rgba(8,145,178,0.22)] transition active:scale-[0.99]"
            >
              Exibir mapa completo
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={setTrayRef}
        className={trayClassName}
        data-mobile-family-map-context-tray="true"
        data-mobile-family-map-context-action={action}
        data-tree-export-ignore="true"
      >
        {hasFlatWhiteTrayBase && (
          <style>
            {`
              [data-mobile-family-map-context-action="formato"] > div:first-of-type {
                padding-bottom: 0.5rem !important;
              }

              [data-mobile-family-map-context-action="formato"] > div:first-of-type button {
                min-height: 72px !important;
                justify-content: center !important;
                gap: 0.375rem !important;
                padding-top: 0.625rem !important;
                padding-bottom: 0.625rem !important;
              }

              [data-mobile-family-map-context-action="formato"] > div:first-of-type button > svg {
                width: 1.55rem !important;
                height: 1.55rem !important;
              }

              [data-mobile-family-map-context-action="cor"] > div:first-of-type,
              [data-mobile-family-map-context-action="grupos"] > div:first-of-type {
                margin-top: 0 !important;
                margin-bottom: 0 !important;
              }

              [data-mobile-family-map-context-action="cor"] > div:first-of-type {
                display: flex !important;
                width: min(100%, 28rem) !important;
                height: 4rem !important;
                max-width: 28rem !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 0 1.45rem !important;
              }

              [data-mobile-family-map-context-action="cor"] > div:first-of-type button {
                height: 3.35rem !important;
                min-width: 3.35rem !important;
              }

              [data-mobile-family-map-context-action="cor"] > div:first-of-type button > span {
                width: 2.05rem !important;
                height: 2.05rem !important;
              }

              [data-mobile-family-map-context-action="grupos"] > div:first-of-type {
                width: min(100%, 28rem) !important;
                align-items: center !important;
              }

              [data-mobile-family-map-context-action="grupos"] > div:first-of-type button {
                height: 4rem !important;
                min-height: 4rem !important;
                align-items: center !important;
                gap: 0.75rem !important;
                padding: 0.75rem 1rem !important;
              }

              [data-mobile-family-map-context-action="grupos"] > div:first-of-type button > svg {
                width: 1.9rem !important;
                height: 1.9rem !important;
              }

              [data-mobile-family-map-context-action="grupos"] > div:first-of-type button > span {
                font-size: 0.82rem !important;
                line-height: 1.05 !important;
                letter-spacing: -0.02em !important;
              }

              [data-mobile-family-map-context-action="zoom"] [data-mobile-family-map-inline-overview="true"] {
                max-height: min(25.75rem, calc(100dvh - 12.75rem)) !important;
              }

              [data-mobile-family-map-context-action="zoom"] button[data-screen] {
                min-height: 6.45rem !important;
                justify-content: space-between !important;
                gap: 0.35rem !important;
                padding-top: 0.72rem !important;
                padding-bottom: 0.85rem !important;
              }

              [data-mobile-family-map-context-action="zoom"] button[data-screen] > span:last-child {
                margin-bottom: 0.2rem !important;
              }
            `}
          </style>
        )}
        {children}
      </div>
    );
  }
);
