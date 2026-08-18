import type { CalculationResult, TripFormData } from "../types/estimator";
import { CURRENT_RATE_VERSION, getRateVersion, type RateVersion } from "./rateVersions";

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

export function calculateTripCost(form: TripFormData, rateVersion: RateVersion = CURRENT_RATE_VERSION
): CalculationResult {

  const rates = rateVersion.rates;
  const tonnage = num(form.tonnage);
  const perTonPrice = num(form.perTonPrice);
  const km = num(form.km);
  const extKm = num(form.externalPointMillKm);

  const brokerCommissionAmount = num(form.brokerCommission);
  const loadingCostAmount = num(form.loadingCost);
  const unloadingCostAmount = num(form.unloadingCost);
  const rtoAmount = num(form.rto);
  const fastagCostAmount = num(form.fastagCost);

  const brokerTripCost = tonnage * perTonPrice;
  const tripAmount = brokerTripCost - brokerCommissionAmount;

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
  const perKmCost = totalKm ? projectedExpenses / totalKm : 0;
  const netMargin = tripAmount - finalAmount;

  const baseClosingRate = form.unloadingDate ? FIXED_RATES.baseClosingRate : 0;
  const totalQuotation = totalKm * baseClosingRate;
  const quotationPerTon = tonnage ? totalQuotation / tonnage : 0;

  return {
    rateVersion: rateVersion.id,
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
export { getRateVersion, CURRENT_RATE_VERSION } from "./rateVersions";

export const formatINR = (n: number): string =>
  isFinite(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0";
