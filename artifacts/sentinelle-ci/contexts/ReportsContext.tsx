import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  increment,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import type { CategoryId, Status } from "@/constants/categories";
import { analyzeReport, generateBlockchainTx } from "@/lib/ai";
import type { Report } from "@/types/report";

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
const COL = "signalements";

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Écoute temps réel Firestore
  useEffect(() => {
    const q = query(collection(db, COL), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Report[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          number: data.number ?? "S???",
          category: data.category,
          description: data.description ?? "",
          photoUris: data.photoUris ?? [],
          quartier: data.quartier ?? "",
          address: data.address ?? "",
          latitude: data.latitude ?? 0,
          longitude: data.longitude ?? 0,
          createdAt: data.createdAt ?? 0,
          authorPseudo: data.authorPseudo ?? "Citoyen",
          isAnonymous: data.isAnonymous ?? false,
          status: data.status ?? "soumis",
          history: data.history ?? [],
          ai: data.ai ?? { severity: "faible", priority: "P3", duplicates: 0, confidence: 50, summary: "" },
          blockchain: data.blockchain ?? generateBlockchainTx(),
          upvotes: data.upvotes ?? 0,
          isMine: data.isMine ?? false,
        };
      });
      setReports(list);
      setLoading(false);
    }, (err) => {
      console.error("Firestore erreur:", err);
      setLoading(false);
    });
    return unsub;
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

  const MAX_PHOTO_BYTES = 200_000; // 200 KB max per photo (Firestore doc limit ~1 MB)

  const compressPhoto = useCallback(
    async (uri: string): Promise<string | null> => {
      try {
        for (const [width, quality] of [[320, 0.2], [240, 0.15], [160, 0.1]] as [number, number][]) {
          const result = await manipulateAsync(
            uri,
            [{ resize: { width } }],
            { compress: quality, format: SaveFormat.JPEG, base64: true },
          );
          if (result.base64) {
            const dataUri = `data:image/jpeg;base64,${result.base64}`;
            if (dataUri.length <= MAX_PHOTO_BYTES) {
              return dataUri;
            }
          }
        }
        const result = await manipulateAsync(
          uri,
          [{ resize: { width: 120 } }],
          { compress: 0.08, format: SaveFormat.JPEG, base64: true },
        );
        if (result.base64) {
          const dataUri = `data:image/jpeg;base64,${result.base64}`;
          if (dataUri.length <= MAX_PHOTO_BYTES) return dataUri;
        }
        console.warn("[compressPhoto] Photo too large even after max compression, skipping");
        return null;
      } catch (err) {
        console.error("[compressPhoto]", err);
        return null;
      }
    },
    [],
  );

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
      const tempId = `temp_${now}`;

      // Compress photos so they fit in Firestore (< 1 MB total)
      let compressedUris: string[] = [];
      if (input.photoUris.length > 0) {
        try {
          const results = await Promise.all(
            input.photoUris.map((uri) => compressPhoto(uri)),
          );
          compressedUris = results.filter((r): r is string => r !== null);
        } catch (err) {
          console.error("[createReport] Photo compression failed:", err);
          compressedUris = [];
        }
      }

      const newReport: Report = {
        id: tempId,
        number: nextNumber(),
        category: input.category,
        description: input.description,
        photoUris: compressedUris,
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

      // Envoyer vers Firebase et récupérer le vrai ID
      const { id: _id, ...data } = newReport;
      const docRef = await addDoc(collection(db, COL), data);
      newReport.id = docRef.id;
      return newReport;
    },
    [countSimilar, nextNumber, reports, compressPhoto],
  );

  const getReport = useCallback(
    (id: string) => {
      const found = reports.find((r) => r.id === id);
      if (found) return found;
      // Fallback : chercher par number si l'ID Firebase n'est pas encore synchronisé
      const match = id.match(/^S\d+$/);
      if (match) return reports.find((r) => r.number === id);
      return undefined;
    },
    [reports],
  );

  const getReportByNumber = useCallback(
    (number: string) => reports.find((r) => r.number === number),
    [reports],
  );

  const upvote = useCallback(
    async (id: string) => {
      const ref = doc(db, COL, id);
      await updateDoc(ref, { upvotes: increment(1) });
    },
    [],
  );

  const advanceStatus = useCallback(
    async (id: string, status: Status, note?: string) => {
      const r = reports.find((x) => x.id === id);
      if (!r) return;
      const ref = doc(db, COL, id);
      await updateDoc(ref, {
        status,
        history: [...r.history, { status, at: Date.now(), note }],
      });
    },
    [reports],
  );

  const resetSeed = useCallback(async () => {
    const snap = await getDocs(collection(db, COL));
    for (const d of snap.docs) {
      await updateDoc(doc(db, COL, d.id), { _deleted: true });
    }
  }, []);

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
  if (!ctx) throw new Error("useReports doit être utilisé dans ReportsProvider");
  return ctx;
}
