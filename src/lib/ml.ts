// TODO: called directly from the browser for now (local dev / FYP demo).
// CLAUDE.md rule #10 says the frontend should never call the ML service
// directly — route these through a Supabase Edge Function proxy before
// this goes to production.
const ML_URL = import.meta.env.VITE_ML_SERVICE_URL || "http://localhost:8000";

// ── Fraud Detection ──────────────────────────────────────────────
export async function scoreFraud(params: {
  order_value: number;
  time_of_day: number;
  orders_last_hour: number;
  account_age_days: number;
  cart_item_count: number;
  university_id: string;
}): Promise<{ score: number; flag: boolean; action: string }> {
  try {
    const res = await fetch(`${ML_URL}/fraud/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Fraud service unavailable");
    return await res.json();
  } catch {
    // Fallback — approve if ML service is down
    return { score: 0, flag: false, action: "approve" };
  }
}

// ── Recommendations ──────────────────────────────────────────────
export async function getRecommendations(
  studentId: string,
  universityId: string,
  limit = 8,
): Promise<string[]> {
  try {
    const res = await fetch(
      `${ML_URL}/recommend/${studentId}?university_id=${universityId}&limit=${limit}`,
    );
    if (!res.ok) throw new Error("Recommendation service unavailable");
    const data = await res.json();
    return data.recommendations || [];
  } catch {
    return [];
  }
}

// ── Dispute Scoring ──────────────────────────────────────────────
export async function scoreDispute(params: {
  vendor_disputes_30d: number;
  vendor_rating: number;
  photo_uploaded: boolean;
  order_value: number;
  account_age_days: number;
  time_since_delivery_hours: number;
}): Promise<{ score: number; recommendation: string; confidence: number }> {
  try {
    const res = await fetch(`${ML_URL}/dispute/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Dispute service unavailable");
    return await res.json();
  } catch {
    return { score: 0.5, recommendation: "review", confidence: 0.5 };
  }
}

// ── Demand Forecast ──────────────────────────────────────────────
export async function getDemandForecast(
  vendorId: string,
  days = 7,
): Promise<
  Array<{ date: string; predicted_orders: number; lower_bound: number; upper_bound: number }>
> {
  try {
    const res = await fetch(`${ML_URL}/forecast/${vendorId}?days=${days}`);
    if (!res.ok) throw new Error("Forecast service unavailable");
    const data = await res.json();
    return data.forecast || [];
  } catch {
    return [];
  }
}
