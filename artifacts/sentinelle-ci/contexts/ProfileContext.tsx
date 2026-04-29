import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CitizenProfile } from "@/types/report";

const STORAGE_KEY = "sentinelle.profile.v2";

const DEFAULT_PROFILE: CitizenProfile = {
  pseudo: "Koffi A.",
  firstName: "Koffi",
  commune: "Cocody",
  reputation: 248,
  level: "Sentinelle de quartier",
  joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 42,
  reportsCount: 0,
  resolvedCount: 0,
  badges: ["Premier signalement", "Témoin fiable"],
  anonymousMode: false,
};

type ProfileContextValue = {
  profile: CitizenProfile;
  updateProfile: (patch: Partial<CitizenProfile>) => Promise<void>;
  toggleAnonymous: () => Promise<void>;
  addReputation: (amount: number) => Promise<void>;
  incrementReports: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function levelFromRep(rep: number): string {
  if (rep >= 1000) return "Gardien de la cité";
  if (rep >= 500) return "Vigie de quartier";
  if (rep >= 250) return "Sentinelle de quartier";
  if (rep >= 100) return "Citoyen actif";
  return "Citoyen débutant";
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<CitizenProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setProfile(JSON.parse(raw));
        else
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(DEFAULT_PROFILE),
          );
      } catch {
        // ignore
      }
    })();
  }, []);

  const persist = useCallback(async (next: CitizenProfile) => {
    setProfile(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<CitizenProfile>) => {
      const next = { ...profile, ...patch };
      next.level = levelFromRep(next.reputation);
      await persist(next);
    },
    [persist, profile],
  );

  const toggleAnonymous = useCallback(async () => {
    await persist({ ...profile, anonymousMode: !profile.anonymousMode });
  }, [persist, profile]);

  const addReputation = useCallback(
    async (amount: number) => {
      const rep = Math.max(0, profile.reputation + amount);
      const next = { ...profile, reputation: rep, level: levelFromRep(rep) };
      await persist(next);
    },
    [persist, profile],
  );

  const incrementReports = useCallback(async () => {
    const next = { ...profile, reportsCount: profile.reportsCount + 1 };
    await persist(next);
  }, [persist, profile]);

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      toggleAnonymous,
      addReputation,
      incrementReports,
    }),
    [profile, updateProfile, toggleAnonymous, addReputation, incrementReports],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
