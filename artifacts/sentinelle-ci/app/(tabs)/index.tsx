import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReportCard } from "@/components/ReportCard";
import { useProfile } from "@/contexts/ProfileContext";
import { useReports } from "@/contexts/ReportsContext";
import { useColors } from "@/hooks/useColors";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { reports, crisisMode, crisisQuartiers } = useReports();
  const [crisisDismissed, setCrisisDismissed] = useState(false);

  const myStats = useMemo(() => {
    const mine = reports.filter((r) => r.isMine);
    const enCours = mine.filter(
      (r) => r.status === "soumis" || r.status === "valide" || r.status === "en_cours",
    ).length;
    const resolus = mine.filter((r) => r.status === "resolu").length;
    return { total: mine.length, enCours, resolus };
  }, [reports]);

  const nearby = useMemo(() => {
    const sorted = [...reports].sort((a, b) => b.createdAt - a.createdAt);
    const local = sorted.filter((r) => r.quartier === profile.commune);
    if (local.length >= 4) return local.slice(0, 5);
    const others = sorted.filter((r) => r.quartier !== profile.commune);
    return [...local, ...others].slice(0, 5);
  }, [reports, profile.commune]);

  const showCrisisInMyArea =
    crisisMode &&
    crisisQuartiers.includes(profile.commune) &&
    !crisisDismissed;

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad =
    Platform.OS === "web" ? insets.bottom + 100 : insets.bottom + 100;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          maxWidth: 600,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <View style={styles.heroBg}>
          <View style={styles.brandRow}>
            <View style={styles.brandLeft}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.logoImage}
              />
              <View>
                <Text
                  style={[styles.brandName, { color: colors.foreground }]}
                >
                  SentinelleCI
                </Text>
                <Text
                  style={[
                    styles.brandTagline,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Votre voix, votre commune
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.communePill,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="map-pin" size={11} color={colors.primary} />
              <Text style={[styles.communeText, { color: colors.primary }]}>
                {profile.commune}
              </Text>
            </View>
          </View>

          <Text style={[styles.greeting, { color: colors.foreground }]}>
            {getGreeting()}, {profile.firstName}
          </Text>
          <Text
            style={[styles.greetingSub, { color: colors.mutedForeground }]}
          >
            Votre quartier compte sur vos yeux aujourd'hui.
          </Text>
        </View>

        {showCrisisInMyArea ? (
          <Pressable
            onPress={() => setCrisisDismissed(true)}
            style={[
              styles.crisisBanner,
              { backgroundColor: colors.destructive },
            ]}
          >
            <View style={styles.crisisIcon}>
              <Feather name="alert-triangle" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.crisisTitle}>Mode crise activé</Text>
              <Text style={styles.crisisText}>
                Plusieurs urgences détectées à {profile.commune} ces dernières
                heures. Touchez pour fermer.
              </Text>
            </View>
            <View style={styles.crisisClose}>
              <Feather name="x" size={16} color="#fff" />
            </View>
          </Pressable>
        ) : null}

        <View style={styles.statsRow}>
          <StatCard
            label="Mes signalements"
            value={myStats.total}
            color={colors.primary}
            icon="layers"
          />
          <StatCard
            label="En cours"
            value={myStats.enCours}
            color={colors.warning}
            icon="loader"
          />
          <StatCard
            label="Résolus"
            value={myStats.resolus}
            color={colors.success}
            icon="check-circle"
          />
        </View>

        <Pressable
          onPress={() => router.push("/signaler")}
          style={({ pressed }) => [
            styles.bigCta,
            {
              backgroundColor: colors.accent,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
              shadowColor: colors.accent,
            },
          ]}
        >
          <View style={styles.bigCtaIcon}>
            <Feather name="plus" size={22} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bigCtaTitle}>Signaler un problème</Text>
            <Text style={styles.bigCtaSub}>
              Photo, lieu, description — 30 secondes
            </Text>
          </View>
          <Feather name="arrow-right" size={20} color="#fff" />
        </Pressable>

        <View style={styles.quickRow}>
          <QuickAction
            icon="map"
            label="Carte"
            onPress={() => router.push("/carte")}
          />
          <QuickAction
            icon="inbox"
            label="Mon suivi"
            onPress={() => router.push("/mes-signalements")}
          />
          <QuickAction
            icon="bar-chart-2"
            label={profile.commune}
            onPress={() => router.push(`/quartier/${profile.commune}`)}
          />
        </View>

        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Près de chez vous
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                marginTop: 2,
              }}
            >
              Signalements récents à {profile.commune} et alentours
            </Text>
          </View>
          <Pressable onPress={() => router.push("/carte")}>
            <Text
              style={{
                color: colors.primary,
                fontFamily: "Inter_700Bold",
                fontSize: 13,
              }}
            >
              Voir tout
            </Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          {nearby.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: colors.surfaceAlt },
                ]}
              >
                <Feather name="eye" size={22} color={colors.primary} />
              </View>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                Soyez le premier à signaler dans votre quartier
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  marginTop: 4,
                  textAlign: "center",
                  lineHeight: 18,
                }}
              >
                Aidez la mairie à voir ce qui ne va pas autour de vous.
              </Text>
            </View>
          ) : (
            nearby.map((r) => <ReportCard key={r.id} report={r} compact />)
          )}
        </View>

        <View
          style={[
            styles.trustCard,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <View style={styles.trustRow}>
            <View
              style={[styles.trustIcon, { backgroundColor: colors.primary }]}
            >
              <Feather name="link" size={14} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 13,
                }}
              >
                Vos signalements sont publics et infalsifiables
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
                Chaque alerte est enregistrée sur la blockchain Polygon. La
                mairie ne peut pas l'effacer.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({
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
        styles.statCard,
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

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: colors.primary + "12" }]}>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <Text
        style={{
          color: colors.foreground,
          fontFamily: "Inter_600SemiBold",
          fontSize: 12,
          marginTop: 8,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroBg: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brandName: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  brandTagline: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 1,
  },
  communePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  communeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  greeting: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 18,
  },
  greetingSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 4,
  },
  crisisBanner: {
    marginHorizontal: 16,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  crisisIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  crisisClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  crisisTitle: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  crisisText: {
    color: "rgba(255,255,255,0.92)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  statCard: {
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
  bigCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  bigCtaIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bigCtaTitle: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  bigCtaSub: {
    color: "rgba(255,255,255,0.92)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  quickAction: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 26,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyState: {
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  trustCard: {
    marginHorizontal: 16,
    marginTop: 22,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trustIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
