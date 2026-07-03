const QUESTIONNAIRE_FINISHED_EVENT = 'meus-dados:questionnaire-finished';
const PROFILE_RESULT_HOST_ID = 'meus-dados-profile-bio-result-host';

declare global {
  interface Window {
    __meusDadosQuestionnaireFinishBridgeInstalled?: boolean;
  }
}

function isMeusDadosPage() {
  return window.location.pathname.replace(/\/$/, '') === '/meus-dados';
}

function findButtonContaining(label: string) {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => button.textContent?.includes(label)) ?? null;
}

function isProfileResultVisible() {
  const resultHost = document.getElementById(PROFILE_RESULT_HOST_ID);
  return Boolean(
    resultHost &&
    !resultHost.classList.contains('hidden') &&
    resultHost.textContent?.includes('Mini Bio')
  );
}

function findStepLabelElement() {
  return Array.from(document.querySelectorAll<HTMLElement>('section span, section div'))
    .find((element) => /^Etapa\s+\d+\s+de\s+\d+$/i.test(element.textContent?.trim() ?? '')) ?? null;
}

function makeFinalStepTemporarilySkippable() {
  const stepLabel = findStepLabelElement();
  const originalText = stepLabel?.textContent ?? '';
  const match = originalText.match(/Etapa\s+(\d+)\s+de\s+(\d+)/i);

  if (!stepLabel || !match) return null;

  const currentStep = Number(match[1]);
  const totalSteps = Number(match[2]);
  if (!Number.isFinite(currentStep) || !Number.isFinite(totalSteps) || currentStep < totalSteps) return null;

  stepLabel.textContent = originalText.replace(
    /Etapa\s+\d+\s+de\s+\d+/i,
    `Etapa ${Math.max(totalSteps - 1, 1)} de ${totalSteps}`,
  );

  return () => {
    if (stepLabel.textContent !== originalText) {
      stepLabel.textContent = originalText;
    }
  };
}

function revealProfileResultsThroughExistingController() {
  if (!isMeusDadosPage() || isProfileResultVisible()) return;

  let attempts = 0;
  let restoreStepLabel: (() => void) | null = null;

  const tryReveal = () => {
    if (isProfileResultVisible()) {
      restoreStepLabel?.();
      return;
    }

    const skipButton = findButtonContaining('Pular Tudo');
    if (skipButton) {
      skipButton.click();
      restoreStepLabel?.();
      return;
    }

    if (!restoreStepLabel) {
      restoreStepLabel = makeFinalStepTemporarilySkippable();
    }

    attempts += 1;
    if (attempts < 16) {
      window.setTimeout(tryReveal, 60);
      return;
    }

    restoreStepLabel?.();
  };

  window.setTimeout(tryReveal, 0);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined' && !window.__meusDadosQuestionnaireFinishBridgeInstalled) {
  window.__meusDadosQuestionnaireFinishBridgeInstalled = true;
  window.addEventListener(QUESTIONNAIRE_FINISHED_EVENT, revealProfileResultsThroughExistingController);
}

export {};
