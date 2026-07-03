import { listarArquivosHistoricosPorPessoa } from './app/services/arquivosHistoricosService';
import { getCurrentUserLinkedPeople } from './app/services/memberProfileService';
import type { ArquivoHistorico } from './app/types';

const PAGE_PATH = '/revisao-dados';
let syncTimer: number | null = null;
let archiveRenderInFlight = false;

function isReviewPage() {
  return window.location.pathname.replace(/\/$/, '') === PAGE_PATH;
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function normalizeComparableValue(value: string) {
  return normalizeText(value).replace(/\D/g, '') || normalizeText(value);
}

function findTextElement(text: string) {
  return Array.from(document.querySelectorAll<HTMLElement>('h1,h2,h3,p,span,div'))
    .find((element) => element.textContent?.trim() === text) ?? null;
}

function findSectionCard(title: string) {
  const titleElement = findTextElement(title);
  if (!titleElement) return null;

  let node: HTMLElement | null = titleElement;
  for (let depth = 0; depth < 8 && node; depth += 1) {
    if (
      node.classList.contains('overflow-hidden') &&
      node.textContent?.includes(title)
    ) {
      return node;
    }
    node = node.parentElement;
  }

  return titleElement.closest<HTMLElement>('[class*="overflow-hidden"]');
}

function getReviewValueElement(sectionTitle: string, label: string) {
  const card = findSectionCard(sectionTitle);
  if (!card) return null;

  const labelElement = Array.from(card.querySelectorAll<HTMLElement>('p'))
    .find((element) => element.textContent?.trim().toLowerCase() === label.toLowerCase()) ?? null;

  return labelElement?.nextElementSibling instanceof HTMLElement
    ? labelElement.nextElementSibling
    : null;
}

function cleanDuplicatedProfileValues() {
  const title = document.querySelector('h1')?.textContent?.trim() ?? '';
  if (!title) return;

  const normalizedTitle = normalizeText(title);

  const headerSummaryItems = Array.from(document.querySelectorAll<HTMLElement>('h1 ~ div span'));
  headerSummaryItems.forEach((item) => {
    if (normalizeText(item.textContent ?? '') === normalizedTitle) {
      item.remove();
    }
  });

  const professionValue = getReviewValueElement('Informações pessoais', 'Profissão');
  if (professionValue && normalizeText(professionValue.textContent ?? '') === normalizedTitle) {
    professionValue.textContent = 'Não informado';
  }

  const phoneValue = getReviewValueElement('Contatos', 'WhatsApp');
  const phoneComparable = normalizeComparableValue(phoneValue?.textContent ?? '');

  ['Endereço', 'Complemento'].forEach((label) => {
    const valueElement = getReviewValueElement('Contatos', label);
    if (!valueElement || !phoneComparable) return;

    if (normalizeComparableValue(valueElement.textContent ?? '') === phoneComparable) {
      valueElement.textContent = 'Não informado';
    }
  });
}

function moveFinalActionToBottom() {
  const editButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => button.textContent?.includes('Editar perfil')) ?? null;
  if (editButton) {
    editButton.style.display = 'none';
  }

  const topFinalButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => button.textContent?.includes('Finalizar e acessar árvore')) ?? null;
  const topActionBar = topFinalButton?.parentElement;
  if (topActionBar?.textContent?.includes('Editar perfil')) {
    topActionBar.style.display = 'none';
  }

  const bottomFinalButton = Array.from(document.querySelectorAll<HTMLButtonElement>('main > div button'))
    .reverse()
    .find((button) => button.textContent?.includes('Finalizar e acessar árvore') || button.textContent?.includes('Finalizando')) ?? null;

  const bottomWrapper = bottomFinalButton?.parentElement;
  if (!bottomWrapper || bottomWrapper.dataset.revisaoDadosBottomActionFixed === 'true') return;

  bottomWrapper.dataset.revisaoDadosBottomActionFixed = 'true';
  bottomWrapper.classList.remove('sm:hidden');
  bottomWrapper.classList.add('flex', 'justify-end', 'pt-2');
  bottomFinalButton.classList.remove('w-full');
  bottomFinalButton.classList.add('w-full', 'sm:w-auto');
}

function getArchiveDraftKey(userId: string, pessoaId: string) {
  return `arquivos-historicos-draft:${userId}:${pessoaId}`;
}

