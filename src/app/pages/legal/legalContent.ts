export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
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
  intro: string;
  sections: LegalSection[];
};

const platformOwner = {
  name: 'Tulius Márcio Tsangaroulos Souza',
  cpf: '065.957.034-32',
  email: 'tuliust@gmail.com',
};

export const privacyPolicyContent: LegalDocumentContent = {
  title: 'Política de Privacidade',
  subtitle: 'Árvore Genealógica da Família',
  updatedAt: '09/05/2026',
  owner: platformOwner,
  intro:
    'Esta Política de Privacidade explica como a plataforma Árvore Genealógica da Família coleta, utiliza, armazena, protege e compartilha dados pessoais dos seus usuários.',
  sections: [
    {
      title: 'Apresentação',
      paragraphs: [
        'A plataforma e um ambiente digital restrito a familiares previamente cadastrados, com a finalidade exclusiva de consulta, preservacao e organizacao da genealogia familiar. O acesso nao e publico e depende da existencia de vinculo familiar previamente identificado.',
        'Ao criar sua conta e utilizar a plataforma, o usuario declara estar ciente desta Politica de Privacidade e concorda com o tratamento dos seus dados conforme descrito neste documento.',
      ],
    },
    {
      title: 'Finalidade da plataforma',
      paragraphs: [
        'A Arvore Genealogica da Familia tem como objetivo permitir que membros da familia consultem informacoes genealogicas, visualizem vinculos de parentesco, acessem datas importantes, conhecam historias familiares e preservem registros biograficos e historicos.',
        'A plataforma nao tem finalidade comercial, publicitaria, de venda de dados, exposicao publica ou formacao de rede social aberta. Seu uso e restrito a familia e voltado exclusivamente a preservacao da memoria familiar.',
      ],
    },
    {
      title: 'Quem pode acessar a plataforma',
      paragraphs: [
        'O acesso a plataforma e restrito a pessoas com grau de parentesco ou vinculo familiar reconhecido.',
        'Todos os usuarios sao previamente cadastrados na arvore por um administrador ou responsavel autorizado, recebendo uma identificacao interna antes de criarem suas proprias contas e definirem suas senhas.',
        'Isso significa que o usuario nao entra livremente na plataforma. O cadastro depende da existencia previa de um registro familiar vinculado a sua pessoa.',
      ],
    },
    {
      title: 'Dados coletados no cadastro',
      paragraphs: [
        'Ao criar uma conta, o usuario podera informar dados necessarios para identificacao, autenticacao e uso da plataforma, como:',
      ],
      items: [
        'Nome completo',
        'E-mail',
        'Senha de acesso',
        'Telefone',
        'Endereco',
        'Foto de perfil',
        'Data de nascimento',
        'Local de nascimento',
        'Informacoes de parentesco',
        'Link de rede social',
        'Outras informacoes necessarias a organizacao genealogica',
        'Alguns desses dados podem ja ter sido previamente cadastrados por administradores da arvore, com base em informacoes familiares existentes',
      ],
    },
    {
      title: 'Dados opcionais',
      paragraphs: [
        'Alem dos dados basicos, o usuario podera preencher campos opcionais, como:',
      ],
      items: [
        'Biografia',
        'Curiosidades sobre sua vida',
        'Historias pessoais',
        'Informacoes profissionais',
        'Memorias familiares',
        'Outros textos ou registros que deseje compartilhar com os demais membros autorizados',
      ],
    },
    {
      title: 'Controle dos dados opcionais',
      paragraphs: [
        'O preenchimento desses campos e voluntario. O usuario pode optar por nao preencher, editar ou remover essas informacoes quando desejar, conforme as funcionalidades disponiveis na plataforma.',
      ],
    },
    {
      title: 'Dados visualizados por outros membros',
      paragraphs: [
        'Como a plataforma tem finalidade genealogica, algumas informacoes podem ser visualizadas por outros membros da familia cadastrados e autorizados, como:',
      ],
      items: [
        'Nome',
        'Grau de parentesco',
        'Posicao na arvore genealogica',
        'Vinculos familiares',
        'Datas familiares relevantes',
        'Informacoes biograficas autorizadas',
        'Foto, quando o usuario permitir',
        'Dados de contato, quando o usuario permitir',
        'A visibilidade dos dados pode variar conforme as configuracoes de privacidade, permissoes de usuario e regras administrativas da plataforma',
      ],
    },
    {
      title: 'Dados que o usuário pode ocultar',
      paragraphs: [
        'O usuario podera ocultar determinados dados da visualizacao dos demais membros, quando a funcionalidade estiver disponivel na plataforma.',
        'Entre os dados que podem ser ocultados estao:',
      ],
      items: [
        'Foto de perfil',
        'Link de rede social',
        'Telefone',
        'E-mail',
        'Endereco',
        'Outras informacoes pessoais configuraveis',
      ],
    },
    {
      title: 'Acesso administrativo a dados ocultos',
      paragraphs: [
        'Mesmo quando ocultos dos demais membros, alguns dados poderao permanecer acessiveis a administradores autorizados, quando necessario para manutencao da arvore, seguranca, suporte, identificacao ou cumprimento de obrigacoes legais.',
      ],
    },
    {
      title: 'Uso dos dados pessoais',
      paragraphs: ['Os dados pessoais sao utilizados para:'],
      items: [
        'Identificar o usuario dentro da arvore genealogica',
        'Permitir o acesso seguro a plataforma',
        'Relacionar o usuario aos seus familiares',
        'Exibir vinculos de parentesco',
        'Organizar datas familiares importantes',
        'Permitir consulta historica e genealogica',
        'Personalizar a experiencia do usuario',
        'Enviar comunicacoes relacionadas ao funcionamento da plataforma',
        'Permitir recuperacao de senha e seguranca da conta',
        'Manter a integridade dos registros familiares',
        'A plataforma nao utiliza os dados para venda, publicidade comportamental, prospeccao comercial ou compartilhamento com terceiros para fins comerciais',
      ],
    },
    {
      title: 'Comunicações por e-mail e notificações',
      paragraphs: [
        'A plataforma podera oferecer ao usuario a opcao de receber e-mails com notificacoes relacionadas a eventos, acontecimentos e novidades da familia, como:',
      ],
      items: [
        'Aniversarios',
        'Datas comemorativas',
        'Eventos familiares',
        'Atualizacoes relevantes na arvore',
        'Novas publicacoes, registros ou conteudos familiares',
        'Comunicados administrativos sobre o funcionamento da plataforma',
      ],
    },
    {
      title: 'Preferências de comunicação',
      paragraphs: [
        'O recebimento desses e-mails e opcional e podera ser gerenciado pelo proprio usuario em sua conta, conforme as funcionalidades disponiveis.',
        'O usuario podera ativar, desativar ou ajustar suas preferencias de comunicacao a qualquer momento, incluindo a possibilidade de deixar de receber notificacoes por e-mail.',
        'Mensagens essenciais relacionadas a seguranca da conta, confirmacao de cadastro, recuperacao de senha ou alteracoes importantes nos termos da plataforma poderao ser enviadas independentemente das preferencias de notificacoes, quando necessarias ao funcionamento e a seguranca do servico.',
      ],
    },
    {
      title: 'Integração com Google Agenda',
      paragraphs: [
        'A plataforma podera permitir que o usuario vincule sua conta ao Google Agenda para salvar ou sincronizar eventos importantes da familia, como aniversarios, datas comemorativas, reunioes familiares ou outras datas relevantes.',
        'Essa integracao e opcional. Ao ativa-la, o usuario autoriza a plataforma a realizar as acoes necessarias para criar, salvar ou sincronizar eventos em sua agenda, conforme as permissoes concedidas no momento da conexao.',
        'O usuario podera desconectar a integracao com o Google Agenda a qualquer momento, conforme as funcionalidades disponiveis na plataforma ou diretamente nas configuracoes da sua conta Google.',
        'A plataforma nao utilizara a integracao com o Google Agenda para acessar eventos pessoais sem relacao com a finalidade familiar, salvo quando tecnicamente necessario e autorizado pelas permissoes concedidas pelo proprio usuario.',
      ],
    },
    {
      title: 'Compartilhamento de dados',
      paragraphs: ['Os dados pessoais poderao ser compartilhados apenas nas seguintes situacoes:'],
      items: [
        'Com outros membros familiares autorizados, dentro dos limites de visualizacao da plataforma',
        'Com administradores da arvore, para manutencao, correcao, validacao e organizacao dos dados',
        'Com provedores tecnicos necessarios ao funcionamento da plataforma, como servicos de autenticacao, hospedagem, banco de dados, armazenamento de arquivos e envio de e-mails',
        'Quando exigido por lei, ordem judicial ou autoridade competente',
        'A plataforma nao vende dados pessoais dos usuarios',
      ],
    },
    {
      title: 'Armazenamento e segurança',
      paragraphs: [
        'A plataforma adota medidas tecnicas e organizacionais para proteger os dados pessoais contra acesso nao autorizado, perda, alteracao, divulgacao indevida ou uso inadequado.',
        'Entre essas medidas podem estar:',
      ],
      items: [
        'Controle de acesso por login e senha',
        'Restricao de acesso a membros autorizados',
        'Permissoes diferenciadas para administradores e usuarios comuns',
        'Armazenamento seguro de senhas',
        'Controle de visibilidade de dados pessoais',
        'Monitoramento e correcoes de seguranca quando necessario',
      ],
    },
    {
      title: 'Responsabilidade compartilhada pela seguranca',
      paragraphs: [
        'Apesar dos esforcos de protecao, nenhum sistema digital e totalmente livre de riscos. O usuario tambem deve colaborar para a seguranca da sua conta, mantendo sua senha protegida e evitando compartilha-la com terceiros.',
      ],
    },
    {
      title: 'Responsabilidade do usuário sobre informações compartilhadas',
      paragraphs: [
        'O usuario e responsavel pelas informacoes que cadastra, edita ou compartilha na plataforma.',
        'Ao preencher campos como biografia, curiosidades, historias familiares, redes sociais ou dados de contato, o usuario deve evitar publicar informacoes sensiveis, ofensivas, falsas, de terceiros sem autorizacao ou que possam violar a privacidade de outros familiares.',
        'Caso o usuario publique informacoes sobre outra pessoa, podera ser solicitado que edite ou remova o conteudo.',
      ],
    },
    {
      title: 'Dados de pessoas falecidas',
      paragraphs: [
        'A plataforma podera conter informacoes sobre familiares falecidos, com finalidade de preservacao historica, memorial e genealogica.',
        'Esses dados devem ser tratados com respeito, cuidado e finalidade familiar. Informacoes sensiveis, ofensivas ou desnecessarias sobre pessoas falecidas poderao ser removidas ou ajustadas pelos administradores da plataforma.',
      ],
    },
    {
      title: 'Direitos do usuario',
      paragraphs: ['O usuario podera solicitar, conforme aplicavel:'],
      items: [
        'Confirmacao sobre o tratamento de seus dados',
        'Acesso aos seus dados',
        'Correcao de dados incompletos, inexatos ou desatualizados',
        'Ocultacao ou restricao de visibilidade de determinados dados',
        'Exclusao da conta',
        'Informacoes sobre compartilhamento de dados',
        'Revogacao de permissoes opcionais, como integracao com Google Agenda',
        'Desativacao de notificacoes por e-mail',
        'Eliminacao de dados pessoais, quando aplicavel',
      ],
    },
    {
      title: 'Exclusão de conta',
      paragraphs: [
        'O usuario podera solicitar a exclusao de sua conta a qualquer momento.',
        'A exclusao da conta podera remover o acesso do usuario a plataforma e apagar ou anonimizar dados relacionados a sua conta, conforme viabilidade tecnica, obrigacoes legais e necessidade de preservacao da arvore genealogica.',
        'Alguns dados estritamente genealogicos, como nome, vinculos familiares, datas historicas e relacoes de parentesco, poderao ser mantidos na arvore quando forem necessarios para preservar a estrutura familiar, especialmente quando relacionados a outros membros.',
        'Sempre que possivel, dados de contato, login, senha, e-mail, telefone, endereco, foto e informacoes opcionais inseridas pelo proprio usuario poderao ser removidos, ocultados ou anonimizados mediante solicitacao.',
      ],
    },
    {
      title: 'Retenção dos dados',
      paragraphs: ['Os dados serao mantidos enquanto forem necessarios para:'],
      items: [
        'Manter a conta ativa',
        'Preservar a estrutura genealogica da familia',
        'Permitir consulta historica',
        'Cumprir obrigacoes legais',
        'Resolver disputas, solicitacoes ou questoes de seguranca',
        'Atender pedidos de exclusao, correcao ou anonimizacao',
        'Dados opcionais inseridos pelo usuario poderao ser removidos quando ele solicitar, salvo quando houver justificativa legitima para conservacao',
      ],
    },
    {
      title: 'Menores de idade',
      paragraphs: [
        'Caso a plataforma contenha informacoes de menores de idade, esses dados deverao ser tratados com cuidado adicional e apenas para finalidade familiar e genealogica.',
        'O cadastro, edicao ou exposicao de dados de menores devera observar autorizacao dos responsaveis legais, quando aplicavel, e respeitar configuracoes de privacidade adequadas.',
      ],
    },
    {
      title: 'Alterações nesta Política',
      paragraphs: [
        'Esta Politica de Privacidade podera ser atualizada periodicamente para refletir mudancas na plataforma, nas funcionalidades, nas praticas de seguranca ou na legislacao aplicavel.',
        'Quando houver alteracoes relevantes, os usuarios poderao ser comunicados por meio da propria plataforma, e-mail ou outro canal disponivel.',
      ],
    },
    {
      title: 'Contato',
      paragraphs: [
        'Para duvidas, solicitacoes de privacidade, correcao de dados, exclusao de conta ou questoes relacionadas ao tratamento de dados pessoais, o usuario podera entrar em contato pelos dados do responsavel pela plataforma.',
      ],
    },
  ],
};

