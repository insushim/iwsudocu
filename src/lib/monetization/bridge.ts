/**
 * Native monetization bridges.
 *
 * The web build ships with no ad or billing SDK. The Android wrapper injects
 * `window.NumeroAds` / `window.NumeroBilling` once AdMob and Play Billing are
 * configured with real unit/product ids; until then every entry point below
 * reports "unavailable" and the UI falls back to a purely in-game path. Nothing
 * here ever claims an ad was watched or a purchase completed on its own.
 */

export interface RewardedAdBridge {
  /** True when a rewarded ad is loaded and can be shown right now. */
  isReady(): boolean;
  /** Resolves true only if the user watched to the reward threshold. */
  show(): Promise<boolean>;
}

export interface BillingProduct {
  sku: string;
  titleKo: string;
  descriptionKo: string;
  /** Localized price string from the store, e.g. "₩5,900". */
  price: string;
  grants: Entitlement[];
}

export type Entitlement = 'removeAds' | 'allThemes' | 'seasonPass';

export interface BillingBridge {
  isAvailable(): boolean;
  listProducts(): Promise<BillingProduct[]>;
  /** Resolves the granted entitlements, or null if the purchase didn't complete. */
  purchase(sku: string): Promise<Entitlement[] | null>;
  /** Re-reads owned products so a reinstall restores entitlements. */
  restore(): Promise<Entitlement[]>;
}

declare global {
  interface Window {
    NumeroAds?: RewardedAdBridge;
    NumeroBilling?: BillingBridge;
  }
}

function ads(): RewardedAdBridge | undefined {
  return typeof window === 'undefined' ? undefined : window.NumeroAds;
}

function billing(): BillingBridge | undefined {
  return typeof window === 'undefined' ? undefined : window.NumeroBilling;
}

/** Whether a rewarded ad can be offered. `adFree` owners are never shown ads. */
export function isRewardedAdReady(adFree: boolean): boolean {
  if (adFree) return false;
  try {
    return ads()?.isReady() === true;
  } catch {
    return false;
  }
}

/** Show a rewarded ad. Returns true only on a real, completed view. */
export async function showRewardedAd(): Promise<boolean> {
  const bridge = ads();
  if (!bridge) return false;
  try {
    return (await bridge.show()) === true;
  } catch {
    return false;
  }
}

export function isBillingAvailable(): boolean {
  try {
    return billing()?.isAvailable() === true;
  } catch {
    return false;
  }
}

export async function listProducts(): Promise<BillingProduct[]> {
  const bridge = billing();
  if (!bridge) return [];
  try {
    return await bridge.listProducts();
  } catch {
    return [];
  }
}

export async function purchaseProduct(sku: string): Promise<Entitlement[] | null> {
  const bridge = billing();
  if (!bridge) return null;
  try {
    return await bridge.purchase(sku);
  } catch {
    return null;
  }
}

export async function restorePurchases(): Promise<Entitlement[]> {
  const bridge = billing();
  if (!bridge) return [];
  try {
    return await bridge.restore();
  } catch {
    return [];
  }
}
