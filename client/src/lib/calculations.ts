import type { CalculationResult, TripFormData } from "../types/estimator";

/**
 * Ported from the "Form Responses" sheet formula columns.
 *   totalKm            = km + externalPointMillKm
 *   litres             = totalKm / 3
 *   fuelCost           = litres * 100                (always auto — no manual override)
 *   driver             = 7000                         fixed, once vehicle# entered
 *   projectedExpenses  = fuel + brokerCommission + loadingCost
 *                        + unloadingCost + rto + fastagCost + driver
 *   marginPerTrip      = 5000                         fixed, once broker entered
 *   finalAmount        = projectedExpenses + marginPerTrip
 *   perKmCost          = finalAmount / totalKm         ("Per KM Trip Cost" — uses the
 *                        final amount, i.e. expenses + margin, not raw expenses)
 *   brokerTripCost     = tonnage * perTonPrice        ("Broker Cost" in the sheet)
 *   tripAmount         = brokerTripCost - brokerCommission
 *   netMargin          = brokerTripCost - finalAmount  (uses the un-reduced broker cost,
 *                        NOT tripAmount — verified against the sheet's sample row)
 *   baseClosingRate    = 75                           fixed, once unloading date entered
 *   totalQuotation     = totalKm * baseClosingRate
 *   quotationPerTon    = totalQuotation / tonnage
 */

export const FIXED_RATES = {
  driverCost: 7000,
  marginPerTrip: 5000,
  baseClosingRate: 75,
  kmPerLitre: 3,
  fuelRatePerLitre: 100,
} as const;

const num = (v: string): number => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

export function calculateTripCost(form: TripFormData): CalculationResult {
  const tonnage = num(form.tonnage);
  const perTonPrice = num(form.perTonPrice);
  const km = num(form.km);
  const extKm = num(form.externalPointMillKm);
  const brokerCommissionAmount = num(form.brokerCommission);
  const loadingCostAmount = num(form.loadingCost);
  const unloadingCostAmount = num(form.unloadingCost);
  const rtoAmount = num(form.rto);
  const fastagCostAmount = num(form.fastagCost);

  const totalKm = km + extKm;
  const litres = totalKm / FIXED_RATES.kmPerLitre;
  const fuelCost = litres * FIXED_RATES.fuelRatePerLitre;

  const driver = form.vehicleNumber ? FIXED_RATES.driverCost : 0;

  const projectedExpenses =
    fuelCost +
    brokerCommissionAmount +
    loadingCostAmount +
    unloadingCostAmount +
    rtoAmount +
    fastagCostAmount +
    driver;

  const marginPerTrip = form.brokerDetails ? FIXED_RATES.marginPerTrip : 0;
  const finalAmount = projectedExpenses + marginPerTrip;
  const perKmCost = totalKm ? finalAmount / totalKm : 0;

  const brokerTripCost = tonnage * perTonPrice;
  const tripAmount = brokerTripCost - brokerCommissionAmount;
  const netMargin = brokerTripCost - finalAmount;

  const baseClosingRate = form.unloadingDate ? FIXED_RATES.baseClosingRate : 0;
  const totalQuotation = totalKm * baseClosingRate;
  const quotationPerTon = tonnage ? totalQuotation / tonnage : 0;

  return {
    totalKm,
    litres,
    fuelCost,
    brokerCommissionAmount,
    loadingCostAmount,
    unloadingCostAmount,
    rtoAmount,
    fastagCostAmount,
    driver,
    projectedExpenses,
    perKmCost,
    marginPerTrip,
    finalAmount,
    brokerTripCost,
    tripAmount,
    netMargin,
    baseClosingRate,
    totalQuotation,
    quotationPerTon,
  };
}

export const formatINR = (n: number): string =>
  isFinite(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0";
