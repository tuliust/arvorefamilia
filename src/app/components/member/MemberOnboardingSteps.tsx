import React from 'react';
import { useNavigate } from 'react-router';

type MemberOnboardingStepNumber = 1 | 2 | 3 | 4 | 5;

type MemberOnboardingStepsProps = {
  activeStep: MemberOnboardingStepNumber;
  hidePreferences?: boolean;
};

const STEPS: Array<{
  number: MemberOnboardingStepNumber;
  label: string;
  path: string;
}> = [
  { number: 1, label: 'Meus dados', path: '/meus-dados' },
  { number: 2, label: 'Vínculos', path: '/meus-vinculos' },
  { number: 3, label: 'Arquivos', path: '/arquivos-historicos' },
  { number: 4, label: 'Preferências', path: '/preferencias' },
  { number: 5, label: 'Revisão', path: '/revisao-dados' },
];

export function MemberOnboardingSteps({ activeStep, hidePreferences = false }: MemberOnboardingStepsProps) {
  const navigate = useNavigate();
  const visibleSteps = hidePreferences ? STEPS.filter((step) => step.number !== 4) : STEPS;

  return (
    <nav className="border-t border-gray-100 bg-white" aria-label="Etapas do cadastro">
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-4">
        <ol className="flex w-full min-w-0 items-start justify-between">
          {visibleSteps.map((step, index) => {
            const isActive = step.number === activeStep;
            const isPast = step.number < activeStep;

            return (
              <React.Fragment key={step.number}>
                <li className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center sm:gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(step.path)}
                    aria-current={isActive ? 'step' : undefined}
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition sm:h-9 sm:w-9 sm:text-sm',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
                      isActive
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : isPast
                          ? 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {step.number}
                  </button>
                  <span className={['max-w-[4.25rem] truncate text-[10px] leading-tight min-[390px]:max-w-[5rem] sm:max-w-none sm:text-xs', isActive ? 'font-semibold text-blue-700' : 'font-medium text-gray-500'].join(' ')}>
                    {step.label}
                  </span>
                </li>
                {index < visibleSteps.length - 1 && (
                  <li
                    aria-hidden="true"
                    className={[
                      'mt-4 h-px w-2 shrink-0 min-[375px]:w-4 sm:w-12',
                      step.number < activeStep ? 'bg-blue-200' : 'bg-gray-200',
                    ].join(' ')}
                  />
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
