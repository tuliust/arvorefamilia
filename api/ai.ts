import OpenAI from "openai";

function limitText(value: unknown, maxLength = 300) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function safeContextText(value: unknown, maxLength = 160) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, maxLength) : null;
}

function sanitizeProfileTextContext(context: unknown, memorialMode: boolean) {
  if (!context || typeof context !== "object") return {};

  const record = context as Record<string, unknown>;

  return {
    nome_completo: safeContextText(record.nome_completo),
    data_nascimento: safeContextText(record.data_nascimento, 40),
    local_nascimento: safeContextText(record.local_nascimento),
    data_falecimento: safeContextText(record.data_falecimento, 40),
    local_falecimento: safeContextText(record.local_falecimento),
    local_atual: memorialMode ? null : safeContextText(record.local_atual),
    profissao: safeContextText(record.profissao),
    falecido: record.falecido === true,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY não configurada." });
    }

    const {
      message,
      context,
      purpose,
      tone,
      selectedBadges,
      customTraits,
      answers,
      memorialMode,
    } = req.body || {};

    if (purpose === "profile_text") {
      const hasBadges = Array.isArray(selectedBadges) && selectedBadges.length > 0;
      const hasCustomTraits = typeof customTraits === "string" && customTraits.trim().length > 0;
      const hasAnswers = Array.isArray(answers) && answers.some((item) => item?.answer?.trim());

      if (!hasBadges && !hasCustomTraits && !hasAnswers) {
        return res.status(400).json({
          error: "Selecione ao menos uma opção ou responda uma pergunta para gerar o texto.",
        });
      }

      const isMemorialMode = memorialMode === true || tone === "nostalgico";

      const profilePayload = {
        tone: typeof tone === "string" ? tone.slice(0, 80) : "afetivo",
        memorialMode: isMemorialMode,
        selectedBadges: Array.isArray(selectedBadges)
          ? selectedBadges
            .filter((item) => typeof item === "string")
            .map((item) => item.slice(0, 120))
            .slice(0, 80)
          : [],
        customTraits: typeof customTraits === "string" ? customTraits.trim().slice(0, 1600) : "",
        answers: Array.isArray(answers)
          ? answers
            .filter((item) => item?.answer?.trim())
            .map((item) => ({
              question: String(item?.question ?? "").slice(0, 220),
              answer: String(item?.answer ?? "").trim().slice(0, 800),
            }))
            .slice(0, 6)
          : [],
        context: sanitizeProfileTextContext(context, isMemorialMode),
      };
      const compactProfileContext = JSON.stringify(profilePayload).slice(0, 9000);
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: isMemorialMode
              ? [
                "Você deve gerar dois textos curtos para um perfil familiar de uma pessoa falecida.",
                'Retorne exclusivamente JSON válido, sem markdown, no formato: {"minibio":"...","curiosidades":"..."}.',
                "Regras:",
                "- Escreva em terceira pessoa.",
                "- Use verbos no passado.",
                "- Use tom saudosista, afetivo e respeitoso.",
                "- Pode usar o nome da pessoa quando disponível no contexto.",
                "- Não use primeira pessoa.",
                "- Não use eu, me, meu, minha, meus ou minhas.",
                "- Não escreva como se a pessoa ainda estivesse viva.",
                "- Cada campo deve ter no máximo 300 caracteres.",
                "- Não invente fatos, datas, cidades, viagens, profissões, conquistas ou eventos.",
                "- Não use placeholders como xxxx.",
                "- Não mencione morte diretamente se não for necessário.",
                "- Evite linguagem fúnebre pesada.",
                "- Não mencione IA.",
                "- Não exponha dados técnicos.",
                "- Não inferir saúde, religião, orientação sexual, condição financeira, conflitos familiares, causa de morte ou informações sensíveis não informadas explicitamente.",
                "- Se houver temas sensíveis, trate com sobriedade.",
                "- A Mini Bio deve preservar a memória da pessoa, suas origens, valores, trajetória ou vínculos familiares.",
                "- Curiosidades deve trazer gostos, marcas pessoais, lembranças, hábitos ou detalhes leves no passado.",
                "- Prefira formulações como: '[Nome] foi uma pessoa...', '[Nome] era lembrado por...', 'Gostava de...', 'Adorava...', 'Tinha o costume de...'.",
              ].join(" ")
              : [
                "Você deve gerar dois textos curtos para um perfil familiar.",
                'Retorne exclusivamente JSON válido, sem markdown, no formato: {"minibio":"...","curiosidades":"..."}.',
                "Regras:",
                "- Escreva sempre em primeira pessoa.",
                "- Não use terceira pessoa.",
                "- Cada campo deve ter no máximo 300 caracteres.",
                "- Não invente fatos.",
                "- Use apenas as informações fornecidas em contexto, badges, características adicionais e respostas.",
                "- Não mencione IA.",
                "- Não use linguagem exagerada.",
                "- Não exponha dados técnicos.",
                "- Não inferir saúde, religião, orientação sexual, condição financeira, conflitos familiares, causa de morte ou informações sensíveis não informadas explicitamente.",
                "- Se houver temas sensíveis, trate com sobriedade.",
                "- A Mini Bio deve apresentar quem sou, minhas origens, valores, trajetória ou relação com a família.",
                "- Curiosidades deve trazer gostos, marcas pessoais, lembranças, hábitos ou detalhes leves sobre minha vida.",
              ].join(" "),
          },
          {
            role: "user",
            content: `Dados fornecidos para geração:\n${compactProfileContext}`,
          },
        ],
        max_output_tokens: 360,
      });

      try {
        const parsed = JSON.parse(response.output_text);
        if (typeof parsed?.minibio !== "string" || typeof parsed?.curiosidades !== "string") {
          throw new Error("Invalid profile_text response shape");
        }

        return res.status(200).json({
          minibio: limitText(parsed.minibio),
          curiosidades: limitText(parsed.curiosidades),
        });
      } catch {
        return res.status(500).json({
          error: "Não foi possível interpretar os textos gerados.",
        });
      }
    }
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensagem inválida." });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const trimmedMessage = message.trim().slice(0, 1200);
    const compactContext = context
      ? JSON.stringify(context).slice(0, 45000)
      : "Sem contexto estruturado disponível.";

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            "Você é um assistente de uma árvore genealógica.",
            "Responda em português do Brasil, de forma clara, objetiva e cuidadosa.",
            "Use somente os dados enviados no contexto. Se a informação não estiver disponível, diga que não encontrou esse dado na árvore carregada.",
            "Não exponha IDs internos de pessoas ou relacionamentos.",
            "Use bullets com o marcador '•' para listas de pessoas.",
            "Não finalize com frases genéricas como 'se precisar de mais alguma informação'.",
            "Para perguntas sobre pais, avós, bisavós e irmãos, use relacionamentosFamiliares.paisPorPessoa como fonte principal.",
            "Para 'Quem são meus bisavós paternos?', não liste os avós. Responda com os pais do avô paterno e os pais da avó paterna.",
            "Para 'Quantas pessoas nasceram em Recife?', comece com 'As pessoas da sua família que nasceram em Recife/PE são:' e liste nomes sem prefixar 'Você,'.",
            "Para 'pessoas mais antigas', inclua ano de nascimento e idade aproximada ou idade ao falecer.",
            "Para cidades de nascimento mais recorrentes, inclua as pessoas dentro de cada cidade.",
          ].join(" "),
        },
        {
          role: "user",
          content: `Pergunta do usuário: ${trimmedMessage}\n\nContexto da árvore em JSON:\n${compactContext}`,
        },
      ],
      max_output_tokens: 900,
    });

    return res.status(200).json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error("Erro na OpenAI:", error);
    return res.status(500).json({
      error: "Não foi possível gerar a resposta agora.",
    });
  }
}
