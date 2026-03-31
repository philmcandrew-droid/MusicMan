def get_song_section_advice(section: str) -> str:
    advice = {
        "verse": "Tell the narrative with detail and progression.",
        "pre-chorus": "Raise energy and harmonic tension into the chorus.",
        "chorus": "Deliver the central hook and emotional payoff.",
        "bridge": "Add contrast with new chords, melody, or lyric angle.",
        "middle 8": "Use a short departure to keep arrangement fresh.",
        "outro": "Close intentionally by resolving or fading the motif.",
    }
    return advice.get(section.lower(), "Use this section to support the song story arc.")


def circle_of_fifths_neighbors(key: str) -> dict[str, str]:
    keys = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"]
    if key not in keys:
        return {"key": key, "dominant": "G", "subdominant": "F"}
    idx = keys.index(key)
    return {
        "key": key,
        "dominant": keys[(idx + 1) % len(keys)],
        "subdominant": keys[(idx - 1) % len(keys)],
    }
