import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import {
  CATEGORY_MAP,
  PRIORITY_META,
  SEVERITY_META,
  STATUS_META,
  type CategoryId,
  type Priority,
  type Severity,
  type Status,
} from "@/constants/categories";
import { useColors } from "@/hooks/useColors";

export function StatusBadge({
  status,
  size = "md",
}: {
  status: Status;
  size?: "sm" | "md";
}) {
  const meta = STATUS_META[status];
  const padV = size === "sm" ? 3 : 5;
  const padH = size === "sm" ? 8 : 10;
  const fontSize = size === "sm" ? 11 : 12;
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: meta.bg,
          paddingVertical: padV,
          paddingHorizontal: padH,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text
        style={{ color: meta.color, fontSize, fontFamily: "Inter_600SemiBold" }}
      >
        {meta.label}
      </Text>
    </View>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <View style={[styles.pill, { backgroundColor: meta.bg }]}>
      <Text
        style={{
          color: meta.color,
          fontSize: 12,
          fontFamily: "Inter_600SemiBold",
        }}
      >
        Gravité {meta.label}
      </Text>
    </View>
  );
}

export function PriorityBadge({
  priority,
  withDescription = false,
}: {
  priority: Priority;
  withDescription?: boolean;
}) {
  const meta = PRIORITY_META[priority];
  return (
    <View style={[styles.pill, { backgroundColor: meta.bg }]}>
      <Feather name="zap" size={12} color={meta.color} />
      <Text
        style={{
          color: meta.color,
          fontSize: 12,
          fontFamily: "Inter_700Bold",
        }}
      >
        {meta.label}
        {withDescription ? ` · ${meta.description}` : ""}
      </Text>
    </View>
  );
}

export function CategoryChip({
  category,
  active,
  onPress,
}: {
  category: CategoryId;
  active?: boolean;
  onPress?: () => void;
}) {
  const colors = useColors();
  const meta = CATEGORY_MAP[category];
  const bg = active ? meta.hue : colors.card;
  const fg = active ? "#fff" : colors.foreground;
  const borderColor = active ? meta.hue : colors.border;
  return (
    <View
      onTouchEnd={onPress}
      style={[
        styles.categoryChip,
        { backgroundColor: bg, borderColor, borderRadius: 999 },
      ]}
    >
      <Feather name={meta.icon} size={14} color={fg} />
      <Text
        style={{ color: fg, fontFamily: "Inter_600SemiBold", fontSize: 13 }}
      >
        {meta.label}
      </Text>
    </View>
  );
}

export function BlockchainBadge({ short }: { short: string }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.blockchainBadge,
        { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
      ]}
    >
      <Feather name="link" size={11} color={colors.primary} />
      <Text
        style={{
          color: colors.primary,
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
        }}
      >
        {short}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  blockchainBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
});
