export interface RepairTicket {
  id: string;
  customerName: string;
  companyName?: string;
  device: string;
  issueType: "screen" | "battery" | "button" | "other" | string;
  status: "open" | "parts_assigned" | "technician_working" | "quality_check" | "completed";
  quotedPrice: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  userId?: string;
}

export interface POSLog {
  timestamp: string;
  level: string;
  message: string;
  source: "Cloud" | "WebHook-Receiver";
}

export interface QuoteTier {
  partsCost: number;
  laborCost: number;
  subtotal: number;
  discountAmount: number;
  calculatedTax: number;
  grandTotal: number;
  extras: string[];
}

export interface QuoteResponse {
  tiers: {
    budget: QuoteTier;
    professional: QuoteTier;
    authorized: QuoteTier;
  };
  taxInfo: {
    zipCode: string;
    city: string;
    rate: number;
  };
  discountInfo: {
    applied: boolean;
    percentage: number;
    company: string;
  };
}

export interface TicketTemplate {
  id: string;
  name: string;
  brand: string;
  issueType: string;
  description: string;
  estimatedTime: string;
  difficulty: "Easy" | "Intermediate" | "Advanced" | string;
  defaultPrice: number;
}

