import React, { useEffect, useMemo, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { useNavigate } from 'react-router';
import {
  Baby,
  BookOpen,
  Briefcase,
  Camera,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Gift,
  GraduationCap,
  Heart,
  Home,
  ImagePlus,
  Info,
  Map,
  MapPin,
  Milestone,
  Music,
  Pencil,
  Plane,
  Save,
  Smile,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  UserCircle2,
  Users,
  Utensils,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import {
  HEADER_ACTION_ICONS,
  MemberPageHeader,
} from '../components/layout/MemberPageHeader';
import { MemberOnboardingSteps } from '../components/member/MemberOnboardingSteps';
import { AddressAutocompleteInput } from '../components/person/AddressAutocompleteInput';
import {
  SocialProfileForm,
  SocialProfilesEditor,
} from '../components/person/SocialProfilesEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import {
  EditableOwnPersonPayload,
  ensureMemberProfile,
  getCurrentUserLinkedPeople,
  resolveFirstAccessLinkForUser,
  updateOwnLinkedPerson,
  UserPersonLinkRecord,
} from '../services/memberProfileService';
import { uploadPersonAvatarFile } from '../services/storageService';
import { salvarPreferenciasNotificacao } from '../services/userEngagementService';
import {
  buildSocialProfilesFromRows,
  listarPessoaSocialProfiles,
  substituirPessoaSocialProfiles,
} from '../services/pessoaSocialProfilesService';
import { Pessoa } from '../types';
import {
  buildEditablePersonFormState,
  cleanPersonPayload,
  formatPersonName,
  formatPhone,
  getInitials,
  maskBirthDate,
  normalizeBirthDate,
  normalizeLocationByMode,
  normalizeProfession,
  PersonFieldErrors,
  buildSocialProfilesFromPerson,
  createSocialProfile,
  syncFirstSocialProfileToPersonFields,
  validateEditablePersonForm,
  validateLocationByMode,
} from '../utils/personFields';

const AVATAR_SIZE = 512;
// TODO: Migrar blocos simples para os componentes compartilhados de pessoa sem afetar avatar/crop, Places e primeiro acesso.

type MeusDadosDraft = {
  form: EditableOwnPersonPayload;
  socialProfiles: SocialProfileForm[];
  pendingAvatarDataUrl?: string | null;
  avatarCropSourceDataUrl?: string | null;
  photoMarkedForRemoval?: boolean;
};

type AiTone =
  | 'afetivo'
  | 'simples'
  | 'divertido'
  | 'elegante'
  | 'nostalgico'
  | 'inspirador'
  | 'familiar'
  | 'emocional'
  | 'leve'
  | 'formal';

type AiBadgeCategory =
  | 'personalidade'
  | 'familia'
  | 'trabalho'
  | 'lugares'
  | 'momentos'
  | 'hobbies'
  | 'marcas';

type AiBadge = {
  id: string;
  label: string;
  category: AiBadgeCategory;
  icon?: React.ComponentType<{ className?: string }>;
};

type AiGeneratedQuestion = {
  id: string;
  question: string;
  answer: string;
};

type AiBadgeGroup = {
  id: AiBadgeCategory;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badges: AiBadge[];
};

const AI_TONES: Array<{
  id: AiTone;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'afetivo', label: 'Afetivo', description: 'Carinhoso, humano e próximo.', icon: Heart },
  { id: 'simples', label: 'Simples e direto', description: 'Claro, breve e sem floreios.', icon: Pencil },
  { id: 'divertido', label: 'Divertido', description: 'Leve, bem-humorado e natural.', icon: Smile },
  { id: 'elegante', label: 'Elegante', description: 'Cuidado, discreto e polido.', icon: Star },
  { id: 'nostalgico', label: 'Nostálgico', description: 'Para homenagens e memórias de quem já faleceu.', icon: Camera },
  { id: 'inspirador', label: 'Inspirador', description: 'Positivo, sem exagerar conquistas.', icon: Sparkles },
  { id: 'familiar', label: 'Familiar', description: 'Voltado a vínculos e lembranças.', icon: Users },
  { id: 'emocional', label: 'Emocional', description: 'Sensível e acolhedor.', icon: Gift },
  { id: 'leve', label: 'Leve', description: 'Suave, simples e cotidiano.', icon: Coffee },
  { id: 'formal', label: 'Formal', description: 'Mais sóbrio e objetivo.', icon: BookOpen },
];

const AI_STEPS = [
  'Tom do texto',
  'Personalidade',
  'Família e vínculos',
  'Trabalho e trajetória',
  'Lugares e mudanças de cidade',
  'Momentos marcantes',
  'Hobbies e paixões',
  'Marcas pessoais e curiosidades',
  'Outras características',
  'Perguntas opcionais',
];

function makeBadges(
  category: AiBadgeCategory,
  labels: string[],
  fallbackIcon: React.ComponentType<{ className?: string }>,
  iconOverrides: Record<string, React.ComponentType<{ className?: string }>> = {},
): AiBadge[] {
  return labels.map((label) => ({
    id: `${category}-${label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}`,
    label,
    category,
    icon: iconOverrides[label] ?? fallbackIcon,
  }));
}

const AI_BADGE_GROUPS: AiBadgeGroup[] = [
  {
    id: 'personalidade',
    title: 'Você se definiria como uma pessoa...',
    subtitle: 'Escolha características que combinam com você.',
    icon: Smile,
    badges: makeBadges('personalidade', [
      'Calma',
      'Comunicativa',
      'Reservada',
      'Criativa',
      'Curiosa',
      'Bem-humorada',
      'Sensível',
      'Determinada',
      'Independente',
      'Organizada',
      'Espontânea',
      'Teimosa',
      'Generosa',
      'Cuidadosa',
      'Sonhadora',
      'Observadora',
      'Acolhedora',
      'Corajosa',
    ], Smile),
  },
  {
    id: 'familia',
    title: 'Família e vínculos',
    subtitle: 'Selecione o que representa sua relação com a família e com as pessoas importantes da sua vida.',
    icon: Users,
    badges: makeBadges('familia', [
      'Família em primeiro lugar',
      'Gosto de reunir pessoas',
      'Mantenho tradições familiares',
      'Valorizo histórias antigas',
      'Tenho forte ligação com meus pais',
      'Tenho forte ligação com meus avós',
      'Tenho proximidade com meus irmãos',
      'Amo ser mãe ou pai',
      'Amo ser tia ou tio',
      'Gosto de cuidar dos outros',
      'Sou referência na família',
      'Gosto de ouvir histórias da família',
      'Gosto de contar histórias',
      'Valorizo encontros de família',
      'Guardo fotos e lembranças',
      'Preservo memórias familiares',
    ], Users, {
      'Família em primeiro lugar': Heart,
      'Guardo fotos e lembranças': Camera,
      'Preservo memórias familiares': BookOpen,
    }),
  },
  {
    id: 'trabalho',
    title: 'Trabalho e trajetória',
    subtitle: 'Conte um pouco sobre sua relação com o trabalho, profissão e conquistas.',
    icon: Briefcase,
    badges: makeBadges('trabalho', [
      'Me dedico ao trabalho',
      'Gosto de empreender',
      'Me destaco pela criatividade',
      'Gosto de ensinar',
      'Gosto de aprender',
      'Tenho espírito de liderança',
      'Mudei de carreira',
      'Trabalhei desde cedo',
      'Construí minha trajetória com esforço',
      'Tenho orgulho da minha profissão',
      'Sou reconhecida pelo que faço',
      'Trabalhei em diferentes áreas',
      'Valorizo independência financeira',
      'Gosto de resolver problemas',
      'Tenho habilidade manual',
      'Tenho facilidade com pessoas',
      'Tenho habilidade com comunicação',
      'Tenho facilidade com números',
      'Tenho habilidade artística',
    ], Briefcase, {
      'Gosto de ensinar': GraduationCap,
      'Gosto de aprender': BookOpen,
    }),
  },
  {
    id: 'lugares',
    title: 'Lugares que fazem parte da sua história',
    subtitle: 'Marque experiências ligadas a cidades, viagens e mudanças de vida.',
    icon: MapPin,
    badges: makeBadges('lugares', [
      'Nasci em uma cidade e vivi em outra',
      'Mudei de cidade',
      'Mudei de estado',
      'Morei fora do Brasil',
      'Tenho ligação forte com minha cidade natal',
      'Sinto saudade de um lugar',
      'Tenho uma cidade que marcou minha vida',
      'Gosto de viajar',
      'Vivi uma fase importante em outra cidade',
      'Comecei de novo em outro lugar',
      'Construí família longe da cidade natal',
      'Voltei para minha cidade de origem',
      'Tenho raízes no interior',
      'Tenho raízes no litoral',
      'Tenho raízes em outro país',
      'Valorizo minhas origens',
    ], MapPin, {
      'Gosto de viajar': Plane,
      'Morei fora do Brasil': Map,
      'Comecei de novo em outro lugar': Home,
    }),
  },
  {
    id: 'momentos',
    title: 'Momentos marcantes',
    subtitle: 'Selecione acontecimentos que ajudaram a formar quem você é.',
    icon: Milestone,
    badges: makeBadges('momentos', [
      'Casamento',
      'Nascimento dos filhos',
      'Mudança de cidade',
      'Primeira casa',
      'Primeiro emprego',
      'Formatura',
      'Viagem marcante',
      'Recomeço importante',
      'Perda de alguém querido',
      'Superação de uma fase difícil',
      'Conquista profissional',
      'Criação de um negócio',
      'Encontro com alguém especial',
      'Fase de muito aprendizado',
      'Mudança de carreira',
      'Aposentadoria',
      'Uma decisão que mudou a vida',
      'Um sonho realizado',
    ], Milestone, {
      'Nascimento dos filhos': Baby,
      'Primeira casa': Home,
      'Formatura': GraduationCap,
      'Viagem marcante': Plane,
    }),
  },
  {
    id: 'hobbies',
    title: 'Gostos, paixões e pequenos prazeres',
    subtitle: 'Escolha interesses, hábitos e coisas que fazem parte do seu jeito de viver.',
    icon: Star,
    badges: makeBadges('hobbies', [
      'Cozinhar',
      'Viajar',
      'Música',
      'Dançar',
      'Ler',
      'Filmes e séries',
      'Futebol',
      'Praia',
      'Natureza',
      'Animais',
      'Fotografia',
      'Jardinagem',
      'Artesanato',
      'Tecnologia',
      'Festas de família',
      'Comida caseira',
      'Caminhadas',
      'Conversar',
      'Contar histórias',
      'Receber pessoas em casa',
      'Café',
      'Religião ou espiritualidade',
      'Cultura',
      'Estudos',
    ], Star, {
      'Cozinhar': Utensils,
      'Comida caseira': Utensils,
      'Música': Music,
      'Ler': BookOpen,
      'Fotografia': Camera,
      'Viajar': Plane,
      'Café': Coffee,
    }),
  },
  {
    id: 'marcas',
    title: 'O que faz você uma pessoa única?',
    subtitle: 'Pequenas manias, frases, gostos e costumes ajudam a deixar sua história mais viva.',
    icon: Sparkles,
    badges: makeBadges('marcas', [
      'Tenho um apelido',
      'Tenho uma frase típica',
      'Costumo repetir histórias',
      'Tenho uma receita famosa',
      'Estou sempre tirando fotos',
      'Guardo objetos antigos',
      'Tenho uma música marcante',
      'Me conhecem pelo meu humor',
      'Me conhecem pela minha teimosia',
      'Me conhecem pela minha generosidade',
      'Gosto de aconselhar pessoas',
      'Costumo organizar encontros',
      'Tenho uma mania engraçada',
      'Tenho um talento escondido',
      'Costumo ser pontual',
      'Costumo me atrasar',
      'Amo datas comemorativas',
      'Tenho um prato preferido',
      'Tenho um lugar preferido',
      'Tenho uma lembrança de infância marcante',
    ], Sparkles, {
      'Tenho uma receita famosa': Utensils,
      'Estou sempre tirando fotos': Camera,
      'Tenho uma música marcante': Music,
      'Amo datas comemorativas': Gift,
    }),
  },
];

