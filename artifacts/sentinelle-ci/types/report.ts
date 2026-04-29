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
  number: string;
  category: CategoryId;
  description: string;
  photoUris: string[];
  quartier: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: number;
  authorPseudo: string;
  isAnonymous: boolean;
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
  firstName: string;
  commune: string;
  reputation: number;
  level: string;
  joinedAt: number;
  reportsCount: number;
  resolvedCount: number;
  badges: string[];
  anonymousMode: boolean;
};
