import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReportCard } from "@/components/ReportCard";
import { CATEGORIES } from "@/constants/categories";
import { useReports } from "@/contexts/ReportsContext";
import { useColors } from "@/hooks/useColors";

export default function QuartierScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const { reports } = useReports();

  const quartierName = name ?? "Quartier";

  const local = useMemo(
    () => reports.filter((r) => r.quartier === quartierName),
    [reports, quartierName],
  );

  const stats = useMemo(() => {
    const total = local.length;
    const resolved = local.filter((r) => r.status === "resolu").length;
    const critical = local.filter((r) => r.ai.priority === "P1").length;
    const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

    const resolvedWithTime = local.filter(
      (r) => r.status === "resolu" && r.history.length > 0,
    );
    let avgHours = 0;
    if (resolvedWithTime.length > 0) {
      const sum = resolvedWithTime.reduce((acc, r) => {
        const lastEvt = r.history[r.history.length - 1];
        const created = r.createdAt;
        return acc + (lastEvt ? (lastEvt.at - created) / 3600000 : 0);
      }, 0);
      avgHours = Math.round(sum / resolvedWithTime.length);
    }

    return { total, resolved, critical, resolutionRate, avgHours };
  }, [local]);

  const topCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of local) counts[r.category] = (counts[r.category] ?? 0) + 1;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 4);
  }, [local]);

  const maxCount = topCategory[0]?.[1] ?? 1;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, maxWidth: 600, alignSelf: "center", width: "100%" }}
      >
        <LinearGradient
          colors={[colors.primary, "#2A4A75"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroKicker}>QUARTIER</Text>
          <Text style={styles.heroTitle}>{quartierName}</Text>
          <Text style={styles.heroSub}>
            {stats.total} signalement{stats.total > 1 ? "s" : ""} historique
            {stats.total > 1 ? "s" : ""} · {stats.resolutionRate}% résolus
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.resolved}</Text>
              <Text style={styles.heroStatLabel}>Résolus</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.avgHours}h</Text>
              <Text style={styles.heroStatLabel}>Délai moyen</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stats.critical}</Text>
              <Text style={styles.heroStatLabel}>Urgences</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Top problèmes signalés
          </Text>
          <View
            style={[
              styles.chartCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {topCategory.length === 0 ? (
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  paddingVertical: 12,
                }}
              >
                Aucune donnée pour ce quartier.
              </Text>
            ) : (
              topCategory.map(([catId, count]) => {
                const cat = CATEGORIES.find((c) => c.id === catId);
                if (!cat) return null;
                const ratio = count / maxCount;
                return (
                  <View key={catId} style={styles.barRow}>
                    <View style={styles.barLabel}>
                      <Feather name={cat.icon} size={14} color={cat.hue} />
                      <Text
                        style={{
                          color: colors.foreground,
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 13,
                        }}
                      >
                        {cat.label}
                      </Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${ratio * 100}%`, backgroundColor: cat.hue },
                        ]}
                      />
                    </View>
                    <Text
                      style={{
                        color: colors.foreground,
                        fontFamily: "Inter_700Bold",
                        fontSize: 13,
                        width: 26,
                        textAlign: "right",
                      }}
                    >
                      {count}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Performance de la commune
          </Text>
          <View style={styles.perfRow}>
            <PerfCard
              label="Taux de résolution"
              value={`${stats.resolutionRate}%`}
              icon="check-circle"
              color={colors.success}
            />
            <PerfCard
              label="Temps moyen"
              value={stats.avgHours > 0 ? `${stats.avgHours}h` : "—"}
              icon="clock"
              color={colors.primary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Signalements récents
          </Text>
          <View style={{ gap: 12 }}>
            {local
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 5)
              .map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            {local.length === 0 ? (
              <View
                style={[
                  styles.empty,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <Feather name="inbox" size={22} color={colors.mutedForeground} />
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                    marginTop: 8,
                  }}
                >
                  Pas encore de signalement dans ce quartier.
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PerfCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.perfCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.perfIcon, { backgroundColor: color + "15" }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text
        style={{
          color: colors.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 22,
          marginTop: 8,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: colors.mutedForeground,
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    padding: 18,
    paddingBottom: 22,
  },
  heroKicker: {
    color: "#FFFFFFCC",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    marginTop: 2,
  },
  heroSub: {
    color: "#FFFFFFCC",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 4,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
  },
  heroStatValue: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  heroStatLabel: {
    color: "#FFFFFFCC",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    marginBottom: 12,
  },
  chartCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  barLabel: {
    width: 110,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
  },
  perfRow: {
    flexDirection: "row",
    gap: 10,
  },
  perfCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  perfIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    padding: 22,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
});
