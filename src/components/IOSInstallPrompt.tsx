"use client";

import { useEffect, useState } from "react";
import { Share, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const DISMISS_KEY = "kanchaeum-ios-install-dismissed";

function isIOSSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}

export function IOSInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isIOSSafari() || isStandalone()) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      // Don't show again for 7 days
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Show after 3 seconds
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-[60]",
        "bg-slate-800 rounded-2xl border border-white/10",
        "shadow-2xl shadow-black/50 p-4",
        "animate-in slide-in-from-bottom-4",
      )}
    >
      <button
        onClick={() => {
          setShow(false);
          localStorage.setItem(DISMISS_KEY, Date.now().toString());
        }}
        className="absolute top-3 right-3 p-1 text-white/40 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
          <Plus className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white mb-1">
            홈 화면에 추가하세요
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            앱처럼 빠르게 실행하고 오프라인에서도 사용할 수 있습니다
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
            <Share className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              하단의 <strong className="text-indigo-300">공유</strong> 버튼 →{" "}
              <strong className="text-indigo-300">홈 화면에 추가</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
