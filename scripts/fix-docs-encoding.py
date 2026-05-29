from __future__ import annotations

from pathlib import Path

TARGETS = list(Path("docs").rglob("*.md")) + [
    Path("README.md"),
    Path("ARCHITECTURE.md"),
    Path("DEPLOYMENT.md"),
]

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


def score(text: str) -> int:
    return sum(text.count(marker) for marker in BAD_MARKERS)


def decode_pass(text: str) -> str:
    candidates = [text]
    for encoding in ("latin1", "cp1252"):
        try:
            candidates.append(text.encode(encoding).decode("utf-8"))
        except UnicodeError:
            pass
    return min(candidates, key=score)


def replace_pass(text: str) -> str:
    fixed = text
    for bad, good in REPLACEMENTS.items():
        fixed = fixed.replace(bad, good)
    return fixed


def fix_text(text: str) -> str:
    fixed = text.replace("\ufeff", "")
    for _ in range(12):
        before = fixed
        decoded = decode_pass(fixed)
        replaced = replace_pass(decoded)
        fixed = replaced if score(replaced) <= score(decoded) else decoded
        if fixed == before:
            break
    return fixed.rstrip() + "\n"


def main() -> None:
    changed: list[str] = []
    still_bad: list[str] = []

    for path in TARGETS:
        if not path.exists():
            continue
        original = path.read_text(encoding="utf-8-sig")
        fixed = fix_text(original)
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
        raise SystemExit(1)

    print("\nEncoding check passed.")


if __name__ == "__main__":
    main()
