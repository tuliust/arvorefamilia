import React, { useCallback, useEffect, useState } from 'react';
import { MousePointerClick, X } from 'lucide-react';

type HorizontalLineHighlightHintProps = {
  visible: boolean;
};

type HintPosition = {
  boxLeft: number;
  boxTop: number;
  arrowMinX: number;
  arrowMinY: number;
  arrowWidth: number;
  arrowHeight: number;
  arrowStartX: number;
  arrowStartY: number;
  arrowEndX: number;
  arrowEndY: number;
};

const STORAGE_KEY = 'arvorefamilia:horizontal-line-highlight-hint:v1';

const TARGET_SELECTORS = [
  'button[data-family-map-color-key="tataravos"][data-family-map-spouse-tone="true"]',
  'button[data-family-map-color-key="tataravos"]',
  'button[data-family-map-color-key]',
];

const HINT_WIDTH = 172;
const HINT_HEIGHT = 66;

/**
 * Ajustes principais:
 * - box mais abaixo
 * - seta menor
 * - seta mais fina
 */
const BOX_LEFT_OFFSET = -8;
const BOX_TOP_OFFSET = 122;
const ARROW_RIGHT_OFFSET = 8;
const ARROW_END_EXTRA_X = 26;
const ARROW_END_EXTRA_Y = -2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function findTargetElement() {
  for (const selector of TARGET_SELECTORS) {
    const target = document.querySelector<HTMLElement>(selector);

    if (target) {
      return target.closest<HTMLElement>('.absolute.z-20') ?? target;
    }
  }

  return null;
}

export function HorizontalLineHighlightHint({
  visible,
}: HorizontalLineHighlightHintProps) {
  const [dismissed, setDismissed] = useState(false);
  const [position, setPosition] = useState<HintPosition | null>(null);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === 'dismissed');
    } catch {
      setDismissed(false);
    }
  }, []);

  const updatePosition = useCallback(() => {
    const target = findTargetElement();

    if (!target) {
      setPosition(null);
      return;
    }

    const rect = target.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      setPosition(null);
      return;
    }

    const boxLeft = clamp(
      rect.left + BOX_LEFT_OFFSET,
      12,
      window.innerWidth - HINT_WIDTH - 12
    );

    const boxTop = clamp(
      rect.bottom + BOX_TOP_OFFSET,
      12,
      window.innerHeight - HINT_HEIGHT - 12
    );

    /**
     * Seta saindo do meio da lateral direita do box
     */
    const rawArrowStartX = boxLeft + HINT_WIDTH + ARROW_RIGHT_OFFSET;
    const rawArrowStartY = boxTop + HINT_HEIGHT / 2;

    /**
     * Seta curta apontando para a região da conexão
     */
    const rawArrowEndX = rawArrowStartX + ARROW_END_EXTRA_X;
    const rawArrowEndY = rawArrowStartY + ARROW_END_EXTRA_Y;

    const arrowMinX = Math.min(rawArrowStartX, rawArrowEndX) - 8;
    const arrowMinY = Math.min(rawArrowStartY, rawArrowEndY) - 8;
    const arrowWidth = Math.abs(rawArrowEndX - rawArrowStartX) + 16;
    const arrowHeight = Math.abs(rawArrowEndY - rawArrowStartY) + 16;

    setPosition({
      boxLeft,
      boxTop,
      arrowMinX,
      arrowMinY,
      arrowWidth,
      arrowHeight,
      arrowStartX: rawArrowStartX - arrowMinX,
      arrowStartY: rawArrowStartY - arrowMinY,
      arrowEndX: rawArrowEndX - arrowMinX,
      arrowEndY: rawArrowEndY - arrowMinY,
    });
  }, []);

  useEffect(() => {
    if (!visible || dismissed) return;

    let frame = 0;

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updatePosition);
    };

    scheduleUpdate();

    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);

    const timeoutIds = [
      window.setTimeout(scheduleUpdate, 120),
      window.setTimeout(scheduleUpdate, 350),
      window.setTimeout(scheduleUpdate, 800),
    ];

    return () => {
      window.cancelAnimationFrame(frame);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, true);
    };
  }, [dismissed, updatePosition, visible]);

  if (!visible || dismissed || !position) return null;

  const handleDismiss = () => {
    setDismissed(true);

    try {
      window.localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {
      // Ignora quando localStorage não estiver disponível.
    }
  };

  return (
    <>
      <svg
        className="pointer-events-none fixed z-[8999] overflow-visible text-fuchsia-700"
        style={{
          left: position.arrowMinX,
          top: position.arrowMinY,
          width: position.arrowWidth,
          height: position.arrowHeight,
        }}
        viewBox={'0 0 ' + position.arrowWidth + ' ' + position.arrowHeight}
        fill="none"
        aria-hidden="true"
        data-tree-export-ignore="true"
      >
        <defs>
          <marker
            id="horizontal-line-hint-arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5.5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0 0L6 3L0 6Z" fill="currentColor" />
          </marker>
        </defs>

        <path
          d={
            'M ' +
            position.arrowStartX +
            ' ' +
            position.arrowStartY +
            ' C ' +
            (position.arrowStartX + 10) +
            ' ' +
            position.arrowStartY +
            ' ' +
            (position.arrowEndX - 10) +
            ' ' +
            position.arrowEndY +
            ' ' +
            position.arrowEndX +
            ' ' +
            position.arrowEndY
          }
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd="url(#horizontal-line-hint-arrow)"
        />
      </svg>

      <aside
        className="pointer-events-auto fixed z-[9000]"
        style={{
          left: position.boxLeft,
          top: position.boxTop,
          width: HINT_WIDTH,
        }}
        role="note"
        aria-label="Dica sobre destaque de linhas"
        data-tree-export-ignore="true"
      >
        <div className="relative rounded-md border border-amber-300 bg-amber-50/95 px-2 py-1.5 text-amber-950 shadow-sm backdrop-blur-sm">
          <div className="relative z-10 flex items-start gap-1.5">
            <div className="mt-[0.1rem] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-white/80 text-amber-700">
              <MousePointerClick className="h-2.5 w-2.5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-extrabold uppercase leading-[0.65rem] tracking-[0.12em] text-amber-700">
                Dica
              </p>
              <p className="mt-0.5 text-[10px] font-normal leading-[0.78rem] text-amber-950">
                Clique nas linhas entre grupos e cards para destacá-las.
              </p>
            </div>

            <button
              type="button"
              className="-mr-1 -mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded text-amber-800 transition hover:bg-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              onClick={handleDismiss}
              aria-label="Fechar dica"
              title="Fechar dica"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
