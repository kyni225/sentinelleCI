import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReportCard } from "@/components/ReportCard";
import { STATUS_META } from "@/constants/categories";
import { useReports } from "@/contexts/ReportsContext";
import { useColors } from "@/hooks/useColors";

type StatusFilter = "tous" | "en_cours" | "resolus" | "urgents";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "en_cours", label: "En cours" },
  { id: "resolus", label: "Résolus" },
  { id: "urgents", label: "Urgents" },
];

export default function MyReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reports } = useReports();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("tous");

  const mine = useMemo(
    () =>
      reports
        .filter((r) => r.isMine)
        .sort((a, b) => b.createdAt - a.createdAt),
    [reports],
  );

  const counts = useMemo(() => {
    const enCours = mine.filter(
      (r) =>
        r.status === "soumis" ||
        r.status === "valide" ||
        r.status === "en_cours",
    ).length;
    const resolus = mine.filter((r) => r.status === "resolu").length;
    const urgents = mine.filter((r) => r.ai.priority === "P1").length;
    return { tous: mine.length, en_cours: enCours, resolus, urgents };
  }, [mine]);

  const filtered = useMemo(() => {
    if (activeFilter === "tous") return mine;
    if (activeFilter === "urgents")
      return mine.filter((r) => r.ai.priority === "P1");
    if (activeFilter === "resolus")
      return mine.filter((r) => r.status === "resolu");
    return mine.filter(
      (r) =>
        r.status === "soumis" ||
        r.status === "valide" ||
        r.status === "en_cours",
    );
  }, [mine, activeFilter]);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad =
    Platform.OS === "web" ? insets.bottom + 100 : insets.bottom + 100;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: topPad + 16,
          paddingBottom: bottomPad,
          maxWidth: 600,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.accent }]}>
            MON SUIVI
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Mes signalements
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Suivez le traitement et l'impact dans votre commune.
          </Text>
        </View>

        <View style={styles.summary}>
          <SummaryCard
            label="Soumis"
            value={counts.tous}
            color={colors.primary}
            icon="upload"
          />
          <SummaryCard
            label="En cours"
            value={counts.en_cours}
            color={STATUS_META.en_cours.color}
            icon="loader"
          />
          <SummaryCard
            label="Résolus"
            value={counts.resolus}
            color={STATUS_META.resolu.color}
            icon="check"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setActiveFilter(f.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.foreground : colors.card,
                    borderColor: active ? colors.foreground : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.background : colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  {f.label}
                </Text>
                <View
                  style={[
                    styles.filterBadge,
                    {
                      backgroundColor: active
                        ? "rgba(255,255,255,0.18)"
                        : colors.surfaceAlt,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? colors.background : colors.mutedForeground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 11,
                    }}
                  >
                    {counts[f.id]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {mine.length === 0 ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.surfaceAlt },
              ]}
            >
              <Feather name="inbox" size={28} color={colors.mutedForeground} />
            </View>
            <Text
              style={[styles.emptyTitle, { color: colors.foreground }]}
            >
              Aucun signalement pour l'instant
            </Text>
            <Text
              style={[
                styles.emptyText,
                { color: colors.mutedForeground },
              ]}
            >
              Repérez un nid de poule, un lampadaire éteint, une fuite d'eau ?
              Faites-le savoir à votre commune en deux minutes.
            </Text>
            <Pressable
              onPress={() => router.push("/signaler")}
              style={[styles.cta, { backgroundColor: colors.accent }]}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "Inter_700Bold",
                  fontSize: 14,
                }}
              >
                Faire mon premier signalement
              </Text>
            </Pressable>
          </View>
        ) : filtered.length === 0 ? (
          <View
            style={[
              styles.emptyFilter,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="filter" size={20} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                marginTop: 8,
              }}
            >
              Aucun signalement dans ce filtre
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Essayez un autre filtre ou créez un nouveau signalement.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ComponentProps<typeof Feather>["name"];
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.summaryCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.summaryIcon, { backgroundColor: color + "15" }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.summaryValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: "Inter_700Bold",
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    lineHeight: 19,
  },
  summary: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  summaryLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 20,
    alignItems: "center",
  },
  empty: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 19,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 6,
  },
  emptyFilter: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 22,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  list: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
});
