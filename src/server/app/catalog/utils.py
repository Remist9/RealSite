import re

def normalize(text: str) -> str:
    text = text.lower().strip()
    text = text.replace("ё", "е")
    text = text.replace(".", ",")
    text = re.sub(r"\s+", " ", text)
    return text


def basic_translit(text: str) -> str:
    mapping = {
        "а": "a","б": "b","в": "v","г": "g","д": "d",
        "е": "e","ж": "zh","з": "z","и": "i","й": "y",
        "к": "k","л": "l","м": "m","н": "n","о": "o",
        "п": "p","р": "r","с": "s","т": "t","у": "u",
        "ф": "f","х": "h","ч": "ch","ш": "sh","щ": "sh",
        "ю": "yu","я": "ya"
    }

    text = text.replace("дж", "j")

    return "".join(mapping.get(ch, ch) for ch in text)


def build_blob(name, category, group, size, extra=""):
    base = " ".join([
        normalize(name),
        normalize(category or ""),
        normalize(group or ""),
        normalize(str(size) if size else ""),
        normalize(extra or "")
    ])

    translit = basic_translit(base)
    translit_alt = translit.replace("k", "c")

    return f"{base} {translit} {translit_alt}"