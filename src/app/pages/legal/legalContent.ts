export type LegalTextPart = {
  text: string;
  href?: string;
  bold?: true;
};

export type LegalText = string | LegalTextPart[];

export type LegalSection = {
  title: string;
  paragraphs?: LegalText[];
  items?: LegalText[];
};

export type LegalDocumentContent = {
  title: string;
  subtitle: string;
  updatedAt: string;
  owner: {
    name: string;
    cpf: string;
    email: string;
  };
  intro: LegalText;
  sections: LegalSection[];
};

const platformOwner = {
  name: 'Tulius Márcio Tsangaroulos Souza',
  cpf: '065.957.034-32',
  email: 'tuliust@gmail.com',
};

const platformName: LegalTextPart = { text: 'Árvore Genealógica da Família', bold: true };

export const privacyPolicyContent: LegalDocumentContent = {
  title: 'Política de Privacidade',
  subtitle: 'Árvore Genealógica da Família',
  updatedAt: '09/05/2026',
  owner: platformOwner,
  intro: [
    { text: 'Esta política de privacidade explica como a plataforma ' },
    platformName,
    { text: ' coleta, utiliza, armazena, protege e compartilha dados pessoais dos seus usuários.' },
  ],
  sections: [
    {
      title: 'Apresentação',
      paragraphs: [
        'A plataforma é um ambiente digital restrito a familiares previamente cadastrados, com a finalidade exclusiva de consulta, preservação e organização da genealogia familiar. O acesso não é público e depende da existência de vínculo familiar previamente identificado.',
        [
          { text: 'Ao criar sua conta e utilizar a plataforma, o usuário declara estar ciente desta política de privacidade e concorda com o tratamento dos seus dados conforme descrito neste documento e nos ' },
          { text: 'termos de uso', href: '/termos' },
          { text: '.' },
        ],
      ],
    },
    {
      title: 'Finalidade da plataforma',
      paragraphs: [
        [
          { text: 'A ' },
          platformName,
          { text: ' tem como objetivo permitir que membros da família consultem informações genealógicas, visualizem vínculos de parentesco, acessem datas importantes, conheçam histórias familiares e preservem registros biográficos e históricos.' },
        ],
        'A plataforma não tem finalidade comercial, publicitária, de venda de dados, exposição pública ou formação de rede social aberta. Seu uso é restrito à família e voltado exclusivamente à preservação da memória familiar.',
      ],
    },
    {
      title: 'Quem pode acessar a plataforma',
      paragraphs: [
        'O acesso à plataforma é restrito a pessoas com grau de parentesco ou vínculo familiar reconhecido.',
        'Todos os usuários são previamente cadastrados na árvore por um administrador ou responsável autorizado, recebendo uma identificação interna antes de criarem suas próprias contas e definirem suas senhas.',
        'Isso significa que o usuário não entra livremente na plataforma. O cadastro depende da existência prévia de um registro familiar vinculado à sua pessoa.',
      ],
    },
    {
      title: 'Dados coletados no cadastro',
      paragraphs: ['Ao criar uma conta, o usuário poderá informar dados necessários para identificação, autenticação e uso da plataforma, como:'],
      items: [
        'Nome completo',
        'E-mail',
        'Senha de acesso',
        'Telefone',
        'Endereço',
        'Foto de perfil',
        'Data de nascimento',
        'Local de nascimento',
        'Informações de parentesco',
        'Link de rede social',
        'Outras informações necessárias à organização genealógica',
        'Alguns desses dados podem já ter sido previamente cadastrados por administradores da árvore, com base em informações familiares existentes',
      ],
    },
    {
      title: 'Dados opcionais',
      paragraphs: ['Além dos dados básicos, o usuário poderá preencher campos opcionais, como:'],
      items: [
        'Biografia',
        'Curiosidades sobre sua vida',
        'Histórias pessoais',
        'Informações profissionais',
        'Memórias familiares',
        'Outros textos ou registros que deseje compartilhar com os demais membros autorizados',
      ],
    },
    {
      title: 'Controle dos dados opcionais',
      paragraphs: [
        'O preenchimento desses campos é voluntário. O usuário pode optar por não preencher, editar ou remover essas informações quando desejar, conforme as funcionalidades disponíveis na plataforma.',
      ],
    },
    {
      title: 'Dados visualizados por outros membros',
      paragraphs: ['Como a plataforma tem finalidade genealógica, algumas informações podem ser visualizadas por outros membros da família cadastrados e autorizados, como:'],
      items: [
        'Nome',
        'Grau de parentesco',
        'Posição na árvore genealógica',
        'Vínculos familiares',
        'Datas familiares relevantes',
        'Informações biográficas autorizadas',
        'Foto, quando o usuário permitir',
        'Dados de contato, quando o usuário permitir',
        'A visibilidade dos dados pode variar conforme as configurações de privacidade, permissões de usuário e regras administrativas da plataforma',
      ],
    },
    {
      title: 'Dados que o usuário pode ocultar',
      paragraphs: [
        'O usuário poderá ocultar determinados dados da visualização dos demais membros, quando a funcionalidade estiver disponível na plataforma.',
        'Entre os dados que podem ser ocultados estão:',
      ],
      items: ['Foto de perfil', 'Link de rede social', 'Telefone', 'E-mail', 'Endereço', 'Outras informações pessoais configuráveis'],
    },
    {
      title: 'Acesso administrativo a dados ocultos',
      paragraphs: [
        'Mesmo quando ocultos dos demais membros, alguns dados poderão permanecer acessíveis a administradores autorizados, quando necessário para manutenção da árvore, segurança, suporte, identificação ou cumprimento de obrigações legais.',
      ],
    },
    {
      title: 'Uso dos dados pessoais',
      paragraphs: ['Os dados pessoais são utilizados para:'],
      items: [
        'Identificar o usuário dentro da árvore genealógica',
        'Permitir o acesso seguro à plataforma',
        'Relacionar o usuário aos seus familiares',
        'Exibir vínculos de parentesco',
        'Organizar datas familiares importantes',
        'Permitir consulta histórica e genealógica',
        'Personalizar a experiência do usuário',
        'Enviar comunicações relacionadas ao funcionamento da plataforma',
        'Permitir recuperação de senha e segurança da conta',
        'Manter a integridade dos registros familiares',
        'A plataforma não utiliza os dados para venda, publicidade comportamental, prospecção comercial ou compartilhamento com terceiros para fins comerciais',
      ],
    },
    {
      title: 'Comunicações por e-mail e notificações',
      paragraphs: ['A plataforma poderá oferecer ao usuário a opção de receber e-mails com notificações relacionadas a eventos, acontecimentos e novidades da família, como:'],
      items: ['Aniversários', 'Datas comemorativas', 'Eventos familiares', 'Atualizações relevantes na árvore', 'Novas publicações, registros ou conteúdos familiares', 'Comunicados administrativos sobre o funcionamento da plataforma'],
    },
    {
      title: 'Preferências de comunicação',
      paragraphs: [
        'O recebimento desses e-mails é opcional e poderá ser gerenciado pelo próprio usuário em sua conta, conforme as funcionalidades disponíveis.',
        'O usuário poderá ativar, desativar ou ajustar suas preferências de comunicação a qualquer momento, incluindo a possibilidade de deixar de receber notificações por e-mail.',
        'Mensagens essenciais relacionadas à segurança da conta, confirmação de cadastro, recuperação de senha ou alterações importantes nos termos da plataforma poderão ser enviadas independentemente das preferências de notificações, quando necessárias ao funcionamento e à segurança do serviço.',
      ],
    },
    {
      title: 'Integração com Google Agenda',
      paragraphs: [
        'A plataforma poderá permitir que o usuário vincule sua conta ao Google Agenda para salvar ou sincronizar eventos importantes da família, como aniversários, datas comemorativas, reuniões familiares ou outras datas relevantes.',
        'Essa integração é opcional. Ao ativá-la, o usuário autoriza a plataforma a realizar as ações necessárias para criar, salvar ou sincronizar eventos em sua agenda, conforme as permissões concedidas no momento da conexão.',
        'O usuário poderá desconectar a integração com o Google Agenda a qualquer momento, conforme as funcionalidades disponíveis na plataforma ou diretamente nas configurações da sua conta Google.',
        'A plataforma não utilizará a integração com o Google Agenda para acessar eventos pessoais sem relação com a finalidade familiar, salvo quando tecnicamente necessário e autorizado pelas permissões concedidas pelo próprio usuário.',
      ],
    },
    {
      title: 'Compartilhamento de dados',
      paragraphs: ['Os dados pessoais poderão ser compartilhados apenas nas seguintes situações:'],
      items: [
        'Com outros membros familiares autorizados, dentro dos limites de visualização da plataforma',
        'Com administradores da árvore, para manutenção, correção, validação e organização dos dados',
        'Com provedores técnicos necessários ao funcionamento da plataforma, como serviços de autenticação, hospedagem, banco de dados, armazenamento de arquivos e envio de e-mails',
        'Quando exigido por lei, ordem judicial ou autoridade competente',
        'A plataforma não vende dados pessoais dos usuários',
      ],
    },
    {
      title: 'Armazenamento e segurança',
      paragraphs: [
        'A plataforma adota medidas técnicas e organizacionais para proteger os dados pessoais contra acesso não autorizado, perda, alteração, divulgação indevida ou uso inadequado.',
        'Entre essas medidas podem estar:',
      ],
      items: ['Controle de acesso por login e senha', 'Restrição de acesso a membros autorizados', 'Permissões diferenciadas para administradores e usuários comuns', 'Armazenamento seguro de senhas', 'Controle de visibilidade de dados pessoais', 'Monitoramento e correções de segurança quando necessário'],
    },
    {
      title: 'Responsabilidade compartilhada pela segurança',
      paragraphs: [
        'Apesar dos esforços de proteção, nenhum sistema digital é totalmente livre de riscos. O usuário também deve colaborar para a segurança da sua conta, mantendo sua senha protegida e evitando compartilhá-la com terceiros.',
      ],
    },
    {
      title: 'Responsabilidade do usuário sobre informações compartilhadas',
      paragraphs: [
        'O usuário é responsável pelas informações que cadastra, edita ou compartilha na plataforma.',
        'Ao preencher campos como biografia, curiosidades, histórias familiares, redes sociais ou dados de contato, o usuário deve evitar publicar informações sensíveis, ofensivas, falsas, de terceiros sem autorização ou que possam violar a privacidade de outros familiares.',
        'Caso o usuário publique informações sobre outra pessoa, poderá ser solicitado que edite ou remova o conteúdo.',
      ],
    },
    {
      title: 'Dados de pessoas falecidas',
      paragraphs: [
        'A plataforma poderá conter informações sobre familiares falecidos, com finalidade de preservação histórica, memorial e genealógica.',
        'Esses dados devem ser tratados com respeito, cuidado e finalidade familiar. Informações sensíveis, ofensivas ou desnecessárias sobre pessoas falecidas poderão ser removidas ou ajustadas pelos administradores da plataforma.',
      ],
    },
    {
      title: 'Direitos do usuário',
      paragraphs: ['O usuário poderá solicitar, conforme aplicável:'],
      items: [
        'Confirmação sobre o tratamento de seus dados',
        'Acesso aos seus dados',
        'Correção de dados incompletos, inexatos ou desatualizados',
        'Ocultação ou restrição de visibilidade de determinados dados',
        'Exclusão da conta',
        'Informações sobre compartilhamento de dados',
        'Revogação de permissões opcionais, como integração com Google Agenda',
        'Desativação de notificações por e-mail',
        'Eliminação de dados pessoais, quando aplicável',
      ],
    },
    {
      title: 'Exclusão de conta',
      paragraphs: [
        'O usuário poderá solicitar a exclusão de sua conta a qualquer momento.',
        'A exclusão da conta poderá remover o acesso do usuário à plataforma e apagar ou anonimizar dados relacionados à sua conta, conforme viabilidade técnica, obrigações legais e necessidade de preservação da árvore genealógica.',
        'Alguns dados estritamente genealógicos, como nome, vínculos familiares, datas históricas e relações de parentesco, poderão ser mantidos na árvore quando forem necessários para preservar a estrutura familiar, especialmente quando relacionados a outros membros.',
        'Sempre que possível, dados de contato, login, senha, e-mail, telefone, endereço, foto e informações opcionais inseridas pelo próprio usuário poderão ser removidos, ocultados ou anonimizados mediante solicitação.',
      ],
    },
    {
      title: 'Retenção dos dados',
      paragraphs: ['Os dados serão mantidos enquanto forem necessários para:'],
      items: [
        'Manter a conta ativa',
        'Preservar a estrutura genealógica da família',
        'Permitir consulta histórica',
        'Cumprir obrigações legais',
        'Resolver disputas, solicitações ou questões de segurança',
        'Atender pedidos de exclusão, correção ou anonimização',
        'Dados opcionais inseridos pelo usuário poderão ser removidos quando ele solicitar, salvo quando houver justificativa legítima para conservação',
      ],
    },
    {
      title: 'Menores de idade',
      paragraphs: [
        'Caso a plataforma contenha informações de menores de idade, esses dados deverão ser tratados com cuidado adicional e apenas para finalidade familiar e genealógica.',
        'O cadastro, edição ou exposição de dados de menores deverá observar autorização dos responsáveis legais, quando aplicável, e respeitar configurações de privacidade adequadas.',
      ],
    },
    {
      title: 'Alterações nesta política',
      paragraphs: [
        'Esta política de privacidade poderá ser atualizada periodicamente para refletir mudanças na plataforma, nas funcionalidades, nas práticas de segurança ou na legislação aplicável.',
        'Quando houver alterações relevantes, os usuários poderão ser comunicados por meio da própria plataforma, e-mail ou outro canal disponível.',
      ],
    },
    {
      title: 'Contato',
      paragraphs: [
        'Para dúvidas, solicitações de privacidade, correção de dados, exclusão de conta ou questões relacionadas ao tratamento de dados pessoais, o usuário poderá entrar em contato pelos dados do responsável pela plataforma.',
      ],
    },
  ],
};

