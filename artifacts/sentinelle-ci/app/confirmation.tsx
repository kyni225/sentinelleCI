import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BlockchainBadge,
  PriorityBadge,
  SeverityBadge,
} from "@/components/Badges";
import { CATEGORY_MAP, PRIORITY_META } from "@/constants/categories";
import { useReports } from "@/contexts/ReportsContext";
import { useColors } from "@/hooks/useColors";
import { shortHash } from "@/lib/ai";

export default function ConfirmationScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const { getReport } = useReports();
  const report = params.id ? getReport(params.id) : undefined;
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(0.55), 600);
    const t2 = setTimeout(() => setProgress(1), 1400);
    const t3 = setTimeout(() => setConfirmed(true), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (!report) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Inter_600SemiBold",
            margin: 24,
          }}
        >
          Signalement introuvable.
        </Text>
      </View>
    );
  }

  const cat = CATEGORY_MAP[report.category];
  const prio = PRIORITY_META[report.ai.priority];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 120,
        }}
      >
        <View style={styles.successHeader}>
          <View
            style={[styles.checkCircle, { backgroundColor: colors.success }]}
          >
            <Feather name="check" size={36} color="#fff" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Signalement envoyé
          </Text>
          <Text
            style={[styles.successSub, { color: colors.mutedForeground }]}
          >
            Merci d'avoir contribué. Voici votre récépissé.
          </Text>
        </View>

        <View
          style={[
            styles.numberCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              letterSpacing: 1.5,
            }}
          >
            NUMÉRO DE SIGNALEMENT
          </Text>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_700Bold",
              fontSize: 36,
              marginTop: 4,
              letterSpacing: 1,
            }}
          >
            #{report.number}
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            Conservez ce numéro pour suivre votre signalement à tout moment.
          </Text>
        </View>

        <View style={styles.aiCard}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiGradient}
          >
            <View style={styles.aiHeader}>
              <View style={styles.aiBadge}>
                <Feather name="cpu" size={12} color="#fff" />
                <Text style={styles.aiBadgeText}>ANALYSE IA</Text>
              </View>
              <Text style={styles.aiConfidence}>
                Confiance {Math.round(report.ai.confidence * 100)}%
              </Text>
            </View>

            <View style={styles.aiPriorityRow}>
              <View style={[styles.aiPrioCircle, { backgroundColor: prio.bg }]}>
                <Feather name="zap" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiPrioLabel}>Priorité attribuée</Text>
                <Text style={styles.aiPrioValue}>
                  {prio.label} · {prio.description}
                </Text>
              </View>
            </View>

            <View style={styles.aiMeta}>
              <View style={styles.aiMetaItem}>
                <Text style={styles.aiMetaLabel}>Gravité</Text>
                <Text style={styles.aiMetaValue}>
                  {report.ai.severity === "critique"
                    ? "Critique"
                    : report.ai.severity === "moyen"
                      ? "Moyen"
                      : "Faible"}
                </Text>
              </View>
              <View style={styles.aiDivider} />
              <View style={styles.aiMetaItem}>
                <Text style={styles.aiMetaLabel}>Catégorie</Text>
                <Text style={styles.aiMetaValue}>{cat.label}</Text>
              </View>
              <View style={styles.aiDivider} />
              <View style={styles.aiMetaItem}>
                <Text style={styles.aiMetaLabel}>Doublons</Text>
                <Text style={styles.aiMetaValue}>
                  {report.ai.duplicates > 0 ? `+${report.ai.duplicates}` : "—"}
                </Text>
              </View>
            </View>

            <Text style={styles.aiSummary}>{report.ai.summary}</Text>

            {report.ai.duplicates > 0 ? (
              <View style={styles.dupNotice}>
                <Feather name="copy" size={12} color="#fff" />
                <Text style={styles.dupNoticeText}>
                  Ce signalement a été regroupé avec {report.ai.duplicates}{" "}
                  alerte{report.ai.duplicates > 1 ? "s" : ""} similaire
                  {report.ai.duplicates > 1 ? "s" : ""}.
                </Text>
              </View>
            ) : null}
          </LinearGradient>
        </View>

        <View
          style={[
            styles.blockCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.blockHeader}>
            <View
              style={[styles.blockIcon, { backgroundColor: colors.primary }]}
            >
              <Feather name="link" size={16} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                }}
              >
                Enregistrement blockchain
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Polygon · immuable et public
              </Text>
            </View>
            {confirmed ? (
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: colors.success },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: colors.warning },
                ]}
              />
            )}
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: confirmed ? colors.success : colors.accent,
                },
              ]}
            />
          </View>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              marginTop: 8,
            }}
          >
            {confirmed
              ? "Confirmation reçue · bloc minté"
              : "Diffusion sur le réseau Polygon..."}
          </Text>

          <View
            style={[
              styles.txRow,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}
          >
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                letterSpacing: 1,
              }}
            >
              TX HASH
            </Text>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                marginTop: 4,
              }}
            >
              {shortHash(report.blockchain.txHash)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.repCard,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <View style={[styles.repIcon, { backgroundColor: colors.accent }]}>
            <Feather name="award" size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 14,
              }}
            >
              +15 points de réputation
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              Votre voix compte un peu plus aujourd'hui.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.actions,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => router.replace(`/signalement/${report.id}`)}
          style={[styles.actionPrimary, { backgroundColor: colors.primary }]}
        >
          <Text
            style={{
              color: "#fff",
              fontFamily: "Inter_700Bold",
              fontSize: 14,
            }}
          >
            Voir mon signalement
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace("/signaler")}
          style={[
            styles.actionSecondary,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_700Bold",
              fontSize: 14,
            }}
          >
            Signaler un autre
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  successHeader: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  checkCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  successTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    marginTop: 16,
  },
  successSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 19,
  },
  numberCard: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  aiCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    overflow: "hidden",
  },
  aiGradient: {
    padding: 16,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  aiBadgeText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
  aiConfidence: {
    color: "#FFFFFFCC",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  aiPriorityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  aiPrioCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  aiPrioLabel: {
    color: "#FFFFFFCC",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
  },
  aiPrioValue: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginTop: 2,
  },
  aiMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.18)",
  },
  aiMetaItem: {
    flex: 1,
    alignItems: "center",
  },
  aiMetaLabel: {
    color: "#FFFFFFAA",
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1,
  },
  aiMetaValue: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    marginTop: 4,
  },
  aiDivider: {
    width: 1,
    height: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  aiSummary: {
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 14,
    opacity: 0.9,
  },
  dupNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginTop: 12,
  },
  dupNoticeText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    flex: 1,
  },
  blockCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  blockIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  txRow: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  repCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  repIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 10,
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  actionPrimary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionSecondary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
});
