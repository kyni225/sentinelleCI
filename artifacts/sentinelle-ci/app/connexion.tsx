import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function phoneToEmail(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return `${cleaned}@sentinelle.ci`;
}

export default function ConnexionScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const email = phoneToEmail(phone);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      let msg = "Numéro ou mot de passe incorrect.";
      if (err.code === "auth/user-not-found") msg = "Aucun compte trouvé avec ce numéro.";
      if (err.code === "auth/too-many-requests") msg = "Trop de tentatives. Réessayez plus tard.";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.root, { paddingTop: insets.top }]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.iconWrap}>
              <Feather name="shield" size={28} color="#006B3F" />
            </View>
            <View>
              <Text style={styles.brand}>SentinelleCI</Text>
              <Text style={styles.tagline}>Application Citoyenne</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Se connecter</Text>
          <Text style={styles.subtitle}>
            Accédez à votre espace citoyen
          </Text>

          {/* Téléphone */}
          <View style={styles.field}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <View style={styles.inputWrap}>
              <Feather name="phone" size={18} color="#6B7785" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="07 XX XX XX XX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Mot de passe */}
          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={18} color="#6B7785" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Votre mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#94A3B8"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#6B7785" />
              </Pressable>
            </View>
          </View>

          {/* Bouton */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.btnPrimary,
              { opacity: pressed || loading ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.btnPrimaryText}>
              {loading ? "Connexion..." : "Se connecter"}
            </Text>
          </Pressable>

          {/* Lien inscription */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ?</Text>
            <Pressable onPress={() => router.push("/inscription")}>
              <Text style={styles.footerLink}>S'inscrire</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#006B3F15",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 24,
    fontWeight: "800",
    color: "#006B3F",
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 14,
    color: "#6B7785",
    marginTop: 2,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "#E5DCC9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F1B2D",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7785",
    marginBottom: 24,
    textAlign: "center",
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7785",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1ECE0",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5DCC9",
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F1B2D",
    height: "100%",
  },
  eyeBtn: {
    padding: 6,
  },
  btnPrimary: {
    backgroundColor: "#FF6700",
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: "#6B7785",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#006B3F",
  },
});
