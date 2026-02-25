// ===== JanSathi AI — Mandi Price Service =====
// Search and filter mandi prices from the embedded dataset.
// No external API — all data is local.

import { MANDI_DATA, CROP_ALIASES, type MandiPrice } from "../knowledge-bases/mandi-data";
import logger from "../utils/logger";

// ── Types ───────────────────────────────────────────────────
export interface MandiSearchResult {
    crop: string;
    cropHi: string;
    entries: MandiPrice[];
    cheapestMandi: string;
    expensiveMandi: string;
    avgModalPrice: number;
    priceRange: string;
    summary: string;
    summaryHi: string;
}

// ── Crop Name Resolution ────────────────────────────────────
function resolveCropName(query: string): string | null {
    const normalised = query.toLowerCase().trim();

    // Direct match in data
    const directMatch = MANDI_DATA.find(
        (m) => m.crop === normalised || m.cropHi === query.trim()
    );
    if (directMatch) return directMatch.crop;

    // Alias match
    if (CROP_ALIASES[normalised]) return CROP_ALIASES[normalised];
    if (CROP_ALIASES[query.trim()]) return CROP_ALIASES[query.trim()];

    // Fuzzy match — substring
    for (const entry of MANDI_DATA) {
        if (entry.crop.includes(normalised) || entry.cropHi.includes(query.trim())) {
            return entry.crop;
        }
    }

    // Check aliases for substring
    for (const [alias, cropId] of Object.entries(CROP_ALIASES)) {
        if (alias.includes(normalised) || normalised.includes(alias)) {
            return cropId;
        }
    }

    return null;
}

// ── Search by Crop ──────────────────────────────────────────
export function searchByCrop(query: string): MandiSearchResult | null {
    const cropId = resolveCropName(query);
    if (!cropId) {
        logger.debug("mandi.search.not_found", { query });
        return null;
    }

    const entries = MANDI_DATA.filter((m) => m.crop === cropId);
    if (entries.length === 0) return null;

    // Sort by modal price ascending
    const sorted = [...entries].sort((a, b) => a.modalPrice - b.modalPrice);

    const cheapest = sorted[0];
    const expensive = sorted[sorted.length - 1];
    const avgModal = Math.round(
        entries.reduce((sum, e) => sum + e.modalPrice, 0) / entries.length
    );

    const result: MandiSearchResult = {
        crop: cropId,
        cropHi: entries[0].cropHi,
        entries: sorted,
        cheapestMandi: cheapest.mandi,
        expensiveMandi: expensive.mandi,
        avgModalPrice: avgModal,
        priceRange: `₹${cheapest.modalPrice} - ₹${expensive.modalPrice}`,
        summary: `${entries[0].cropHi} (${cropId}) prices across ${entries.length} mandis. Average: ₹${avgModal}/quintal. Cheapest at ${cheapest.mandi} (₹${cheapest.modalPrice}), highest at ${expensive.mandi} (₹${expensive.modalPrice}).`,
        summaryHi: `${entries[0].cropHi} की कीमत ${entries.length} मंडियों में। औसत: ₹${avgModal}/क्विंटल। सबसे सस्ता ${cheapest.mandi} (₹${cheapest.modalPrice}), सबसे महंगा ${expensive.mandi} (₹${expensive.modalPrice})।`,
    };

    logger.debug("mandi.search.found", { crop: cropId, count: entries.length });
    return result;
}

// ── Search by State ─────────────────────────────────────────
export function searchByState(state: string): MandiPrice[] {
    const normalised = state.toLowerCase().trim();
    return MANDI_DATA.filter(
        (m) =>
            m.state.toLowerCase() === normalised ||
            m.stateHi === state.trim() ||
            m.state.toLowerCase().includes(normalised)
    ).sort((a, b) => a.crop.localeCompare(b.crop));
}

// ── Search by Mandi ─────────────────────────────────────────
export function searchByMandi(mandi: string): MandiPrice[] {
    const normalised = mandi.toLowerCase().trim();
    return MANDI_DATA.filter(
        (m) => m.mandi.toLowerCase().includes(normalised)
    ).sort((a, b) => a.crop.localeCompare(b.crop));
}

// ── Get All Available Crops ─────────────────────────────────
export function getAvailableCrops(): Array<{ crop: string; cropHi: string; mandiCount: number }> {
    const cropMap = new Map<string, { cropHi: string; count: number }>();
    for (const entry of MANDI_DATA) {
        const existing = cropMap.get(entry.crop);
        if (existing) {
            existing.count++;
        } else {
            cropMap.set(entry.crop, { cropHi: entry.cropHi, count: 1 });
        }
    }
    return Array.from(cropMap.entries())
        .map(([crop, info]) => ({ crop, cropHi: info.cropHi, mandiCount: info.count }))
        .sort((a, b) => b.mandiCount - a.mandiCount);
}

// ── Build Context for LLM ───────────────────────────────────
export function buildMandiContext(query: string): string {
    // Try crop search first
    const cropResult = searchByCrop(query);
    if (cropResult) {
        return [
            `📊 मंडी भाव — ${cropResult.cropHi} (${cropResult.crop})`,
            `औसत: ₹${cropResult.avgModalPrice}/क्विंटल`,
            `कीमत सीमा: ${cropResult.priceRange}`,
            "",
            ...cropResult.entries.map(
                (e) =>
                    `• ${e.mandi} (${e.stateHi}): ₹${e.minPrice}-${e.maxPrice}, सामान्य: ₹${e.modalPrice}/${e.unit} [${e.variety}]`
            ),
        ].join("\n");
    }

    return "";
}
