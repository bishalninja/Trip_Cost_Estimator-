export interface TripFormData {
  vehicleNumber: string;
  driverName: string;
  brokerDetails: string;
  loadingDate: string;
  loadingLocation: string;
  unloadingDate: string;
  unloadingLocation: string;
  sku: string;
  tonnage: string;
  perTonPrice: string;
  km: string;
  externalPointMillKm: string;
  brokerCommission: string;
  loadingCost: string;
  unloadingCost: string;
  rto: string;
  fastagCost: string;
}

export interface CalculationResult {
  totalKm: number;
  litres: number;
  fuelCost: number;
  brokerCommissionAmount: number;
  driver: number;
  projectedExpenses: number;
  perKmCost: number;
  marginPerTrip: number;
  finalAmount: number;
  brokerTripCost: number;
  tripAmount: number;
  netMargin: number;
  baseClosingRate: number;
  totalQuotation: number;
  quotationPerTon: number;
}

export interface ConfirmedLoad extends TripFormData, CalculationResult {
  id: number;
  serial: number;
  timestamp: string;
  status: "CONFIRMED";
}

export const emptyTripForm: TripFormData = {
  vehicleNumber: "",
  driverName: "",
  brokerDetails: "",
  loadingDate: "",
  loadingLocation: "",
  unloadingDate: "",
  unloadingLocation: "",
  sku: "",
  tonnage: "",
  perTonPrice: "",
  km: "",
  externalPointMillKm: "",
  brokerCommission: "",
  loadingCost: "",
  unloadingCost: "",
  rto: "",
  fastagCost: "",
};