export const termsContent: LegalDocumentContent = {
  title: 'Termos de Uso',
  subtitle: 'Árvore Genealógica da Família',
  updatedAt: '09/05/2026',
  owner: platformOwner,
  intro: [
    { text: 'Ao utilizar a plataforma ' },
    platformName,
    { text: ', o usuário reconhece que se trata de um ambiente privado, restrito a familiares, criado para preservar a memória, os vínculos e a história da família.' },
  ],
  sections: [
    {
      title: 'Aceitação dos termos',
      paragraphs: [
        [
          { text: 'Ao acessar ou utilizar a plataforma ' },
          platformName,
          { text: ', o usuário declara que leu, compreendeu e concorda com estes termos de uso e com a ' },
          { text: 'política de privacidade', href: '/privacidade' },
          { text: '.' },
        ],
        'Caso não concorde com qualquer condição, o usuário não deverá utilizar a plataforma.',
      ],
    },
    {
      title: 'Finalidade da plataforma',
      paragraphs: [
        'A plataforma tem finalidade familiar, privada e genealógica.',
        'Seu objetivo é permitir que membros da família consultem, organizem e preservem informações sobre parentesco, história familiar, datas importantes, registros biográficos, fotos e outros dados relacionados à árvore genealógica.',
        'A plataforma não é uma rede social pública, não é destinada a uso comercial e não deve ser usada para divulgação ampla de informações pessoais.',
      ],
    },
    {
      title: 'Acesso restrito a familiares',
      paragraphs: [
        'O acesso é limitado a usuários previamente cadastrados e vinculados à árvore genealógica.',
        'Para criar uma conta, o usuário deve já possuir um registro familiar prévio na plataforma, criado por administrador ou responsável autorizado. Após essa identificação, o usuário poderá completar seu cadastro, definir senha e acessar sua conta.',
        'A plataforma poderá negar, suspender ou cancelar acessos quando houver inconsistência de identidade, ausência de vínculo familiar, uso indevido ou violação destes termos.',
      ],
    },
    {
      title: 'Conta do usuário',
      paragraphs: ['O usuário é responsável por:'],
      items: [
        'Informar dados verdadeiros e atualizados',
        'Manter sua senha em sigilo',
        'Não compartilhar sua conta com terceiros',
        'Atualizar informações incorretas ou desatualizadas',
        'Comunicar suspeita de acesso indevido',
        'Usar a plataforma apenas para sua finalidade familiar e genealógica',
        'Gerenciar suas preferências de privacidade e notificações, quando disponíveis',
        'A plataforma não se responsabiliza por danos decorrentes do uso indevido da conta por descuido do próprio usuário',
      ],
    },
    {
      title: 'Regras de uso',
      paragraphs: ['Ao utilizar a plataforma, o usuário concorda em não:'],
      items: [
        'Compartilhar dados da árvore com pessoas não autorizadas',
        'Copiar, extrair ou divulgar informações familiares fora da plataforma sem autorização',
        'Publicar informações falsas, ofensivas, discriminatórias ou invasivas',
        'Expor dados sensíveis de outros familiares',
        'Usar a plataforma para perseguição, constrangimento, conflito familiar ou exposição indevida',
        'Tentar acessar áreas restritas sem permissão',
        'Interferir no funcionamento técnico da plataforma',
        'Usar robôs, scripts ou ferramentas automatizadas sem autorização',
        'Publicar fotos, histórias ou dados de terceiros sem autorização adequada',
        'Utilizar o ambiente para fins comerciais, políticos, publicitários ou alheios à finalidade genealógica',
      ],
    },
    {
      title: 'Informações cadastradas pelo usuário',
      paragraphs: [
        'O usuário poderá cadastrar ou editar informações pessoais, como foto, telefone, e-mail, endereço, rede social, biografia e curiosidades.',
        'O usuário declara que as informações inseridas são verdadeiras, respeitam direitos de terceiros e não violam a privacidade de outros familiares.',
        'A plataforma poderá remover, ocultar ou ajustar conteúdos que sejam considerados inadequados, ofensivos, falsos, sensíveis, excessivos ou incompatíveis com a finalidade familiar.',
      ],
    },
    {
      title: 'Privacidade e visibilidade dos dados',
      paragraphs: [
        'A plataforma permite que determinados dados sejam visualizados por outros membros autorizados da família.',
        'O usuário poderá ocultar informações como:',
      ],
      items: ['Foto', 'Link de rede social', 'Telefone', 'E-mail', 'Endereço', 'Outros campos de privacidade disponíveis'],
    },
    {
      title: 'Limites da ocultação',
      paragraphs: [
        'A ocultação impede ou limita a visualização pelos demais membros, mas pode não impedir o acesso por administradores autorizados quando necessário para suporte, segurança, manutenção ou cumprimento de obrigações legais.',
      ],
    },
    {
      title: 'Dados genealógicos essenciais',
      paragraphs: ['Algumas informações podem ser consideradas essenciais para a finalidade da plataforma, como:'],
      items: ['Nome', 'Vínculos familiares', 'Relações de parentesco', 'Datas relevantes', 'Posição na árvore', 'Indicação de familiares ascendentes, descendentes, irmãos, cônjuges ou outros vínculos'],
    },
    {
      title: 'Permanência de dados genealógicos',
      paragraphs: [
        'Esses dados podem permanecer na plataforma mesmo após a exclusão da conta, quando forem necessários para preservar a estrutura genealógica da família e o entendimento dos vínculos entre os demais membros.',
        'Nesses casos, sempre que possível, dados de login, contato e informações opcionais do usuário poderão ser removidos, ocultados ou anonimizados.',
      ],
    },
    {
      title: 'Biografia, curiosidades e histórias pessoais',
      paragraphs: [
        'A plataforma poderá permitir que o usuário adicione informações opcionais sobre sua vida, como biografia, curiosidades, memórias, experiências pessoais e histórias familiares.',
        'Esses campos são voluntários. O usuário deve evitar inserir informações íntimas, sensíveis, ofensivas ou que envolvam terceiros sem autorização.',
        'A plataforma poderá remover conteúdos que violem estes termos ou que possam afetar a privacidade, honra ou segurança de outras pessoas.',
      ],
    },
    {
      title: 'Fotos e imagens',
      paragraphs: [
        'O usuário poderá inserir foto de perfil ou outros registros visuais, conforme as funcionalidades disponíveis.',
        'Ao enviar imagens, o usuário declara que possui direito de uso ou autorização para publicação no ambiente familiar restrito.',
        'É proibido enviar imagens ofensivas, constrangedoras, íntimas, discriminatórias ou que violem a privacidade de outras pessoas.',
      ],
    },
    {
      title: 'Notificações e comunicações por e-mail',
      paragraphs: [
        'A plataforma poderá oferecer ao usuário a opção de receber e-mails com notificações sobre eventos, acontecimentos e novidades da família.',
        'Essas comunicações poderão incluir, entre outros temas:',
      ],
      items: ['Aniversários', 'Datas familiares importantes', 'Eventos da família', 'Novos registros na árvore', 'Atualizações relevantes', 'Comunicados administrativos', 'Novidades sobre funcionalidades da plataforma'],
    },
    {
      title: 'Preferências de notificação',
      paragraphs: [
        'O usuário poderá gerenciar suas preferências de recebimento de e-mails pela própria conta, quando essa funcionalidade estiver disponível.',
        'O usuário poderá optar por ativar, desativar ou ajustar os tipos de notificações que deseja receber.',
        'Comunicações essenciais relacionadas à conta, segurança, recuperação de senha, confirmação de e-mail, alterações relevantes nos termos ou funcionamento necessário da plataforma poderão ser enviadas mesmo que o usuário tenha desativado notificações opcionais.',
      ],
    },
    {
      title: 'Google Agenda',
      paragraphs: [
        'A plataforma poderá oferecer integração opcional com o Google Agenda para salvar eventos importantes da família.',
        'Ao conectar sua conta Google, o usuário autoriza a plataforma a executar as ações necessárias para essa funcionalidade, conforme as permissões concedidas.',
        'O usuário poderá desconectar a integração a qualquer momento.',
        'A plataforma não se responsabiliza por alterações feitas diretamente pelo usuário no Google Agenda, nem por limitações, indisponibilidades ou mudanças nas regras técnicas do serviço do Google.',
      ],
    },
    {
      title: 'Administração da árvore',
      paragraphs: ['Administradores autorizados poderão:'],
      items: [
        'Criar e editar registros familiares',
        'Validar vínculos de parentesco',
        'Corrigir informações incorretas',
        'Remover conteúdos inadequados',
        'Gerenciar permissões de acesso',
        'Suspender contas em caso de uso indevido',
        'Preservar a integridade da árvore genealógica',
        'Os administradores devem agir de forma responsável, respeitando a finalidade familiar da plataforma e a privacidade dos usuários',
      ],
    },
    {
      title: 'Exclusão de conta',
      paragraphs: [
        'O usuário poderá solicitar a exclusão de sua conta a qualquer momento.',
        'A exclusão poderá encerrar o acesso do usuário à plataforma e remover, ocultar ou anonimizar dados vinculados à conta, conforme viabilidade técnica e necessidade de preservação genealógica.',
        'A exclusão da conta não garante a remoção integral de dados históricos ou genealógicos essenciais que sejam necessários para manter a árvore compreensível para os demais familiares.',
      ],
    },
    {
      title: 'Disponibilidade da plataforma',
      paragraphs: [
        'A plataforma poderá passar por manutenções, atualizações, correções técnicas ou períodos de indisponibilidade.',
        'Não há garantia de funcionamento contínuo, ininterrupto ou livre de erros. Sempre que possível, serão adotadas medidas para preservar dados e restaurar o funcionamento adequado.',
      ],
    },
    {
      title: 'Segurança',
      paragraphs: [
        'O usuário não deve tentar explorar falhas, acessar dados de terceiros sem autorização, burlar permissões, interferir no sistema ou usar a plataforma de forma prejudicial.',
        'Qualquer uso indevido poderá resultar em suspensão ou exclusão da conta, sem prejuízo de outras medidas cabíveis.',
      ],
    },
    {
      title: 'Propriedade e uso do conteúdo',
      paragraphs: [
        'A estrutura da plataforma, seu layout, código, organização visual, textos institucionais e funcionalidades pertencem aos seus responsáveis ou desenvolvedores autorizados.',
        'As informações familiares, fotos, textos e registros inseridos pelos usuários continuam vinculados aos respectivos titulares ou pessoas que tenham direito sobre esse conteúdo.',
        'Ao inserir conteúdo na plataforma, o usuário autoriza seu uso dentro do ambiente restrito da árvore, exclusivamente para finalidade familiar e genealógica.',
      ],
    },
    {
      title: 'Limitação de responsabilidade',
      paragraphs: [
        'A plataforma busca preservar informações familiares de forma organizada e cuidadosa, mas não garante que todos os dados estejam completos, corretos ou atualizados.',
        'Como parte das informações pode ser fornecida por familiares, administradores ou registros antigos, podem existir erros, lacunas ou divergências históricas.',
        'A plataforma não se responsabiliza por conflitos familiares, interpretações pessoais, informações incorretas fornecidas por usuários ou uso indevido de dados por membros autorizados.',
      ],
    },
    {
      title: 'Alterações nos termos',
      paragraphs: [
        'Estes termos de uso poderão ser atualizados periodicamente.',
        'Alterações relevantes poderão ser comunicadas aos usuários por meio da plataforma, e-mail ou outro canal disponível. O uso continuado da plataforma após a atualização representa concordância com os novos termos.',
      ],
    },
    {
      title: 'Encerramento ou suspensão de acesso',
      paragraphs: ['A plataforma poderá suspender ou encerrar o acesso de usuários que:'],
      items: ['Violem estes termos', 'Divulguem dados familiares fora do ambiente autorizado', 'Tentem acessar áreas restritas', 'Compartilhem login e senha', 'Publiquem conteúdo ofensivo, falso ou inadequado', 'Usem a plataforma para finalidade diferente da genealógica'],
    },
    {
      title: 'Contato',
      paragraphs: [
        'Para dúvidas, solicitações, correções de dados, exclusão de conta ou questões relacionadas ao uso da plataforma, o usuário poderá entrar em contato pelos dados do responsável pela plataforma.',
      ],
    },
    {
      title: 'Declaração final',
      paragraphs: [
        [
          { text: 'Ao utilizar a plataforma ' },
          platformName,
          { text: ', o usuário reconhece que se trata de um ambiente privado, restrito a familiares, criado para preservar a memória, os vínculos e a história da família.' },
        ],
        'O usuário compromete-se a utilizar a plataforma com respeito, responsabilidade e cuidado com a privacidade dos demais membros.',
      ],
    },
  ],
};
