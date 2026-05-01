import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { CATEGORIES, type CategoryId } from "@/constants/categories";
import { QUARTIERS } from "@/constants/quartiers";
import { useProfile } from "@/contexts/ProfileContext";
import { useReports } from "@/contexts/ReportsContext";
import { useColors } from "@/hooks/useColors";

const MAX_PHOTOS = 3;

export default function SignalerScreen() {
  const colors = useColors();
  const router = useRouter();
  const { createReport } = useReports();
  const { addReputation, incrementReports, profile } = useProfile();

  const [category, setCategory] = useState<CategoryId | null>(null);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [quartier, setQuartier] = useState<string>(profile.commune);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    category !== null && description.trim().length >= 10 && !!quartier;

  function cancel() {
    if (
      category !== null ||
      photoUris.length > 0 ||
      description.length > 0
    ) {
      Alert.alert(
        "Annuler le signalement ?",
        "Les informations saisies seront perdues.",
        [
          { text: "Continuer", style: "cancel" },
          {
            text: "Annuler",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  }

  async function pickPhoto(fromCamera: boolean) {
    if (photoUris.length >= MAX_PHOTOS) {
      Alert.alert(
        "Maximum atteint",
        `Vous pouvez ajouter jusqu'à ${MAX_PHOTOS} photos.`,
      );
      return;
    }
    try {
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert(
            "Permission requise",
            "Autorisez l'accès à la caméra pour prendre une photo.",
          );
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: false,
        });
        if (!result.canceled && result.assets[0]) {
          setPhotoUris((p) => [...p, result.assets[0]!.uri]);
          await tryHaptic("light");
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert(
            "Permission requise",
            "Autorisez l'accès à votre galerie.",
          );
          return;
        }
        const remaining = MAX_PHOTOS - photoUris.length;
        const result = await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          allowsEditing: false,
          allowsMultipleSelection: remaining > 1,
          selectionLimit: remaining,
        });
        if (!result.canceled && result.assets) {
          const uris = result.assets.map((a) => a.uri).slice(0, remaining);
          setPhotoUris((p) => [...p, ...uris]);
          await tryHaptic("light");
        }
      }
    } catch {
      Alert.alert("Erreur", "Impossible d'accéder à la photo.");
    }
  }

  function removePhoto(index: number) {
    setPhotoUris((p) => p.filter((_, i) => i !== index));
  }

  async function detectLocation() {
    setLocating(true);
    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined") {
        await new Promise<void>((resolve) => {
          if (!navigator.geolocation) {
            setCoords({ lat: 5.345, lng: -4.024 });
            setAddress(`${quartier}, Abidjan`);
            resolve();
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setCoords({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
              setAddress(`Position GPS · ${quartier}`);
              resolve();
            },
            () => {
              setCoords({ lat: 5.345, lng: -4.024 });
              setAddress(`${quartier}, Abidjan (approx.)`);
              resolve();
            },
            { timeout: 5000 },
          );
        });
      } else {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (!perm.granted) {
          Alert.alert(
            "Permission requise",
            "Autorisez la géolocalisation pour situer le signalement.",
          );
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        try {
          const geo = await Location.reverseGeocodeAsync({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          if (geo[0]) {
            const a = geo[0];
            const parts = [a.street, a.city ?? a.region]
              .filter(Boolean)
              .join(", ");
            setAddress(parts || `${quartier}, Abidjan`);
          } else {
            setAddress(`${quartier}, Abidjan`);
          }
        } catch {
          setAddress(`${quartier}, Abidjan`);
        }
      }
      await tryHaptic("light");
    } catch {
      Alert.alert("Erreur", "Géolocalisation indisponible.");
    } finally {
      setLocating(false);
    }
  }

  async function tryHaptic(style: "light" | "medium" | "success") {
    if (Platform.OS === "web") return;
    try {
      if (style === "success") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } else {
        await Haptics.impactAsync(
          style === "light"
            ? Haptics.ImpactFeedbackStyle.Light
            : Haptics.ImpactFeedbackStyle.Medium,
        );
      }
    } catch {
      // ignoré
    }
  }

  async function submit() {
    if (!canSubmit || !category) return;
    setSubmitting(true);
    try {
      const finalCoords =
        coords ??
        (() => {
          const idx = QUARTIERS.indexOf(quartier);
          const baseLat = 5.32 + (idx >= 0 ? idx * 0.012 : 0);
          const baseLng = -4.05 + (idx >= 0 ? idx * 0.01 : 0);
          return { lat: baseLat, lng: baseLng };
        })();
      const finalAddress = address.trim() || `${quartier}, Abidjan`;
      const report = await createReport({
        category,
        description: description.trim(),
        photoUris,
        quartier,
        address: finalAddress,
        latitude: finalCoords.lat,
        longitude: finalCoords.lng,
        authorPseudo: profile.pseudo,
        isAnonymous: profile.anonymousMode,
      });
      await incrementReports();
      await addReputation(15);
      await tryHaptic("success");
      router.replace({
        pathname: "/confirmation",
        params: { id: report.id },
      });
    } catch {
      Alert.alert("Erreur", "Impossible d'envoyer le signalement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        bottomOffset={100}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 140, maxWidth: 600, alignSelf: "center", width: "100%" }}
      >
        <View style={styles.intro}>
          <View style={styles.introTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.kicker, { color: colors.accent }]}>
                ÉTAPE PAR ÉTAPE
              </Text>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Signaler un problème
              </Text>
            </View>
            <Pressable
              onPress={cancel}
              style={[
                styles.cancelBtn,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Feather name="x" size={16} color={colors.mutedForeground} />
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                }}
              >
                Annuler
              </Text>
            </Pressable>
          </View>
          <Text
            style={[styles.subtitle, { color: colors.mutedForeground }]}
          >
            En 4 étapes simples. Tout est enregistré sur la blockchain Polygon.
          </Text>
        </View>

        <Section number={1} title="Catégorie" icon="grid">
          <View style={styles.catGrid}>
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    setCategory(c.id);
                    tryHaptic("light");
                  }}
                  style={[
                    styles.catTile,
                    {
                      backgroundColor: active ? c.hue : colors.card,
                      borderColor: active ? c.hue : colors.border,
                    },
                  ]}
                >
                  {active ? (
                    <View style={styles.catCheck}>
                      <Feather name="check" size={11} color={c.hue} />
                    </View>
                  ) : null}
                  <Feather
                    name={c.icon}
                    size={20}
                    color={active ? "#fff" : c.hue}
                  />
                  <Text
                    style={{
                      color: active ? "#fff" : colors.foreground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      marginTop: 6,
                    }}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section
          number={2}
          title={`Photos (${photoUris.length}/${MAX_PHOTOS})`}
          icon="camera"
        >
          {photoUris.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingRight: 10 }}
              style={{ marginBottom: 10 }}
            >
              {photoUris.map((uri, i) => (
                <View
                  key={i}
                  style={[styles.photoCard, { borderColor: colors.border }]}
                >
                  <Image source={{ uri }} style={styles.photo} />
                  <Pressable
                    onPress={() => removePhoto(i)}
                    style={[
                      styles.removePhoto,
                      { backgroundColor: colors.foreground },
                    ]}
                  >
                    <Feather name="x" size={12} color={colors.background} />
                  </Pressable>
                </View>
              ))}
              {photoUris.length < MAX_PHOTOS ? (
                <Pressable
                  onPress={() => pickPhoto(true)}
                  style={[
                    styles.addMoreCard,
                    { borderColor: colors.border, backgroundColor: colors.card },
                  ]}
                >
                  <Feather name="plus" size={20} color={colors.primary} />
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    Ajouter
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          ) : null}
          {photoUris.length === 0 ? (
            <View style={styles.photoActions}>
              <PhotoButton
                icon="camera"
                label="Prendre"
                onPress={() => pickPhoto(true)}
                primary
              />
              <PhotoButton
                icon="image"
                label="Galerie"
                onPress={() => pickPhoto(false)}
              />
            </View>
          ) : null}
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              marginTop: 8,
            }}
          >
            Une photo permet à notre IA d'évaluer la gravité automatiquement.
            Jusqu'à {MAX_PHOTOS} photos par signalement.
          </Text>
        </Section>

        <Section number={3} title="Localisation" icon="map-pin">
          <Pressable
            onPress={detectLocation}
            disabled={locating}
            style={[
              styles.locateBtn,
              {
                backgroundColor: coords ? colors.success : colors.primary,
                opacity: locating ? 0.6 : 1,
              },
            ]}
          >
            {locating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather
                name={coords ? "check" : "navigation"}
                size={16}
                color="#fff"
              />
            )}
            <Text
              style={{
                color: "#fff",
                fontFamily: "Inter_700Bold",
                fontSize: 14,
              }}
            >
              {coords
                ? "Position détectée"
                : locating
                  ? "Détection..."
                  : "Utiliser ma position"}
            </Text>
          </Pressable>

          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              marginTop: 14,
              marginBottom: 6,
            }}
          >
            Quartier
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {QUARTIERS.map((q) => {
              const active = q === quartier;
              return (
                <Pressable
                  key={q}
                  onPress={() => setQuartier(q)}
                  style={[
                    styles.quartierChip,
                    {
                      backgroundColor: active ? colors.foreground : colors.card,
                      borderColor: active ? colors.foreground : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? colors.background : colors.foreground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 13,
                    }}
                  >
                    {q}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Adresse précise (rue, point de repère...)"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                color: colors.foreground,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          />
        </Section>

        <Section number={4} title="Description" icon="edit-3">
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez le problème : où, depuis quand, niveau de danger... Plus c'est précis, plus l'IA aide la mairie à prioriser."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={5}
            style={[
              styles.textArea,
              {
                color: colors.foreground,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          />
          <Text
            style={{
              color:
                description.length >= 10
                  ? colors.success
                  : colors.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              marginTop: 6,
            }}
          >
            {description.length}/10 caractères minimum
          </Text>
        </Section>

        {profile.anonymousMode ? (
          <View
            style={[
              styles.anonNote,
              { backgroundColor: colors.primary + "10", borderColor: colors.primary },
            ]}
          >
            <Feather name="eye-off" size={14} color={colors.primary} />
            <Text
              style={{
                color: colors.primary,
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
                flex: 1,
              }}
            >
              Mode anonyme actif · ce signalement sera publié sans votre nom.
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.aiNote,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <Feather name="cpu" size={14} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 12,
              }}
            >
              Analyse IA en temps réel
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              Dès l'envoi : détection de gravité, priorisation et regroupement
              des doublons.
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <Pressable
          onPress={submit}
          disabled={!canSubmit || submitting}
          style={[
            styles.submitBtn,
            {
              backgroundColor: canSubmit ? colors.accent : colors.muted,
              opacity: submitting ? 0.7 : 1,
            },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather
                name="send"
                size={16}
                color={canSubmit ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={{
                  color: canSubmit ? "#fff" : colors.mutedForeground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                }}
              >
                Envoyer le signalement
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function Section({
  number,
  title,
  icon,
  children,
}: {
  number: number;
  title: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View
          style={[styles.sectionNumber, { backgroundColor: colors.primary }]}
        >
          <Text
            style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 }}
          >
            {number}
          </Text>
        </View>
        <Feather name={icon} size={16} color={colors.foreground} />
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
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function PhotoButton({
  icon,
  label,
  onPress,
  primary,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.photoBtn,
        {
          backgroundColor: primary ? colors.primary : colors.card,
          borderColor: primary ? colors.primary : colors.border,
        },
      ]}
    >
      <Feather
        name={icon}
        size={18}
        color={primary ? "#fff" : colors.foreground}
      />
      <Text
        style={{
          color: primary ? "#fff" : colors.foreground,
          fontFamily: "Inter_600SemiBold",
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  intro: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  introTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBody: {},
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catTile: {
    width: "31%",
    aspectRatio: 1.4,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  catCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  photoActions: {
    flexDirection: "row",
    gap: 10,
  },
  photoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  photoCard: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
    width: 130,
    height: 130,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  removePhoto: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreCard: {
    width: 130,
    height: 130,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  locateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  quartierChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  input: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  textArea: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    minHeight: 110,
    textAlignVertical: "top",
  },
  anonNote: {
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiNote: {
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    borderTopWidth: 1,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
});
