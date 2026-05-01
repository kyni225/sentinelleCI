import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BlockchainBadge,
  PriorityBadge,
  SeverityBadge,
  StatusBadge,
} from "@/components/Badges";
import {
  CATEGORY_MAP,
  STATUS_META,
  type Status,
} from "@/constants/categories";
import { useReports } from "@/contexts/ReportsContext";
import { useColors } from "@/hooks/useColors";
import { shortHash } from "@/lib/ai";

const STATUS_ORDER: Status[] = ["soumis", "valide", "en_cours", "resolu"];

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportDetail() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getReport, upvote } = useReports();
  const report = id ? getReport(id) : undefined;
  const [photoIdx, setPhotoIdx] = useState(0);

  if (!report) {
    return (
      <View
        style={[
          styles.root,
          { backgroundColor: colors.background, padding: 24 },
        ]}
      >
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Inter_600SemiBold",
          }}
        >
          Signalement introuvable.
        </Text>
      </View>
    );
  }

  const cat = CATEGORY_MAP[report.category] ?? { id: "autre", label: report.category || "Autre", icon: "help-circle" as const, hue: "#9333EA" };
  const currentStepIdx = STATUS_ORDER.indexOf(report.status);
  const photoWidth = Math.min(width, 600);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100, maxWidth: 600, alignSelf: "center", width: "100%" }}
      >
        <LinearGradient
          colors={[cat.hue, cat.hue + "BB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBar}
        >
          <View style={styles.heroIcon}>
            <Feather name={cat.icon} size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.heroNumberRow}>
              <Text style={styles.heroNumber}>#{report.number}</Text>
              <Text style={styles.heroLabel}>{cat.label}</Text>
            </View>
            <Text style={styles.heroQuartier}>{report.quartier}</Text>
          </View>
          {report.ai.priority !== "P3" ? <PriorityBadge priority={report.ai.priority} /> : null}
        </LinearGradient>

        {report.photoUris.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setPhotoIdx(
                  Math.round(e.nativeEvent.contentOffset.x / photoWidth),
                )
              }
            >
              {report.photoUris.map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={[styles.photo, { width: photoWidth }]}
                />
              ))}
            </ScrollView>
            {report.photoUris.length > 1 ? (
              <View style={styles.dots}>
                {report.photoUris.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          i === photoIdx ? colors.foreground : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.metaRow}>
            <StatusBadge status={report.status} />
            <SeverityBadge severity={report.ai.severity} />
            <BlockchainBadge short={shortHash(report.blockchain.txHash)} />
          </View>

          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              lineHeight: 22,
              marginTop: 14,
            }}
          >
            {report.description}
          </Text>

          <View style={styles.locRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                flex: 1,
              }}
            >
              {report.address}
            </Text>
          </View>
          <View style={styles.locRow}>
            <Feather name="clock" size={14} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
              }}
            >
              Signalé par {report.authorPseudo} · {formatDate(report.createdAt)}
            </Text>
          </View>

          <Pressable
            onPress={() => upvote(report.id)}
            style={[
              styles.upvoteRow,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}
          >
            <View style={[styles.upIcon, { backgroundColor: colors.primary }]}>
              <Feather name="arrow-up" size={16} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 14,
                }}
              >
                Je confirme ce problème
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  marginTop: 1,
                }}
              >
                {report.upvotes} citoyen{report.upvotes > 1 ? "s" : ""} ont
                confirmé.
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        </View>

        <SectionTitle title="Analyse intelligence artificielle" />
        <View
          style={[
            styles.aiCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.aiCardRow}>
            <AiBlock
              icon="zap"
              label="Priorité"
              value={report.ai.priority}
              accent={
                report.ai.priority === "P1"
                  ? colors.destructive
                  : report.ai.priority === "P2"
                    ? colors.warning
                    : colors.mutedForeground
              }
            />
            <AiBlock
              icon="alert-octagon"
              label="Gravité"
              value={
                report.ai.severity === "critique"
                  ? "Critique"
                  : report.ai.severity === "moyen"
                    ? "Moyen"
                    : "Faible"
              }
              accent={
                report.ai.severity === "critique"
                  ? colors.destructive
                  : report.ai.severity === "moyen"
                    ? colors.warning
                    : colors.success
              }
            />
            <AiBlock
              icon="copy"
              label="Doublons"
              value={
                report.ai.duplicates > 0 ? `+${report.ai.duplicates}` : "Aucun"
              }
              accent={colors.primary}
            />
          </View>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              lineHeight: 19,
              marginTop: 14,
            }}
          >
            {report.ai.summary}
          </Text>
          <View style={styles.confidenceRow}>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 12,
              }}
            >
              Confiance IA
            </Text>
            <View style={styles.confidenceTrack}>
              <View
                style={[
                  styles.confidenceFill,
                  {
                    width: `${report.ai.confidence * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 12,
              }}
            >
              {Math.round(report.ai.confidence * 100)}%
            </Text>
          </View>
        </View>

        <SectionTitle title="Suivi du signalement" />
        <View style={styles.timeline}>
          {STATUS_ORDER.map((s, i) => {
            const event = report.history.find((h) => h.status === s);
            const passed = i <= currentStepIdx;
            const meta = STATUS_META[s];
            return (
              <View key={s} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: passed ? meta.color : colors.muted,
                        borderColor: passed ? meta.color : colors.border,
                      },
                    ]}
                  >
                    {passed ? (
                      <Feather name="check" size={11} color="#fff" />
                    ) : null}
                  </View>
                  {i < STATUS_ORDER.length - 1 ? (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor:
                            i < currentStepIdx ? meta.color : colors.border,
                        },
                      ]}
                    />
                  ) : null}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={{
                      color: passed
                        ? colors.foreground
                        : colors.mutedForeground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 14,
                    }}
                  >
                    {meta.label}
                  </Text>
                  {event ? (
                    <Text
                      style={{
                        color: colors.mutedForeground,
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {formatDate(event.at)}
                      {event.note ? ` · ${event.note}` : ""}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: colors.mutedForeground,
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      En attente
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <SectionTitle title="Preuve blockchain" />
        <View
          style={[
            styles.blockCard,
            { backgroundColor: colors.primary, borderColor: colors.border },
          ]}
        >
          <View style={styles.blockTop}>
            <Feather name="link" size={18} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontFamily: "Inter_700Bold",
                fontSize: 14,
              }}
            >
              {report.blockchain.chain} Mainnet
            </Text>
          </View>
          <KeyValue
            label="Numéro de signalement"
            value={`#${report.number}`}
            mono
          />
          <KeyValue
            label="Hash de transaction"
            value={shortHash(report.blockchain.txHash)}
            mono
          />
          <KeyValue
            label="Numéro de bloc"
            value={`#${report.blockchain.blockNumber.toLocaleString("fr-FR")}`}
          />
          <KeyValue
            label="Confirmé le"
            value={formatDate(report.blockchain.confirmedAt)}
          />
          <View style={styles.immutableTag}>
            <Feather name="lock" size={11} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontFamily: "Inter_700Bold",
                fontSize: 11,
              }}
            >
              Donnée immuable et publique
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push(`/quartier/${report.quartier}`)}
          style={[
            styles.quartierLink,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.quartierLinkIcon,
              { backgroundColor: colors.surfaceAlt },
            ]}
          >
            <Feather name="bar-chart-2" size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 14,
              }}
            >
              Historique de {report.quartier}
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                marginTop: 1,
              }}
            >
              Voir tous les signalements et statistiques du quartier
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={18}
            color={colors.mutedForeground}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitleWrap}>
      <Text
        style={{
          color: colors.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 16,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function AiBlock({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  accent: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.aiBlock}>
      <View style={[styles.aiBlockIcon, { backgroundColor: accent + "15" }]}>
        <Feather name={icon} size={16} color={accent} />
      </View>
      <Text
        style={{
          color: colors.mutedForeground,
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          marginTop: 6,
          letterSpacing: 0.5,
        }}
      >
        {label.toUpperCase()}
      </Text>
      <Text
        style={{
          color: colors.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 16,
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function KeyValue({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text
        style={[
          styles.kvValue,
          mono ? { fontFamily: "Inter_600SemiBold" } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  heroNumber: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  heroLabel: {
    color: "#FFFFFFCC",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  heroQuartier: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 1,
  },
  photo: {
    height: 220,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  upvoteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  upIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitleWrap: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 12,
  },
  aiCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  aiCardRow: {
    flexDirection: "row",
    gap: 8,
  },
  aiBlock: {
    flex: 1,
    alignItems: "flex-start",
  },
  aiBlockIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  confidenceTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 3,
  },
  timeline: {
    paddingHorizontal: 16,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
  },
  timelineLeft: {
    alignItems: "center",
    width: 24,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 18,
  },
  blockCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  blockTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  kv: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  kvLabel: {
    color: "#FFFFFFAA",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  kvValue: {
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  immutableTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignSelf: "flex-start",
    marginTop: 12,
  },
  quartierLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 22,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  quartierLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
