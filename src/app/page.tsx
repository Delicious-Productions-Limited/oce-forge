"use client";

import { useEffect, useState } from "react";

interface VentureMetrics {
  slug: string;
  name: string;
  status: "active" | "killed" | "graduated";
  weeklyRevenue: number;
  totalRevenue: number;
  mrr: number;
}

interface Metrics {
  ventures: VentureMetrics[];
  totalRevenue: number;
  mrr: number;
  weeklyGrowth: number;
  graduationProgress: number;
}

function StatusDot({ status }: { status: string }) {
  const color = status === "active" ? "bg-[#00ff88]" : status === "graduated" ? "bg-[#00aaff]" : "bg-[#ff4444]";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />;
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6">
      <div className="text-[#888] text-sm font-medium mb-1">{label}</div>
      <div className="text-3xl font-bold font-[family-name:var(--font-mono)] tracking-tight">{value}</div>
      {sub && <div className="text-[#888] text-xs mt-1">{sub}</div>}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-[#1a1a1a] rounded-full h-3 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-full transition-all duration-1000"
        style={{ width: `${Math.max(value, 1)}%` }}
      />
    </div>
  );
}

export default function Home() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then((d) => { setMetrics(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const activeVentures = metrics?.ventures.filter((v) => v.status === "active") || [];
  const killedVentures = metrics?.ventures.filter((v) => v.status === "killed") || [];
  const graduatedVentures = metrics?.ventures.filter((v) => v.status === "graduated") || [];

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          <span className="text-[#00ff88]">OCE</span> Forge
        </h1>
        <p className="text-[#888] text-lg">OpenClaw Ecosystem — Live Venture Dashboard</p>
      </div>

      {/* Revenue Forge — Hero Metrics */}
      {loading ? (
        <div className="text-[#888] text-center py-20">Loading metrics from Stripe...</div>
      ) : error ? (
        <div className="text-[#ff4444] text-center py-20">Failed to load metrics. Retrying...</div>
      ) : metrics ? (
        <>
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider mb-4">The Revenue Forge</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Total Revenue" value={`€${metrics.totalRevenue.toFixed(2)}`} sub="All-time" />
              <MetricCard label="MRR" value={`€${metrics.mrr.toFixed(2)}`} sub="Monthly recurring" />
              <MetricCard label="Active Ventures" value={`${activeVentures.length}`} sub={`${killedVentures.length} killed`} />
              <MetricCard label="Weekly Growth" value={metrics.weeklyGrowth > 0 ? `+${metrics.weeklyGrowth.toFixed(1)}%` : "—"} sub="vs last week" />
            </div>
          </section>

          {/* Graduation Progress */}
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider mb-4">Graduation Progress — €1,000/week target</h2>
            <ProgressBar value={metrics.graduationProgress} />
            <div className="flex justify-between text-xs text-[#888] mt-2">
              <span>€0</span>
              <span className="text-[#00ff88] font-medium">{metrics.graduationProgress.toFixed(1)}%</span>
              <span>€1,000/wk</span>
            </div>
          </section>

          {/* Venture Ticker — Active */}
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider mb-4">Incubator — Active</h2>
            {activeVentures.length === 0 ? (
              <div className="text-[#888] text-sm bg-[#111] border border-[#1a1a1a] rounded-xl p-6">No active ventures.</div>
            ) : (
              <div className="space-y-3">
                {activeVentures.map((v) => (
                  <div key={v.slug} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusDot status={v.status} />
                      <div>
                        <div className="font-semibold">{v.name}</div>
                        <div className="text-xs text-[#888] font-[family-name:var(--font-mono)]">{v.slug}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold font-[family-name:var(--font-mono)]">€{v.weeklyRevenue.toFixed(2)}<span className="text-xs text-[#888]">/wk</span></div>
                      <div className="text-xs text-[#888]">MRR €{v.mrr.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Graduated */}
          {graduatedVentures.length > 0 && (
            <section className="mb-12">
              <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider mb-4">Graduated</h2>
              <div className="space-y-3">
                {graduatedVentures.map((v) => (
                  <div key={v.slug} className="bg-[#111] border border-[#0a3d2a] rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusDot status={v.status} />
                      <div>
                        <div className="font-semibold">{v.name}</div>
                        <div className="text-xs text-[#888] font-[family-name:var(--font-mono)]">{v.slug}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold font-[family-name:var(--font-mono)]">€{v.weeklyRevenue.toFixed(2)}<span className="text-xs text-[#888]">/wk</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Killed */}
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider mb-4">Killed — Default Dead</h2>
            <div className="space-y-3">
              {killedVentures.map((v) => (
                <div key={v.slug} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <StatusDot status={v.status} />
                    <div>
                      <div className="font-semibold">{v.name}</div>
                      <div className="text-xs text-[#888] font-[family-name:var(--font-mono)]">{v.slug}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#888]">Total €{v.totalRevenue.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-[#888] text-xs pt-8 border-t border-[#1a1a1a]">
            <p>OCE Forge — OpenClaw Ecosystem © {new Date().getFullYear()}</p>
            <p className="mt-1">Data sourced live from Stripe. Refreshes every 5 minutes.</p>
          </footer>
        </>
      ) : null}
    </main>
  );
}
