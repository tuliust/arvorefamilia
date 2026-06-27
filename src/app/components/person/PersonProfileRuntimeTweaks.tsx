import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { getLinkedPessoaIdForUser } from '../../services/permissionService';
import { listProfileManagersForPerson } from '../../services/profileControlRequestService';

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

function hideOwnProfileOnlySections(isOwnProfile: boolean, profileManagedOnlyByCurrentUser: boolean) {
  const shouldHideProfileAdministration = isOwnProfile || profileManagedOnlyByCurrentUser;

  setElementVisible(findSectionByExactHeading('Administração do perfil'), !shouldHideProfileAdministration);
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

function hideRelatedDiscussionsTopAction() {
  const discussionsSection = findSectionByExactHeading('Discussões relacionadas');
  if (!discussionsSection) return;

  Array.from(discussionsSection.querySelectorAll<HTMLElement>('a, button')).forEach((element) => {
    if (normalizeText(element.textContent) !== 'criar discussao sobre esta pessoa') return;

    const target = element.closest('a') as HTMLElement | null ?? element;
    target.style.display = 'none';
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

function applyPersonProfileTweaks(isOwnProfile: boolean, profileManagedOnlyByCurrentUser: boolean) {
  hideOwnProfileOnlySections(isOwnProfile, profileManagedOnlyByCurrentUser);
  hideEmptySiblingCard();
  hideQuestionnaireBadgeGroups();
  hideRelatedDiscussionsTopAction();
  moveDiscussionsBelowTimeline();
}

export function PersonProfileRuntimeTweaks() {
  const { user } = useAuth();
  const location = useLocation();
  const profileId = useMemo(() => getCurrentProfileId(location.pathname), [location.pathname]);
  const [linkedPessoaId, setLinkedPessoaId] = useState<string | null>(null);
  const [profileManagedOnlyByCurrentUser, setProfileManagedOnlyByCurrentUser] = useState(false);

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
    let mounted = true;

    async function loadProfileManagers() {
      if (!user?.id || !profileId) {
        setProfileManagedOnlyByCurrentUser(false);
        return;
      }

      const result = await listProfileManagersForPerson(profileId);
      if (!mounted) return;

      if (result.error || result.data.length === 0) {
        setProfileManagedOnlyByCurrentUser(false);
        return;
      }

      setProfileManagedOnlyByCurrentUser(result.data.every((manager) => manager.user_id === user.id));
    }

    void loadProfileManagers();

    return () => {
      mounted = false;
    };
  }, [profileId, user?.id]);

  useEffect(() => {
    if (!profileId) return undefined;

    const isOwnProfile = Boolean(linkedPessoaId && profileId === linkedPessoaId);
    const apply = () => applyPersonProfileTweaks(isOwnProfile, profileManagedOnlyByCurrentUser);

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
  }, [linkedPessoaId, profileId, profileManagedOnlyByCurrentUser]);

  return null;
}
