import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
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

export default function MyReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reports } = useReports();

  const mine = useMemo(
    () => reports.filter((r) => r.isMine).sort((a, b) => b.createdAt - a.createdAt),
    [reports],
  );

  const breakdown = useMemo(() => {
    const total = mine.length;
    const enCours = mine.filter(
      (r) => r.status === "valide" || r.status === "en_cours",
    ).length;
    const resolus = mine.filter((r) => r.status === "resolu").length;
    return { total, enCours, resolus };
  }, [mine]);

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
        }}
      >
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.accent }]}>
            MES SIGNALEMENTS
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Mon suivi
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Suivez le traitement de vos signalements et l'impact sur votre
            quartier.
          </Text>
        </View>

        <View style={styles.summary}>
          <SummaryCard
            label="Soumis"
            value={breakdown.total}
            color={colors.primary}
            icon="upload"
          />
          <SummaryCard
            label="En cours"
            value={breakdown.enCours}
            color={STATUS_META.en_cours.color}
            icon="loader"
          />
          <SummaryCard
            label="Résolus"
            value={breakdown.resolus}
            color={STATUS_META.resolu.color}
            icon="check"
          />
        </View>

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
        ) : (
          <View style={styles.list}>
            {mine.map((r) => (
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
    fontSize: 28,
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
  list: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
});
