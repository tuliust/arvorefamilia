import React from 'react';

import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';

interface AiQuestionPanelProps {
  aiQuestion: string;
  aiAnswer: string;
  aiLoading: boolean;
  aiError: string | null;
  canAskAi: boolean;
  placeholder: string;
  onQuestionChange: (value: string) => void;
  onClearError: () => void;
  onAskAi: () => void;
  onNewAiQuestion: () => void;
  hideTitle?: boolean;
}

export function AiQuestionPanel({
  aiQuestion,
  aiAnswer,
  aiLoading,
  aiError,
  canAskAi,
  placeholder,
  onQuestionChange,
  onClearError,
  onAskAi,
  onNewAiQuestion,
  hideTitle = false,
}: AiQuestionPanelProps) {
  return (
    <section>
      {!hideTitle && <h2 className="mb-2 text-base font-semibold text-gray-900">Pergunte à IA</h2>}
      {!aiAnswer ? (
        <Textarea
          value={aiQuestion}
          onChange={(event) => {
            onQuestionChange(event.target.value);
            onClearError();
          }}
          placeholder={placeholder}
          className="min-h-[170px] w-full resize-y rounded-lg border border-slate-400 bg-white px-4 py-3 text-sm leading-relaxed text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      ) : (
        <div className="min-h-[170px] w-full whitespace-pre-line rounded-lg border border-slate-500 bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-inner">
          {aiAnswer}
        </div>
      )}
      <div className="mt-3 flex flex-col justify-end gap-2 sm:flex-row">
        {aiAnswer && (
          <Button type="button" variant="outline" onClick={onNewAiQuestion} className="w-full bg-white sm:w-auto">
            Nova pergunta
          </Button>
        )}
        {!aiAnswer && (
          <Button onClick={onAskAi} disabled={!canAskAi || aiLoading} className="w-full sm:w-auto">
            {aiLoading ? 'Perguntando...' : 'Perguntar'}
          </Button>
        )}
      </div>
      {aiError && (
        <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {aiError}
        </p>
      )}
    </section>
  );
}
