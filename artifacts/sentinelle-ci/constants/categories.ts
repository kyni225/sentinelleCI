import type { ComponentProps } from "react";
import type { Feather } from "@expo/vector-icons";

export type CategoryId =
  | "routes"
  | "eclairage"
  | "eau"
  | "ecoles"
  | "dechets"
  | "sante"
  | "securite";

export type Severity = "faible" | "moyen" | "critique";
export type Priority = "P1" | "P2" | "P3";
export type Status = "soumis" | "valide" | "en_cours" | "resolu";

export const CATEGORIES: {
  id: CategoryId;
  label: string;
  icon: ComponentProps<typeof Feather>["name"];
  hue: string;
}[] = [
  { id: "routes", label: "Routes", icon: "map", hue: "#1E3A5F" },
  { id: "eclairage", label: "Éclairage", icon: "sun", hue: "#F59E0B" },
  { id: "eau", label: "Eau", icon: "droplet", hue: "#0EA5E9" },
  { id: "ecoles", label: "Écoles", icon: "book", hue: "#7C3AED" },
  { id: "dechets", label: "Déchets", icon: "trash-2", hue: "#16A34A" },
  { id: "sante", label: "Santé", icon: "heart", hue: "#DC2626" },
  { id: "securite", label: "Sécurité", icon: "shield", hue: "#475569" },
];

export const CATEGORY_MAP: Record<CategoryId, (typeof CATEGORIES)[number]> =
  CATEGORIES.reduce(
    (acc, c) => {
      acc[c.id] = c;
      return acc;
    },
    {} as Record<CategoryId, (typeof CATEGORIES)[number]>,
  );

export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string; bg: string; emoji: string }
> = {
  faible: { label: "Faible", color: "#475569", bg: "#E2E8F0", emoji: "○" },
  moyen: { label: "Moyen", color: "#B45309", bg: "#FEF3C7", emoji: "◐" },
  critique: { label: "Critique", color: "#B91C1C", bg: "#FEE2E2", emoji: "●" },
};

export const STATUS_META: Record<
  Status,
  { label: string; color: string; bg: string }
> = {
  soumis: { label: "Soumis", color: "#475569", bg: "#E2E8F0" },
  valide: { label: "Validé", color: "#0369A1", bg: "#DBEAFE" },
  en_cours: { label: "En cours", color: "#B45309", bg: "#FEF3C7" },
  resolu: { label: "Résolu", color: "#15803D", bg: "#DCFCE7" },
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; color: string; bg: string; description: string }
> = {
  P1: {
    label: "P1",
    color: "#FFFFFF",
    bg: "#DC2626",
    description: "Urgence absolue",
  },
  P2: {
    label: "P2",
    color: "#FFFFFF",
    bg: "#F59E0B",
    description: "Intervention rapide",
  },
  P3: {
    label: "P3",
    color: "#FFFFFF",
    bg: "#475569",
    description: "Programmé",
  },
};
