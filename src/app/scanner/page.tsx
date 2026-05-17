"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  MessageCircle,
  Phone,
  Clock,
  ArrowLeft,
} from "lucide-react";
import type { ScanResult } from "@/lib/types";
import Link from "next/link";

// QRScanner must be client-only (uses browser camera APIs)
const QRScanner = dynamic(() => import("@/components/QRScanner"), { ssr: false });

type Status = "idle" | "success" | "duplicate" | "error";

export default function ScannerPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanActive, setScanActive] = useState(true);
  const [processing, setProcessing] = useState(false);

  const handleResult = useCallback(
    async (res: ScanResult) => {
      if (processing) return;

      setProcessing(true);

      setResult(res);

      setStatus(
        res.alreadyArrived
          ? "duplicate"
          : "success"
      );

      setScanActive(false);

      setTimeout(() => {
        setProcessing(false);
      }, 1500);
    },
    [processing]
  );

  const handleError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setStatus("error");
    setScanActive(false);
  }, []);

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
    setScanActive(true);
  };

  const arrivedTime =
  result?.attendance?.arrivedAt
    ? new Date(
        result.attendance.arrivedAt
      ).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "--";

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      {/* Header */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Scan QR Code</h1>
            <p className="text-slate-400 text-xs">Point camera at student's QR tag</p>
          </div>
        </div>

        {/* Scanner area */}
        {status === "idle" && (
          <div className="space-y-4 animate-fade-in">
            <QRScanner
              active={scanActive}
              onScanResult={handleResult}
              onError={handleError}
            />
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-sm text-sky-700">
              <p className="font-medium mb-1">How to scan</p>
              <p className="text-sky-600 text-xs">
                Hold the QR code from the student's bag or ID tag in front of the camera.
                The system will automatically detect and record the arrival.
              </p>
            </div>
          </div>
        )}

        {processing && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-xl">
              <p className="text-sm font-medium text-slate-700">
                Processing scan...
              </p>
            </div>
          </div>
        )}

        {/* Success state */}
        {status === "success" && result && (
          <div className="text-center space-y-6 animate-slide-up">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 mx-auto mb-5">
                {result.student.photo ? (
                  <img
                    src={result.student.photo}
                    alt={result.student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                )}
              </div>
              {/* <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div> */}

              <h2 className="text-xl font-bold text-slate-900">{result.student.name}</h2>
              <p className="text-slate-400 text-sm mt-1">{result.student.grade}</p>

              <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>Arrived at {arrivedTime}</span>
              </div>

              {/* Notification status */}
              <div className="mt-6 space-y-2">
                {result.notifications.map((n, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${
                      n.success
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {n.channel === "whatsapp" ? (
                        <MessageCircle className="w-4 h-4" />
                      ) : (
                        <Phone className="w-4 h-4" />
                      )}
                      <span className="capitalize">{n.channel} notification</span>
                    </div>
                    <span className="font-medium">{n.success ? "Sent ✓" : "Failed"}</span>
                  </div>
                ))}
                <p className="text-xs text-slate-400 mt-1">
                  Notified: {result.student.parentName} ({result.student.parentPhone})
                </p>
              </div>
            </div>

            <button
              onClick={reset}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Scan Another
            </button>
          </div>
        )}

        {/* Duplicate state */}
        {status === "duplicate" && result && (
          <div className="text-center space-y-6 animate-slide-up">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
                <Clock className="w-10 h-10 text-amber-500" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">{result.student.name}</h2>
              <p className="text-slate-400 text-sm mt-1">{result.student.grade}</p>

              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-amber-700 text-sm font-medium">Already Checked In</p>
                <p className="text-amber-600 text-xs mt-1">
                  This student was already marked as arrived at {arrivedTime} today.
                </p>
              </div>
            </div>

            <button
              onClick={reset}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Scan Another
            </button>
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="text-center space-y-6 animate-slide-up">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Scan Failed</h2>
              <p className="text-slate-500 text-sm mt-2">{errorMsg}</p>
            </div>

            <button
              onClick={reset}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
