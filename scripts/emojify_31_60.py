#!/usr/bin/env python3
"""Apply emoji prefixes to section headings, curiosity blocks, and activity items
for articles 31-60."""
import json, re, sys, os

PLAN = {
    "31": {
        "sections": {
            "Three Lokas and Three Primary Deities": "🌌",
            "Deities of Bhu Loka": "🌍",
            "Indra's Role — Slaying of Vritrasura": "⚡",
            "तीन लोक आणि तीन प्रमुख देवता": "🌌",
            "भू लोकातील देवता": "🌍",
            "इंद्राची भूमिका — वृत्रासुर वध": "⚡",
        },
        "activity": {
            "mr": ["🌧️", "🌅", "🔄"],
            "en": ["🌧️", "🌅", "🔄"],
        }
    },
    "32": {
        "sections": {
            "Deva — Radiance and Light": "✨",
            "Three Nadis — Three Fields of Experience": "〰️",
            "Vasu, Rudra, Aditya — Three Levels": "🔱",
            "The Complete Vedic Cycle": "🔄",
            "देव — तेज आणि प्रकाश": "✨",
            "तीन नाड्या — तीन अनुभव क्षेत्रे": "〰️",
            "वसु, रुद्र, आदित्य — तीन स्तर": "🔱",
            "संपूर्ण वैदिक चक्र": "🔄",
        },
        "activity": {
            "mr": ["🏛️", "🌅", "🌬️"],
            "en": ["🏛️", "🌅", "🌬️"],
        }
    },
    "33": {
        "sections": {
            "Why is Reconstruction Difficult?": "🔍",
            "Central Knowledge in the Puranas": "📚",
            "Distortion Without Context — The E=mc² Example": "⚠️",
            "The Count of Devas — From One to Crores": "🔢",
            "पुनर्रचना का कठीण आहे?": "🔍",
            "पुराणांमधील केंद्रीय ज्ञान": "📚",
            "संदर्भाशिवाय विकृती — E=mc² चे उदाहरण": "⚠️",
            "देवांची संख्या — एक ते कोटी": "🔢",
        },
        "activity": {
            "mr": ["📖", "📜", "💡"],
            "en": ["📖", "📜", "💡"],
        }
    },
    "34": {
        "sections": {
            "Why Were Institutions Needed?": "🏛️",
            "Institutions at the Individual Level": "🧘",
            "Institutions at the Family and Society Level": "👨‍👩‍👧",
            "Institutions at the National Level": "🏴",
            "Together — A Treasury of Intangible Heritage": "💎",
            "संस्थांची आवश्यकता का होती?": "🏛️",
            "व्यक्तिगत स्तरावरील संस्था": "🧘",
            "कुटुंब आणि समाज स्तरावरील संस्था": "👨‍👩‍👧",
            "राष्ट्रीय स्तरावरील संस्था": "🏴",
            "एकत्र — अमूर्त वारसाचा खजिना": "💎",
        },
        "activity": {
            "mr": ["💭", "🏛️", "⚖️"],
            "en": ["💭", "🏛️", "⚖️"],
        }
    },
    "35": {
        "sections": {
            "The Story of Three Sons": "👨‍👦‍👦",
            "Three Types of Samhitas": "📚",
            "Mitra Samhita — The Way of Puranas": "📖",
            "Kanta Samhita — The Way of Kavya": "🎭",
            "तीन पुत्रांची कथा": "👨‍👦‍👦",
            "तीन प्रकारच्या संहिता": "📚",
            "मित्र संहिता — पुराणांचा मार्ग": "📖",
            "कांत संहिता — काव्याचा मार्ग": "🎭",
        },
        "activity": {
            "mr": ["🎓", "🔍", "🎭"],
            "en": ["🎓", "🔍", "🎭"],
        }
    },
    "36": {
        "sections": {
            "Vidya — The Core Concept of Education": "📚",
            "Structure of the Fourteen Vidyas": "🏗️",
            "Kautilya's Fourfold Classification": "🔢",
            "64 Kalas — Skill-Based Knowledge": "🎨",
            "विद्या — शिक्षणाची केंद्रीय संकल्पना": "📚",
            "चौदा विद्यांची रचना": "🏗️",
            "कौटिल्याचे चतुर्विध वर्गीकरण": "🔢",
            "६४ कला — कौशल्यावर आधारित ज्ञान": "🎨",
        },
        "activity": {
            "mr": ["🔍", "💡", "🎨"],
            "en": ["🔍", "💡", "🎨"],
        }
    },
    "37": {
        "sections": {
            "The Vedas — Primary Means for Dharma": "📜",
            "Samhita and Brahmana — The Karma Kanda": "🔥",
            "Aranyaka and Upanishads — The Jnana Kanda": "🧘",
            "वेद — धर्माचे प्राथमिक साधन": "📜",
            "संहिता आणि ब्राह्मण — कर्मकांड": "🔥",
            "आरण्यक आणि उपनिषद — ज्ञानकांड": "🧘",
        },
        "activity": {
            "mr": ["🌸", "🧘", "📖"],
            "en": ["🌸", "🧘", "📖"],
        }
    },
    "38": {
        "sections": {
            "The Himalayan Experience — An Experiment": "🏔️",
            "What Are the Vedangas?": "📚",
            "The Six Vedangas": "6️⃣",
            "हिमालयाचा अनुभव — एक प्रयोग": "🏔️",
            "वेदांग म्हणजे काय?": "📚",
            "सहा वेदांग": "6️⃣",
        },
        "activity": {
            "mr": ["🏔️", "🎵", "🔤"],
            "en": ["🏔️", "🎵", "🔤"],
        }
    },
    "39": {
        "sections": {
            "Shiksha — The Science of Speech Production": "🗣️",
            "Four Types of Vak and the Four Vedas": "📜",
            "Vyakarana — Extracting the Meaning": "🔍",
            "Chhanda — Rhythm and Inner Experience": "🎵",
            "शिक्षा — उच्चार उत्पादनाचे शास्त्र": "🗣️",
            "वाणीचे चार प्रकार आणि चार वेद": "📜",
            "व्याकरण — अर्थ काढणे": "🔍",
            "छंद — लय आणि आंतरिक अनुभव": "🎵",
        },
        "activity": {
            "mr": ["🗣️", "🎵", "💃"],
            "en": ["🗣️", "🎵", "💃"],
        }
    },
    "40": {
        "sections": {
            "Nirukta — Finding the Root of Words": "🔤",
            "Jyotisha — Science of Time and Astronomy": "⭐",
            "Kalpa — The Science of Action": "🔥",
            "निरुक्त — शब्दांचे मूळ शोधणे": "🔤",
            "ज्योतिष — काळ आणि खगोलशास्त्र": "⭐",
            "कल्प — कर्माचे शास्त्र": "🔥",
        },
        "activity": {
            "mr": ["🗣️", "🌅", "🙌"],
            "en": ["🗣️", "🌅", "🙌"],
        }
    },
    "41": {
        "sections": {
            "Four Vedas — Four Stages of Expression": "📜",
            "Rigveda and Yajurveda": "🔥",
            "Samaveda and Atharvaveda": "🎵",
            "The Four Upavedas": "🌿",
            "चार वेद — अभिव्यक्तीचे चार टप्पे": "📜",
            "ऋग्वेद आणि यजुर्वेद": "🔥",
            "सामवेद आणि अथर्ववेद": "🎵",
            "चार उपवेद": "🌿",
        },
        "activity": {
            "mr": ["🗣️", "🌿", "🎵"],
            "en": ["🗣️", "🌿", "🎵"],
        }
    },
    "42": {
        "sections": {
            "What is Darshana?": "👁️",
            "Nastika Darshanas — Lokayata, Buddhist, Jain": "🧘",
            "Astika Darshanas — Samkhya, Yoga, Nyaya, Vaisheshika": "⚖️",
            "Mimamsa and Vedanta": "📚",
            "दर्शन म्हणजे काय?": "👁️",
            "नास्तिक दर्शने — लोकायत, बौद्ध, जैन": "🧘",
            "आस्तिक दर्शने — सांख्य, योग, न्याय, वैशेषिक": "⚖️",
            "मीमांसा आणि वेदांत": "📚",
        },
        "activity": {
            "mr": ["💭", "🔍", "🧩"],
            "en": ["💭", "🔍", "🧩"],
        }
    },
    "43": {
        "sections": {
            "Tantra and Agama — An Introduction": "🔮",
            "Two Levels of Worship": "🙏",
            "Tantra, Mantra, and Yantra": "🕉️",
            "तंत्र आणि आगम — एक परिचय": "🔮",
            "उपासनेचे दोन स्तर": "🙏",
            "तंत्र, मंत्र आणि यंत्र": "🕉️",
        },
        "activity": {
            "mr": ["🏠", "🏛️", "🌍"],
            "en": ["🏠", "🏛️", "🌍"],
        }
    },
    "44": {
        "sections": {
            "The Essence of Tantra — The Goal of Samadhi": "🧘",
            "Kundalini Shakti — The Inner Journey": "🐍",
            "Yantras in Daily Life — Rangoli": "🌸",
            "तंत्राचे सार — समाधीचे ध्येय": "🧘",
            "कुंडलिनी शक्ती — आंतरिक प्रवास": "🐍",
            "दैनंदिन जीवनातील यंत्र — रांगोळी": "🌸",
        },
        "activity": {
            "mr": ["👁️", "🌸", "🌬️"],
            "en": ["👁️", "🌸", "🌬️"],
        }
    },
    "45": {
        "sections": {
            "Four Values of Life — Purusharthas": "🎯",
            "Brahmacharya Ashrama — The Stage of Learning": "📚",
            "Grihastha Ashrama — The Peak of Manifest Life": "🏠",
            "Vanaprastha and Sannyasa": "🌿",
            "जीवनाची चार मूल्ये — पुरुषार्थ": "🎯",
            "ब्रह्मचर्याश्रम — शिक्षणाचा टप्पा": "📚",
            "गृहस्थाश्रम — व्यक्त जीवनाचा शिखर": "🏠",
            "वानप्रस्थ आणि संन्यास": "🌿",
        },
        "activity": {
            "mr": ["🎯", "⚖️", "🧘"],
            "en": ["🎯", "⚖️", "🧘"],
        }
    },
    "46": {
        "sections": {
            "Structure of the Daily Cycle": "🌅",
            "Pancha Yajna — Five Daily Sacrifices": "🔥",
            "Unattached Action — Nirmamata": "🌊",
            "दैनंदिन चक्राची रचना": "🌅",
            "पंच यज्ञ — पाच दैनंदिन यज्ञ": "🔥",
            "अनासक्त कर्म — निर्ममता": "🌊",
        },
        "activity": {
            "mr": ["🌅", "🔥", "🧘"],
            "en": ["🌅", "🔥", "🧘"],
        }
    },
    "47": {
        "sections": {
            "Annual Cycles of the Seasons": "🍂",
            "Sharada and Dipavali — Festivals of Light": "🪔",
            "Time Cycles and Auspicious Convergences": "⭐",
            "ऋतूंची वार्षिक चक्रे": "🍂",
            "शारदा आणि दीपावली — प्रकाशाचे उत्सव": "🪔",
            "काळ चक्रे आणि शुभ मिलन": "⭐",
        },
        "activity": {
            "mr": ["🎉", "👴", "📅"],
            "en": ["🎉", "👴", "📅"],
        }
    },
    "48": {
        "sections": {
            "The Cyclist and Balance": "🚴",
            "Purpose of Samskaras": "🌱",
            "Method of Samskara — Yajna-like Karma": "🔥",
            "सायकलस्वार आणि समतोल": "🚴",
            "संस्कारांचा उद्देश": "🌱",
            "संस्काराची पद्धत — यज्ञसदृश कर्म": "🔥",
        },
        "activity": {
            "mr": ["🌿", "🙏", "🔍"],
            "en": ["🌿", "🙏", "🔍"],
        }
    },
    "49": {
        "sections": {
            "What Happens When We Listen to Music?": "🎵",
            "Nine Rasas — The Universe of Emotions": "🌈",
            "Manoranjanam — Filling the Mind with Colour": "🎨",
            "Sixty-Four Kalas — Vehicles of Life's Cycle": "🎭",
            "संगीत ऐकताना काय होते?": "🎵",
            "नव रस — भावनांचे विश्व": "🌈",
            "मनोरंजनम् — मनात रंग भरणे": "🎨",
            "चौसष्ट कला — जीवन चक्राची वाहने": "🎭",
        },
        "activity": {
            "mr": ["🎵", "🎬", "🎨"],
            "en": ["🎵", "🎬", "🎨"],
        }
    },
    "50": {
        "sections": {
            "Yajnavedika to Temple — A Thread of Continuity": "🧵",
            "Temple Architecture — Replica of Pindanda-Brahmanda": "🏛️",
            "Temple — A Miniature of the Cosmos": "🌌",
            "Daily Rituals — Echo of the Cosmic Cycle": "🔄",
            "Sadhana and Festivals in the Temple": "🪔",
            "यज्ञवेदिका ते मंदिर — सातत्याचा धागा": "🧵",
            "मंदिर स्थापत्य — पिंडांड-ब्रह्मांडाची प्रतिकृती": "🏛️",
            "मंदिर — विश्वाचे लघुरूप": "🌌",
            "दैनंदिन विधी — वैश्विक चक्राची प्रतिध्वनी": "🔄",
            "मंदिरात साधना आणि उत्सव": "🪔",
        },
        "activity": {
            "mr": ["🏛️", "🔔", "🔄"],
            "en": ["🏛️", "🔔", "🔄"],
        }
    },
    "51": {
        "sections": {
            "Tirtha — To Cross Over": "🌉",
            "Sapta Mokshapur and Sacred Sites": "🗺️",
            "Geography and its Relation to Dharma": "🌍",
            "तीर्थ — पार होणे": "🌉",
            "सप्त मोक्षपूर आणि पवित्र स्थळे": "🗺️",
            "भूगोल आणि धर्माशी त्याचा संबंध": "🌍",
        },
        "activity": {
            "mr": ["🌿", "🗺️", "🙏"],
            "en": ["🌿", "🗺️", "🙏"],
        }
    },
    "52": {
        "sections": {
            "The King's Two Kingdoms": "👑",
            "Brahmadanda — The Inner Principle of Governance": "⚖️",
            "Danda Is Not Retribution": "🌱",
            "राजाची दोन राज्ये": "👑",
            "ब्रह्मदंड — शासनाचे आंतरिक तत्त्व": "⚖️",
            "दंड हा प्रतिशोध नाही": "🌱",
        },
        "activity": {
            "mr": ["🔍", "👀", "🤔"],
            "en": ["🔍", "👀", "🤔"],
        }
    },
    "53": {
        "sections": {
            "Bharat — A Form of Prakriti": "🌿",
            "The Geo-Spiritual Map of Bharatadevi": "🗺️",
            "Bharat — Mother, Nation-State, and Liberating Sacred Land": "🇮🇳",
            "भारत — प्रकृतीचे एक रूप": "🌿",
            "भारतदेवीचा भू-आध्यात्मिक नकाशा": "🗺️",
            "भारत — माता, राष्ट्र-राज्य आणि मुक्तिदायी पवित्र भूमी": "🇮🇳",
        },
        "activity": {
            "mr": ["🗺️", "🌏", "📚"],
            "en": ["🗺️", "🌏", "📚"],
        }
    },
    "54": {
        "sections": {
            "Balance on the Circular Track": "⚖️",
            "Nature of the Three Gunas": "🔱",
            "Trimurti and the Trigunas": "🙏",
            "वर्तुळाकार मार्गावर समतोल": "⚖️",
            "तीन गुणांचे स्वरूप": "🔱",
            "त्रिमूर्ती आणि त्रिगुण": "🙏",
        },
        "activity": {
            "mr": ["🌅", "💭", "📖"],
            "en": ["🌅", "💭", "📖"],
        }
    },
    "55": {
        "sections": {
            "Multiple Meanings of Dharma": "☸️",
            "Shastra — The Codex of Dharma": "📜",
            "धर्माचे अनेक अर्थ": "☸️",
            "शास्त्र — धर्माचे संहितापत्र": "📜",
        },
        "activity": {
            "mr": ["💭", "📋", "💡"],
            "en": ["💭", "📋", "💡"],
        }
    },
    "56": {
        "sections": {
            "Karma is Not Divine Retribution": "⚖️",
            "Papa, Punya, and Prayaschitta": "🌱",
            "कर्म हे दैवी शिक्षा नाही": "⚖️",
            "पाप, पुण्य आणि प्रायश्चित्त": "🌱",
        },
        "activity": {
            "mr": ["⚖️", "🔍", "💡"],
            "en": ["⚖️", "🔍", "💡"],
        }
    },
    "57": {
        "sections": {
            "Summary of the Four Chakras": "🔄",
            "IKS-Inspired Science and Technology": "🔬",
            "चार चक्रांचा सारांश": "🔄",
            "IKS-प्रेरित विज्ञान आणि तंत्रज्ञान": "🔬",
        },
        "activity": {
            "mr": ["💡", "🔬", "🌐"],
            "en": ["💡", "🔬", "🌐"],
        }
    },
    "58": {
        "sections": {
            "Problem Statement": "❓",
            "IKS Analysis": "🔍",
            "Evaluation Methods": "📊",
            "समस्या विधान": "❓",
            "IKS विश्लेषण": "🔍",
            "मूल्यमापन पद्धती": "📊",
        },
        "activity": {
            "mr": ["🎧", "🎵", "💡"],
            "en": ["🎧", "🎵", "💡"],
        }
    },
    "59": {
        "sections": {
            "Problem Statement": "❓",
            "IKS Analysis": "🔍",
            "Components of the Action Plan": "🌿",
            "समस्या विधान": "❓",
            "IKS विश्लेषण": "🔍",
            "कृती योजनेचे घटक": "🌿",
        },
        "activity": {
            "mr": ["🛑", "🌱", "🏥"],
            "en": ["🛑", "🌱", "🏥"],
        }
    },
    "60": {
        "sections": {
            "Problem Statement": "❓",
            "Structure of the Step Arrangement": "🪜",
            "IKS Analysis": "🔍",
            "समस्या विधान": "❓",
            "पायऱ्यांच्या मांडणीची रचना": "🪜",
            "IKS विश्लेषण": "🔍",
        },
        "activity": {
            "mr": ["🪜", "🔍", "🏛️"],
            "en": ["🪜", "🔍", "🏛️"],
        }
    },
}

