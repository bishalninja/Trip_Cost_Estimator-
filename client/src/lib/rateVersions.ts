/**
 * Versioned fixed rates used in cost calculations.
 *
 * Why versioned: if these numbers ever change (e.g. driver cost goes up,
 * fuel rate changes), old saved loads should keep showing the rates that
 * were actually in effect when they were calculated — not get silently
 * reinterpreted under today's numbers. Every calculation records which
 * version it used (`rateVersion` on CalculationResult / ConfirmedLoad).
 *
 * To change rates going forward: add a NEW entry to RATE_VERSIONS below
 * (don't edit an existing one — that would retroactively change the
 * meaning of historical loads that reference it). The last entry in the
 * array is always the "current" version used for new calculations.
 */

export interface RateSet {
  driverCost: number;
  marginPerTrip: number;
  baseClosingRate: number;
  kmPerLitre: number;
  fuelRatePerLitre: number;
}

export interface RateVersion {
  id: string;
  label: string;
  effectiveFrom: string; // ISO date, for your own reference
  rates: RateSet;
}

export const RATE_VERSIONS: RateVersion[] = [
  {
    id: "v1",
    label: "Initial rates",
    effectiveFrom: "2026-01-01",
    rates: {
      driverCost: 7000,
      marginPerTrip: 5000,
      baseClosingRate: 75,
      kmPerLitre: 3,
      fuelRatePerLitre: 100,
    },
  },
];

export const CURRENT_RATE_VERSION = RATE_VERSIONS[RATE_VERSIONS.length - 1];

export function getRateVersion(id: string): RateVersion {
  return RATE_VERSIONS.find((v) => v.id === id) ?? CURRENT_RATE_VERSION;
}