function limitText(value: string, maxLength = 300) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function getAiBadgeDisplayLabel(badge: AiBadge, memorialMode: boolean) {
  if (!memorialMode) return badge.label;

  const memorialLabels: Record<string, string> = {
    'Calma': 'Era uma pessoa calma',
    'Comunicativa': 'Era comunicativa',
    'Reservada': 'Era reservada',
    'Criativa': 'Era criativa',
    'Curiosa': 'Era curiosa',
    'Bem-humorada': 'Era bem-humorada',
    'Sensível': 'Era sensível',
    'Determinada': 'Era determinada',
    'Independente': 'Era independente',
    'Organizada': 'Era organizada',
    'Espontânea': 'Era espontânea',
    'Teimosa': 'Era teimosa',
    'Generosa': 'Era generosa',
    'Cuidadosa': 'Era cuidadosa',
    'Sonhadora': 'Era sonhadora',
    'Observadora': 'Era observadora',
    'Acolhedora': 'Era acolhedora',
    'Corajosa': 'Era corajosa',

    'Família em primeiro lugar': 'Família esteve em primeiro lugar',
    'Gosto de reunir pessoas': 'Gostava de reunir pessoas',
    'Mantenho tradições familiares': 'Mantinha tradições familiares',
    'Valorizo histórias antigas': 'Valorizava histórias antigas',
    'Tenho forte ligação com meus pais': 'Tinha forte ligação com os pais',
    'Tenho forte ligação com meus avós': 'Tinha forte ligação com os avós',
    'Tenho proximidade com meus irmãos': 'Tinha proximidade com os irmãos',
    'Amo ser mãe ou pai': 'Amava ser mãe ou pai',
    'Amo ser tia ou tio': 'Amava ser tia ou tio',
    'Gosto de cuidar dos outros': 'Gostava de cuidar dos outros',
    'Sou referência na família': 'Era referência na família',
    'Gosto de ouvir histórias da família': 'Gostava de ouvir histórias da família',
    'Gosto de contar histórias': 'Gostava de contar histórias',
    'Valorizo encontros de família': 'Valorizava encontros de família',
    'Guardo fotos e lembranças': 'Guardava fotos e lembranças',
    'Preservo memórias familiares': 'Preservava memórias familiares',

    'Me dedico ao trabalho': 'Dedicou-se ao trabalho',
    'Gosto de empreender': 'Gostava de empreender',
    'Me destaco pela criatividade': 'Destacava-se pela criatividade',
    'Gosto de ensinar': 'Gostava de ensinar',
    'Gosto de aprender': 'Gostava de aprender',
    'Tenho espírito de liderança': 'Tinha espírito de liderança',
    'Mudei de carreira': 'Mudou de carreira',
    'Trabalhei desde cedo': 'Trabalhou desde cedo',
    'Construí minha trajetória com esforço': 'Construiu sua trajetória com esforço',
    'Tenho orgulho da minha profissão': 'Tinha orgulho da profissão',
    'Sou reconhecida pelo que faço': 'Era reconhecida pelo que fazia',
    'Trabalhei em diferentes áreas': 'Trabalhou em diferentes áreas',
    'Valorizo independência financeira': 'Valorizava independência financeira',
    'Gosto de resolver problemas': 'Gostava de resolver problemas',
    'Tenho habilidade manual': 'Tinha habilidade manual',
    'Tenho facilidade com pessoas': 'Tinha facilidade com pessoas',
    'Tenho habilidade com comunicação': 'Tinha habilidade com comunicação',
    'Tenho facilidade com números': 'Tinha facilidade com números',
    'Tenho habilidade artística': 'Tinha habilidade artística',

    'Nasci em uma cidade e vivi em outra': 'Nasceu em uma cidade e viveu em outra',
    'Mudei de cidade': 'Mudou de cidade',
    'Mudei de estado': 'Mudou de estado',
    'Morei fora do Brasil': 'Morou fora do Brasil',
    'Tenho ligação forte com minha cidade natal': 'Tinha ligação forte com sua cidade natal',
    'Sinto saudade de um lugar': 'Sentia saudade de um lugar',
    'Tenho uma cidade que marcou minha vida': 'Teve uma cidade que marcou sua vida',
    'Gosto de viajar': 'Gostava de viajar',
    'Vivi uma fase importante em outra cidade': 'Viveu uma fase importante em outra cidade',
    'Comecei de novo em outro lugar': 'Começou de novo em outro lugar',
    'Construí família longe da cidade natal': 'Construiu família longe da cidade natal',
    'Voltei para minha cidade de origem': 'Voltou para sua cidade de origem',
    'Tenho raízes no interior': 'Tinha raízes no interior',
    'Tenho raízes no litoral': 'Tinha raízes no litoral',
    'Tenho raízes em outro país': 'Tinha raízes em outro país',
    'Valorizo minhas origens': 'Valorizava suas origens',

    'Casamento': 'Viveu um casamento',
    'Nascimento dos filhos': 'Viveu o nascimento dos filhos',
    'Mudança de cidade': 'Viveu uma mudança de cidade',
    'Primeira casa': 'Conquistou a primeira casa',
    'Primeiro emprego': 'Teve o primeiro emprego',
    'Formatura': 'Formou-se',
    'Viagem marcante': 'Fez uma viagem marcante',
    'Recomeço importante': 'Viveu um recomeço importante',
    'Perda de alguém querido': 'Perdeu alguém querido',
    'Superação de uma fase difícil': 'Superou uma fase difícil',
    'Conquista profissional': 'Teve uma conquista profissional',
    'Criação de um negócio': 'Criou um negócio',
    'Encontro com alguém especial': 'Encontrou alguém especial',
    'Fase de muito aprendizado': 'Viveu uma fase de muito aprendizado',
    'Mudança de carreira': 'Mudou de carreira',
    'Aposentadoria': 'Aposentou-se',
    'Uma decisão que mudou a vida': 'Tomou uma decisão que mudou sua vida',
    'Um sonho realizado': 'Realizou um sonho',

    'Cozinhar': 'Gostava de cozinhar',
    'Viajar': 'Gostava de viajar',
    'Música': 'Gostava de música',
    'Dançar': 'Gostava de dançar',
    'Ler': 'Gostava de ler',
    'Filmes e séries': 'Gostava de filmes e séries',
    'Futebol': 'Gostava de futebol',
    'Praia': 'Gostava de praia',
    'Natureza': 'Gostava de natureza',
    'Animais': 'Gostava de animais',
    'Fotografia': 'Gostava de fotografia',
    'Jardinagem': 'Gostava de jardinagem',
    'Artesanato': 'Gostava de artesanato',
    'Tecnologia': 'Gostava de tecnologia',
    'Festas de família': 'Gostava de festas de família',
    'Comida caseira': 'Gostava de comida caseira',
    'Caminhadas': 'Gostava de caminhadas',
    'Conversar': 'Gostava de conversar',
    'Contar histórias': 'Gostava de contar histórias',
    'Receber pessoas em casa': 'Gostava de receber pessoas em casa',
    'Café': 'Gostava de café',
    'Religião ou espiritualidade': 'Valorizava religião ou espiritualidade',
    'Cultura': 'Gostava de cultura',
    'Estudos': 'Gostava de estudar',

    'Tenho um apelido': 'Tinha um apelido',
    'Tenho uma frase típica': 'Tinha uma frase típica',
    'Costumo repetir histórias': 'Costumava repetir histórias',
    'Tenho uma receita famosa': 'Tinha uma receita famosa',
    'Estou sempre tirando fotos': 'Estava sempre tirando fotos',
    'Guardo objetos antigos': 'Guardava objetos antigos',
    'Tenho uma música marcante': 'Tinha uma música marcante',
    'Me conhecem pelo meu humor': 'Era lembrada pelo humor',
    'Me conhecem pela minha teimosia': 'Era lembrada pela teimosia',
    'Me conhecem pela minha generosidade': 'Era lembrada pela generosidade',
    'Gosto de aconselhar pessoas': 'Gostava de aconselhar pessoas',
    'Costumo organizar encontros': 'Costumava organizar encontros',
    'Tenho uma mania engraçada': 'Tinha uma mania engraçada',
    'Tenho um talento escondido': 'Tinha um talento escondido',
    'Costumo ser pontual': 'Costumava ser pontual',
    'Costumo me atrasar': 'Costumava se atrasar',
    'Amo datas comemorativas': 'Amava datas comemorativas',
    'Tenho um prato preferido': 'Tinha um prato preferido',
    'Tenho um lugar preferido': 'Tinha um lugar preferido',
    'Tenho uma lembrança de infância marcante': 'Tinha uma lembrança de infância marcante',
  };

  return memorialLabels[badge.label] ?? badge.label;
}

