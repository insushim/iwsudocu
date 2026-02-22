"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const GITHUB_REPO = "insushim/iwsudocu";
const DISMISS_KEY = "kanchaeum-update-dismissed";

function getApkVersion(): string | null {
  if (typeof window === "undefined") return null;
  // Check JavaScript interface (Android WebView)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  if (win.KanchaeumNative?.getVersion) {
    return win.KanchaeumNative.getVersion();
  }
  // Check user agent
  const match = navigator.userAgent.match(/KanchaeumApp\/([\d.]+)/);
  return match ? match[1] : null;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export function AppUpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<{
    version: string;
    url: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const currentVersion = getApkVersion();
    if (!currentVersion) return; // Not running in APK

    // Check if already dismissed for this session
    const dismissedVersion = sessionStorage.getItem(DISMISS_KEY);

    async function checkUpdate() {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
          { headers: { Accept: "application/vnd.github.v3+json" } },
        );
        if (!res.ok) return;
        const release = await res.json();
        const latestVersion = (release.tag_name as string).replace(/^v/, "");

        if (
          compareVersions(latestVersion, currentVersion!) > 0 &&
          dismissedVersion !== latestVersion
        ) {
          // Find APK asset
          const apkAsset = (
            release.assets as Array<{
              name: string;
              browser_download_url: string;
            }>
          )?.find((a) => a.name.endsWith(".apk"));
          setUpdateInfo({
            version: latestVersion,
            url: apkAsset?.browser_download_url || release.html_url,
          });
        }
      } catch {
        // Silently fail
      }
    }

    // Check after 5 seconds to not block initial load
    const timer = setTimeout(checkUpdate, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!updateInfo || dismissed) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[60] safe-top",
        "bg-gradient-to-r from-indigo-600 to-purple-600",
        "px-4 py-3 shadow-lg",
      )}
    >
      <div className="mx-auto max-w-lg flex items-center gap-3">
        <Download className="w-5 h-5 text-white shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">
            새 버전 v{updateInfo.version} 사용 가능
          </p>
          <p className="text-xs text-white/70">
            업데이트하여 최신 기능을 즐기세요
          </p>
        </div>
        <a
          href={updateInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 rounded-lg bg-white text-indigo-600 text-sm font-bold"
        >
          업데이트
        </a>
        <button
          onClick={() => {
            setDismissed(true);
            sessionStorage.setItem(DISMISS_KEY, updateInfo.version);
          }}
          className="shrink-0 p-1 text-white/60 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
