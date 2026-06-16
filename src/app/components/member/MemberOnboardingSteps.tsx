import React from 'react';
import { useNavigate } from 'react-router';

type MemberOnboardingStepNumber = 1 | 2 | 3 | 4 | 5;

type MemberOnboardingStepsProps = {
  activeStep: MemberOnboardingStepNumber;
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

export function MemberOnboardingSteps({ activeStep }: MemberOnboardingStepsProps) {
  const navigate = useNavigate();

  return (
    <nav className="border-t border-gray-100 bg-white" aria-label="Etapas do cadastro">
      <div className="mx-auto max-w-6xl overflow-x-auto px-4 py-4">
        <ol className="flex min-w-max items-start justify-center">
          {STEPS.map((step, index) => {
            const isActive = step.number === activeStep;
            const isPast = step.number < activeStep;

            return (
              <React.Fragment key={step.number}>
                <li className="flex min-w-[84px] flex-col items-center gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => navigate(step.path)}
                    aria-current={isActive ? 'step' : undefined}
                    className={[
                      'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition',
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
                  <span className={isActive ? 'text-xs font-semibold text-blue-700' : 'text-xs font-medium text-gray-500'}>
                    {step.label}
                  </span>
                </li>
                {index < STEPS.length - 1 && (
                  <li
                    aria-hidden="true"
                    className={[
                      'mt-4 h-px w-8 shrink-0 sm:w-12',
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
