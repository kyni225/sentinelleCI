import type {
  CategoryId,
  Priority,
  Severity,
} from "@/constants/categories";

const CRITICAL_KEYWORDS = [
  "danger",
  "urgent",
  "blessé",
  "blesses",
  "accident",
  "effondré",
  "effondre",
  "explosion",
  "feu",
  "incendie",
  "noyade",
  "fuite",
  "court-circuit",
  "électrocution",
  "sang",
  "mort",
  "écolier",
  "enfant",
];

const MEDIUM_KEYWORDS = [
  "trou",
  "nid",
  "cassé",
  "casse",
  "panne",
  "lampadaire",
  "fuite",
  "éteint",
  "dégradé",
  "abimé",
];

export type AIAnalysis = {
  severity: Severity;
  priority: Priority;
  duplicates: number;
  confidence: number;
  summary: string;
};

const HIGH_PRIORITY_CATEGORIES: CategoryId[] = ["sante", "securite", "eau"];

export function analyzeReport(input: {
  description: string;
  category: CategoryId;
  quartier: string;
  hasPhoto: boolean;
  similarCount?: number;
}): AIAnalysis {
  const text = input.description.toLowerCase();
  let severityScore = 1;
  if (CRITICAL_KEYWORDS.some((k) => text.includes(k))) severityScore += 2;
  if (MEDIUM_KEYWORDS.some((k) => text.includes(k))) severityScore += 1;
  if (HIGH_PRIORITY_CATEGORIES.includes(input.category)) severityScore += 1;
  if (input.hasPhoto) severityScore += 0.5;

  const severity: Severity =
    severityScore >= 4 ? "critique" : severityScore >= 2.5 ? "moyen" : "faible";

  const dupes = input.similarCount ?? 0;
  let priorityScore = severityScore + Math.min(dupes * 0.5, 2);
  if (HIGH_PRIORITY_CATEGORIES.includes(input.category)) priorityScore += 0.5;

  const priority: Priority =
    priorityScore >= 4.5 ? "P1" : priorityScore >= 2.5 ? "P2" : "P3";

  const confidence = Math.min(
    0.98,
    0.62 +
      (input.hasPhoto ? 0.18 : 0) +
      (input.description.length > 40 ? 0.1 : 0) +
      Math.min(dupes * 0.02, 0.08),
  );

  const summary = buildSummary(severity, priority, dupes, input.category);

  return {
    severity,
    priority,
    duplicates: dupes,
    confidence: Math.round(confidence * 100) / 100,
    summary,
  };
}

function buildSummary(
  severity: Severity,
  priority: Priority,
  duplicates: number,
  category: CategoryId,
): string {
  const sev =
    severity === "critique"
      ? "Gravité critique"
      : severity === "moyen"
        ? "Gravité moyenne"
        : "Gravité faible";
  const dup =
    duplicates > 0
      ? `${duplicates} signalement${duplicates > 1 ? "s" : ""} similaire${duplicates > 1 ? "s" : ""} regroupé${duplicates > 1 ? "s" : ""}`
      : "Aucun doublon détecté";
  const cat =
    category === "sante" || category === "securite" || category === "eau"
      ? " — catégorie sensible"
      : "";
  return `${sev} • Priorité ${priority}${cat} • ${dup}`;
}

export function generateBlockchainTx(): {
  txHash: string;
  blockNumber: number;
  chain: "Polygon";
  confirmedAt: number;
} {
  const hex = "0123456789abcdef";
  let h = "0x";
  for (let i = 0; i < 64; i++) h += hex[Math.floor(Math.random() * 16)];
  return {
    txHash: h,
    blockNumber: 50_000_000 + Math.floor(Math.random() * 5_000_000),
    chain: "Polygon",
    confirmedAt: Date.now() + 2000,
  };
}

export function shortHash(hash: string): string {
  if (hash.length < 12) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}
