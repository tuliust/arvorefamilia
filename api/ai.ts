import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY não configurada." });
    }

    const { message, context, purpose, destination, keywords } = req.body || {};

    if (purpose === "profile_text") {
      if (!keywords || typeof keywords !== "string") {
        return res.status(400).json({ error: "Informe palavras-chave para gerar o texto." });
      }

      const target = destination === "curiosidades" ? "Curiosidades" : "Mini Bio";
      const compactProfileContext = context
        ? JSON.stringify(context).slice(0, 6000)
        : "Sem contexto adicional.";
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: [
              `Escreva uma sugestão curta para o campo ${target} de um perfil familiar.`,
              "Responda em português do Brasil, em um único texto pronto para uso.",
              "Use somente os fatos e palavras-chave fornecidos.",
              "Não invente datas, lugares, parentescos, conquistas ou características.",
              target === "Mini Bio"
                ? "Use tom acolhedor e objetivo, preferencialmente em terceira pessoa, com até 90 palavras."
                : "Use tom leve e pessoal, com até 120 palavras.",
            ].join(" "),
          },
          {
            role: "user",
            content: `Palavras-chave: ${keywords.trim().slice(0, 1200)}\nContexto do perfil: ${compactProfileContext}`,
          },
        ],
        max_output_tokens: 260,
      });

      return res.status(200).json({ answer: response.output_text });
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
