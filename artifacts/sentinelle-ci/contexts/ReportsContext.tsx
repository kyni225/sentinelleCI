import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CategoryId, Status } from "@/constants/categories";
import { analyzeReport, generateBlockchainTx } from "@/lib/ai";
import { SEED_REPORTS } from "@/lib/seed";
import type { Report } from "@/types/report";

const STORAGE_KEY = "sentinelle.reports.v2";

type NewReportInput = {
  category: CategoryId;
  description: string;
  photoUris: string[];
  quartier: string;
  address: string;
  latitude: number;
  longitude: number;
  authorPseudo: string;
  isAnonymous: boolean;
};

type ReportsContextValue = {
  reports: Report[];
  loading: boolean;
  createReport: (input: NewReportInput) => Promise<Report>;
  getReport: (id: string) => Report | undefined;
  getReportByNumber: (number: string) => Report | undefined;
  upvote: (id: string) => Promise<void>;
  advanceStatus: (id: string, status: Status, note?: string) => Promise<void>;
  countSimilar: (
    category: CategoryId,
    quartier: string,
    description: string,
  ) => number;
  resetSeed: () => Promise<void>;
  crisisMode: boolean;
  crisisQuartiers: string[];
};

const ReportsContext = createContext<ReportsContextValue | null>(null);

const HOUR = 60 * 60 * 1000;

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Report[] = JSON.parse(raw);
          setReports(parsed);
        } else {
          setReports(SEED_REPORTS);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REPORTS));
        }
      } catch {
        setReports(SEED_REPORTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Report[]) => {
    setReports(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const countSimilar = useCallback(
    (category: CategoryId, quartier: string, description: string) => {
      const tokens = description
        .toLowerCase()
        .split(/\W+/)
        .filter((t) => t.length > 4);
      return reports.filter((r) => {
        if (r.category !== category) return false;
        if (r.quartier !== quartier) return false;
        const d = r.description.toLowerCase();
        return tokens.some((t) => d.includes(t));
      }).length;
    },
    [reports],
  );

  const nextNumber = useCallback(() => {
    let max = 0;
    for (const r of reports) {
      const m = r.number.match(/^S(\d+)$/);
      if (m && m[1]) {
        const n = parseInt(m[1], 10);
        if (n > max) max = n;
      }
    }
    return `S${String(max + 1).padStart(3, "0")}`;
  }, [reports]);

  const createReport = useCallback(
    async (input: NewReportInput) => {
      const similar = countSimilar(
        input.category,
        input.quartier,
        input.description,
      );
      const ai = analyzeReport({
        description: input.description,
        category: input.category,
        quartier: input.quartier,
        hasPhoto: input.photoUris.length > 0,
        similarCount: similar,
      });
      const now = Date.now();
      const newReport: Report = {
        id: `${now}_${Math.random().toString(36).slice(2, 8)}`,
        number: nextNumber(),
        category: input.category,
        description: input.description,
        photoUris: input.photoUris,
        quartier: input.quartier,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        createdAt: now,
        authorPseudo: input.isAnonymous ? "Citoyen anonyme" : input.authorPseudo,
        isAnonymous: input.isAnonymous,
        status: "soumis",
        history: [{ status: "soumis", at: now }],
        ai,
        blockchain: generateBlockchainTx(),
        upvotes: 1,
        isMine: true,
      };
      const next = [newReport, ...reports];
      await persist(next);
      return newReport;
    },
    [countSimilar, nextNumber, persist, reports],
  );

  const getReport = useCallback(
    (id: string) => reports.find((r) => r.id === id),
    [reports],
  );

  const getReportByNumber = useCallback(
    (number: string) => reports.find((r) => r.number === number),
    [reports],
  );

  const upvote = useCallback(
    async (id: string) => {
      const next = reports.map((r) =>
        r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r,
      );
      await persist(next);
    },
    [persist, reports],
  );

  const advanceStatus = useCallback(
    async (id: string, status: Status, note?: string) => {
      const next = reports.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status,
          history: [...r.history, { status, at: Date.now(), note }],
        };
      });
      await persist(next);
    },
    [persist, reports],
  );

  const resetSeed = useCallback(async () => {
    await persist(SEED_REPORTS);
  }, [persist]);

  const { crisisMode, crisisQuartiers } = useMemo(() => {
    const since = Date.now() - 24 * HOUR;
    const recentP1 = reports.filter(
      (r) => r.ai.priority === "P1" && r.createdAt >= since,
    );
    const counts: Record<string, number> = {};
    for (const r of recentP1) {
      counts[r.quartier] = (counts[r.quartier] ?? 0) + 1;
    }
    const triggered = Object.entries(counts)
      .filter(([, n]) => n >= 1)
      .map(([q]) => q);
    return {
      crisisMode: recentP1.length >= 2,
      crisisQuartiers: triggered,
    };
  }, [reports]);

  const value = useMemo(
    () => ({
      reports,
      loading,
      createReport,
      getReport,
      getReportByNumber,
      upvote,
      advanceStatus,
      countSimilar,
      resetSeed,
      crisisMode,
      crisisQuartiers,
    }),
    [
      reports,
      loading,
      createReport,
      getReport,
      getReportByNumber,
      upvote,
      advanceStatus,
      countSimilar,
      resetSeed,
      crisisMode,
      crisisQuartiers,
    ],
  );

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("useReports must be used within ReportsProvider");
  return ctx;
}
