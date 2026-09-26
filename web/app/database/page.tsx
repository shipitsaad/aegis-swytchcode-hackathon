"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Database, RefreshCw, WifiOff, CheckCircle2, XCircle, HelpCircle } from "lucide-react";

const API_BASE = "http://localhost:5001";

interface CaptureRecord {
  id: string;
  status: string;
  amount: { value: string; currency_code: string };
}

interface DisputeRecord {
  dispute_id: string;
  reason: string;
  dispute_amount: { value: string; currency_code: string };
  dispute_life_cycle_stage: string;
  status: string;
}

interface OrderStatusRecord {
  order_id?: string;
  delivered: boolean;
  delivered_at?: string;
  carrier?: string;
  status?: string;
  note?: string;
}

interface TestData {
  captures: Record<string, CaptureRecord>;
  disputes: Record<string, DisputeRecord>;
  order_status: Record<string, OrderStatusRecord>;
}

const CAPTURE_NOTES: Record<string, string> = {
  "TEST-SMALL": "Small, routine amount - demos refund / deny / Leak Radar & repeat-customer patterns",
  "TEST-LARGE": "High amount - demos judgment-based escalation (no fixed dollar ceiling)",
  "TEST-DELIVERED": "Marked delivered in the order data - demos the non-receipt contradiction check",
};

const DISPUTE_NOTES: Record<string, string> = {
  "PP-D-TEST-SMALL": "ITEM_NOT_RECEIVED, low-value - demos low-risk dispute acceptance",
  "PP-D-TEST-MEDIUM": "Not-as-described, mid-value - demos a partial settlement offer",
  "PP-D-TEST-LARGE": "UNAUTHORIZED, high-value - demos escalation (likely fraud/compromise)",
};

export default function TestDatabasePage() {
  const [data, setData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/test-data`)
      .then((res) => {
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) =>
        setError(
          err?.message === "Failed to fetch"
            ? "Can't reach the Aegis backend at localhost:5001 - make sure api_server.py is running."
            : err.message
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#16171B] font-sans">
      <header className="h-14 border-b border-[#E4E6EA] bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#4B5563] hover:text-[#16171B] transition-colors font-medium py-1.5 px-2.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
          <div className="h-5 w-[1px] bg-[#E4E6EA]" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#5E6AD2] text-white shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-sm tracking-tight">Test Order Database</div>
              <div className="text-[11px] text-[#6B7280]">Live from the real backend, not re-typed here</div>
            </div>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] font-medium cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 leading-relaxed">
          Aegis verifies every test case against exactly this data - fetched live from{" "}
          <code className="bg-white/60 px-1 py-0.5 rounded font-mono">GET /test-data</code>, the same dicts and
          file (`order_status.json`) the agent's own tools actually read. Nothing on this page is re-typed or
          hardcoded separately - if the underlying file changes, this page changes with it. In production, this
          exact same lookup would hit PayPal's live API and the merchant's real order-management database
          instead.
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {data && (
          <>
            {/* Payment Captures + Delivery Status */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[#16171B]">Payment Captures (PayPal)</h2>
              <div className="bg-white rounded-2xl border border-[#E4E6EA] overflow-hidden shadow-xs">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F9FAFB] text-[#6B7280] text-[10px] uppercase tracking-wider">
                      <th className="text-left font-semibold px-3 py-2">Order</th>
                      <th className="text-left font-semibold px-3 py-2">Amount</th>
                      <th className="text-left font-semibold px-3 py-2">Payment</th>
                      <th className="text-left font-semibold px-3 py-2">Delivery</th>
                      <th className="text-left font-semibold px-3 py-2">Demo case</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.captures).map(([id, c]) => {
                      const order = data.order_status[id];
                      return (
                        <tr key={id} className="border-t border-[#F0F1F3]">
                          <td className="px-3 py-2.5">
                            <div className="font-mono font-semibold text-[#16171B]">
                              {order?.order_id || id}
                            </div>
                            <div className="font-mono text-[10px] text-[#9CA3AF] mt-0.5">
                              PayPal capture: {id}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 font-mono">
                            {c.amount.value} {c.amount.currency_code}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {c.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            {order ? (
                              order.delivered ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Delivered{order.delivered_at ? ` ${order.delivered_at}` : ""}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                  <XCircle className="w-3.5 h-3.5" />
                                  {order.status || "Not delivered"}
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#9CA3AF]">
                                <HelpCircle className="w-3.5 h-3.5" />
                                No record
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-[#6B7280]">{CAPTURE_NOTES[id] || ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Formal Disputes */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[#16171B]">Formal PayPal Disputes</h2>
              <div className="bg-white rounded-2xl border border-[#E4E6EA] overflow-hidden shadow-xs">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F9FAFB] text-[#6B7280] text-[10px] uppercase tracking-wider">
                      <th className="text-left font-semibold px-3 py-2">Dispute ID</th>
                      <th className="text-left font-semibold px-3 py-2">Reason</th>
                      <th className="text-left font-semibold px-3 py-2">Amount</th>
                      <th className="text-left font-semibold px-3 py-2">Stage</th>
                      <th className="text-left font-semibold px-3 py-2">Demo case</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.disputes).map(([id, d]) => (
                      <tr key={id} className="border-t border-[#F0F1F3]">
                        <td className="px-3 py-2.5 font-mono font-semibold">{id}</td>
                        <td className="px-3 py-2.5 font-mono">{d.reason}</td>
                        <td className="px-3 py-2.5 font-mono">
                          {d.dispute_amount.value} {d.dispute_amount.currency_code}
                        </td>
                        <td className="px-3 py-2.5">{d.dispute_life_cycle_stage}</td>
                        <td className="px-3 py-2.5 text-[#6B7280]">{DISPUTE_NOTES[id] || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
