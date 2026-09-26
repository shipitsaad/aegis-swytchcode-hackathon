"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  MessageCircle,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  MapPin,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Star,
  CheckCheck,
  CreditCard,
  Lock,
  Loader2,
  Bell,
  ShoppingBag,
  X,
  Check,
} from "lucide-react";
import { PayPalLogo } from "./ConsoleView";
import { DisputeScenario } from "../types/scenarios";

export interface TomatoAppMockupProps {
  onSendMessage: (promptText: string) => void;
  isConsoleRevealed: boolean;
  refundCompleted?: boolean;
  scenario?: DisputeScenario;
  onReset?: () => void;
  className?: string;
}

export type PhoneStep = "checkout" | "paypal" | "failed" | "chat";

export default function TomatoAppMockup({
  onSendMessage,
  isConsoleRevealed,
  refundCompleted = false,
  scenario,
  onReset,
  className = "",
}: TomatoAppMockupProps) {
  const currentAmount = scenario?.amount || "₹45.00";
  const currentCaptureId = scenario?.captureId || "TEST-SMALL";
  const currentItemTitle = scenario?.itemTitle || "1x Crispy Veg Burger + Pepsi";
  const currentRestaurant = scenario?.restaurant || "Burger Singh · Big Punjabi Burgers";

  const [phoneStep, setPhoneStep] = useState<PhoneStep>("checkout");
  const [paypalProcessing, setPaypalProcessing] = useState(false);
  const [showBankNotification, setShowBankNotification] = useState(false);
  const [showRefundNotification, setShowRefundNotification] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [inputText, setInputText] = useState(
    scenario?.promptText ||
      "My order was cancelled before it shipped but I was still charged, please check capture TEST-SMALL and refund me."
  );

  // Sync inputText when scenario changes
  useEffect(() => {
    if (scenario) {
      setInputText(scenario.promptText);
    }
  }, [scenario]);

  // Trigger realistic iOS refund push notification on completion
  useEffect(() => {
    if (refundCompleted) {
      setShowRefundNotification(true);
      const timer = setTimeout(() => setShowRefundNotification(false), 6000);
      return () => clearTimeout(timer);
    } else {
      setShowRefundNotification(false);
    }
  }, [refundCompleted]);

  // Auto-reset phone when console closes/replays
  useEffect(() => {
    if (!isConsoleRevealed) {
      setPhoneStep("checkout");
      setPaypalProcessing(false);
      setShowBankNotification(false);
      setShowRefundNotification(false);
      setMessageSent(false);
    }
  }, [isConsoleRevealed]);

  // 1. User clicks Pay Now -> Opens PayPal Gateway
  const handleOpenPayPal = () => {
    setPhoneStep("paypal");
  };

  // 2. User clicks Pay on PayPal -> Simulates capture, returns to app with failed order
  const handleCompletePayPal = () => {
    setPaypalProcessing(true);
    setTimeout(() => {
      setPaypalProcessing(false);
      setPhoneStep("failed");
      setShowBankNotification(true);
      // Auto-hide bank notification banner after 4.5s
      setTimeout(() => setShowBankNotification(false), 4500);
    }, 1200);
  };

  // 3. User taps Contact Support
  const handleOpenSupport = () => {
    setPhoneStep("chat");
  };

  // 4. User sends complaint message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessageSent(true);
    onSendMessage(inputText);
  };

  const handleResetLocal = () => {
    setPhoneStep("checkout");
    setPaypalProcessing(false);
    setShowBankNotification(false);
    setShowRefundNotification(false);
    setMessageSent(false);
    setInputText(
      scenario?.promptText ||
        "My order was cancelled before it shipped but I was still charged, please check capture TEST-SMALL and refund me."
    );
    if (onReset) onReset();
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none transition-all duration-700 ease-in-out ${className}`}
    >
      {/* ==================================================================== */}
      {/* Authentic Flagship Smartphone Frame (Real 19.5:9 Aspect Ratio)       */}
      {/* ==================================================================== */}
      <div className="relative w-[320px] h-[685px] rounded-[52px] p-[10px] bg-gradient-to-b from-[#2E2F38] via-[#1C1D24] to-[#121318] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.18),inset_0_1px_2px_rgba(255,255,255,0.25)] border-[3.5px] border-[#3C3D4A] shrink-0 flex flex-col overflow-visible">
        {/* Physical Side Buttons */}
        <div className="absolute -left-[6px] top-24 w-[3.5px] h-6 bg-[#2B2C36] rounded-l-xs border-y border-l border-white/10" />
        <div className="absolute -left-[6px] top-34 w-[3.5px] h-11 bg-[#2B2C36] rounded-l-xs border-y border-l border-white/10" />
        <div className="absolute -left-[6px] top-48 w-[3.5px] h-11 bg-[#2B2C36] rounded-l-xs border-y border-l border-white/10" />
        <div className="absolute -right-[6px] top-36 w-[3.5px] h-16 bg-[#2B2C36] rounded-r-xs border-y border-r border-white/10" />

        {/* Ear Speaker Slit */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#0A0A0C] rounded-full z-40" />

        {/* ================================================================== */}
        {/* Inner OLED Display Glass (Exact 19.5:9 Ratio, ZERO SCROLLING)       */}
        {/* ================================================================== */}
        <div className="relative rounded-[42px] overflow-hidden bg-[#F4F4F6] flex flex-col h-full w-full text-[#1C1C1E] justify-between shadow-inner">
          {/* Dynamic Island Pill with Camera Sensor Reflections */}
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              refundCompleted
                ? "w-60 h-7.5"
                : paypalProcessing
                ? "w-48 h-7"
                : "w-28 h-6"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A22] flex items-center justify-center shrink-0">
              <div className="w-1 h-1 rounded-full bg-[#0E1528]" />
            </div>

            {/* Dynamic Island Content based on State */}
            {refundCompleted ? (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold animate-in fade-in duration-300">
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                <span className="truncate">
                  {scenario?.outcomeType === "blocked"
                    ? "Blocked by Radar"
                    : scenario?.outcomeType === "escalated"
                    ? "Escalated: Review"
                    : `${currentAmount} Refunded`}
                </span>
              </div>
            ) : paypalProcessing ? (
              <div className="flex items-center gap-1.5 text-[10px] text-sky-300 font-mono animate-in fade-in duration-300">
                <Loader2 className="w-3 h-3 text-sky-400 animate-spin" />
                <span>PayPal Gateway...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            )}
          </div>

          {/* iOS Native Status Bar */}
          <div className="h-9 pt-2.5 px-6 flex items-center justify-between text-[11px] font-semibold text-[#1C1C1E] z-30 shrink-0 bg-white/95 backdrop-blur-sm">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <div className="w-4 h-2.5 border border-[#1C1C1E] rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-[#1C1C1E] rounded-xs" />
              </div>
            </div>
          </div>

          {/* Bank Debit Push Notification (Simulates real SMS deduction) */}
          {showBankNotification && (
            <div
              onClick={() => setShowBankNotification(false)}
              className="absolute top-11 left-3 right-3 z-40 bg-[#1C1C1E]/95 backdrop-blur-md text-white p-2.5 rounded-2xl shadow-xl border border-white/10 animate-in slide-in-from-top-4 duration-300 cursor-pointer"
              title="Tap to dismiss"
            >
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] text-[#A0A0A5]">
                    <span className="font-bold text-white">Bank Alert</span>
                    <span>now</span>
                  </div>
                  <p className="text-[10px] leading-tight text-[#E5E5E7] mt-0.5">
                    {currentAmount} debited via PayPal (Ref: {currentCaptureId}) to Tomato Inc.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Feature 6: Realistic iOS Refund / Decision Push Notification */}
          {showRefundNotification && (
            <div
              onClick={() => setShowRefundNotification(false)}
              className="absolute top-11 left-3 right-3 z-50 bg-[#1C1C1E]/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-white/15 animate-in slide-in-from-top-4 duration-400 cursor-pointer"
              title="Tap to dismiss"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#E23744] text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-xs mt-0.5">
                  T
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] text-[#A0A0A5]">
                    <span className="font-bold text-white flex items-center gap-1">
                      <span>Tomato Support</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </span>
                    <span>now</span>
                  </div>
                  <p className="text-[10px] font-semibold text-white mt-0.5 leading-snug">
                    {scenario?.notificationMessage || `Refund Approved: ${currentAmount} credited to your PayPal balance.`}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[8px] text-emerald-300 font-mono">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Swytchcode Sandboxed Policy Engine</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 1: CHECKOUT CART SCREEN (User clicks Pay Now)               */}
          {/* ================================================================ */}
          {phoneStep === "checkout" && (
            <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden animate-in fade-in duration-300">
              {/* App Bar */}
              <div className="bg-white rounded-2xl p-2.5 border border-[#EAEAEA] shadow-2xs flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-tight text-[#E23744]">tomato</span>
                  <span className="text-[10px] font-bold text-[#828282]">· Order Checkout</span>
                </div>
                <div className="text-[10px] text-[#24963F] font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  10 min delivery
                </div>
              </div>

              {/* Restaurant & Item Card */}
              <div className="bg-white rounded-2xl p-3 border border-[#EAEAEA] shadow-2xs space-y-2 shrink-0">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#F2F2F2]">
                  <div>
                    <div className="font-bold text-xs text-[#1C1C1E]">
                      {currentRestaurant}
                    </div>
                    <div className="text-[10px] text-[#828282]">
                      Sector 29, Gurugram
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 bg-[#24963F] text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                    <span>4.3</span>
                    <Star className="w-2.5 h-2.5 fill-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <span className="w-2.5 h-2.5 border border-[#24963F] rounded-xs flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#24963F]" />
                    </span>
                    {currentItemTitle}
                  </span>
                  <span className="font-bold">{currentAmount}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-2xl p-3 border border-[#EAEAEA] shadow-2xs space-y-2 shrink-0">
                <div className="text-[10px] font-bold text-[#828282] uppercase tracking-wider">
                  Payment Method
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <PayPalLogo className="w-5 h-5" />
                    <div>
                      <div className="font-bold text-xs text-sky-950">PayPal Sandbox</div>
                      <div className="text-[9px] text-[#6B7280]">Linked Wallet (•••• 9402)</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-sky-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                    <span>Selected</span>
                    <Check className="w-3 h-3 text-sky-700 stroke-[3]" />
                  </span>
                </div>
              </div>

              {/* Bill Details */}
              <div className="bg-white rounded-2xl p-3 border border-[#EAEAEA] shadow-2xs space-y-1 text-[10px] text-[#696969] shrink-0">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="font-medium text-[#1C1C1E]">{currentAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Partner Fee</span>
                  <span className="text-emerald-700 font-bold">FREE (Gold)</span>
                </div>
                <div className="flex justify-between font-bold text-xs text-[#1C1C1E] pt-1.5 border-t border-[#F2F2F2]">
                  <span>To Pay</span>
                  <span className="text-[#E23744] text-sm">{currentAmount}</span>
                </div>
              </div>

              {/* Pay Now Button */}
              <div className="pt-1 shrink-0">
                <button
                  onClick={handleOpenPayPal}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#E23744] hover:bg-[#CB202D] active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(226,55,68,0.35)] transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay {currentAmount} via PayPal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Nav */}
              <div className="h-6 px-4 flex items-center justify-around text-[#828282] text-[9px] font-bold border-t border-[#EAEAEA] pt-0.5 shrink-0">
                <span className="text-[#E23744]">Order</span>
                <span>Dining</span>
                <span>Live</span>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 2: PAYPAL GATEWAY MODAL SHEET (User clicks Pay)             */}
          {/* ================================================================ */}
          {phoneStep === "paypal" && (
            <div className="flex-1 flex flex-col justify-between p-3.5 bg-[#FDFDFD] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
              {/* PayPal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] shrink-0">
                <div className="flex items-center gap-1.5">
                  <PayPalLogo className="w-5 h-5" />
                  <span className="font-extrabold text-sm text-[#003087]">PayPal</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                    Sandbox
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#1C1C1E]">{currentAmount}</span>
                  <button
                    onClick={() => setPhoneStep("checkout")}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors cursor-pointer"
                    title="Cancel and return to Cart"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Merchant Details */}
              <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-[#E9ECEF] space-y-2 shrink-0">
                <div className="text-[10px] text-[#6C757D] uppercase font-bold tracking-wider">
                  Merchant Order Summary
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#212529]">Tomato Delivery Inc.</span>
                  <span className="text-xs font-mono font-bold text-[#0079C1]">{currentAmount}</span>
                </div>
                <div className="text-[10px] text-[#6C757D]">
                  Capture Intent: <strong>{currentCaptureId}</strong>
                </div>
              </div>

              {/* Payment Account */}
              <div className="bg-white rounded-2xl p-3 border border-[#E9ECEF] space-y-2 shadow-2xs shrink-0">
                <div className="text-[10px] text-[#6C757D] uppercase font-bold tracking-wider">
                  Paying With
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0079C1]/10 flex items-center justify-center text-[#0079C1]">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#212529]">PayPal Balance</div>
                      <div className="text-[10px] text-[#6C757D]">Account: rahul.kumar@gmail.com</div>
                    </div>
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0079C1] flex items-center justify-center text-white">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </span>
                </div>
              </div>

              {/* Complete Payment Button */}
              <div className="space-y-2 pt-2 shrink-0">
                <button
                  onClick={handleCompletePayPal}
                  disabled={paypalProcessing}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0070BA] hover:bg-[#003087] active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-75"
                >
                  {paypalProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Complete Payment {currentAmount}</span>
                    </>
                  )}
                </button>

                <div className="text-center text-[9px] text-[#6C757D] flex items-center justify-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Secured by Swytchcode Sandbox Guardrails</span>
                </div>
              </div>

              <div className="h-4 shrink-0" />
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 3: ORDER FAILED / GLITCH SCREEN (Money deducted, no food)   */}
          {/* ================================================================ */}
          {phoneStep === "failed" && (
            <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden animate-in fade-in duration-300">
              {/* App Bar */}
              <div className="bg-white rounded-2xl p-2.5 border border-[#EAEAEA] shadow-2xs flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-tight text-[#E23744]">tomato</span>
                  <span className="text-[10px] font-bold text-[#E23744]">· Order Status</span>
                </div>
                <div className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  <span>Cancelled</span>
                </div>
              </div>

              {/* Order Failed Card */}
              <div className="bg-white rounded-2xl p-3 border border-red-200 shadow-2xs space-y-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-red-100 text-[#E23744] flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-[#E23744]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-[#E23744] tracking-tight leading-none">
                      Payment Received · Order Cancelled
                    </h3>
                    <p className="text-[10px] text-[#696969] mt-0.5">
                      Order #TM-9402 could not be placed
                    </p>
                  </div>
                </div>

                <div className="bg-[#FFF5F5] rounded-xl p-2 border border-red-100 text-[10px] text-[#7A1C24] leading-relaxed">
                  The restaurant terminal timed out before accepting. However, <strong className="font-bold text-[#E23744]">{currentAmount}</strong> was captured via PayPal.
                </div>
              </div>

              {/* Restaurant & Item Card */}
              <div className="bg-white rounded-2xl p-3 border border-[#EAEAEA] shadow-2xs space-y-2 shrink-0">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#F2F2F2]">
                  <div>
                    <div className="font-bold text-xs text-[#1C1C1E]">
                      {currentRestaurant}
                    </div>
                    <div className="text-[10px] text-[#828282]">
                      Sector 29, Gurugram
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 bg-[#24963F] text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                    <span>4.3</span>
                    <Star className="w-2.5 h-2.5 fill-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-0.5">
                  <span className="flex items-center gap-1.5 truncate max-w-[190px]">
                    <span className="w-2.5 h-2.5 border border-[#24963F] rounded-xs flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#24963F]" />
                    </span>
                    {currentItemTitle}
                  </span>
                  <span className="font-bold">{currentAmount}</span>
                </div>

                {/* Deducted Reference */}
                <div className="pt-1.5 border-t border-[#F2F2F2] space-y-0.5 text-[10px] text-[#828282]">
                  <div className="flex justify-between">
                    <span>Payment Gateway</span>
                    <span className="font-mono text-[#1C1C1E] font-medium">PayPal Sandbox</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capture ID</span>
                    <span className="font-mono font-bold text-[#E23744] bg-red-50 px-1 rounded">
                      {currentCaptureId}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-xs text-[#1C1C1E] pt-1 border-t border-[#F2F2F2]">
                    <span>Amount Deducted</span>
                    <span className="text-[#E23744]">{currentAmount}</span>
                  </div>
                </div>
              </div>

              {/* Chat with Support CTA */}
              <div className="pt-1 shrink-0">
                <button
                  onClick={handleOpenSupport}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#E23744] hover:bg-[#CB202D] active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(226,55,68,0.35)] transition-all cursor-pointer animate-pulse"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Need Help? Chat with Support</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Nav */}
              <div className="h-6 px-4 flex items-center justify-around text-[#828282] text-[9px] font-bold border-t border-[#EAEAEA] pt-0.5 shrink-0">
                <span className="text-[#E23744]">Order</span>
                <span>Dining</span>
                <span>Live</span>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 4: SUPPORT CHAT (User sends complaint -> Triggers Aegis)    */}
          {/* ================================================================ */}
          {phoneStep === "chat" && (
            <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
              {/* Chat Top Bar */}
              <div className="bg-white rounded-2xl p-2 border border-[#EAEAEA] shadow-2xs flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { if (!messageSent) setPhoneStep("failed"); }}
                    disabled={messageSent}
                    className="p-1 rounded-lg hover:bg-[#F2F2F2] text-[#1C1C1E] cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="w-7 h-7 rounded-full bg-[#E23744] text-white flex items-center justify-center font-black text-xs shadow-2xs">
                    T
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-[#1C1C1E] flex items-center gap-1.5">
                      <span>Tomato Support</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-[9px] text-[#828282]">
                      Order #TM-9402 · Active now
                    </div>
                  </div>
                </div>

                {isConsoleRevealed && (
                  <button
                    onClick={handleResetLocal}
                    className="text-[9px] font-bold text-[#828282] hover:text-[#1C1C1E] flex items-center gap-1 px-2 py-1 rounded-md bg-[#F2F2F2] border border-[#E0E0E0] cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset
                  </button>
                )}
              </div>

              {/* Chat Stream (Measured to Fit 100% with NO SCROLL) */}
              <div className="flex-1 flex flex-col justify-end space-y-2 py-2 overflow-hidden">
                {/* Bot Message Bubble */}
                <div className="bg-white rounded-2xl rounded-tl-xs p-2.5 border border-[#EAEAEA] shadow-2xs max-w-[88%] text-[11px] text-[#1C1C1E] leading-relaxed">
                  Hi, how can we help you today?
                </div>

                {/* Pre-attached Order Chip */}
                <div className="inline-flex items-center gap-1.5 bg-[#FFF5F5] border border-red-200 px-2 py-1 rounded-lg text-[9px] text-[#E23744] font-medium self-start">
                  <span>Capture ID: {currentCaptureId}</span>
                  <span>·</span>
                  <span className="font-bold">{currentAmount}</span>
                </div>

                {/* Customer Sent Message */}
                {messageSent && (
                  <div className="space-y-1.5 self-end max-w-[92%]">
                    <div className="bg-[#E23744] text-white rounded-2xl rounded-tr-xs p-2.5 text-[11px] leading-relaxed font-medium shadow-xs">
                      {inputText}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-white/80">
                        <span>12:43 PM</span>
                        <CheckCheck className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* Live Hand-off Pulse Pill */}
                    <div className="p-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[10px] text-indigo-900 flex items-center gap-1.5 animate-pulse">
                      <Sparkles className="w-3 h-3 text-[#5E6AD2] shrink-0" />
                      <span className="truncate">Connecting to Aegis Defense Engine...</span>
                    </div>

                    {/* Live Refund / Decision Completed Banner */}
                    {refundCompleted && (
                      <div
                        className={`p-2 rounded-xl text-[10px] space-y-0.5 animate-in zoom-in-95 duration-500 shadow-2xs border ${
                          scenario?.outcomeType === "blocked"
                            ? "bg-rose-50 border-rose-200 text-rose-950"
                            : scenario?.outcomeType === "escalated"
                            ? "bg-indigo-50 border-indigo-200 text-indigo-950"
                            : "bg-[#EDF7ED] border-[#C8E6C9] text-[#1E4620]"
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold text-[11px]">
                          {scenario?.outcomeType === "blocked" ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span className="text-rose-900 font-black">Dispute Blocked: Leak Radar</span>
                            </>
                          ) : scenario?.outcomeType === "escalated" ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="text-indigo-900 font-black">Escalated to Human Review</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-emerald-900 font-black">Refund Approved ({currentAmount})</span>
                            </>
                          )}
                        </div>
                        <p
                          className={`text-[9px] leading-tight ${
                            scenario?.outcomeType === "blocked"
                              ? "text-rose-700"
                              : scenario?.outcomeType === "escalated"
                              ? "text-indigo-700"
                              : "text-emerald-700"
                          }`}
                        >
                          {scenario?.outcomeType === "blocked"
                            ? "Swytchcode velocity limit tripped (6 matching claims). Prevented bot exploit."
                            : scenario?.outcomeType === "escalated"
                            ? `Claim for ${currentAmount} exceeds autonomous refund limit. Ticket AEGIS-9402-ESC created.`
                            : "Credited back to PayPal sandbox. Case: AEGIS-9402-REF."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              {!messageSent ? (
                <div className="bg-white rounded-2xl p-2 border border-red-200 shadow-xs space-y-1.5 shrink-0">
                  <div className="text-[9px] text-[#828282] font-semibold px-1">
                    Your claim message to support:
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FAF9F9] rounded-xl p-1.5 border border-[#E8E8E8]">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      className="flex-1 bg-transparent text-[11px] text-[#1C1C1E] focus:outline-none px-1 font-medium"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="w-8 h-8 rounded-lg bg-[#E23744] hover:bg-[#CB202D] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
                      title="Send Complaint"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-1 text-center text-[10px] text-emerald-700 font-semibold bg-emerald-50 rounded-xl border border-emerald-200 shrink-0">
                  Ticket dispatched · Handed off to Aegis
                </div>
              )}
            </div>
          )}

          {/* iOS Bottom Home Bar Indicator */}
          <div className="h-4 pb-1.5 flex items-center justify-center shrink-0 bg-transparent">
            <div className="w-28 h-1 bg-[#1C1C1E]/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