export const termsContent: LegalDocumentContent = {
  title: 'Termos de Uso',
  subtitle: 'Árvore Genealógica da Família',
  updatedAt: '09/05/2026',
  owner: platformOwner,
  intro:
    'Ao utilizar a plataforma Árvore Genealógica da Família, o usuário reconhece que se trata de um ambiente privado, restrito a familiares, criado para preservar a memória, os vínculos e a história da família.',
  sections: [
    {
      title: 'Aceitação dos Termos',
      paragraphs: [
        'Ao acessar ou utilizar a plataforma Arvore Genealogica da Familia, o usuario declara que leu, compreendeu e concorda com estes Termos de Uso e com a Politica de Privacidade.',
        'Caso nao concorde com qualquer condicao, o usuario nao devera utilizar a plataforma.',
      ],
    },
    {
      title: 'Finalidade da plataforma',
      paragraphs: [
        'A plataforma tem finalidade familiar, privada e genealogica.',
        'Seu objetivo e permitir que membros da familia consultem, organizem e preservem informacoes sobre parentesco, historia familiar, datas importantes, registros biograficos, fotos e outros dados relacionados a arvore genealogica.',
        'A plataforma nao e uma rede social publica, nao e destinada a uso comercial e nao deve ser usada para divulgacao ampla de informacoes pessoais.',
      ],
    },
    {
      title: 'Acesso restrito a familiares',
      paragraphs: [
        'O acesso e limitado a usuarios previamente cadastrados e vinculados a arvore genealogica.',
        'Para criar uma conta, o usuario deve ja possuir um registro familiar previo na plataforma, criado por administrador ou responsavel autorizado. Apos essa identificacao, o usuario podera completar seu cadastro, definir senha e acessar sua conta.',
        'A plataforma podera negar, suspender ou cancelar acessos quando houver inconsistencia de identidade, ausencia de vinculo familiar, uso indevido ou violacao destes Termos.',
      ],
    },
    {
      title: 'Conta do usuário',
      paragraphs: ['O usuario e responsavel por:'],
      items: [
        'Informar dados verdadeiros e atualizados',
        'Manter sua senha em sigilo',
        'Nao compartilhar sua conta com terceiros',
        'Atualizar informacoes incorretas ou desatualizadas',
        'Comunicar suspeita de acesso indevido',
        'Usar a plataforma apenas para sua finalidade familiar e genealogica',
        'Gerenciar suas preferencias de privacidade e notificacoes, quando disponiveis',
        'A plataforma nao se responsabiliza por danos decorrentes do uso indevido da conta por descuido do proprio usuario',
      ],
    },
    {
      title: 'Regras de uso',
      paragraphs: ['Ao utilizar a plataforma, o usuario concorda em nao:'],
      items: [
        'Compartilhar dados da arvore com pessoas nao autorizadas',
        'Copiar, extrair ou divulgar informacoes familiares fora da plataforma sem autorizacao',
        'Publicar informacoes falsas, ofensivas, discriminatorias ou invasivas',
        'Expor dados sensiveis de outros familiares',
        'Usar a plataforma para perseguicao, constrangimento, conflito familiar ou exposicao indevida',
        'Tentar acessar areas restritas sem permissao',
        'Interferir no funcionamento tecnico da plataforma',
        'Usar robos, scripts ou ferramentas automatizadas sem autorizacao',
        'Publicar fotos, historias ou dados de terceiros sem autorizacao adequada',
        'Utilizar o ambiente para fins comerciais, politicos, publicitarios ou alheios a finalidade genealogica',
      ],
    },
    {
      title: 'Informações cadastradas pelo usuário',
      paragraphs: [
        'O usuario podera cadastrar ou editar informacoes pessoais, como foto, telefone, e-mail, endereco, rede social, biografia e curiosidades.',
        'O usuario declara que as informacoes inseridas sao verdadeiras, respeitam direitos de terceiros e nao violam a privacidade de outros familiares.',
        'A plataforma podera remover, ocultar ou ajustar conteudos que sejam considerados inadequados, ofensivos, falsos, sensiveis, excessivos ou incompativeis com a finalidade familiar.',
      ],
    },
    {
      title: 'Privacidade e visibilidade dos dados',
      paragraphs: [
        'A plataforma permite que determinados dados sejam visualizados por outros membros autorizados da familia.',
        'O usuario podera ocultar informacoes como:',
      ],
      items: [
        'Foto',
        'Link de rede social',
        'Telefone',
        'E-mail',
        'Endereco',
        'Outros campos de privacidade disponiveis',
      ],
    },
    {
      title: 'Limites da ocultação',
      paragraphs: [
        'A ocultacao impede ou limita a visualizacao pelos demais membros, mas pode nao impedir o acesso por administradores autorizados quando necessario para suporte, seguranca, manutencao ou cumprimento de obrigacoes legais.',
      ],
    },
    {
      title: 'Dados genealógicos essenciais',
      paragraphs: ['Algumas informacoes podem ser consideradas essenciais para a finalidade da plataforma, como:'],
      items: [
        'Nome',
        'Vinculos familiares',
        'Relacoes de parentesco',
        'Datas relevantes',
        'Posicao na arvore',
        'Indicacao de familiares ascendentes, descendentes, irmaos, conjuges ou outros vinculos',
      ],
    },
    {
      title: 'Permanência de dados genealógicos',
      paragraphs: [
        'Esses dados podem permanecer na plataforma mesmo apos a exclusao da conta, quando forem necessarios para preservar a estrutura genealogica da familia e o entendimento dos vinculos entre os demais membros.',
        'Nesses casos, sempre que possivel, dados de login, contato e informacoes opcionais do usuario poderao ser removidos, ocultados ou anonimizados.',
      ],
    },
    {
      title: 'Biografia, curiosidades e histórias pessoais',
      paragraphs: [
        'A plataforma podera permitir que o usuario adicione informacoes opcionais sobre sua vida, como biografia, curiosidades, memorias, experiencias pessoais e historias familiares.',
        'Esses campos sao voluntarios. O usuario deve evitar inserir informacoes intimas, sensiveis, ofensivas ou que envolvam terceiros sem autorizacao.',
        'A plataforma podera remover conteudos que violem estes Termos ou que possam afetar a privacidade, honra ou seguranca de outras pessoas.',
      ],
    },
    {
      title: 'Fotos e imagens',
      paragraphs: [
        'O usuario podera inserir foto de perfil ou outros registros visuais, conforme as funcionalidades disponiveis.',
        'Ao enviar imagens, o usuario declara que possui direito de uso ou autorizacao para publicacao no ambiente familiar restrito.',
        'E proibido enviar imagens ofensivas, constrangedoras, intimas, discriminatorias ou que violem a privacidade de outras pessoas.',
      ],
    },
    {
      title: 'Notificações e comunicações por e-mail',
      paragraphs: [
        'A plataforma podera oferecer ao usuario a opcao de receber e-mails com notificacoes sobre eventos, acontecimentos e novidades da familia.',
        'Essas comunicacoes poderao incluir, entre outros temas:',
      ],
      items: [
        'Aniversarios',
        'Datas familiares importantes',
        'Eventos da familia',
        'Novos registros na arvore',
        'Atualizacoes relevantes',
        'Comunicados administrativos',
        'Novidades sobre funcionalidades da plataforma',
      ],
    },
    {
      title: 'Preferências de notificação',
      paragraphs: [
        'O usuario podera gerenciar suas preferencias de recebimento de e-mails pela propria conta, quando essa funcionalidade estiver disponivel.',
        'O usuario podera optar por ativar, desativar ou ajustar os tipos de notificacoes que deseja receber.',
        'Comunicacoes essenciais relacionadas a conta, seguranca, recuperacao de senha, confirmacao de e-mail, alteracoes relevantes nos Termos ou funcionamento necessario da plataforma poderao ser enviadas mesmo que o usuario tenha desativado notificacoes opcionais.',
      ],
    },
    {
      title: 'Google Agenda',
      paragraphs: [
        'A plataforma podera oferecer integracao opcional com o Google Agenda para salvar eventos importantes da familia.',
        'Ao conectar sua conta Google, o usuario autoriza a plataforma a executar as acoes necessarias para essa funcionalidade, conforme as permissoes concedidas.',
        'O usuario podera desconectar a integracao a qualquer momento.',
        'A plataforma nao se responsabiliza por alteracoes feitas diretamente pelo usuario no Google Agenda, nem por limitacoes, indisponibilidades ou mudancas nas regras tecnicas do servico do Google.',
      ],
    },
    {
      title: 'Administração da árvore',
      paragraphs: ['Administradores autorizados poderao:'],
      items: [
        'Criar e editar registros familiares',
        'Validar vinculos de parentesco',
        'Corrigir informacoes incorretas',
        'Remover conteudos inadequados',
        'Gerenciar permissoes de acesso',
        'Suspender contas em caso de uso indevido',
        'Preservar a integridade da arvore genealogica',
        'Os administradores devem agir de forma responsavel, respeitando a finalidade familiar da plataforma e a privacidade dos usuarios',
      ],
    },
    {
      title: 'Exclusão de conta',
      paragraphs: [
        'O usuario podera solicitar a exclusao de sua conta a qualquer momento.',
        'A exclusao podera encerrar o acesso do usuario a plataforma e remover, ocultar ou anonimizar dados vinculados a conta, conforme viabilidade tecnica e necessidade de preservacao genealogica.',
        'A exclusao da conta nao garante a remocao integral de dados historicos ou genealogicos essenciais que sejam necessarios para manter a arvore compreensivel para os demais familiares.',
      ],
    },
    {
      title: 'Disponibilidade da plataforma',
      paragraphs: [
        'A plataforma podera passar por manutencoes, atualizacoes, correcoes tecnicas ou periodos de indisponibilidade.',
        'Nao ha garantia de funcionamento continuo, ininterrupto ou livre de erros. Sempre que possivel, serao adotadas medidas para preservar dados e restaurar o funcionamento adequado.',
      ],
    },
    {
      title: 'Segurança',
      paragraphs: [
        'O usuario nao deve tentar explorar falhas, acessar dados de terceiros sem autorizacao, burlar permissoes, interferir no sistema ou usar a plataforma de forma prejudicial.',
        'Qualquer uso indevido podera resultar em suspensao ou exclusao da conta, sem prejuizo de outras medidas cabiveis.',
      ],
    },
    {
      title: 'Propriedade e uso do conteudo',
      paragraphs: [
        'A estrutura da plataforma, seu layout, codigo, organizacao visual, textos institucionais e funcionalidades pertencem aos seus responsaveis ou desenvolvedores autorizados.',
        'As informacoes familiares, fotos, textos e registros inseridos pelos usuarios continuam vinculados aos respectivos titulares ou pessoas que tenham direito sobre esse conteudo.',
        'Ao inserir conteudo na plataforma, o usuario autoriza seu uso dentro do ambiente restrito da arvore, exclusivamente para finalidade familiar e genealogica.',
      ],
    },
    {
      title: 'Limitação de responsabilidade',
      paragraphs: [
        'A plataforma busca preservar informacoes familiares de forma organizada e cuidadosa, mas nao garante que todos os dados estejam completos, corretos ou atualizados.',
        'Como parte das informacoes pode ser fornecida por familiares, administradores ou registros antigos, podem existir erros, lacunas ou divergencias historicas.',
        'A plataforma nao se responsabiliza por conflitos familiares, interpretacoes pessoais, informacoes incorretas fornecidas por usuarios ou uso indevido de dados por membros autorizados.',
      ],
    },
    {
      title: 'Alterações nos Termos',
      paragraphs: [
        'Estes Termos de Uso poderao ser atualizados periodicamente.',
        'Alteracoes relevantes poderao ser comunicadas aos usuarios por meio da plataforma, e-mail ou outro canal disponivel. O uso continuado da plataforma apos a atualizacao representa concordancia com os novos termos.',
      ],
    },
    {
      title: 'Encerramento ou suspensão de acesso',
      paragraphs: ['A plataforma podera suspender ou encerrar o acesso de usuarios que:'],
      items: [
        'Violem estes Termos',
        'Divulguem dados familiares fora do ambiente autorizado',
        'Tentem acessar areas restritas',
        'Compartilhem login e senha',
        'Publiquem conteudo ofensivo, falso ou inadequado',
        'Usem a plataforma para finalidade diferente da genealogica',
      ],
    },
    {
      title: 'Contato',
      paragraphs: [
        'Para duvidas, solicitacoes, correcoes de dados, exclusao de conta ou questoes relacionadas ao uso da plataforma, o usuario podera entrar em contato pelos dados do responsavel pela plataforma.',
      ],
    },
    {
      title: 'Declaração final',
      paragraphs: [
        'Ao utilizar a plataforma Arvore Genealogica da Familia, o usuario reconhece que se trata de um ambiente privado, restrito a familiares, criado para preservar a memoria, os vinculos e a historia da familia.',
        'O usuario compromete-se a utilizar a plataforma com respeito, responsabilidade e cuidado com a privacidade dos demais membros.',
      ],
    },
  ],
};
