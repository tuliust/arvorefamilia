from __future__ import annotations

import argparse
import re
import unicodedata
from pathlib import Path

LEGACY_DIR = Path("docs/historico/documentacao-antiga")

BAD_MARKERS = (
    "Ã",
    "Â",
    "â€",
    "â€”",
    "â€“",
    "Ãƒ",
    "�",
)

REPLACEMENTS = {
    # double mojibake
    "ÃƒÂ¡": "á",
    "ÃƒÂ ": "à",
    "ÃƒÂ£": "ã",
    "ÃƒÂ¢": "â",
    "ÃƒÂ©": "é",
    "ÃƒÂª": "ê",
    "ÃƒÂ­": "í",
    "ÃƒÂ³": "ó",
    "ÃƒÂ´": "ô",
    "ÃƒÂµ": "õ",
    "ÃƒÂº": "ú",
    "ÃƒÂ§": "ç",
    "ÃƒÂ": "Á",
    "ÃƒÂ‰": "É",
    "ÃƒÂ": "Í",
    "ÃƒÂ“": "Ó",
    "ÃƒÂš": "Ú",
    "ÃƒÂ‡": "Ç",
    "ÃƒÅ¡": "Ú",
    # simple mojibake
    "Ã¡": "á",
    "Ã ": "à",
    "Ã£": "ã",
    "Ã¢": "â",
    "Ã©": "é",
    "Ãª": "ê",
    "Ã­": "í",
    "Ã³": "ó",
    "Ã´": "ô",
    "Ãµ": "õ",
    "Ãº": "ú",
    "Ã§": "ç",
    "Ã": "Á",
    "Ã‰": "É",
    "Ã": "Í",
    "Ã“": "Ó",
    "Ãš": "Ú",
    "Ã‡": "Ç",
    # cases where a control byte was stripped by a terminal/editor
    "Ãrvore": "Árvore",
    "Ãrvores": "Árvores",
    "Ãrea": "Área",
    "Ãreas": "Áreas",
    "Ãndice": "Índice",
    "Ãltima": "Última",
    "Ãšltima": "Última",
    "Ãnico": "Único",
    "FamÃlia": "Família",
    "famÃlia": "família",
    "especÃfica": "específica",
    "especÃficas": "específicas",
    "concluÃda": "concluída",
    "usuÃrio": "usuário",
    "usuÃrios": "usuários",
    "histÃrico": "histórico",
    "histÃricos": "históricos",
    "tÃcnico": "técnico",
    "tÃcnica": "técnica",
    "tÃcnicos": "técnicos",
    "decisÃµes": "decisões",
    "notificaÃ§Ãµes": "notificações",
    "documentaÃ§Ã£o": "documentação",
    "implementaÃ§Ãµes": "implementações",
    "atualizaÃ§Ã£o": "atualização",
    "revisÃ£o": "revisão",
    "canÃ´nico": "canônico",
    "nÃ£o": "não",
    "jÃ¡": "já",
    "Ã©": "é",
    "pÃ³s": "pós",
    # punctuation and arrows
    "â€”": "—",
    "â€“": "–",
    "â€œ": "“",
    "â€": "”",
    "â€˜": "‘",
    "â€™": "’",
    "â€¦": "…",
    "â€¢": "•",
    "â†“": "↓",
    "â†’": "→",
    "â†": "←",
    "â†‘": "↑",
    "â": "↓",
    "â": "→",
    # cp1252 re-encoded variants seen in the repo
    "Ã¢â‚¬â€": "—",
    "Ã¢â‚¬â€œ": "–",
    "Ã¢â‚¬Å“": "“",
    "Ã¢â‚¬Â": "”",
    "Ã¢â‚¬â„¢": "’",
    "Ã¢â‚¬Â¢": "•",
    # leftovers
    "Â ": " ",
    "Â": "",
    "\ufeff": "",
}

# Repair suspicious chunks instead of the whole file. Whole-file latin1/cp1252
# decoding fails when a document already contains some valid Unicode characters.
SUSPICIOUS_CHUNK = re.compile(r"[^\s`<>\[\]{}()|]+")


def score(text: str) -> int:
    return sum(text.count(marker) for marker in BAD_MARKERS)


def replace_pass(text: str) -> str:
    fixed = text
    for bad, good in REPLACEMENTS.items():
        fixed = fixed.replace(bad, good)
    return fixed


def decode_candidate(text: str) -> str:
    candidates = [text]
    for encoding in ("latin1", "cp1252"):
        try:
            candidates.append(text.encode(encoding).decode("utf-8"))
        except UnicodeError:
            pass
    return min(candidates, key=score)


def repair_chunk(match: re.Match[str]) -> str:
    chunk = match.group(0)
    if score(chunk) == 0:
        return chunk
    fixed = chunk
    for _ in range(8):
        before = fixed
        fixed = replace_pass(fixed)
        decoded = decode_candidate(fixed)
        if score(decoded) <= score(fixed):
            fixed = decoded
        fixed = replace_pass(fixed)
        if fixed == before:
            break
    return fixed


def strip_accents_to_ascii(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    return normalized.encode("ascii", "ignore").decode("ascii")


def fix_text(text: str, ascii_only: bool) -> str:
    fixed = text.replace("\ufeff", "")
    for _ in range(10):
        before = fixed
        fixed = replace_pass(fixed)
        fixed = SUSPICIOUS_CHUNK.sub(repair_chunk, fixed)
        fixed = replace_pass(fixed)
        if fixed == before:
            break
    if ascii_only:
        fixed = strip_accents_to_ascii(fixed)
        fixed = fixed.replace("—", "-").replace("–", "-")
        fixed = fixed.replace("“", '"').replace("”", '"')
        fixed = fixed.replace("‘", "'").replace("’", "'")
    return fixed.rstrip() + "\n"


def is_legacy_doc(path: Path) -> bool:
    try:
        path.relative_to(LEGACY_DIR)
        return True
    except ValueError:
        return False


def collect_targets(include_legacy: bool) -> list[Path]:
    docs = []
    for path in Path("docs").rglob("*.md"):
        if not include_legacy and is_legacy_doc(path):
            continue
        docs.append(path)
    return docs + [Path("README.md"), Path("ARCHITECTURE.md"), Path("DEPLOYMENT.md")]


def main() -> None:
    parser = argparse.ArgumentParser(description="Fix mojibake in Markdown documentation files.")
    parser.add_argument(
        "--include-legacy",
        action="store_true",
        help="also process docs/historico/documentacao-antiga",
    )
    parser.add_argument(
        "--ascii",
        action="store_true",
        help="convert output to ASCII after repairing mojibake; safest for Windows terminals",
    )
    args = parser.parse_args()

    changed: list[str] = []
    still_bad: list[str] = []

    for path in collect_targets(include_legacy=args.include_legacy):
        if not path.exists():
            continue
        original = path.read_text(encoding="utf-8-sig")
        fixed = fix_text(original, ascii_only=args.ascii)
        if fixed != original:
            path.write_text(fixed, encoding="utf-8")
            changed.append(str(path))
        current = path.read_text(encoding="utf-8-sig")
        if score(current) > 0:
            still_bad.append(str(path))

    print("Changed files:")
    for item in changed:
        print(f"- {item}")

    if still_bad:
        print("\nFiles that still contain suspicious markers:")
        for item in still_bad:
            print(f"- {item}")
        print("\nTip: run again with --ascii if you want a safe ASCII-only documentation set.")
        raise SystemExit(1)

    print("\nEncoding check passed.")


if __name__ == "__main__":
    main()
