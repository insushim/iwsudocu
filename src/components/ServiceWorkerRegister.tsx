"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Check for updates every 30 minutes
        setInterval(
          () => {
            registration.update();
          },
          30 * 60 * 1000,
        );

        // When a new SW is found, it will skipWaiting and activate
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            // New SW activated while old one was controlling - reload to get fresh assets
            if (
              newWorker.state === "activated" &&
              navigator.serviceWorker.controller
            ) {
              window.location.reload();
            }
          });
        });
      })
      .catch(() => {});

    // Listen for SW_UPDATED message from service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SW_UPDATED") {
        window.location.reload();
      }
    });
  }, []);

  return null;
}
