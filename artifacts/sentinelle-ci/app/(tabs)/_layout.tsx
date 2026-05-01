import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs, useRouter } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Accueil</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="carte">
        <Icon sf={{ default: "map", selected: "map.fill" }} />
        <Label>Carte</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="signaler-tab">
        <Icon sf={{ default: "plus.circle.fill", selected: "plus.circle.fill" }} />
        <Label>Signaler</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="mes-signalements">
        <Icon sf={{ default: "tray", selected: "tray.fill" }} />
        <Label>Suivi</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profil">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profil</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function CenterReportButton({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.centerButton,
        {
          backgroundColor: colors.accent,
          shadowColor: colors.accent,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      <Feather name="plus" size={28} color="#fff" />
    </Pressable>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const tabIconSize = isWeb ? 18 : 22;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: isWeb ? 10 : 11,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb
            ? { height: 60, paddingBottom: 8, paddingTop: 4, maxWidth: 600, alignSelf: "center", width: "100%", marginHorizontal: "auto" }
            : { height: 84 }),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.card },
              ]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={tabIconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="carte"
        options={{
          title: "Carte",
          tabBarIcon: ({ color }) => (
            <Feather name="map" size={tabIconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="signaler-tab"
        options={{
          title: "",
          tabBarButton: () => (
            <View style={styles.centerSlot}>
              <CenterReportButton onPress={() => router.push("/signaler")} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mes-signalements"
        options={{
          title: "Suivi",
          tabBarIcon: ({ color }) => (
            <Feather name="inbox" size={tabIconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={tabIconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  centerSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: Platform.OS === "web" ? 48 : 64,
    height: Platform.OS === "web" ? 48 : 64,
    borderRadius: Platform.OS === "web" ? 24 : 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Platform.OS === "web" ? -10 : -22,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
    borderWidth: Platform.OS === "web" ? 3 : 4,
    borderColor: "#fff",
  },
});
