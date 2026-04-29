import { Feather } from "@expo/vector-icons";
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
import { useReports } from "@/contexts/ReportsContext";
import { useColors } from "@/hooks/useColors";

type Sort = "recent" | "priority" | "doublons";

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reports } = useReports();
  const [sort, setSort] = useState<Sort>("recent");

  const sorted = useMemo(() => {
    const arr = [...reports];
    if (sort === "recent") arr.sort((a, b) => b.createdAt - a.createdAt);
    if (sort === "priority")
      arr.sort((a, b) => {
        const order = { P1: 0, P2: 1, P3: 2 } as const;
        return order[a.ai.priority] - order[b.ai.priority];
      });
    if (sort === "doublons") arr.sort((a, b) => b.ai.duplicates - a.ai.duplicates);
    return arr;
  }, [reports, sort]);

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
            FIL CITOYEN
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Tout ce qui bouge
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.mutedForeground }]}
          >
            Suivez en temps réel les signalements de toute la commune.
          </Text>
        </View>

        <View style={styles.tabsRow}>
          <SortTab
            label="Récents"
            icon="clock"
            active={sort === "recent"}
            onPress={() => setSort("recent")}
          />
          <SortTab
            label="Urgences IA"
            icon="zap"
            active={sort === "priority"}
            onPress={() => setSort("priority")}
          />
          <SortTab
            label="Doublons"
            icon="copy"
            active={sort === "doublons"}
            onPress={() => setSort("doublons")}
          />
        </View>

        <View style={styles.list}>
          {sorted.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function SortTab({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.sortTab,
        {
          backgroundColor: active ? colors.foreground : colors.card,
          borderColor: active ? colors.foreground : colors.border,
        },
      ]}
    >
      <Feather
        name={icon}
        size={14}
        color={active ? colors.background : colors.foreground}
      />
      <Text
        style={{
          color: active ? colors.background : colors.foreground,
          fontFamily: "Inter_600SemiBold",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
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
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sortTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  list: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
});
