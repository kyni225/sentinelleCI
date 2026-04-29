import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useProfile } from "@/contexts/ProfileContext";
import { useReports } from "@/contexts/ReportsContext";
import { useColors } from "@/hooks/useColors";

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, toggleAnonymous } = useProfile();
  const { reports } = useReports();

  const stats = useMemo(() => {
    const mine = reports.filter((r) => r.isMine);
    const resolved = mine.filter((r) => r.status === "resolu").length;
    const upvotes = mine.reduce((sum, r) => sum + r.upvotes, 0);
    return {
      reports: mine.length,
      resolved,
      upvotes,
    };
  }, [reports]);

  const { current, next, progress } = useMemo(() => {
    const rep = profile.reputation;
    let lower = 0;
    let upper = 100;
    for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
      const t = LEVEL_THRESHOLDS[i] ?? 0;
      const n = LEVEL_THRESHOLDS[i + 1] ?? t + 100;
      if (rep >= t && rep < n) {
        lower = t;
        upper = n;
        break;
      }
      if (rep >= (LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] ?? 0)) {
        lower = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] ?? 0;
        upper = lower + 500;
      }
    }
    return {
      current: lower,
      next: upper,
      progress: Math.min(1, (rep - lower) / (upper - lower)),
    };
  }, [profile.reputation]);

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
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile.pseudo
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName}>{profile.pseudo}</Text>
                <View style={styles.heroMeta}>
                  <Feather name="map-pin" size={12} color="#FFFFFFAA" />
                  <Text style={styles.heroMetaText}>
                    Commune de {profile.commune}
                  </Text>
                </View>
              </View>
              <View style={styles.verifiedBadge}>
                <Feather name="check" size={12} color="#fff" />
              </View>
            </View>

            <View style={styles.repBlock}>
              <Text style={styles.repLabel}>Score de réputation</Text>
              <View style={styles.repRow}>
                <Text style={styles.repValue}>{profile.reputation}</Text>
                <View style={styles.repLevelTag}>
                  <Feather name="star" size={11} color={colors.accent} />
                  <Text style={styles.repLevelText}>{profile.level}</Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.max(0, next - profile.reputation)} points avant le
                prochain niveau · {current} → {next}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsRow}>
          <StatTile
            value={stats.reports}
            label="Signalements"
            icon="upload"
            color={colors.primary}
          />
          <StatTile
            value={stats.resolved}
            label="Résolus grâce à vous"
            icon="check-circle"
            color={colors.success}
          />
          <StatTile
            value={stats.upvotes}
            label="Soutiens reçus"
            icon="thumbs-up"
            color={colors.accent}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Vos badges
        </Text>
        <View style={styles.badges}>
          <BadgeItem
            unlocked
            icon="award"
            title="Premier signalement"
            description="Vous avez fait entendre votre voix."
          />
          <BadgeItem
            unlocked
            icon="eye"
            title="Témoin fiable"
            description="Vos signalements sont confirmés."
          />
          <BadgeItem
            unlocked={profile.reputation >= 500}
            icon="shield"
            title="Vigie de quartier"
            description="500 points atteints."
          />
          <BadgeItem
            unlocked={profile.reputation >= 1000}
            icon="zap"
            title="Gardien de la cité"
            description="1000 points : voix qui porte."
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Confidentialité
        </Text>
        <View
          style={[
            styles.privacyCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.privacyIcon,
              {
                backgroundColor: profile.anonymousMode
                  ? colors.primary
                  : colors.surfaceAlt,
              },
            ]}
          >
            <Feather
              name={profile.anonymousMode ? "eye-off" : "user"}
              size={18}
              color={profile.anonymousMode ? "#fff" : colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 14,
              }}
            >
              Signalement anonyme
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                marginTop: 2,
                lineHeight: 16,
              }}
            >
              {profile.anonymousMode
                ? "Vos prochains signalements seront publiés sous « Citoyen anonyme »."
                : "Vos signalements affichent votre pseudo public."}
            </Text>
          </View>
          <Switch
            value={profile.anonymousMode}
            onValueChange={() => toggleAnonymous()}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Réglages
        </Text>
        <View
          style={[
            styles.settings,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="bell"
            label="Notifications push"
            value="Activées"
          />
          <Divider />
          <SettingRow icon="globe" label="Langue" value="Français" />
          <Divider />
          <SettingRow icon="lock" label="Données blockchain" value="Polygon" />
          <Divider />
          <Pressable
            onPress={() => router.push(`/quartier/${profile.commune}`)}
            style={styles.settingRow}
          >
            <View
              style={[styles.settingIcon, { backgroundColor: colors.surfaceAlt }]}
            >
              <Feather name="bar-chart-2" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                }}
              >
                Voir mon quartier
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  marginTop: 1,
                }}
              >
                Statistiques et historique de {profile.commune}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        </View>

        <View
          style={[
            styles.about,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <View style={styles.aboutHeader}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text
              style={{
                color: colors.primary,
                fontFamily: "Inter_700Bold",
                fontSize: 12,
                letterSpacing: 1,
              }}
            >
              À PROPOS DE LA RÉPUTATION
            </Text>
          </View>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              lineHeight: 19,
              marginTop: 8,
            }}
          >
            Votre score augmente quand vos signalements sont validés et résolus.
            Il diminue en cas de faux signalement. Un score élevé donne plus de
            poids à vos alertes auprès de la commune.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatTile({
  value,
  label,
  icon,
  color,
}: {
  value: number;
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statTile,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.statTileIcon, { backgroundColor: color + "15" }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.statTileValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statTileLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function BadgeItem({
  icon,
  title,
  description,
  unlocked,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  description: string;
  unlocked: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.badgeItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: unlocked ? 1 : 0.5,
        },
      ]}
    >
      <View
        style={[
          styles.badgeIcon,
          {
            backgroundColor: unlocked ? colors.accent : colors.surfaceAlt,
          },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={unlocked ? "#fff" : colors.mutedForeground}
        />
      </View>
      <Text
        style={{
          color: colors.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 12,
          textAlign: "center",
          marginTop: 8,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.mutedForeground,
          fontFamily: "Inter_400Regular",
          fontSize: 11,
          textAlign: "center",
          marginTop: 2,
          lineHeight: 14,
        }}
        numberOfLines={2}
      >
        {description}
      </Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.settingRow}>
      <View
        style={[styles.settingIcon, { backgroundColor: colors.surfaceAlt }]}
      >
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          color: colors.mutedForeground,
          fontFamily: "Inter_500Medium",
          fontSize: 13,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroWrap: {
    paddingHorizontal: 16,
  },
  hero: {
    borderRadius: 22,
    padding: 18,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  heroName: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  heroMetaText: {
    color: "#FFFFFFCC",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  verifiedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  repBlock: {
    marginTop: 18,
  },
  repLabel: {
    color: "#FFFFFFCC",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
  },
  repRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  repValue: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 40,
  },
  repLevelTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 8,
  },
  repLevelText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    color: "#FFFFFFAA",
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statTile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  statTileIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statTileValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  statTileLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
  },
  badgeItem: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  privacyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  settings: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    marginLeft: 58,
  },
  about: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  aboutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