def already_has_emoji(text):
    """Check if text already starts with an emoji."""
    if not text:
        return False
    # Rough check: if first char has high codepoint it's likely emoji
    return ord(text[0]) > 127

def add_emoji(text, emoji):
    if not text or already_has_emoji(text):
        return text
    return emoji + " " + text

def process_article(num):
    path = f"articles/{num}/content.json"
    if not os.path.exists(path):
        print(f"  SKIP {num}: no content.json")
        return False

    plan = PLAN.get(num, {})
    if not plan:
        print(f"  SKIP {num}: no plan")
        return False

    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    section_map = plan.get("sections", {})
    act_emojis = plan.get("activity", {})
    changed = False

    for block in data.get("body", []):
        btype = block.get("type")

        # Section headings
        if btype == "section":
            for field in ["headEn", "headMr"]:
                val = block.get(field, "")
                # Strip emoji prefix to look up in map
                stripped = val.lstrip()
                # Remove leading emoji chars for lookup
                clean = stripped
                for k in section_map:
                    if clean == k or clean.endswith(k) or clean.startswith(k):
                        emoji = section_map[k]
                        if not already_has_emoji(clean):
                            block[field] = emoji + " " + clean
                            changed = True
                        break
                # Also try exact match after stripping emoji
                if val and not already_has_emoji(val):
                    for k, emoji in section_map.items():
                        if val == k:
                            block[field] = emoji + " " + val
                            changed = True
                            break

        # Curiosity
        if btype == "curiosity":
            for lang in ["mr", "en"]:
                val = block.get(lang, "")
                if val and not already_has_emoji(val):
                    block[lang] = "🌟 " + val
                    changed = True

        # Activity
        if btype == "activity":
            for lang in ["mr", "en"]:
                items = block.get(lang, [])
                emojis = act_emojis.get(lang, [])
                new_items = []
                for i, item in enumerate(items):
                    if item and not already_has_emoji(item) and i < len(emojis):
                        new_items.append(emojis[i] + " " + item)
                        changed = True
                    else:
                        new_items.append(item)
                if new_items:
                    block[lang] = new_items

    if changed:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  ✓ {num}: updated")
    else:
        print(f"  ~ {num}: no changes")
    return changed

if __name__ == "__main__":
    articles = [str(n) for n in range(31, 61)]
    for num in articles:
        process_article(num)
    print("Done.")
