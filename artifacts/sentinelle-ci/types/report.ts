import type {
  CategoryId,
  Priority,
  Severity,
  Status,
} from "@/constants/categories";

export type StatusEvent = {
  status: Status;
  at: number;
  note?: string;
};

export type Report = {
  id: string;
  category: CategoryId;
  description: string;
  photoUri: string | null;
  quartier: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: number;
  authorPseudo: string;
  status: Status;
  history: StatusEvent[];
  ai: {
    severity: Severity;
    priority: Priority;
    duplicates: number;
    confidence: number;
    summary: string;
  };
  blockchain: {
    txHash: string;
    blockNumber: number;
    chain: "Polygon";
    confirmedAt: number;
  };
  upvotes: number;
  isMine: boolean;
};

export type CitizenProfile = {
  pseudo: string;
  commune: string;
  reputation: number;
  level: string;
  joinedAt: number;
  reportsCount: number;
  resolvedCount: number;
  badges: string[];
};