function getAiBadgeGroupDisplayText(group: AiBadgeGroup, memorialMode: boolean) {
  if (!memorialMode) {
    return {
      title: group.title,
      subtitle: group.subtitle,
    };
  }

  const memorialText: Partial<Record<AiBadgeCategory, { title: string; subtitle: string }>> = {
    personalidade: {
      title: 'Essa pessoa era lembrada como alguém...',
      subtitle: 'Escolha características que marcaram seu jeito de ser.',
    },
    familia: {
      title: 'Família e vínculos que marcaram sua vida',
      subtitle: 'Selecione lembranças ligadas à família e às pessoas importantes em sua trajetória.',
    },
    trabalho: {
      title: 'Trabalho e trajetória de vida',
      subtitle: 'Selecione aspectos que fizeram parte de sua história profissional ou de suas conquistas.',
    },
    lugares: {
      title: 'Lugares que fizeram parte da sua história',
      subtitle: 'Marque cidades, viagens e mudanças que fizeram parte de sua trajetória.',
    },
    momentos: {
      title: 'Momentos que marcaram sua história',
      subtitle: 'Selecione acontecimentos que fizeram parte de sua trajetória.',
    },
    hobbies: {
      title: 'Gostos, paixões e pequenos prazeres que marcaram sua vida',
      subtitle: 'Escolha interesses e hábitos que faziam parte de seu jeito de viver.',
    },
    marcas: {
      title: 'O que fazia essa pessoa ser única?',
      subtitle: 'Escolha marcas pessoais, gostos e lembranças que ajudam a preservar sua memória.',
    },
  };

  return memorialText[group.id] ?? {
    title: group.title,
    subtitle: group.subtitle,
  };
}

function buildAiProfileQuestions(
  selectedBadges: AiBadge[],
  customTraits: string,
  memorialMode: boolean,
): AiGeneratedQuestion[] {
  const categories = new Set(selectedBadges.map((badge) => badge.category));
  const questions: AiGeneratedQuestion[] = [];
  const addQuestion = (id: string, question: string) => {
    if (questions.length < 3 && !questions.some((item) => item.id === id)) {
      questions.push({ id, question, answer: '' });
    }
  };

  if (memorialMode) {
    if (categories.has('familia')) {
      addQuestion('familia', 'Que lembrança de família essa pessoa deixou?');
    }
    if (categories.has('lugares')) {
      addQuestion('lugares', 'Qual cidade, mudança ou lugar marcou sua trajetória?');
    }
    if (categories.has('trabalho')) {
      addQuestion('trabalho', 'O que mais marcou sua vida profissional ou seu jeito de trabalhar?');
    }
    if (categories.has('hobbies') || categories.has('marcas')) {
      addQuestion('curiosidades', 'Existe alguma comida, frase, mania ou costume pelo qual essa pessoa era lembrada?');
    }
    if (categories.has('momentos')) {
      addQuestion('momentos', 'Que momento importante ajudou a formar sua história?');
    }
    if (customTraits.trim()) {
      addQuestion('detalhes', 'Qual detalhe pessoal deveria aparecer nessa homenagem?');
    }

    addQuestion('historia', 'O que você gostaria que a família lembrasse sobre essa pessoa?');
    addQuestion('jeito', 'Que característica dessa pessoa aparecia no convívio com os outros?');
    addQuestion('memoria', 'Qual lembrança, hábito ou gosto ajuda a preservar sua memória?');

    return questions.slice(0, 3);
  }

  if (categories.has('familia')) {
    addQuestion('familia', 'Qual lembrança de família você guarda com mais carinho?');
  }
  if (categories.has('lugares')) {
    addQuestion('lugares', 'Qual cidade, mudança ou lugar marcou mais sua vida?');
  }
  if (categories.has('trabalho')) {
    addQuestion('trabalho', 'O que mais marcou sua trajetória profissional ou seu jeito de trabalhar?');
  }
  if (categories.has('hobbies') || categories.has('marcas')) {
    addQuestion('curiosidades', 'Existe alguma comida, frase, mania ou costume pelo qual as pessoas lembram de você?');
  }
  if (categories.has('momentos')) {
    addQuestion('momentos', 'Que momento da sua trajetória ajudou a formar quem você é?');
  }
  if (customTraits.trim()) {
    addQuestion('detalhes', 'Qual detalhe pessoal você gostaria que aparecesse no texto?');
  }

  addQuestion('historia', 'O que você gostaria que sua família soubesse sobre sua história?');
  addQuestion('jeito', 'Que característica sua costuma aparecer no convívio com as pessoas?');
  addQuestion('memoria', 'Qual lembrança, hábito ou gosto ajuda a contar quem você é?');

  return questions.slice(0, 3);
}

// Futuro banco: substituir campos rede_social/instagram_usuario por pessoa_social_profiles
// (id, pessoa_id, rede, perfil, url, exibir_no_perfil, created_at, updated_at).

function getDraftKey(userId: string, pessoaId: string) {
  return `meus-dados-draft:${userId}:${pessoaId}`;
}

