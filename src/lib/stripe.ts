import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
});

export interface VentureMetrics {
  slug: string;
  name: string;
  status: "active" | "killed" | "graduated";
  weeklyRevenue: number;
  totalRevenue: number;
  mrr: number;
  priceId?: string;
}

const VENTURES: Array<{
  slug: string;
  name: string;
  status: "active" | "killed" | "graduated";
  priceId?: string;
  productId?: string;
}> = [
  { slug: "laundromat-seo", name: "LaundryLocal", status: "active", priceId: "price_1T8nXxB8moqxCyLJggDSvBZn" },
  { slug: "gpc-auditor", name: "GPC Auditor", status: "killed", priceId: "price_1T5iGvB8moqxCyLJZr26SZZr" },
  { slug: "pet-affiliate-scanner", name: "Pet Affiliate Scanner", status: "killed", priceId: "price_1T7PZfB8moqxCyLJW4brHqFQ" },
  { slug: "gaming-achievement-tracker", name: "Gaming Achievement Tracker", status: "killed", priceId: "price_1T7PZnB8moqxCyLJaf9ldOCb" },
  { slug: "beauty-ugc-curator", name: "Beauty UGC Curator", status: "killed", priceId: "price_1T7PZtB8moqxCyLJZnb0moFW" },
];

export async function getMetrics(): Promise<{
  ventures: VentureMetrics[];
  totalRevenue: number;
  mrr: number;
  weeklyGrowth: number;
  graduationProgress: number;
}> {
  let totalRevenue = 0;
  let mrr = 0;

  const now = Math.floor(Date.now() / 1000);
  const oneWeekAgo = now - 7 * 24 * 60 * 60;

  const ventureMetrics: VentureMetrics[] = [];

  for (const v of VENTURES) {
    let ventureTotal = 0;
    let ventureWeekly = 0;
    let ventureMrr = 0;

    if (v.priceId) {
      try {
        // Get all charges for this price via invoice line items
        const charges = await stripe.charges.list({ limit: 100 });
        for (const charge of charges.data) {
          if (charge.status === "succeeded" && charge.metadata?.price_id === v.priceId) {
            const amount = charge.amount / 100;
            ventureTotal += amount;
            if (charge.created >= oneWeekAgo) {
              ventureWeekly += amount;
            }
          }
        }

        // Check active subscriptions for MRR
        const subs = await stripe.subscriptions.list({
          price: v.priceId,
          status: "active",
          limit: 100,
        });
        for (const sub of subs.data) {
          for (const item of sub.items.data) {
            if (item.price.id === v.priceId) {
              ventureMrr += (item.price.unit_amount || 0) / 100;
            }
          }
        }
      } catch {
        // Stripe call failed — use 0
      }
    }

    ventureMetrics.push({
      slug: v.slug,
      name: v.name,
      status: v.status,
      weeklyRevenue: ventureWeekly,
      totalRevenue: ventureTotal,
      mrr: ventureMrr,
      priceId: v.priceId,
    });

    totalRevenue += ventureTotal;
    mrr += ventureMrr;
  }

  // Graduation target: €1000/week ecosystem
  const currentWeeklyRevenue = ventureMetrics.reduce((s, v) => s + v.weeklyRevenue, 0);
  const graduationProgress = Math.min((currentWeeklyRevenue / 1000) * 100, 100);

  return {
    ventures: ventureMetrics,
    totalRevenue,
    mrr,
    weeklyGrowth: 0, // Would need historical data
    graduationProgress,
  };
}
