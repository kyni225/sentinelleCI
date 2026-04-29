import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  BlockchainBadge,
  PriorityBadge,
  SeverityBadge,
  StatusBadge,
} from "@/components/Badges";
import { CATEGORY_MAP } from "@/constants/categories";
import { useColors } from "@/hooks/useColors";
import { shortHash } from "@/lib/ai";
import type { Report } from "@/types/report";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function ReportCard({ report }: { report: Report }) {
  const colors = useColors();
  const router = useRouter();
  const cat = CATEGORY_MAP[report.category];

  return (
    <Pressable
      onPress={() => router.push(`/signalement/${report.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[styles.iconWrap, { backgroundColor: cat.hue + "15" }]}
        >
          <Feather name={cat.icon} size={18} color={cat.hue} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.category, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {cat.label} · {report.quartier}
          </Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>
            {timeAgo(report.createdAt)} · {report.authorPseudo}
          </Text>
        </View>
        <PriorityBadge priority={report.ai.priority} />
      </View>

      <Text
        style={[styles.description, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {report.description}
      </Text>

      <View style={styles.badgeRow}>
        <StatusBadge status={report.status} size="sm" />
        <SeverityBadge severity={report.ai.severity} />
        {report.ai.duplicates > 0 ? (
          <View
            style={[
              styles.duplicate,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}
          >
            <Feather name="copy" size={11} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 11,
              }}
            >
              +{report.ai.duplicates} similaires
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={[styles.footer, { borderTopColor: colors.border }]}
      >
        <View style={styles.footerLeft}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text
            style={[styles.address, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {report.address}
          </Text>
        </View>
        <View style={styles.footerRight}>
          <BlockchainBadge short={shortHash(report.blockchain.txHash)} />
          <View style={styles.upvotes}>
            <Feather name="arrow-up" size={13} color={colors.primary} />
            <Text
              style={{
                color: colors.primary,
                fontFamily: "Inter_700Bold",
                fontSize: 12,
              }}
            >
              {report.upvotes}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  category: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  time: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 19,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  duplicate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  address: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    flex: 1,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  upvotes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
});
