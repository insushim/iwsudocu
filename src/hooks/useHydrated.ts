'use client';

import { useSyncExternalStore } from 'react';

// Nothing to subscribe to: the answer flips exactly once, when React swaps the
// server snapshot for the client one at the end of hydration.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` while prerendering and during the hydrating render, `true` afterwards.
 *
 * Lets a component render a server-safe placeholder and then read client-only
 * state (localStorage, the wall clock, the resolved theme) without the
 * `useState(false)` + `useEffect(() => setState(true))` round trip, which
 * triggers a cascading render and is flagged by react-hooks/set-state-in-effect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
