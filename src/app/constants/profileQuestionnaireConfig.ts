import {
  Baby,
  BookOpen,
  Briefcase,
  Camera,
  Coffee,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Map,
  MapPin,
  Milestone,
  Music,
  Pencil,
  Plane,
  Smile,
  Sparkles,
  Star,
  Users,
  Utensils,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type {
  ProfileQuestionnaireAnswer,
  ProfileQuestionnaireBadgeCategory,
  ProfileQuestionnaireBadgeGroup,
  ProfileQuestionnaireSelectableOption,
  ProfileQuestionnaireTone,
  ProfileQuestionnaireToneOption,
} from '../types/profileQuestionnaire';

export type AiTone = ProfileQuestionnaireTone;
export type AiBadgeCategory = ProfileQuestionnaireBadgeCategory;
export type AiBadge = ProfileQuestionnaireSelectableOption;
export type AiGeneratedQuestion = ProfileQuestionnaireAnswer;
export type AiBadgeGroup = ProfileQuestionnaireBadgeGroup;

export const AI_TONES: ProfileQuestionnaireToneOption[] = [
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

export const AI_STEPS = [
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
  fallbackIcon: ComponentType<{ className?: string }>,
  iconOverrides: Record<string, ComponentType<{ className?: string }>> = {},
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

export const AI_BADGE_GROUPS: AiBadgeGroup[] = [
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

const MEMORIAL_BADGE_LABELS: Record<string, string> = {
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

export function limitProfileQuestionnaireText(value: string, maxLength = 300) {
  return String(value ?? '').trim().slice(0, maxLength);
}

export function getAiBadgeDisplayLabel(badge: AiBadge, memorialMode: boolean) {
  if (!memorialMode) return badge.label;
  return MEMORIAL_BADGE_LABELS[badge.label] ?? badge.label;
}

export function getAiBadgeGroupDisplayText(group: AiBadgeGroup, memorialMode: boolean) {
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

export function buildAiProfileQuestions(
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
