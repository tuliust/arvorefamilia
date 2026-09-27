import React from 'react';
import {
  Baby,
  BookOpen,
  Calendar,
  CalendarDays,
  CalendarX,
  Circle,
  Download,
  ExternalLink,
  FileText,
  Heart,
  HeartCrack,
  Image,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { PdfDocumentPreview } from './PdfDocumentPreview';
import { toast } from 'sonner';
import { downloadStorageFile, getStorageFileAccessUrl, openStorageFileInNewTab } from '../../services/storageService';
import type { PersonTimelineAttachment, PersonTimelineItem, PersonTimelineItemType } from '../../utils/buildPersonTimeline';

type PersonTimelineProps = {
  items?: PersonTimelineItem[];
  isAdmin?: boolean;
  title?: string;
  subtitle?: string;
  embedded?: boolean;
};

const TYPE_LABELS: Record<PersonTimelineItemType, string> = {
  birth: 'Nascimento',
  death: 'Óbito',
  marriage: 'Casamento',
  union: 'União',
  separation: 'Separação',
  child_birth: 'Nasceu o filho',
  historical_file: 'Arquivo',
  person_event: 'Evento',
  family_event: 'Família',
  memory: 'Memória',
  other: 'Outro',
};

const TYPE_STYLES: Record<PersonTimelineItemType, string> = {
  birth: 'bg-blue-50 text-blue-700 ring-blue-100',
  death: 'bg-gray-100 text-gray-700 ring-gray-200',
  marriage: 'bg-rose-50 text-rose-700 ring-rose-100',
  union: 'bg-rose-50 text-rose-700 ring-rose-100',
  separation: 'bg-orange-50 text-orange-700 ring-orange-100',
  child_birth: 'bg-sky-50 text-sky-700 ring-sky-100',
  historical_file: 'bg-amber-50 text-amber-700 ring-amber-100',
  person_event: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  family_event: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  memory: 'bg-violet-50 text-violet-700 ring-violet-100',
  other: 'bg-gray-50 text-gray-700 ring-gray-200',
};

const ATTACHMENT_ACTION_CLASS = 'inline-flex items-center gap-1 text-xs font-semibold leading-5 text-gray-600 hover:text-gray-900';

function historicalTimelineItemHasFile(item: PersonTimelineItem) {
  if (item.type !== 'historical_file') return undefined;
  return item.metadata?.has_file === true;
}

function getTimelineIcon(item: PersonTimelineItem) {
  const className = 'h-4 w-4';

  if (item.type === 'historical_file' && historicalTimelineItemHasFile(item) === false) {
    return <BookOpen className={className} />;
  }

  switch (item.type) {
    case 'birth':
    case 'child_birth':
      return <Baby className={className} />;
    case 'death':
      return <CalendarX className={className} />;
    case 'marriage':
    case 'union':
      return <Heart className={className} />;
    case 'separation':
      return <HeartCrack className={className} />;
    case 'historical_file':
      return <FileText className={className} />;
    case 'person_event':
      return <Calendar className={className} />;
    case 'family_event':
      return <Users className={className} />;
    case 'memory':
      return <BookOpen className={className} />;
    default:
      return <Circle className={className} />;
  }
}

function getTimelineStyle(item: PersonTimelineItem) {
  if (item.type === 'historical_file' && historicalTimelineItemHasFile(item) === false) {
    return TYPE_STYLES.memory;
  }

  return TYPE_STYLES[item.type];
}

function getDateLabel(item: PersonTimelineItem) {
  if (item.dateLabel && item.precision !== 'unknown') return item.dateLabel;
  return undefined;
}

function getAttachmentIcon(attachment: PersonTimelineAttachment) {
  if (attachment.kind === 'image') return <Image className="h-4 w-4 text-emerald-600" />;
  if (attachment.kind === 'pdf') return <FileText className="h-4 w-4 text-red-600" />;
  return <BookOpen className="h-4 w-4 text-blue-600" />;
}

function getAttachmentKindLabel(attachment: PersonTimelineAttachment) {
  if (attachment.kind === 'image') return 'Imagem';
  if (attachment.kind === 'pdf') return 'PDF';
  return 'Registro';
}

function getAttachmentDownloadName(attachment: PersonTimelineAttachment) {
  const cleanTitle = attachment.title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'arquivo-historico';
  const extension = attachment.kind === 'pdf' ? 'pdf' : attachment.kind === 'image' ? 'jpg' : 'txt';
  return cleanTitle.endsWith(`.${extension}`) ? cleanTitle : `${cleanTitle}.${extension}`;
}

function AttachmentPreviewDialog({
  attachment,
  onOpenChange,
}: {
  attachment: PersonTimelineAttachment | null;
  onOpenChange: (open: boolean) => void;
}) {
  const attachmentUrl = attachment?.url;

  return (
    <Dialog open={Boolean(attachment)} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(calc(100dvh-2rem),860px)] w-[min(calc(100vw-1rem),980px)] !max-w-none flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-5 py-4 pr-16 text-left">
          <DialogTitle className="break-words text-base font-semibold text-gray-900 sm:text-lg">
            {attachment?.title || 'Arquivo'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Visualização do PDF sem baixar o arquivo.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 bg-gray-100">
          {attachment?.kind === 'pdf' ? (
            <PdfDocumentPreview url={attachmentUrl} title={attachment.title} />
          ) : attachmentUrl ? (
            <iframe
              src={attachmentUrl}
              title={`Visualização de ${attachment?.title || 'arquivo'}`}
              className="h-full w-full border-0 bg-white"
              allow="fullscreen"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-500">
              Este arquivo não tem uma URL disponível para visualização.
            </div>
          )}
        </div>

        {attachmentUrl && attachment && (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-3 text-xs font-semibold sm:text-sm">
            <span className="text-gray-500">Se a pré-visualização não carregar, abra o PDF em nova aba.</span>
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir em nova aba
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function attachmentHasFile(attachment: PersonTimelineAttachment) {
  return Boolean(
    String(attachment.url ?? '').trim()
    || (String(attachment.storage_bucket ?? '').trim() && String(attachment.storage_path ?? '').trim())
  );
}

function TimelineAttachments({ attachments }: { attachments?: PersonTimelineAttachment[] }) {
  const [previewAttachment, setPreviewAttachment] = React.useState<PersonTimelineAttachment | null>(null);

  const handlePreview = React.useCallback(async (attachment: PersonTimelineAttachment) => {
    try {
      const url = await getStorageFileAccessUrl(attachment);
      setPreviewAttachment({ ...attachment, url });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível abrir o arquivo.');
    }
  }, []);

  const handleOpen = React.useCallback(async (attachment: PersonTimelineAttachment) => {
    try {
      await openStorageFileInNewTab(attachment);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível abrir o arquivo.');
    }
  }, []);

  const handleDownload = React.useCallback(async (attachment: PersonTimelineAttachment) => {
    try {
      await downloadStorageFile(attachment, getAttachmentDownloadName(attachment));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível baixar o arquivo.');
    }
  }, []);

  if (!attachments?.length) return null;

  return (
    <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex min-w-0 items-start gap-2">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white shadow-sm">
                {getAttachmentIcon(attachment)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="break-words text-sm font-semibold text-gray-900">{attachment.title}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500 ring-1 ring-gray-200">
                    {getAttachmentKindLabel(attachment)}
                  </span>
                  {attachment.year && (
                    <span className="text-[11px] font-medium text-gray-400">{attachment.year}</span>
                  )}
                </div>
                {attachment.description && (
                  <p className="mt-1 whitespace-pre-line break-words text-xs leading-5 text-gray-600">{attachment.description}</p>
                )}
                {attachmentHasFile(attachment) && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        if (attachment.kind === 'pdf') {
                          void handlePreview(attachment);
                        } else {
                          void handleOpen(attachment);
                        }
                      }}
                      className={ATTACHMENT_ACTION_CLASS}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Abrir
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDownload(attachment)}
                      className={ATTACHMENT_ACTION_CLASS}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <AttachmentPreviewDialog
        attachment={previewAttachment}
        onOpenChange={(open) => {
          if (!open) setPreviewAttachment(null);
        }}
      />
    </div>
  );
}

export function PersonTimeline({
  items = [],
  isAdmin = false,
  title = 'Linha do tempo',
  subtitle = 'Eventos importantes registrados a partir dos dados disponíveis.',
  embedded = false,
}: PersonTimelineProps) {
  const shouldHideEmbeddedHeader = embedded && title === 'Eventos automáticos e manuais';
  const content = (
    <>
      {embedded ? (
        !shouldHideEmbeddedHeader && (
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
        )
      ) : (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </CardHeader>
      )}
      <CardContent className={embedded ? 'px-0 pb-0 pt-0' : undefined}>
        {items.length === 0 ? (
          <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
            Ainda não há eventos suficientes para montar a linha do tempo desta pessoa.
          </p>
        ) : (
          <div className="relative space-y-4 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-gray-200 sm:before:left-5">
            {items.map((item) => {
              const dateLabel = getDateLabel(item);
              const badgeLabel = item.badgeLabel ?? TYPE_LABELS[item.type];

              return (
                <article key={item.id} className="relative pl-11 sm:pl-14">
                  <div className="absolute left-0 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm sm:h-10 sm:w-10">
                    {getTimelineIcon(item)}
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getTimelineStyle(item)}`}
                      >
                        {badgeLabel}
                      </span>

                      {dateLabel && (
                        <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-600">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          {dateLabel}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-base font-semibold leading-6 text-gray-900">{item.title}</h3>
                    {item.description && (
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">{item.description}</p>
                    )}
                    <TimelineAttachments attachments={item.attachments} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </>
  );

  if (embedded) {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <Card>
      {content}
    </Card>
  );
}