function readMeusDadosDraft(key: string): MeusDadosDraft | null {
  try {
    const rawDraft = window.sessionStorage.getItem(key);
    if (!rawDraft) return null;

    const draft = JSON.parse(rawDraft) as Partial<MeusDadosDraft> & { complemento?: string };
    if (!draft.form || !Array.isArray(draft.socialProfiles)) return null;

    const form = {
      ...buildEditablePersonFormState(),
      ...draft.form,
      complemento: draft.form.complemento ?? draft.complemento ?? '',
    };

    return {
      form,
      socialProfiles: draft.socialProfiles.length > 0 ? draft.socialProfiles : [createSocialProfile()],
      pendingAvatarDataUrl: draft.pendingAvatarDataUrl ?? null,
      avatarCropSourceDataUrl: draft.avatarCropSourceDataUrl ?? null,
      photoMarkedForRemoval: draft.photoMarkedForRemoval === true,
    };
  } catch {
    return null;
  }
}

function writeMeusDadosDraft(key: string, draft: MeusDadosDraft) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Rascunho é uma proteção auxiliar; falhas de storage não devem bloquear a edição.
  }
}

function removeMeusDadosDraft(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // noop
  }
}

function readImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = src;
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () => reject(reader.error ?? new Error('Não foi possível preparar a imagem.')));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string) {
  try {
    const [metadata, encodedData] = dataUrl.split(',');
    if (!metadata || !encodedData) return null;

    const mimeType = metadata.match(/^data:([^;]+)/)?.[1] ?? 'image/jpeg';
    const isBase64 = metadata.includes(';base64');
    const binary = isBase64 ? window.atob(encodedData) : decodeURIComponent(encodedData);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mimeType });
  } catch {
    return null;
  }
}

async function createPersistableAvatarSource(file: File) {
  const sourceDataUrl = await blobToDataUrl(file);
  const image = await readImage(sourceDataUrl);
  const maxDimension = 1600;

  if (image.naturalWidth <= maxDimension && image.naturalHeight <= maxDimension) {
    return sourceDataUrl;
  }

  const scale = maxDimension / Math.max(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext('2d');

  if (!context) return sourceDataUrl;

  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.9);
}

async function createCroppedAvatarBlob(imageSrc: string, cropPixels: Area) {
  const image = await readImage(imageSrc);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Não foi possível preparar o corte da imagem.');
  }

  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Não foi possível gerar o JPEG final.'));
        return;
      }

      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
}