function readArchiveDraft(userId: string, pessoaId: string) {
  try {
    const raw = window.localStorage.getItem(getArchiveDraftKey(userId, pessoaId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as ArquivoHistorico[] : null;
  } catch {
    return null;
  }
}

function archiveHasFile(archive: ArquivoHistorico) {
  return Boolean(String(archive.url ?? '').trim());
}

function getArchiveLabel(archive: ArquivoHistorico) {
  if (!archiveHasFile(archive)) return 'Fato sem arquivo';
  if (archive.tipo === 'pdf' || archive.mime_type === 'application/pdf') return 'PDF';
  return 'Imagem';
}

function createArchiveCard(archive: ArquivoHistorico) {
  const card = document.createElement('div');
  card.className = 'flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3';

  const thumb = document.createElement('div');
  thumb.className = 'flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-gray-500 ring-1 ring-gray-200';

  if (archive.url && (archive.tipo === 'imagem' || archive.mime_type?.startsWith('image/'))) {
    const image = document.createElement('img');
    image.src = archive.url;
    image.alt = archive.titulo;
    image.className = 'h-full w-full object-cover';
    thumb.appendChild(image);
  } else {
    thumb.textContent = archiveHasFile(archive) ? 'PDF' : 'Fato';
    thumb.classList.add('text-xs', 'font-semibold');
  }

  const content = document.createElement('div');
  content.className = 'min-w-0';

  const row = document.createElement('div');
  row.className = 'flex flex-wrap items-center gap-2';

  const title = document.createElement('p');
  title.className = 'min-w-0 truncate text-sm font-semibold text-gray-900';
  title.textContent = archive.titulo || 'Sem título';

  const label = document.createElement('span');
  label.className = 'shrink-0 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-600';
  label.textContent = getArchiveLabel(archive);

  row.append(title, label);

  const description = document.createElement('p');
  description.className = 'mt-1 line-clamp-2 text-xs text-gray-600';
  description.textContent = archive.descricao || 'Sem descrição.';

  content.append(row, description);

  if (archive.ano) {
    const year = document.createElement('p');
    year.className = 'mt-1 text-xs text-gray-500';
    year.textContent = `Ano: ${archive.ano}`;
    content.appendChild(year);
  }

  card.append(thumb, content);
  return card;
}

function renderArchives(archives: ArquivoHistorico[]) {
  const card = findSectionCard('Fatos e arquivos históricos');
  if (!card) return;

  const content = Array.from(card.querySelectorAll<HTMLElement>('div'))
    .reverse()
    .find((element) => element.textContent?.includes('Nenhum fato ou arquivo histórico informado.')) ?? null;
  if (!content) return;

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 gap-3 md:grid-cols-2';
  archives.forEach((archive) => grid.appendChild(createArchiveCard(archive)));

  content.replaceWith(grid);
}

async function syncHistoricalArchives() {
  if (archiveRenderInFlight || !isReviewPage()) return;
  const emptyArchiveMessage = findTextElement('Nenhum fato ou arquivo histórico informado.');
  if (!emptyArchiveMessage) return;

  archiveRenderInFlight = true;
  try {
    const links = await getCurrentUserLinkedPeople();
    if (links.error) return;

    const link = links.data.find((item) => item.principal) || links.data[0];
    if (!link?.pessoa_id) return;

    const userId = link.user_id;
    const draftArchives = readArchiveDraft(userId, link.pessoa_id);
    const archives = draftArchives ?? await listarArquivosHistoricosPorPessoa(link.pessoa_id);
    if (archives.length > 0) {
      renderArchives(archives);
    }
  } catch (error) {
    console.warn('[Revisão de dados] Não foi possível sincronizar fatos e arquivos históricos:', error);
  } finally {
    archiveRenderInFlight = false;
  }
}

function syncReviewPagePresentation() {
  if (!isReviewPage()) return;
  cleanDuplicatedProfileValues();
  moveFinalActionToBottom();
  void syncHistoricalArchives();
}

function scheduleSync() {
  if (syncTimer) window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(syncReviewPagePresentation, 120);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  scheduleSync();

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  window.addEventListener('popstate', scheduleSync);
  window.addEventListener('focus', scheduleSync);
}

export {};
