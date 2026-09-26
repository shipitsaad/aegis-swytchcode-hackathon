export type ScenarioId = "standard" | "bot_attack" | "high_value";

export interface DisputeScenario {
  id: ScenarioId;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  amount: string;
  amountNumber: number;
  captureId: string;
  restaurant: string;
  itemTitle: string;
  shortDesc: string;
  promptText: string;
  guardrailLabel: string;
  guardrailStatus: "passed" | "blocked" | "escalated";
  whyGuardrail: string;
  velocityMetric: string;
  outcomeTitle: string;
  outcomeType: "refunded" | "blocked" | "escalated";
  outcomeDesc: string;
  notificationMessage: string;
}

export const DISPUTE_SCENARIOS: DisputeScenario[] = [
  {
    id: "standard",
    badge: "Scenario 1",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    title: "Standard Glitch Charge",
    subtitle: "Isolated terminal drop, authentic capture under threshold",
    amount: "₹45.00",
    amountNumber: 45,
    captureId: "TEST-SMALL",
    restaurant: "Burger Singh · Big Punjabi Burgers",
    itemTitle: "1x Crispy Veg Burger + Pepsi",
    shortDesc: "Authentic ₹45 charge, order glitched before shipping.",
    promptText: "My order was cancelled before it shipped but I was still charged, please check capture TEST-SMALL and refund me.",
    guardrailLabel: "Ceiling & Velocity Check Passed",
    guardrailStatus: "passed",
    whyGuardrail: "Safe claim: ₹45.00 is well below the ₹100.00 ceiling. 0 repeat claims detected in 60m window. Autonomous execution authorized.",
    velocityMetric: "0 Matches in 60m Window",
    outcomeTitle: "REFUNDED (₹45.00)",
    outcomeType: "refunded",
    outcomeDesc: "PayPal lookup confirmed capture TEST-SMALL (₹45.00) completed. The claim matched authentic transaction data, was plausible, and was within autonomous safety thresholds. Executed refund, notified Slack, and committed compliance row to Notion.",
    notificationMessage: "Refund Approved: ₹45.00 has been credited back to your PayPal balance for order #TM-9402.",
  },
  {
    id: "bot_attack",
    badge: "Scenario 2",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    title: "Card-Testing Bot Attack",
    subtitle: "Swytchcode Leak Radar detects high-frequency cluster",
    amount: "₹45.00",
    amountNumber: 45,
    captureId: "TEST-CARDTEST",
    restaurant: "Chai Point · Rapid Micro Trials",
    itemTitle: "1x Micro Trial Chai Pass",
    shortDesc: "6 repeated ₹45 disputes in 10 minutes from suspicious client IP.",
    promptText: "Immediate refund needed for transaction TEST-CARDTEST ₹45.00, payment failed retry #6.",
    guardrailLabel: "Leak Radar Velocity Limit Triggered",
    guardrailStatus: "blocked",
    whyGuardrail: "Velocity breach detected! 6 matching ₹45 claims within 10 minutes from identical subnet. Swytchcode Leak Radar blocked payout to prevent merchant treasury draining.",
    velocityMetric: "6 Cluster Matches in 10m (CRITICAL)",
    outcomeTitle: "BLOCKED BY LEAK RADAR",
    outcomeType: "blocked",
    outcomeDesc: "Transaction TEST-CARDTEST halted by Swytchcode velocity guardrails. Repeated micro-charge pattern matches automated card-testing cluster. Payout intercepted; security event logged to Slack #security-ops and IP blacklisted in Notion.",
    notificationMessage: "Security Notice: Transaction TEST-CARDTEST was blocked by Swytchcode Leak Radar to protect merchant funds.",
  },
  {
    id: "high_value",
    badge: "Scenario 3",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    title: "High-Value Dispute (₹2,500)",
    subtitle: "Exceeds ₹100 ceiling — routed to Human-in-the-Loop",
    amount: "₹2,500.00",
    amountNumber: 2500,
    captureId: "TEST-HIGH",
    restaurant: "Haldiram's · Grand Corporate Catering",
    itemTitle: "1x Deluxe Corporate Catering Feast (12 Pax)",
    shortDesc: "High-value catering dispute exceeding autonomous threshold.",
    promptText: "I was charged ₹2,500.00 for corporate party catering order TEST-HIGH that never arrived. Need full refund.",
    guardrailLabel: "Delegation Ceiling Exceeded",
    guardrailStatus: "escalated",
    whyGuardrail: "Policy ceiling exceeded: ₹2,500.00 exceeds the autonomous refund cap of ₹100.00. Swytchcode safety policy intercepted automatic disbursement and created a human escalation approval ticket.",
    velocityMetric: "Isolated Corporate Claim (Over Ceiling)",
    outcomeTitle: "ESCALATED TO HUMAN REVIEW",
    outcomeType: "escalated",
    outcomeDesc: "Capture TEST-HIGH confirmed completed at ₹2,500.00. Because this exceeds the ₹100.00 autonomous threshold, Swytchcode safely intercepted the payout and routed case AEGIS-9402-ESC to the Senior Fraud Escalation queue with full audit context.",
    notificationMessage: "Ticket Escalated: Dispute for ₹2,500.00 routed to Senior Supervisor queue (Ref: AEGIS-9402-ESC).",
  },
];
