import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BlockchainBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/Badges";
import { StylizedMap } from "@/components/MapView";
import {
  CATEGORIES,
  CATEGORY_MAP,
  type CategoryId,
} from "@/constants/categories";
import { useReports } from "@/contexts/ReportsContext";
import { useColors } from "@/hooks/useColors";
import { shortHash } from "@/lib/ai";

export default function MapScreen() {
  const colors = useColors();
  const router = useRouter();
  const { reports, crisisMode } = useReports();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [crisisFilter, setCrisisFilter] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let r = reports;
    if (filter !== "all") r = r.filter((x) => x.category === filter);
    if (crisisFilter) r = r.filter((x) => x.ai.priority === "P1");
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      r = r.filter(
        (x) =>
          x.number.toLowerCase().includes(q) ||
          x.quartier.toLowerCase().includes(q) ||
          x.address.toLowerCase().includes(q),
      );
    }
    return r;
  }, [reports, filter, crisisFilter, search]);

  const selected = selectedId
    ? reports.find((r) => r.id === selectedId)
    : null;

  const stats = useMemo(() => {
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === "resolu").length;
    const critical = reports.filter((r) => r.ai.priority === "P1").length;
    return { total, resolved, critical };
  }, [reports]);

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
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.accent }]}>
              CARTE PUBLIQUE
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Tous les signalements
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.mutedForeground }]}
            >
              Vérifiés, datés et tracés sur blockchain.
            </Text>
          </View>
          <Pressable
            onPress={() => setCrisisFilter((v) => !v)}
            style={[
              styles.crisisToggle,
              {
                backgroundColor: crisisFilter
                  ? colors.destructive
                  : colors.card,
                borderColor: crisisFilter ? colors.destructive : colors.border,
              },
            ]}
          >
            <Feather
              name="alert-triangle"
              size={16}
              color={crisisFilter ? "#fff" : colors.destructive}
            />
            <Text
              style={{
                color: crisisFilter ? "#fff" : colors.destructive,
                fontFamily: "Inter_700Bold",
                fontSize: 12,
              }}
            >
              {crisisFilter ? "Mode crise" : "Mode crise"}
            </Text>
          </Pressable>
        </View>

        {crisisMode ? (
          <View
            style={[
              styles.crisisLive,
              { backgroundColor: colors.destructive + "12", borderColor: colors.destructive },
            ]}
          >
            <Feather name="radio" size={14} color={colors.destructive} />
            <Text
              style={{
                color: colors.destructive,
                fontFamily: "Inter_700Bold",
                fontSize: 12,
                flex: 1,
              }}
            >
              Mode crise actif · {stats.critical} urgences signalées
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher #S001, quartier, rue..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <StatBox
            label="Signalements"
            value={stats.total}
            icon="layers"
            color={colors.primary}
          />
          <StatBox
            label="Résolus"
            value={stats.resolved}
            icon="check-circle"
            color={colors.success}
          />
          <StatBox
            label="Urgences IA"
            value={stats.critical}
            icon="zap"
            color={colors.destructive}
          />
        </View>

        <View style={styles.filtersWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            <FilterChip
              label="Tout"
              icon="grid"
              active={filter === "all"}
              onPress={() => setFilter("all")}
              accent={colors.primary}
            />
            {CATEGORIES.map((c) => (
              <FilterChip
                key={c.id}
                label={c.label}
                icon={c.icon}
                active={filter === c.id}
                onPress={() => setFilter(c.id)}
                accent={c.hue}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.mapWrap}>
          <StylizedMap
            reports={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </View>

        {selected ? (
          <View
            style={[
              styles.selectedCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.selectedTop}>
              <View
                style={[
                  styles.selectedIcon,
                  {
                    backgroundColor:
                      CATEGORY_MAP[selected.category].hue + "15",
                  },
                ]}
              >
                <Feather
                  name={CATEGORY_MAP[selected.category].icon}
                  size={18}
                  color={CATEGORY_MAP[selected.category].hue}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontFamily: "Inter_700Bold",
                    fontSize: 11,
                  }}
                >
                  #{selected.number}
                </Text>
                <Text
                  style={[
                    styles.selectedTitle,
                    { color: colors.foreground },
                  ]}
                >
                  {CATEGORY_MAP[selected.category].label} · {selected.quartier}
                </Text>
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {selected.address}
                </Text>
              </View>
              <PriorityBadge priority={selected.ai.priority} />
            </View>
            <Text
              style={[
                styles.selectedDesc,
                { color: colors.foreground },
              ]}
              numberOfLines={3}
            >
              {selected.description}
            </Text>
            <View style={styles.selectedRow}>
              <StatusBadge status={selected.status} size="sm" />
              <BlockchainBadge short={shortHash(selected.blockchain.txHash)} />
              <View style={{ flex: 1 }} />
              <Pressable
                onPress={() => router.push(`/signalement/${selected.id}`)}
                style={[
                  styles.detailBtn,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: "Inter_700Bold",
                    fontSize: 13,
                  }}
                >
                  Détails
                </Text>
                <Feather name="arrow-right" size={14} color="#fff" />
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.hintCard,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}
          >
            <Feather name="info" size={16} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                flex: 1,
              }}
            >
              Touchez un point sur la carte pour voir le signalement.
            </Text>
          </View>
        )}

        <View style={styles.legendCard}>
          <Text
            style={[styles.legendTitle, { color: colors.foreground }]}
          >
            Légende des priorités
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 13,
              fontFamily: "Inter_400Regular",
              marginTop: 4,
              lineHeight: 18,
            }}
          >
            L'intelligence artificielle classe chaque signalement selon la
            gravité, le contexte et le nombre de citoyens qui le confirment.
          </Text>
          <View style={styles.legendRows}>
            <LegendRow
              color="#DC2626"
              title="P1 — Urgence absolue"
              text="Risque immédiat pour la vie ou la sécurité publique."
            />
            <LegendRow
              color="#F59E0B"
              title="P2 — Intervention rapide"
              text="Doit être traité dans les 48 h pour éviter une dégradation."
            />
            <LegendRow
              color="#475569"
              title="P3 — Programmé"
              text="Maintenance courante, sans danger immédiat."
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatBox({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statBox,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
        <Feather name={icon} size={14} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function FilterChip({
  label,
  icon,
  active,
  onPress,
  accent,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  active: boolean;
  onPress: () => void;
  accent: string;
}) {
  const colors = useColors();
  const bg = active ? accent : colors.card;
  const fg = active ? "#fff" : colors.foreground;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        {
          backgroundColor: bg,
          borderColor: active ? accent : colors.border,
        },
      ]}
    >
      <Feather name={icon} size={14} color={fg} />
      <Text
        style={{
          color: fg,
          fontFamily: "Inter_600SemiBold",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function LegendRow({
  color,
  title,
  text,
}: {
  color: string;
  title: string;
  text: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendBar, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Inter_700Bold",
            fontSize: 13,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            marginTop: 1,
          }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    gap: 12,
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
  crisisToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  crisisLive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingVertical: 0,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },
  filtersWrap: {
    marginTop: 18,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  mapWrap: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  selectedCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  selectedTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectedIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  selectedDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 19,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  hintCard: {
    marginHorizontal: 16,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  legendCard: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
  },
  legendTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  legendRows: {
    marginTop: 14,
    gap: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  legendBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginTop: 2,
  },
});
