from __future__ import annotations

import re

KEY_SECTION_PATTERNS = [
    "rumusan masalah",
    "tujuan penelitian",
    "batasan",
    "metode penelitian",
    "metodologi",
    "perancangan",
    "implementasi",
    "pengujian",
    "hasil",
    "pembahasan",
    "kesimpulan",
    "saran",
]


def compact_text(text: str, max_chars: int) -> str:
    normalized = normalize_whitespace(text)
    if len(normalized) <= max_chars:
        return normalized

    if max_chars <= 3000:
        return normalized[:max_chars]

    head_budget = int(max_chars * 0.35)
    tail_budget = int(max_chars * 0.2)
    window_budget = max_chars - head_budget - tail_budget

    parts = [normalized[:head_budget]]
    parts.extend(_keyword_windows(normalized, window_budget))
    parts.append(normalized[-tail_budget:])

    compacted = "\n\n[...]\n\n".join(part.strip() for part in parts if part.strip())
    return compacted[:max_chars].strip()


def normalize_whitespace(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _keyword_windows(text: str, budget: int) -> list[str]:
    if budget <= 0:
        return []

    lower_text = text.lower()
    windows: list[tuple[int, int]] = []
    per_window = max(1200, budget // max(len(KEY_SECTION_PATTERNS), 1))

    for pattern in KEY_SECTION_PATTERNS:
        index = lower_text.find(pattern)
        if index == -1:
            continue
        start = max(0, index - per_window // 4)
        end = min(len(text), index + per_window)
        windows.append((start, end))

    merged = _merge_windows(windows)
    chunks: list[str] = []
    used = 0
    for start, end in merged:
        if used >= budget:
            break
        chunk = text[start:end]
        remaining = budget - used
        chunks.append(chunk[:remaining])
        used += len(chunks[-1])
    return chunks


def _merge_windows(windows: list[tuple[int, int]]) -> list[tuple[int, int]]:
    if not windows:
        return []
    sorted_windows = sorted(windows)
    merged = [sorted_windows[0]]
    for start, end in sorted_windows[1:]:
        prev_start, prev_end = merged[-1]
        if start <= prev_end:
            merged[-1] = (prev_start, max(prev_end, end))
        else:
            merged.append((start, end))
    return merged
