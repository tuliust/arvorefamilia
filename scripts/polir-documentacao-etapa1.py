from __future__ import annotations

import re
from pathlib import Path

DOCS_ROOT = Path("docs")
TARGETS = list(DOCS_ROOT.rglob("*.md")) + [
    Path("README.md"),
    Path("ARCHITECTURE.md"),
    Path("DEPLOYMENT.md"),
]

# Substituicoes pontuais geradas pela conversao para ASCII.
# Mantem tudo em ASCII para evitar novo problema de encoding no Windows.
LITERAL_REPLACEMENTS = {
    "A  arvore": "a arvore",
    "A  Arvore": "a Arvore",
    "A  exportacao": "a exportacao",
    "A  Exportacao": "a Exportacao",
    "Area do usuario  `/meus-dados`": "Area do usuario - `/meus-dados`",
    "Minha Arvore  filtros": "Minha Arvore - filtros",
    "Guia de implementacoes  Arvore Familia": "Guia de implementacoes - Arvore Familia",
    "Arvore  legendas": "Arvore - legendas",
    "Git  comandos": "Git - comandos",
    "Operacao  manutencao": "Operacao - manutencao",
    "Historico  diagnosticos": "Historico - diagnosticos",
}

# Perguntas conhecidas que perderam pontuacao no processo de conversao ASCII.
QUESTION_LINES = {
    "1. A alteracao realmente exige banco": "1. A alteracao realmente exige banco?",
    "2. E ajuste funcional ou apenas visual": "2. E ajuste funcional ou apenas visual?",
    "3. A coluna/tabela/RPC ja existe em migration": "3. A coluna/tabela/RPC ja existe em migration?",
    "4. O ambiente remoto esta alinhado com local": "4. O ambiente remoto esta alinhado com local?",
    "5. Existe risco de perda de dados": "5. Existe risco de perda de dados?",
    "6. Ha backup ou rollback manual": "6. Ha backup ou rollback manual?",
    "7. O frontend ja envia payload para a nova coluna": "7. O frontend ja envia payload para a nova coluna?",
    "8. RLS precisa ser alterada": "8. RLS precisa ser alterada?",
    "9. Existe teste ou QA manual para o fluxo": "9. Existe teste ou QA manual para o fluxo?",
}

# Corrige titulos Markdown que ficaram com dois ou mais espacos entre partes do titulo.
# Exemplo: "# Minha Arvore  filtros" -> "# Minha Arvore - filtros".
HEADING_DOUBLE_SPACE_RE = re.compile(r"^(#{1,6}\s+.+?)\s{2,}(.+)$", re.MULTILINE)

# Remove espacos em branco no fim de linha.
TRAILING_WHITESPACE_RE = re.compile(r"[ \t]+$", re.MULTILINE)


def normalize_heading(match: re.Match[str]) -> str:
    left = match.group(1).rstrip()
    right = match.group(2).strip()

    # Evita alterar headings vazios ou linhas ja normalizadas.
    if not left or not right:
        return match.group(0)

    return f"{left} - {right}"


def polish_text(text: str) -> str:
    fixed = text.replace("\ufeff", "")

    for bad, good in LITERAL_REPLACEMENTS.items():
        fixed = fixed.replace(bad, good)

    lines = []
    for line in fixed.splitlines():
        stripped = line.strip()
        lines.append(QUESTION_LINES.get(stripped, line))
    fixed = "\n".join(lines)

    fixed = HEADING_DOUBLE_SPACE_RE.sub(normalize_heading, fixed)
    fixed = TRAILING_WHITESPACE_RE.sub("", fixed)

    return fixed.rstrip() + "\n"


def main() -> None:
    changed: list[str] = []

    for path in TARGETS:
        if not path.exists() or not path.is_file():
            continue

        original = path.read_text(encoding="utf-8-sig")
        fixed = polish_text(original)

        if fixed != original:
            path.write_text(fixed, encoding="utf-8")
            changed.append(str(path))

    print("Arquivos alterados:")
    for item in changed:
        print(f"- {item}")

    if not changed:
        print("Nenhum ajuste necessario.")


if __name__ == "__main__":
    main()
