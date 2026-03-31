from app.services.theory_engine import get_song_section_advice


def generate_free_local_coach_response(prompt: str) -> str:
    lowered = prompt.lower()
    if "pre-chorus" in lowered:
        return (
            "Try a pre-chorus that climbs in melody and reduces lyrical density. "
            "Keep chords moving every bar to build momentum into your chorus."
        )
    if "chorus" in lowered:
        return (
            "Center your chorus on a singable melodic shape and repeat a strong title phrase. "
            "Contrast with verse by lifting rhythm, register, or harmonic brightness."
        )
    if "bridge" in lowered:
        return (
            "Use your bridge for contrast: introduce a new chord center or rhythmic pattern, "
            "then return to the final chorus with greater impact."
        )
    if "verse" in lowered:
        return f"Verse focus: {get_song_section_advice('verse')}"

    return (
        "Start with a clear hook, support it with a focused verse story, and create lift before chorus. "
        "If you share key/chords, I can suggest a stronger progression."
    )