export function MeusDados() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasInitializedFormRef = useRef(false);
  const initializedPessoaIdRef = useRef<string | null>(null);
  const isDirtyRef = useRef(false);
  const [link, setLink] = useState<(UserPersonLinkRecord & { pessoa: Pessoa | null }) | null>(null);
  const [linkedPeople, setLinkedPeople] = useState<Array<UserPersonLinkRecord & { pessoa: Pessoa | null }>>([]);
  const [selectedPessoaId, setSelectedPessoaId] = useState('');
  const [form, setForm] = useState<EditableOwnPersonPayload>(buildEditablePersonFormState());
  const [socialProfiles, setSocialProfiles] = useState<SocialProfileForm[]>(() => [createSocialProfile()]);
  const [errors, setErrors] = useState<PersonFieldErrors>({});
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [croppedPhotoBlob, setCroppedPhotoBlob] = useState<Blob | null>(null);
  const [pendingAvatarDataUrl, setPendingAvatarDataUrl] = useState<string | null>(null);
  const [avatarCropSourceDataUrl, setAvatarCropSourceDataUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [photoMarkedForRemoval, setPhotoMarkedForRemoval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [aiTone, setAiTone] = useState<AiTone>('afetivo');
  const [aiSelectedBadges, setAiSelectedBadges] = useState<string[]>([]);
  const [aiCustomTraits, setAiCustomTraits] = useState('');
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<AiGeneratedQuestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user) return;

      setLoading(true);
      await resolveFirstAccessLinkForUser(user);
      const { data: linksData, error } = await getCurrentUserLinkedPeople();

      if (!mounted) return;

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      setLinkedPeople(linksData);
      const selectedLink = (
        selectedPessoaId
          ? linksData.find((item) => item.pessoa_id === selectedPessoaId)
          : null
      ) || linksData.find((item) => item.principal) || linksData[0] || null;

      if (selectedLink && selectedLink.pessoa_id !== selectedPessoaId) {
        setSelectedPessoaId(selectedLink.pessoa_id);
      }

      const data = selectedLink;
      const nextPessoaId = data?.pessoa?.id ?? null;
      const samePessoa = nextPessoaId && initializedPessoaIdRef.current === nextPessoaId;
      const shouldPreserveDraft = hasInitializedFormRef.current && isDirtyRef.current && samePessoa;
      const draftKey = user.id && nextPessoaId ? getDraftKey(user.id, nextPessoaId) : null;
      const draft = draftKey && !shouldPreserveDraft ? readMeusDadosDraft(draftKey) : null;
      let loadedSocialProfiles = buildSocialProfilesFromPerson(data?.pessoa);

      setLink(data);

      if (nextPessoaId) {
        try {
          const socialProfileRows = await listarPessoaSocialProfiles(nextPessoaId);
          loadedSocialProfiles = buildSocialProfilesFromRows(socialProfileRows, data?.pessoa);
        } catch (socialProfilesError) {
          if (mounted) {
            toast.warning(
              socialProfilesError instanceof Error
                ? `Não foi possível carregar redes sociais versionadas: ${socialProfilesError.message}`
                : 'Não foi possível carregar redes sociais versionadas.',
            );
          }
        }
      }

      if (!shouldPreserveDraft) {
        setForm(draft?.form ?? buildEditablePersonFormState(data?.pessoa));
        setSocialProfiles(draft?.socialProfiles ?? loadedSocialProfiles);
        isDirtyRef.current = Boolean(draft);
      }

      hasInitializedFormRef.current = true;
      initializedPessoaIdRef.current = nextPessoaId;
      if (!shouldPreserveDraft) {
        const restoredPendingAvatar = draft?.pendingAvatarDataUrl ?? null;
        const restoredCropSource = draft?.avatarCropSourceDataUrl ?? null;
        setPendingAvatarDataUrl(restoredPendingAvatar);
        setAvatarCropSourceDataUrl(restoredCropSource);
        setPhotoPreviewUrl(restoredPendingAvatar);
        setCropImageUrl(restoredCropSource);
        setCroppedPhotoBlob(restoredPendingAvatar ? dataUrlToBlob(restoredPendingAvatar) : null);
        setPhotoMarkedForRemoval(draft?.photoMarkedForRemoval === true);
      }
      setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [selectedPessoaId, user]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    return () => {
      if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    };
  }, [cropImageUrl]);

  useEffect(() => {
    const pessoaId = link?.pessoa?.id;
    if (!user?.id || !pessoaId || !hasInitializedFormRef.current || !isDirtyRef.current) return;

    writeMeusDadosDraft(getDraftKey(user.id, pessoaId), {
      form,
      socialProfiles,
      pendingAvatarDataUrl,
      avatarCropSourceDataUrl,
      photoMarkedForRemoval,
    });
  }, [
    avatarCropSourceDataUrl,
    form,
    link?.pessoa?.id,
    pendingAvatarDataUrl,
    photoMarkedForRemoval,
    socialProfiles,
    user?.id,
  ]);

  const pessoa = link?.pessoa;
  const canEditSelectedProfile = link?.can_edit !== false;
  const previewName = useMemo(() => {
    const name = formatPersonName(String(form.nome_completo ?? '').trim());
    return name || pessoa?.nome_completo || 'Minha pessoa na árvore';
  }, [form.nome_completo, pessoa?.nome_completo]);

  const previewLocation = useMemo(() => {
    if (form.local_atual) {
      return normalizeLocationByMode(String(form.local_atual), {
        international: form.local_atual_exterior === true,
      }) || 'Sem local informado';
    }
    return normalizeLocationByMode(String(form.local_nascimento || ''), {
      international: form.local_nascimento_exterior === true,
    }) || 'Sem local informado';
  }, [form.local_atual, form.local_atual_exterior, form.local_nascimento, form.local_nascimento_exterior]);

  const currentPhotoUrl = photoMarkedForRemoval ? '' : photoPreviewUrl || String(form.foto_principal_url ?? '');
  const aiAllBadges = useMemo(() => AI_BADGE_GROUPS.flatMap((group) => group.badges), []);
  const aiSelectedBadgeItems = useMemo(
    () => aiAllBadges.filter((badge) => aiSelectedBadges.includes(badge.id)),
    [aiAllBadges, aiSelectedBadges],
  );
  const aiIsMemorialMode = aiTone === 'nostalgico';
  const aiAnsweredQuestions = useMemo(
    () => aiGeneratedQuestions.filter((item) => item.answer.trim()),
    [aiGeneratedQuestions],
  );
  const aiHasGenerationSource = aiSelectedBadgeItems.length > 0 || aiCustomTraits.trim().length > 0 || aiAnsweredQuestions.length > 0;
  const aiProgressPercent = Math.round(((aiStep + 1) / AI_STEPS.length) * 100);

  useEffect(() => {
    setAiGeneratedQuestions((currentQuestions) => {
      const nextQuestions = buildAiProfileQuestions(aiSelectedBadgeItems, aiCustomTraits, aiIsMemorialMode);
      return nextQuestions.map((question) => ({
        ...question,
        answer: currentQuestions.find((item) => item.id === question.id)?.answer ?? '',
      }));
    });
  }, [aiSelectedBadgeItems, aiCustomTraits, aiIsMemorialMode]);

  const markFormDirty = () => {
    isDirtyRef.current = true;
  };

  const updateField = (field: keyof EditableOwnPersonPayload, value: string | boolean) => {
    markFormDirty();
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const updateTextField = (field: keyof EditableOwnPersonPayload, value: string) => {
    if (field === 'data_nascimento' || field === 'data_falecimento') {
      updateField(field, maskBirthDate(value));
      return;
    }

    if (field === 'telefone') {
      updateField(field, formatPhone(value));
      return;
    }

    updateField(field, value);
  };

  const getCompleteSocialProfiles = (profiles: SocialProfileForm[] = socialProfiles) => (
    profiles.filter((profile) => profile.rede.trim() && profile.perfil.trim())
  );

  const getPrimaryCompleteSocialProfile = (profiles: SocialProfileForm[] = socialProfiles) => (
    getCompleteSocialProfiles(profiles)[0] ?? createSocialProfile()
  );

  const syncFirstSocialProfileToLegacyFields = (profiles: SocialProfileForm[]) => {
    markFormDirty();
    const primaryCompleteProfile = getPrimaryCompleteSocialProfile(profiles);
    setForm((current) => syncFirstSocialProfileToPersonFields(current, [primaryCompleteProfile]));
    setErrors((current) => ({
      ...current,
      rede_social: undefined,
      instagram_usuario: undefined,
    }));
  };

  const handleSocialProfilesChange = (nextProfiles: SocialProfileForm[]) => {
    markFormDirty();
    setSocialProfiles(nextProfiles);
    syncFirstSocialProfileToLegacyFields(nextProfiles);
  };

  const normalizeFieldOnBlur = (field: keyof EditableOwnPersonPayload) => {
    const value = String(form[field] ?? '');

    if (field === 'nome_completo') updateField(field, formatPersonName(value));
    if (field === 'data_nascimento' || field === 'data_falecimento') {
      updateField(field, normalizeBirthDate(value));
    }
    if (field === 'profissao') updateField(field, normalizeProfession(value));
    if (field === 'local_nascimento' || field === 'local_atual' || field === 'local_falecimento') {
      const international = field === 'local_nascimento'
        ? form.local_nascimento_exterior === true
        : field === 'local_falecimento'
          ? form.local_falecimento_exterior === true
          : form.local_atual_exterior === true;
      const normalizedLocation = normalizeLocationByMode(value, { international });
      updateField(field, normalizedLocation);
      setErrors((current) => ({
        ...current,
        [field]: validateLocationByMode(normalizedLocation, { international }),
      }));
    }
  };

  const validateForm = () => {
    const primarySocialProfile = getPrimaryCompleteSocialProfile();
    const formForValidation = {
      ...form,
      rede_social: primarySocialProfile.rede || '',
      instagram_usuario: primarySocialProfile.perfil || '',
    };
    const nextErrors = validateEditablePersonForm(formForValidation);
    const normalizedName = formatPersonName(String(form.nome_completo ?? ''));
    const normalizedBirthDate = normalizeBirthDate(String(form.data_nascimento ?? ''));
    const normalizedBirthLocation = normalizeLocationByMode(String(form.local_nascimento ?? ''), {
      international: form.local_nascimento_exterior === true,
    });
    const normalizedDeathDate = normalizeBirthDate(String(form.data_falecimento ?? ''));
    const normalizedDeathLocation = normalizeLocationByMode(String(form.local_falecimento ?? ''), {
      international: form.local_falecimento_exterior === true,
    });
    const normalizedCurrentLocation = normalizeLocationByMode(String(form.local_atual ?? ''), {
      international: form.local_atual_exterior === true,
    });

    setErrors(nextErrors);
    setForm((current) => ({
      ...current,
      nome_completo: normalizedName,
      data_nascimento: normalizedBirthDate,
      local_nascimento: normalizedBirthLocation,
      data_falecimento: normalizedDeathDate,
      local_falecimento: normalizedDeathLocation,
      local_atual: normalizedCurrentLocation,
      profissao: normalizeProfession(String(current.profissao ?? '')),
      telefone: formatPhone(String(current.telefone ?? '')),
      rede_social: primarySocialProfile.rede || '',
      instagram_usuario: primarySocialProfile.perfil || '',
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handlePhotoFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.');
      return;
    }

    try {
      const sourceDataUrl = await createPersistableAvatarSource(file);
      markFormDirty();
      setAvatarCropSourceDataUrl(sourceDataUrl);
      setCropImageUrl(sourceDataUrl);
    } catch {
      toast.error('Não foi possível preparar a imagem selecionada.');
      return;
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setPhotoMarkedForRemoval(false);
  };

  const handleRemovePhoto = () => {
    markFormDirty();
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setPhotoPreviewUrl(null);
    setCropImageUrl(null);
    setCroppedPhotoBlob(null);
    setPendingAvatarDataUrl(null);
    setAvatarCropSourceDataUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setPhotoMarkedForRemoval(true);
    setPhotoDialogOpen(false);
  };

  const handleApplyCrop = async () => {
    if (!cropImageUrl || !croppedAreaPixels) {
      toast.error('Selecione e ajuste uma imagem antes de aplicar.');
      return;
    }

    try {
      const blob = await createCroppedAvatarBlob(cropImageUrl, croppedAreaPixels);
      const previewUrl = await blobToDataUrl(blob);

      markFormDirty();
      setPhotoPreviewUrl(previewUrl);
      setCroppedPhotoBlob(blob);
      setPendingAvatarDataUrl(previewUrl);
      setAvatarCropSourceDataUrl(null);
      setCropImageUrl(null);
      setPhotoMarkedForRemoval(false);
      setPhotoDialogOpen(false);
      toast.success('Corte aplicado ao avatar.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível aplicar o corte.');
    }
  };

  const uploadAvatarBlob = async (blob: Blob) => {
    if (!user || !pessoa?.id) return { error: 'Não foi possível localizar o usuário para salvar a foto.', url: null };

    try {
      const upload = await uploadPersonAvatarFile(blob, { pessoaId: pessoa.id });
      return { error: undefined, url: upload.url };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Não foi possível enviar a foto.',
        url: null,
      };
    }
  };

  const toggleAiBadge = (badgeId: string) => {
    setAiSelectedBadges((current) => (
      current.includes(badgeId)
        ? current.filter((item) => item !== badgeId)
        : [...current, badgeId]
    ));
  };

  const handleGenerateAiText = async () => {
    if (aiLoading) return;

    if (!aiHasGenerationSource) {
      setAiError('Selecione ao menos uma opção ou responda uma pergunta para gerar o texto.');
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const answeredQuestions = aiGeneratedQuestions
        .filter((item) => item.answer.trim())
        .map((item) => ({
          question: item.question,
          answer: item.answer.trim(),
        }));

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose: 'profile_text',
          tone: aiTone,
          memorialMode: aiIsMemorialMode,
          selectedBadges: aiSelectedBadgeItems.map((badge) => getAiBadgeDisplayLabel(badge, aiIsMemorialMode)),
          customTraits: aiCustomTraits.trim(),
          answers: answeredQuestions,
          context: {
            nome: String(form.nome_completo ?? ''),
            profissao: String(form.profissao ?? ''),
            local_nascimento: String(form.local_nascimento ?? ''),
            local_atual: String(form.local_atual ?? ''),
            data_nascimento: String(form.data_nascimento ?? ''),
            data_falecimento: String(form.data_falecimento ?? ''),
            falecido: form.falecido === true,
            minibio_atual: String(form.minibio ?? ''),
            curiosidades_atuais: String(form.curiosidades ?? ''),
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Não foi possível gerar os textos agora. Tente novamente em instantes.');
      }

      const minibio = limitText(payload?.minibio ?? '');
      const curiosidades = limitText(payload?.curiosidades ?? '');
      if (!minibio || !curiosidades) {
        throw new Error('A IA não retornou textos válidos.');
      }

      updateTextField('minibio', minibio);
      updateTextField('curiosidades', curiosidades);
      setAiDialogOpen(false);
      setAiError(null);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Não foi possível gerar os textos agora. Tente novamente em instantes.');
    } finally {
      setAiLoading(false);
    }
  };
  const handleConfirm = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user || !link?.id || !pessoa?.id) {
      toast.error('Não foi possível localizar seu vínculo com a árvore.');
      return;
    }

    if (!canEditSelectedProfile) {
      toast.error('Este perfil está em modo somente leitura para sua conta.');
      return;
    }

    if (!validateForm()) {
      toast.error('Revise os campos destacados antes de salvar.');
      return;
    }

    setSaving(true);

    const completedSocialProfiles = getCompleteSocialProfiles();
    const primarySocialProfile = completedSocialProfiles[0] ?? createSocialProfile();
    const payload = cleanPersonPayload({
      ...form,
      rede_social: primarySocialProfile.rede || '',
      instagram_usuario: primarySocialProfile.perfil || '',
    });

    if (payload.falecido === true) {
      payload.permitir_exibir_data_nascimento = true;
      payload.permitir_exibir_telefone = true;
      payload.permitir_exibir_endereco = true;
      payload.permitir_exibir_rede_social = true;
      payload.permitir_exibir_instagram = true;
      payload.permitir_mensagens_whatsapp = false;
    }
    if (photoMarkedForRemoval) {
      payload.foto_principal_url = '';
    } else if (croppedPhotoBlob) {
      const upload = await uploadAvatarBlob(croppedPhotoBlob);

      if (upload.error) {
        setSaving(false);
        toast.error(`Não foi possível enviar a foto: ${upload.error}`);
        return;
      }

      payload.foto_principal_url = upload.url;
    }

    const { error: updateError, data: updatedPessoa } = await updateOwnLinkedPerson(pessoa.id, payload);

    if (updateError) {
      setSaving(false);
      toast.error(updateError);
      return;
    }

    if (payload.falecido === true) {
      await salvarPreferenciasNotificacao(user.id, {
        receber_aniversarios: false,
        receber_datas_memoria: false,
        receber_eventos: false,
        receber_avisos_gerais: false,
        receber_email: false,
        receber_push: false,
        receber_whatsapp: false,
        receber_email_novo_usuario: false,
        receber_email_datas_especiais: false,
        receber_email_novas_mensagens_forum: false,
        receber_email_novos_registros_historicos: false,
        receber_email_evento_historico_familia: false,
      });
    }

    try {
      const savedProfiles = await substituirPessoaSocialProfiles(pessoa.id, completedSocialProfiles, {
        exibirNoPerfil: payload.permitir_exibir_rede_social !== false,
      });
      setSocialProfiles(buildSocialProfilesFromRows(savedProfiles, updatedPessoa ?? pessoa));
    } catch (socialProfilesError) {
      toast.warning(
        socialProfilesError instanceof Error
          ? `Dados pessoais salvos, mas não foi possível salvar redes sociais versionadas: ${socialProfilesError.message}`
          : 'Dados pessoais salvos, mas não foi possível salvar redes sociais versionadas.',
      );
    }

    if (link.relacao_com_perfil === 'Sou esta pessoa') {
      const { error: profileError } = await ensureMemberProfile(user.id, {
        nome_exibicao: updatedPessoa?.nome_completo ?? String(payload.nome_completo ?? ''),
        avatar_url: photoMarkedForRemoval ? null : String(updatedPessoa?.foto_principal_url ?? form.foto_principal_url ?? '') || null,
      });

      if (profileError) {
        setSaving(false);
        toast.error(profileError);
        return;
      }
    }

    setSaving(false);

    if (user?.id && pessoa.id) {
      removeMeusDadosDraft(getDraftKey(user.id, pessoa.id));
    }
    setPendingAvatarDataUrl(null);
    setAvatarCropSourceDataUrl(null);
    setCroppedPhotoBlob(null);
    isDirtyRef.current = false;
    toast.success('Dados pessoais salvos.');
    navigate('/meus-vinculos', { replace: true });
  };

  const renderAiBadgeGroup = (group: AiBadgeGroup) => {
    const GroupIcon = group.icon;
    const compactCards = ['personalidade', 'familia', 'trabalho', 'lugares', 'momentos', 'hobbies', 'marcas'].includes(group.id);
    const displayText = getAiBadgeGroupDisplayText(group, aiIsMemorialMode);

    return (
      <div className="space-y-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <GroupIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="break-words text-lg font-semibold text-gray-900">{displayText.title}</h3>
            <p className="mt-1 break-words text-sm leading-relaxed text-gray-600">{displayText.subtitle}</p>
          </div>
        </div>
        <div className={compactCards ? 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid grid-cols-1 gap-3 sm:grid-cols-2'}>
          {group.badges.map((badge) => {
            const selected = aiSelectedBadges.includes(badge.id);
            const BadgeIcon = badge.icon ?? group.icon;
            const displayLabel = getAiBadgeDisplayLabel(badge, aiIsMemorialMode);

            if (compactCards) {
              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => toggleAiBadge(badge.id)}
                  className={[
                    'flex min-h-[56px] min-w-0 items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-medium leading-snug transition-colors',
                    selected
                      ? 'border-blue-300 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-blue-200 hover:bg-blue-50/50',
                  ].join(' ')}
                  aria-pressed={selected}
                >
                  <span className="min-w-0 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                    {displayLabel}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => toggleAiBadge(badge.id)}
                className={[
                  'flex min-w-0 items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors',
                  selected
                    ? 'border-blue-300 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/50',
                ].join(' ')}
                aria-pressed={selected}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/80 text-blue-700">
                  <BadgeIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 break-words font-medium leading-snug">{displayLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAiStep = () => {
    if (aiStep === 0) {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="break-words text-lg font-semibold text-gray-900">Escolha o tom do texto</h3>
            <p className="mt-1 break-words text-sm leading-relaxed text-gray-600">
              Como você quer que sua Mini Bio e suas Curiosidades soem? O tom Nostálgico cria uma homenagem em memória de quem já faleceu.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AI_TONES.map((tone) => {
              const selected = aiTone === tone.id;
              const ToneIcon = tone.icon;

              return (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setAiTone(tone.id)}
                  className={[
                    'flex min-w-0 items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                    selected
                      ? 'border-blue-300 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/50',
                  ].join(' ')}
                  aria-pressed={selected}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/80 text-blue-700">
                    <ToneIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-semibold leading-snug">{tone.label}</span>
                    <span className="mt-1 block break-words text-xs leading-snug text-gray-500">{tone.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (aiStep >= 1 && aiStep <= 7) {
      return renderAiBadgeGroup(AI_BADGE_GROUPS[aiStep - 1]);
    }

    if (aiStep === 8) {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="break-words text-lg font-semibold text-gray-900">
              {aiIsMemorialMode ? 'Outras lembranças sobre essa pessoa' : 'Outras características'}
            </h3>
            <p className="mt-1 break-words text-sm leading-relaxed text-gray-600">
              {aiIsMemorialMode
                ? 'Quer acrescentar algo que ajude a contar sua história?'
                : 'Quer acrescentar algo que não apareceu nas opções?'}
            </p>
          </div>
          <Textarea
            value={aiCustomTraits}
            onChange={(event) => setAiCustomTraits(event.target.value)}
            placeholder={
              aiIsMemorialMode
                ? 'Ex: adorava cozinhar aos domingos, era conhecido pelo bom humor, morou em três cidades, gostava de reunir a família...'
                : 'Ex: gosto de fazer pão aos domingos, sou conhecido por contar histórias antigas, morei em três cidades...'
            }
            className="min-h-32 border-gray-300 bg-white text-sm focus-visible:ring-blue-600"
          />
        </div>
      );
    }

    if (aiStep === 9) {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="break-words text-lg font-semibold text-gray-900">Perguntas opcionais</h3>
            <p className="mt-1 break-words text-sm leading-relaxed text-gray-600">
              {aiIsMemorialMode
                ? 'As respostas ajudam a IA a criar uma homenagem mais fiel à memória da pessoa. Você pode deixar em branco.'
                : 'As respostas ajudam a IA a deixar o texto menos genérico. Você pode deixar em branco.'}
            </p>
          </div>
          <div className="space-y-3">
            {aiGeneratedQuestions.map((item) => (
              <div key={item.id} className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
                <Label className="break-words text-sm text-gray-800">{item.question}</Label>
                <Textarea
                  value={item.answer}
                  onChange={(event) => {
                    const answer = event.target.value;
                    setAiGeneratedQuestions((current) => current.map((question) => (
                      question.id === item.id ? { ...question, answer } : question
                    )));
                  }}
                  className="min-h-20 border-gray-300 bg-white text-sm focus-visible:ring-blue-600"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (!link || !pessoa) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-sm">
          <UserCircle2 className="mx-auto mb-4 h-12 w-12 text-amber-600" />
          <h1 className="break-words text-xl font-bold text-gray-900">Perfil não vinculado</h1>
          <p className="mt-2 break-words text-sm text-gray-600">
            Sua conta ainda não está vinculada a uma pessoa da árvore. Use o primeiro acesso ou solicite ajuda.
          </p>
          <Button className="mt-5 w-full sm:w-auto" onClick={() => navigate('/entrar')}>
            Ir para autenticação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Revisar meus dados"
        subtitle="Confira suas informações antes de acessar a árvore principal."
        icon={UserCircle2}
        actions={[
          { label: 'Árvore geral', to: '/', icon: HEADER_ACTION_ICONS.Home },
          { label: 'Mapa Familiar', to: '/mapa-familiar', icon: HEADER_ACTION_ICONS.Network },
        ]}
      />

      <MemberOnboardingSteps activeStep={1} hidePreferences={form.falecido === true} />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,320px)]">
        <form onSubmit={handleConfirm} className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          {linkedPeople.length > 1 && (
            <section className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <Label htmlFor="linked-profile-selector">Perfil em edição</Label>
              <select
                id="linked-profile-selector"
                value={selectedPessoaId}
                onChange={(event) => {
                  isDirtyRef.current = false;
                  hasInitializedFormRef.current = false;
                  initializedPessoaIdRef.current = null;
                  setSelectedPessoaId(event.target.value);
                }}
                className="mt-2 flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {linkedPeople.map((item) => (
                  <option key={item.id} value={item.pessoa_id}>
                    {item.pessoa?.nome_completo || item.pessoa_id}
                    {item.principal ? ' · principal' : ''}
                    {item.can_edit === false ? ' · somente leitura' : ''}
                  </option>
                ))}
              </select>
            </section>
          )}

          {!canEditSelectedProfile && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Este perfil está disponível para consulta, mas sua conta não tem permissão para editar os dados.
            </div>
          )}

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <SectionTitle icon={UserCircle2}>Dados pessoais</SectionTitle>
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              <Field label="Nome completo" error={errors.nome_completo}>
                <Input
                  value={String(form.nome_completo ?? '')}
                  onBlur={() => normalizeFieldOnBlur('nome_completo')}
                  onChange={(e) => updateTextField('nome_completo', e.target.value)}
                  aria-invalid={Boolean(errors.nome_completo)}
                  required
                />
              </Field>

              <Field label="Profissão">
                <Input
                  value={String(form.profissao ?? '')}
                  onBlur={() => normalizeFieldOnBlur('profissao')}
                  onChange={(e) => updateTextField('profissao', e.target.value)}
                  placeholder="Ex: jornalista, professora, médico..."
                />
              </Field>

              <div className="grid min-w-0 grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_128px]">
                <Field
                  label="Local de nascimento"
                  labelAddon={<LocationFormatInfoButton ariaLabel="Formato aceito para local de nascimento" />}
                  error={errors.local_nascimento}
                >
                  <Input
                    value={String(form.local_nascimento ?? '')}
                    onBlur={() => normalizeFieldOnBlur('local_nascimento')}
                    onChange={(e) => updateTextField('local_nascimento', e.target.value)}
                    placeholder={form.local_nascimento_exterior === true ? 'Ex: Dublin (Irlanda)' : 'Ex: Paulo Afonso/BA'}
                    aria-invalid={Boolean(errors.local_nascimento)}
                  />
                </Field>
                <CompactToggleField
                  label="Estrangeiro"
                  checked={form.local_nascimento_exterior === true}
                  onCheckedChange={(checked) => updateField('local_nascimento_exterior', checked)}
                  className="sm:self-end"
                />
              </div>

              <Field
                label="Dia ou Ano de Nascimento"
                labelAddon={<DateFormatInfoButton ariaLabel="Formato aceito para nascimento" />}
                error={errors.data_nascimento}
              >
                <Input
                  id="data-nascimento"
                  value={String(form.data_nascimento ?? '')}
                  onBlur={() => normalizeFieldOnBlur('data_nascimento')}
                  onChange={(e) => updateTextField('data_nascimento', e.target.value)}
                  placeholder="AAAA ou DD/MM/AAAA"
                  aria-invalid={Boolean(errors.data_nascimento)}
                />
              </Field>

              <div className="border-t border-gray-200 pt-4 md:col-span-2">
                <DeathStatusSelector
                  checked={form.falecido === true}
                  onChange={(checked) => updateField('falecido', checked)}
                />
              </div>

              {form.falecido !== true && (
                <div className="grid min-w-0 grid-cols-1 items-start gap-3 md:col-span-2 sm:grid-cols-[minmax(0,1fr)_128px] md:max-w-[calc(50%-0.5rem)]">
                  <Field
                    label="Cidade de residência"
                    labelAddon={<LocationFormatInfoButton ariaLabel="Formato aceito para cidade de residência" />}
                    error={errors.local_atual}
                  >
                    <Input
                      value={String(form.local_atual ?? '')}
                      onBlur={() => normalizeFieldOnBlur('local_atual')}
                      onChange={(e) => updateTextField('local_atual', e.target.value)}
                      placeholder={form.local_atual_exterior === true ? 'Ex: Dublin (Irlanda)' : 'Ex: Paulo Afonso/BA'}
                      aria-invalid={Boolean(errors.local_atual)}
                    />
                  </Field>
                  <CompactToggleField
                    label="Exterior"
                    checked={form.local_atual_exterior === true}
                    onCheckedChange={(checked) => updateField('local_atual_exterior', checked)}
                    className="sm:self-end"
                  />
                </div>
              )}

              {form.falecido === true && (
                <div className="grid grid-cols-1 items-start gap-4 md:col-span-2 md:grid-cols-2">
                  <Field
                    label="Dia ou Ano de Falecimento"
                    labelAddon={<DateFormatInfoButton ariaLabel="Formato aceito para falecimento" />}
                    error={errors.data_falecimento}
                  >
                    <Input
                      value={String(form.data_falecimento ?? '')}
                      onBlur={() => normalizeFieldOnBlur('data_falecimento')}
                      onChange={(event) => updateTextField('data_falecimento', event.target.value)}
                      placeholder="AAAA ou DD/MM/AAAA"
                      aria-invalid={Boolean(errors.data_falecimento)}
                    />
                  </Field>
                  <div className="grid min-w-0 grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <Field
                      label="Local de falecimento"
                      labelAddon={<LocationFormatInfoButton ariaLabel="Formato aceito para local de falecimento" />}
                      error={errors.local_falecimento}
                    >
                      <Input
                        value={String(form.local_falecimento ?? '')}
                        onBlur={() => normalizeFieldOnBlur('local_falecimento')}
                        onChange={(event) => updateTextField('local_falecimento', event.target.value)}
                        placeholder={form.local_falecimento_exterior === true ? 'Ex: Dublin (Irlanda)' : 'Ex: Paulo Afonso/BA'}
                        aria-invalid={Boolean(errors.local_falecimento)}
                      />
                    </Field>
                    <CompactToggleField
                      label="Falecimento no exterior"
                      checked={form.local_falecimento_exterior === true}
                      onCheckedChange={(checked) => updateField('local_falecimento_exterior', checked)}
                      className="sm:self-end"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {form.falecido !== true && (
          <section className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <SectionTitle icon={MapPin}>Contato, endereço e redes sociais</SectionTitle>
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              <Field label="WhatsApp">
                <Input
                  value={String(form.telefone ?? '')}
                  onChange={(e) => updateTextField('telefone', e.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </Field>
              <div className="hidden md:block" />
              <Field label="Endereço">
                <AddressAutocompleteInput
                  value={String(form.endereco ?? '')}
                  onChange={(nextValue) => updateTextField('endereco', nextValue)}
                  placeholder="Digite a rua e número, depois selecione"
                />
              </Field>
              <Field label="Complemento">
                <Input
                  value={String(form.complemento ?? '')}
                  onChange={(e) => updateTextField('complemento', e.target.value)}
                  placeholder="Ex.: Apto 402, Bloco B, Torre Norte"
                />
              </Field>
              <div className="min-w-0 space-y-2 md:col-span-2">
                <SocialProfilesEditor
                  profiles={socialProfiles}
                  onChange={handleSocialProfilesChange}
                  errors={{
                    rede_social: errors.rede_social,
                    instagram_usuario: errors.instagram_usuario,
                  }}
                />
              </div>
            </div>
          </section>
          )}

          <section className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <SectionTitle icon={Sparkles} className="mb-0">Sobre Mim</SectionTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 px-3"
                onClick={() => {
                  setAiError(null);
                  setAiStep(0);
                  setAiDialogOpen(true);
                }}
                aria-label="Receber ajuda da IA para escrever Mini Bio e Curiosidades"
                title="Receber ajuda da IA para escrever Mini Bio e Curiosidades"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Ajuda da IA</span>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Mini Bio">
                <Textarea
                  value={String(form.minibio ?? '')}
                  onChange={(e) => updateTextField('minibio', e.target.value)}
                  placeholder="Escreva uma breve apresentação sobre você em até 300 caracteres."
                  maxLength={300}
                  className="min-h-24 border-gray-300 bg-white text-sm focus-visible:ring-blue-600"
                />
                <p className="text-right text-xs text-gray-500">{String(form.minibio ?? '').length}/300</p>
              </Field>
              <Field label="Curiosidades">
                <Textarea
                  value={String(form.curiosidades ?? '')}
                  onChange={(e) => updateTextField('curiosidades', e.target.value)}
                  placeholder="Compartilhe fatos, gostos, lembranças ou detalhes curiosos sobre sua vida em até 300 caracteres."
                  maxLength={300}
                  className="min-h-24 border-gray-300 bg-white text-sm focus-visible:ring-blue-600"
                />
                <p className="text-right text-xs text-gray-500">{String(form.curiosidades ?? '').length}/300</p>
              </Field>
            </div>
          </section>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="submit" disabled={saving || !canEditSelectedProfile} className="w-full sm:w-auto sm:min-w-[220px]">
              {saving ? (
                'Salvando...'
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Confirmar meus dados
                </>
              )}
            </Button>
          </div>
        </form>

        <aside className="h-fit min-w-0 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-3xl font-bold text-blue-700">
            {currentPhotoUrl ? (
              <img src={currentPhotoUrl} alt={previewName} className="h-full w-full object-cover" />
            ) : (
              <span>{getInitials(previewName)}</span>
            )}
          </div>

          <h2 className="mt-4 break-words text-xl font-bold leading-snug text-gray-900">
            {previewName}
          </h2>
          <p className="mt-2 break-words text-sm text-gray-500">{previewLocation}</p>

          <div className="mt-5 grid grid-cols-1 gap-2">
            <Button type="button" variant="outline" onClick={() => setPhotoDialogOpen(true)}>
              <Camera className="h-4 w-4" />
              <span className="md:hidden">{currentPhotoUrl ? 'Alterar' : 'Cadastrar'}</span>
              <span className="hidden md:inline">{currentPhotoUrl ? 'Alterar foto' : 'Cadastrar foto'}</span>
            </Button>
            {currentPhotoUrl && (
              <Button type="button" variant="ghost" onClick={handleRemovePhoto} className="text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                <span className="md:hidden">Remover</span>
                <span className="hidden md:inline">Remover foto</span>
              </Button>
            )}
          </div>

        </aside>
      </main>

      <Dialog
        open={aiDialogOpen}
        onOpenChange={(open) => {
          setAiDialogOpen(open);
          if (open) setAiError(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="break-words">Ajuda para escrever sobre você</DialogTitle>
            <DialogDescription className="break-words">
              {aiIsMemorialMode
                ? 'Selecione lembranças e momentos importantes. A IA usa suas escolhas para sugerir uma Mini Bio e Curiosidades em tom de homenagem.'
                : 'Selecione características, lembranças e momentos importantes. A IA usa suas escolhas para sugerir uma Mini Bio e Curiosidades sobre sua vida.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs font-medium text-gray-600">
                <span>Etapa {aiStep + 1} de {AI_STEPS.length}</span>
                <span className="break-words text-right">{AI_STEPS[aiStep]}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${aiProgressPercent}%` }}
                />
              </div>
            </div>

            {renderAiStep()}

            {aiError && (
              <p className="break-words rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {aiError}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAiStep((current) => Math.max(0, current - 1))}
              disabled={aiStep === 0 || aiLoading}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
            {aiStep < AI_STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => {
                  setAiError(null);
                  setAiStep((current) => Math.min(AI_STEPS.length - 1, current + 1));
                }}
                disabled={aiLoading}
                className="w-full sm:w-auto"
              >
                Avançar
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleGenerateAiText}
                disabled={aiLoading || !aiHasGenerationSource}
                className="w-full sm:w-auto"
              >
                <Wand2 className="h-4 w-4" />
                {aiLoading ? 'Gerando...' : 'Gerar textos'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="break-words">{currentPhotoUrl ? 'Alterar foto' : 'Cadastrar foto'}</DialogTitle>
            <DialogDescription className="break-words">
              Selecione uma imagem, ajuste o corte quadrado e aplique antes de salvar.
            </DialogDescription>
          </DialogHeader>

          {cropImageUrl ? (
            <div className="space-y-4">
              <div className="relative h-64 overflow-hidden rounded-xl bg-gray-950 sm:h-72">
                <Cropper
                  image={cropImageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="rect"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-zoom">Zoom</Label>
                <input
                  id="avatar-zoom"
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <label className="inline-flex cursor-pointer items-center text-sm font-medium text-blue-700 hover:text-blue-800">
                <UploadCloud className="mr-2 h-4 w-4 shrink-0" />
                <span className="break-words">Escolher outra imagem</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => handlePhotoFile(event.target.files?.[0])}
                />
              </label>
            </div>
          ) : (
            <label
              className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-6 text-center transition-colors hover:border-blue-500 hover:bg-blue-50"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handlePhotoFile(event.dataTransfer.files?.[0]);
              }}
            >
              {photoPreviewUrl ? (
                <img src={photoPreviewUrl} alt="Preview da foto" className="h-32 w-32 rounded-2xl object-cover" />
              ) : currentPhotoUrl ? (
                <img src={currentPhotoUrl} alt={previewName} className="h-32 w-32 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <ImagePlus className="h-8 w-8" />
                </div>
              )}
              <span className="mt-4 flex items-center text-sm font-medium text-gray-900">
                <UploadCloud className="mr-2 h-4 w-4 shrink-0" />
                <span className="break-words">Arraste uma imagem ou clique para selecionar</span>
              </span>
              <span className="mt-1 break-words text-xs text-gray-500">O corte final será quadrado.</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handlePhotoFile(event.target.files?.[0])}
              />
            </label>
          )}

          <DialogFooter>
            {currentPhotoUrl && (
              <Button type="button" variant="ghost" onClick={handleRemovePhoto} className="w-full text-red-700 hover:bg-red-50 sm:w-auto">
                <span className="md:hidden">Remover</span>
                <span className="hidden md:inline">Remover foto</span>
              </Button>
            )}
            {cropImageUrl ? (
              <Button type="button" className="w-full sm:w-auto" onClick={handleApplyCrop}>
                Aplicar corte
              </Button>
            ) : (
              <Button type="button" className="w-full sm:w-auto" onClick={() => setPhotoDialogOpen(false)}>
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
  className = '',
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={['mb-4 flex min-w-0 items-center gap-2.5 text-lg font-semibold text-gray-900', className].filter(Boolean).join(' ')}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </h2>
  );
}

function InfoTooltipButton({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group relative inline-flex shrink-0">
      <button
        type="button"
        aria-label={ariaLabel}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden w-64 rounded-md border border-gray-200 bg-gray-900 px-3 py-2 text-left text-xs font-medium leading-snug text-white shadow-lg group-hover:block group-focus-within:block">
        {children}
      </span>
    </span>
  );
}

function DateFormatInfoButton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <InfoTooltipButton ariaLabel={ariaLabel}>
      Use o formato AAAA ou DD/MM/AAAA
    </InfoTooltipButton>
  );
}

function LocationFormatInfoButton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <InfoTooltipButton ariaLabel={ariaLabel}>
      Para locais no Brasil, use Cidade/UF. Para exterior, marque a opção correspondente e use Cidade (País).
    </InfoTooltipButton>
  );
}

function DeathStatusSelector({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="min-w-0 space-y-3">
      <p className="break-words text-sm font-medium text-gray-900">A pessoa é falecida?</p>
      <div className="inline-flex w-full max-w-xs rounded-lg border border-gray-200 bg-white p-1" role="group" aria-label="A pessoa é falecida?">
        <button
          type="button"
          onClick={() => onChange(true)}
          aria-pressed={checked}
          className={[
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
            checked ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50',
          ].join(' ')}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          aria-pressed={!checked}
          className={[
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
            !checked ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50',
          ].join(' ')}
        >
          Não
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  labelAddon,
  error,
  children,
  className = '',
}: {
  label: string;
  labelAddon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={['min-w-0 space-y-2', className].filter(Boolean).join(' ')}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <Label className="min-w-0 break-words">{label}</Label>
        {labelAddon}
      </div>
      {children}
      {error && <p className="break-words text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function CompactToggleField({
  label,
  checked,
  onCheckedChange,
  className = '',
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <div className={['min-w-0', className].filter(Boolean).join(' ')}>
      <div aria-hidden="true" className="hidden h-[22px] sm:block" />
      <div className="flex h-10 min-w-0 items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 sm:mt-2">
        <Label className="min-w-0 break-words text-xs">{label}</Label>
        <Switch checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
      </div>
    </div>
  );
}
