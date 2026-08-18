export const WA_TAX_DATA: Record<string, { city: string; rate: number }> = {
  "98101": { city: "Seattle", rate: 0.1035 },
  "98102": { city: "Seattle", rate: 0.1035 },
  "98104": { city: "Seattle", rate: 0.1035 },
  "98115": { city: "Seattle", rate: 0.1035 },
  "98004": { city: "Bellevue", rate: 0.101 },
  "98005": { city: "Bellevue", rate: 0.101 },
  "98402": { city: "Tacoma", rate: 0.103 },
  "98405": { city: "Tacoma", rate: 0.103 },
  "98052": { city: "Redmond", rate: 0.101 },
  "98201": { city: "Everett", rate: 0.099 },
  "98501": { city: "Olympia", rate: 0.095 },
  "99201": { city: "Spokane", rate: 0.090 },
  "98660": { city: "Vancouver", rate: 0.087 },
};

export function calculateQuoteInternal(issueType: string, deviceTier: string) {
  const HOURLY_LABOR_RATE = 50;
  const OVERHEAD_MARGIN = 0.8;

  const getPartsCost = (quality: "budget" | "pro" | "auth") => {
    if (issueType === "screen") {
      if (quality === "auth") return deviceTier === "flagship" ? 220 : 180;
      if (quality === "pro") return deviceTier === "flagship" ? 140 : 95;
      return deviceTier === "flagship" ? 75 : 45;
    } else if (issueType === "battery") {
      if (quality === "auth") return 65;
      if (quality === "pro") return 45;
      return 25;
    }
    return 30;
  };

  const getLaborHours = () => {
    if (issueType === "screen") return deviceTier === "flagship" ? 1.5 : 1.0;
    if (issueType === "battery") return 0.75;
    return 1.0;
  };

  const calculateTier = (quality: "budget" | "pro" | "auth") => {
    const parts = getPartsCost(quality);
    const labor = getLaborHours() * HOURLY_LABOR_RATE;
    const subtotal = (parts + labor) * (1 + OVERHEAD_MARGIN);
    return {
      partsCost: Math.round(parts * 100) / 100,
      laborCost: Math.round(labor * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
    };
  };

  return {
    budget: calculateTier("budget"),
    professional: calculateTier("pro"),
    authorized: calculateTier("auth"),
  };
}
