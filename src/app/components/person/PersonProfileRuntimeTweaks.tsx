import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { getLinkedPessoaIdForUser } from '../../services/permissionService';

const QUESTIONNAIRE_CATEGORY_LABELS = new Set([
  'personalidade',
  'familia',
  'família',
  'trabalho',
  'lugares',
  'momentos',
  'hobbies',
  'marcas pessoais',
]);

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCurrentProfileId(pathname: string) {
  const match = pathname.match(/^\/pessoas?\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function findTextElement(text: string) {
  const normalizedTarget = normalizeText(text);

  return Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3, h4, p, span, div'))
    .find((element) => normalizeText(element.textContent) === normalizedTarget) ?? null;
}

function findSectionByExactHeading(text: string) {
  const heading = findTextElement(text);
  return heading?.closest('section, article, [data-person-profile-section], .rounded-2xl, .rounded-xl, .border') as HTMLElement | null;
}

function setElementVisible(element: HTMLElement | null, visible: boolean) {
  if (!element) return;
  element.style.display = visible ? '' : 'none';
}

function hideOwnProfileOnlySections(isOwnProfile: boolean) {
  setElementVisible(findSectionByExactHeading('Administração do perfil'), !isOwnProfile);
  setElementVisible(findSectionByExactHeading('Seu parentesco com ele'), !isOwnProfile);
}

function hideEmptySiblingCard() {
  const siblingSection = findSectionByExactHeading('Irmãos');
  if (!siblingSection) return;

  const hasEmptySiblingText = normalizeText(siblingSection.textContent).includes('nenhum irmao cadastrado');
  setElementVisible(siblingSection, !hasEmptySiblingText);
}

function hideQuestionnaireBadgeGroups() {
  Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3, h4, p, span, div')).forEach((element) => {
    const normalized = normalizeText(element.textContent);
    if (!QUESTIONNAIRE_CATEGORY_LABELS.has(normalized)) return;

    const groupContainer = element.closest('div') as HTMLElement | null;
    if (!groupContainer) return;

    const candidate = groupContainer.parentElement instanceof HTMLElement && normalizeText(groupContainer.parentElement.textContent).length < 700
      ? groupContainer.parentElement
      : groupContainer;

    candidate.style.display = 'none';
  });
}

function moveDiscussionsBelowTimeline() {
  const discussionsSection = findSectionByExactHeading('Discussões relacionadas');
  const timelineSection = findSectionByExactHeading('Linha do tempo');

  if (!discussionsSection || !timelineSection) return;
  if (timelineSection.nextElementSibling === discussionsSection) return;

  const parent = timelineSection.parentElement;
  if (!parent) return;

  discussionsSection.classList.add('mt-6');
  parent.insertBefore(discussionsSection, timelineSection.nextSibling);
}

function applyPersonProfileTweaks(isOwnProfile: boolean) {
  hideOwnProfileOnlySections(isOwnProfile);
  hideEmptySiblingCard();
  hideQuestionnaireBadgeGroups();
  moveDiscussionsBelowTimeline();
}

export function PersonProfileRuntimeTweaks() {
  const { user } = useAuth();
  const location = useLocation();
  const profileId = useMemo(() => getCurrentProfileId(location.pathname), [location.pathname]);
  const [linkedPessoaId, setLinkedPessoaId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadLinkedPessoaId() {
      if (!user?.id) {
        setLinkedPessoaId(null);
        return;
      }

      const result = await getLinkedPessoaIdForUser(user.id);
      if (mounted) setLinkedPessoaId(result.data ?? null);
    }

    void loadLinkedPessoaId();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!profileId) return undefined;

    const isOwnProfile = Boolean(linkedPessoaId && profileId === linkedPessoaId);
    const apply = () => applyPersonProfileTweaks(isOwnProfile);

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const timerIds = [
      window.setTimeout(apply, 80),
      window.setTimeout(apply, 250),
      window.setTimeout(apply, 700),
    ];

    return () => {
      observer.disconnect();
      timerIds.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [linkedPessoaId, profileId]);

  return null;
}
