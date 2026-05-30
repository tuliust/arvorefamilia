import { ArrowLeft, CalendarDays, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { LegalDocumentContent, LegalText } from './legalContent';

const LEGAL_DOCUMENT_UPDATED_AT = '01/06/2026';

function getLegalTextKey(text: LegalText) {
  return typeof text === 'string' ? text : text.map((part) => `${part.text}:${part.href || ''}:${part.bold || ''}`).join('|');
}

function renderLegalText(text: LegalText) {
  if (typeof text === 'string') return text;

  return text.map((part, index) => {
    const key = `${part.text}-${index}`;

    if (part.href) {
      return (
        <Link key={key} to={part.href} className="font-medium text-blue-700 hover:underline">
          {part.text}
        </Link>
      );
    }

    if (part.bold) {
      return (
        <strong key={key} className="font-semibold text-gray-800">
          {part.text}
        </strong>
      );
    }

    return <span key={key}>{part.text}</span>;
  });
}

export function LegalDocumentPage({ content }: { content: LegalDocumentContent }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/entrar"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-12">
        <aside className="order-2 lg:order-1 lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-950">{content.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{content.subtitle}</p>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 flex-none text-gray-400" />
                <div>
                  <dt className="font-medium text-gray-900">Última atualização</dt>
                  <dd className="text-gray-600">{LEGAL_DOCUMENT_UPDATED_AT}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <UserRound className="mt-0.5 h-4 w-4 flex-none text-gray-400" />
                <div>
                  <dt className="font-medium text-gray-900">Responsável</dt>
                  <dd className="text-gray-600">{content.owner.name}</dd>
                  <dd className="text-gray-500">CPF: {content.owner.cpf}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-none text-gray-400" />
                <div>
                  <dt className="font-medium text-gray-900">Contato</dt>
                  <dd>
                    <a className="break-all text-blue-700 hover:underline" href={`mailto:${content.owner.email}`}>
                      {content.owner.email}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </aside>

        <article className="order-1 rounded-lg border border-gray-200 bg-white shadow-sm lg:order-2">
          <div className="border-b border-gray-200 px-5 py-6 sm:px-8 sm:py-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{content.subtitle}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">{content.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">{renderLegalText(content.intro)}</p>
          </div>

          <div className="divide-y divide-gray-100">
            {content.sections.map((section, index) => (
              <section key={`${section.title}-${index}`} className="px-5 py-6 sm:px-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[64px_minmax(0,1fr)]">
                  <div className="text-sm font-semibold tabular-nums text-blue-700">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-950">{section.title}</h2>
                    {section.paragraphs?.map((paragraph) => (
                      <p key={getLegalTextKey(paragraph)} className="mt-3 leading-7 text-gray-600">
                        {renderLegalText(paragraph)}
                      </p>
                    ))}
                    {section.items ? (
                      <ul className="mt-4 grid gap-2 text-gray-600 sm:grid-cols-2">
                        {section.items.map((item) => (
                          <li key={getLegalTextKey(item)} className="flex gap-2 leading-6">
                            <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-blue-600" />
                            <span>{renderLegalText(item)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
