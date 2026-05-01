import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { CATEGORY_MAP, PRIORITY_META } from "@/constants/categories";
import { useColors } from "@/hooks/useColors";
import type { Report } from "@/types/report";

const ABIDJAN_BOUNDS = {
  minLat: 5.27,
  maxLat: 5.45,
  minLng: -4.12,
  maxLng: -3.93,
};

export function StylizedMap({
  reports,
  height = 360,
  selectedId,
  onSelect,
}: {
  reports: Report[];
  height?: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const colors = useColors();
  const router = useRouter();
  const { width: winWidth } = useWindowDimensions();
  const width = Math.min(winWidth - 32, 568);
  const mapHeight = Platform.OS === "web" ? 280 : height;

  const pins = useMemo(() => {
    return reports.map((r) => {
      const xRatio =
        (r.longitude - ABIDJAN_BOUNDS.minLng) /
        (ABIDJAN_BOUNDS.maxLng - ABIDJAN_BOUNDS.minLng);
      const yRatio =
        1 -
        (r.latitude - ABIDJAN_BOUNDS.minLat) /
          (ABIDJAN_BOUNDS.maxLat - ABIDJAN_BOUNDS.minLat);
      return {
        report: r,
        x: Math.max(20, Math.min(width - 40, xRatio * width)),
        y: Math.max(28, Math.min(mapHeight - 40, yRatio * mapHeight)),
      };
    });
  }, [reports, width, mapHeight]);

  return (
    <View
      style={[
        styles.container,
        {
          height: mapHeight,
          width,
          backgroundColor: colors.primary,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
      ]}
    >
      <LinearGradient
        colors={["#1E3A5F", "#2A4A75", "#1E3A5F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative grid */}
      {Array.from({ length: 8 }).map((_, i) => (
        <View
          key={`h${i}`}
          style={[
            styles.gridLine,
            { top: ((i + 1) * mapHeight) / 9, width: "100%", height: 1 },
          ]}
        />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={`v${i}`}
          style={[
            styles.gridLine,
            { left: ((i + 1) * width) / 7, height: "100%", width: 1 },
          ]}
        />
      ))}

      {/* Stylized roads */}
      <View
        style={[
          styles.road,
          {
            top: mapHeight * 0.42,
            transform: [{ rotate: "-8deg" }],
            width: width * 1.3,
            left: -width * 0.15,
          },
        ]}
      />
      <View
        style={[
          styles.road,
          {
            top: mapHeight * 0.62,
            transform: [{ rotate: "5deg" }],
            width: width * 1.3,
            left: -width * 0.15,
          },
        ]}
      />
      <View
        style={[
          styles.roadVertical,
          {
            left: width * 0.45,
            height: mapHeight * 1.2,
            top: -mapHeight * 0.1,
          },
        ]}
      />

      {/* Lagoon hint */}
      <View
        style={[
          styles.lagoon,
          {
            bottom: -20,
            right: -30,
            width: width * 0.5,
            height: mapHeight * 0.4,
            borderRadius: 200,
          },
        ]}
      />

      {/* Pins */}
      {pins.map(({ report, x, y }) => {
        const cat = CATEGORY_MAP[report.category];
        const prio = PRIORITY_META[report.ai.priority];
        const isSelected = selectedId === report.id;
        return (
          <Pressable
            key={report.id}
            onPress={() => {
              if (onSelect) onSelect(report.id);
              else router.push(`/signalement/${report.id}`);
            }}
            style={[
              styles.pin,
              {
                left: x - 18,
                top: y - 36,
                transform: [{ scale: isSelected ? 1.15 : 1 }],
              },
            ]}
          >
            {isSelected ? (
              <View
                style={[
                  styles.pulse,
                  { backgroundColor: prio.bg + "55" },
                ]}
              />
            ) : null}
            <View style={[styles.pinHead, { backgroundColor: prio.bg }]}>
              <Feather name={cat.icon} size={14} color="#fff" />
            </View>
            <View style={[styles.pinTail, { borderTopColor: prio.bg }]} />
          </Pressable>
        );
      })}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendDot, { backgroundColor: PRIORITY_META.P1.bg }]}
          />
          <Text style={styles.legendText}>P1 Urgence</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendDot, { backgroundColor: PRIORITY_META.P2.bg }]}
          />
          <Text style={styles.legendText}>P2 Rapide</Text>
        </View>
      </View>

      {/* Compass */}
      <View style={styles.compass}>
        <Feather name="navigation" size={14} color="#fff" />
        <Text style={styles.compassText}>Abidjan</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  road: {
    position: "absolute",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 4,
  },
  roadVertical: {
    position: "absolute",
    width: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 4,
  },
  lagoon: {
    position: "absolute",
    backgroundColor: "rgba(14,165,233,0.18)",
  },
  pin: {
    position: "absolute",
    alignItems: "center",
    width: 36,
  },
  pinHead: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
  pulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -12,
    left: -12,
  },
  legend: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(15,27,45,0.65)",
    borderRadius: 10,
    padding: 8,
    gap: 4,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  compass: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(15,27,45,0.65)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  compassText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
