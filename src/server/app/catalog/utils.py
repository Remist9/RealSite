import re

CYR_TO_LAT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d",
    "е": "e", "ё": "e", "ж": "zh", "з": "z", "и": "i",
    "й": "i", "к": "k", "л": "l", "м": "m", "н": "n",
    "о": "o", "п": "p", "р": "r", "с": "s", "т": "t",
    "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "ch",
    "ш": "sh", "щ": "sh", "ы": "y", "э": "e", "ю": "u",
    "я": "a",
}

LAT_TO_CYR = {
    "zh": "ж", "ch": "ч", "sh": "ш",
    "a": "а", "b": "б", "c": "к", "d": "д",
    "e": "е", "f": "ф", "g": "г", "h": "х",
    "i": "и", "j": "дж","k": "к", "l": "л", 
    "m": "м", "n": "н","o": "о", "p": "п", 
    "r": "р", "s": "с","t": "т", "u": "у", 
    "v": "в", "y": "й",
}


def normalize(text: str) -> str:
    text = text.lower()
    text = text.replace(",", ".")
    text = re.sub(r"[^a-zа-я0-9\s\.]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def to_latin(text: str) -> str:
    result = ""
    for ch in text.lower():
        result += CYR_TO_LAT.get(ch, ch)
    return result

def to_cyrillic(text: str) -> str:
    text = text.lower()

    # сначала сложные сочетания
    for k, v in LAT_TO_CYR.items():
        text = text.replace(k, v)

    return text