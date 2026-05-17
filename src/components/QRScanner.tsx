"use client";

import { useEffect, useRef, useState } from "react";
import type { ScanResult } from "@/lib/types";

interface QRScannerProps {
  onScanResult: (result: ScanResult) => void;
  onError: (msg: string) => void;
  active: boolean;
}

export default function QRScanner({ onScanResult, onError, active }: QRScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);
  const scanning = useRef(false);

  useEffect(() => {
    if (!active) return;

    let html5QrCode: unknown;

    const start = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { Html5Qrcode } = await import("html5-qrcode");
        html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        await (html5QrCode as { start: Function }).start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          },
          async (decodedText: string) => {
            if (scanning.current) return;
            scanning.current = true;

            try {
              const res = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: decodedText }),
              });

              if (!res.ok) {
                const err = await res.json();
                onError(err.error ?? "Unknown error scanning QR code.");
              } else {
                const data: ScanResult = await res.json();
                
                // Vibrate on successful scan
                navigator.vibrate?.(200);
                
                onScanResult(data);
              }
            } catch {
              onError("Network error. Please try again.");
            } finally {
              // Cooldown before next scan
              setTimeout(() => {
                scanning.current = false;
              }, 1200);
            }
          },
          undefined
        );
        setReady(true);
      } catch (err) {
        onError("Camera access denied. Please allow camera permissions.");
      }
    };

    start();

    return () => {
      if (scannerRef.current) {
        const s = scannerRef.current as {
          stop: () => Promise<void>;
          clear: () => Promise<void>;
        };

        s.stop()
        .then(() => s.clear())
        .catch(() => {});

        scannerRef.current = null;
      }

      // Extra browser-level cleanup
      const video = containerRef.current?.querySelector("video");

      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;

        stream.getTracks().forEach((track) => {
          track.stop();
        });

        video.srcObject = null;
      }
    };
  }, [active, onError, onScanResult]);

  return (
    <div className="relative">
      <div
        id="qr-reader"
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden bg-slate-900"
        style={{ minHeight: 300 }}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 rounded-2xl">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-300">Starting camera…</p>
          </div>
        </div>
      )}
      {/* Scan frame overlay */}
      {ready && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-52 h-52">
            {/* Corner marks */}
            {["top-0 left-0 border-t-4 border-l-4", "top-0 right-0 border-t-4 border-r-4", "bottom-0 left-0 border-b-4 border-l-4", "bottom-0 right-0 border-b-4 border-r-4"].map(
              (cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-sky-400 ${cls} rounded-sm`} />
              )
            )}
            {/* Scan line */}
            <div
              className="absolute left-2 right-2 h-0.5 bg-sky-400 opacity-80 shadow-[0_0_8px_#38bdf8]"
              style={{
                animation: "scanLine 2s linear infinite",
                top: 0,
              }}
            />
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes scanLine {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
