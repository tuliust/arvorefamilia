import { useEffect } from 'react';
import { ArrowLeft, CalendarDays, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { PublicFooterLinks, PublicInlineLink, PublicThemeFrame } from '../../components/public/PublicThemeFrame';
import { useSiteVisualSettings } from '../../hooks/useSiteVisualSettings';
import { LegalDocumentContent, LegalText } from './legalContent';

const LEGAL_DOCUMENT_UPDATED_AT = '01/06/2026';

function getLegalTextKey(text: LegalText) {
  return typeof text === 'string' ? text : text.map((part) => `${part.text}:${part.href || ''}:${part.bold || ''}`).join('|');
}

function renderLegalText(text: LegalText, primaryColor: string, textColor: string) {
  if (typeof text === 'string') return text;

  return text.map((part, index) => {
    const key = `${part.text}-${index}`;

    if (part.href) {
      return (
        <PublicInlineLink key={key} url={part.href} color={primaryColor} external={false}>
          {part.text}
        </PublicInlineLink>
      );
    }

    if (part.bold) {
      return (
        <strong key={key} className="font-semibold" style={{ color: textColor }}>
          {part.text}
        </strong>
      );
    }

    return <span key={key}>{part.text}</span>;
  });
}

export function PublicLegalDocumentPage({ content }: { content: LegalDocumentContent }) {
  const { settings } = useSiteVisualSettings();

  useEffect(() => {
    document.title = `${content.title} | ${settings.global_identity_name}`;

    let descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.name = 'description';
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.content = settings.seo_description;
  }, [content.title, settings.global_identity_name, settings.seo_description]);

  return (
    <PublicThemeFrame settings={settings} className="flex flex-col">
      <header className="relative z-10 border-b border-gray-200/80" style={{ backgroundColor: settings.global_card_background_color }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/entrar"
            className="inline-flex items-center gap-2 text-sm font-medium transition hover:underline"
            style={{ color: settings.global_primary_color }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para entrar
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-12">
        <aside className="order-2 lg:order-1 lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-lg border border-gray-200 p-5 shadow-sm" style={{ backgroundColor: settings.global_card_background_color, borderRadius: settings.global_card_radius }}>
            <div
              className="grid h-11 w-11 place-items-center rounded-lg"
              style={{ backgroundColor: `${settings.global_primary_color}1A`, color: settings.global_primary_color }}
            >
              <ShieldCheck className="block h-5 w-5 shrink-0" />
            </div>
            <h2 className="mt-4 text-lg font-semibold" style={{ color: settings.global_text_color }}>{content.title}</h2>
            <p className="mt-1 text-sm" style={{ color: settings.global_muted_text_color }}>{content.subtitle}</p>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 flex-none" style={{ color: settings.global_muted_text_color }} />
                <div>
                  <dt className="font-medium" style={{ color: settings.global_text_color }}>Última atualização</dt>
                  <dd style={{ color: settings.global_muted_text_color }}>{LEGAL_DOCUMENT_UPDATED_AT}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <UserRound className="mt-0.5 h-4 w-4 flex-none" style={{ color: settings.global_muted_text_color }} />
                <div>
                  <dt className="font-medium" style={{ color: settings.global_text_color }}>Responsável</dt>
                  <dd style={{ color: settings.global_muted_text_color }}>{content.owner.name}</dd>
                  <dd style={{ color: settings.global_muted_text_color }}>CPF: {content.owner.cpf}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-none" style={{ color: settings.global_muted_text_color }} />
                <div>
                  <dt className="font-medium" style={{ color: settings.global_text_color }}>Contato</dt>
                  <dd>
                    <a className="break-all hover:underline" href={`mailto:${content.owner.email}`} style={{ color: settings.global_primary_color }}>
                      {content.owner.email}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </aside>

        <article className="order-1 rounded-lg border border-gray-200 shadow-sm lg:order-2" style={{ backgroundColor: settings.global_card_background_color, borderRadius: settings.global_card_radius }}>
          <div className="border-b border-gray-200 px-5 py-6 sm:px-8 sm:py-8">
            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: settings.global_primary_color }}>{content.subtitle}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: settings.global_text_color }}>{content.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7" style={{ color: settings.global_muted_text_color }}>
              {renderLegalText(content.intro, settings.global_primary_color, settings.global_text_color)}
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {content.sections.map((section, index) => (
              <section key={`${section.title}-${index}`} className="px-5 py-6 sm:px-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[64px_minmax(0,1fr)]">
                  <div className="text-sm font-semibold tabular-nums" style={{ color: settings.global_primary_color }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: settings.global_text_color }}>{section.title}</h2>
                    {section.paragraphs?.map((paragraph) => (
                      <p key={getLegalTextKey(paragraph)} className="mt-3 leading-7" style={{ color: settings.global_muted_text_color }}>
                        {renderLegalText(paragraph, settings.global_primary_color, settings.global_text_color)}
                      </p>
                    ))}
                    {section.items ? (
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2" style={{ color: settings.global_muted_text_color }}>
                        {section.items.map((item) => (
                          <li key={getLegalTextKey(item)} className="flex gap-2 leading-6">
                            <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: settings.global_primary_color }} />
                            <span>{renderLegalText(item, settings.global_primary_color, settings.global_text_color)}</span>
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

      <PublicFooterLinks settings={settings} />
    </PublicThemeFrame>
  );
}
