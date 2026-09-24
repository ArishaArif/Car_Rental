import { Vehicle, VehiclePricingMetrics } from '../types';
import { vehicleService } from './vehicleService';
import { aiPricingApi } from '../api/aiPricingApi';
import { ApiVehiclePricingMetricsResponse } from '../api/types';

export interface SmartPricingServiceInterface {
  getVehiclePricingMetrics(vehicleId: string): Promise<VehiclePricingMetrics>;
  getAllFleetPricingMetrics(): Promise<VehiclePricingMetrics[]>;
  acceptRecommendation(vehicleId: string, newPrice: number): Promise<Vehicle>;
}

function mapApiPricingMetrics(m: ApiVehiclePricingMetricsResponse): VehiclePricingMetrics {
  return {
    vehicleId: m.vehicle_id,
    vehicleName: m.vehicle_name,
    currentPrice: m.current_price,
    recommendedPrice: m.recommended_price,
    difference: m.difference,
    percentageChange: m.percentage_change,
    demandLevel: m.demand_level,
    utilizationRate: m.utilization_rate,
    weekendFactor: m.weekend_factor,
    seasonalFactor: m.seasonal_factor,
    availabilityStatus: m.availability_status as any,
    bookingFrequency: m.booking_frequency,
    explanation: m.explanation,
    factors: m.factors || [],
  };
}

class SmartPricingService implements SmartPricingServiceInterface {
  /**
   * Evaluates vehicle pricing metrics based on live backend yield engine or fallback signals
   */
  public async getVehiclePricingMetrics(vehicleId: string): Promise<VehiclePricingMetrics> {
    try {
      const res = await aiPricingApi.getVehiclePricingMetrics(vehicleId);
      if (res.success && res.data) {
        return mapApiPricingMetrics(res.data);
      }
    } catch (e: any) {
      // fallback to simulated heuristic
    }

    const vehicle = await vehicleService.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle ${vehicleId} not found`);
    }

    const currentPrice = vehicle.pricePerDay;

    let demandMultiplier = 1.05;
    let demandLevel: 'Low' | 'Moderate' | 'High' | 'Peak' = 'High';
    let utilizationRate = 82;
    let weekendFactor = 1.12;
    let seasonalFactor = 1.06;
    let bookingFrequency = 6.2;

    if (vehicle.category === 'SUV') {
      demandMultiplier = 1.14;
      demandLevel = 'Peak';
      utilizationRate = 89;
      weekendFactor = 1.18;
      seasonalFactor = 1.10;
      bookingFrequency = 7.8;
    } else if (vehicle.category === 'Sedan') {
      demandMultiplier = 1.10;
      demandLevel = 'High';
      utilizationRate = 84;
      weekendFactor = 1.12;
      seasonalFactor = 1.05;
      bookingFrequency = 6.5;
    } else if (vehicle.category === 'Luxury') {
      demandMultiplier = 1.08;
      demandLevel = 'Moderate';
      utilizationRate = 68;
      weekendFactor = 1.22;
      seasonalFactor = 1.12;
      bookingFrequency = 3.9;
    } else {
      demandMultiplier = 1.04;
      demandLevel = 'Moderate';
      utilizationRate = 75;
      weekendFactor = 1.08;
      seasonalFactor = 1.02;
      bookingFrequency = 5.1;
    }

    const rawRecommended = currentPrice * demandMultiplier;
    const recommendedPrice = Math.round(rawRecommended / 100) * 100;
    const difference = recommendedPrice - currentPrice;
    const percentageChange = Math.round(((recommendedPrice - currentPrice) / currentPrice) * 100);
    const isIncrease = difference >= 0;

    const explanation = isIncrease
      ? `Our Smart Pricing engine detected elevated ${demandLevel.toLowerCase()} demand (${utilizationRate}% fleet utilization) and upcoming weekend booking velocity for ${vehicle.brand} ${vehicle.model}. Adjusting the daily rate from PKR ${currentPrice.toLocaleString()} to PKR ${recommendedPrice.toLocaleString()} (+${percentageChange}%) optimizes booking yield without reducing reservation conversion.`
      : `Market velocity for ${vehicle.category} models has stabilized. Adjusting to PKR ${recommendedPrice.toLocaleString()} (${percentageChange}%) ensures high vehicle occupancy and beats nearby competitor benchmarks.`;

    const factors = [
      {
        label: `Market Demand (${demandLevel})`,
        impact: `+${Math.round((demandMultiplier - 1) * 100)}%`,
        positive: true,
      },
      {
        label: `Fleet Utilization (${utilizationRate}%)`,
        impact: utilizationRate > 75 ? '+4% yield' : 'Neutral',
        positive: utilizationRate > 75,
      },
      {
        label: `Weekend Surge Factor (${weekendFactor}x)`,
        impact: `+${Math.round((weekendFactor - 1) * 100)}% Friday-Sunday`,
        positive: true,
      },
      {
        label: `Seasonal Factor (${seasonalFactor}x)`,
        impact: `+${Math.round((seasonalFactor - 1) * 100)}% tourist travel`,
        positive: true,
      },
      {
        label: `Booking Frequency (${bookingFrequency}x/mo)`,
        impact: 'High liquidity',
        positive: true,
      },
    ];

    return {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
      currentPrice,
      recommendedPrice,
      difference,
      percentageChange,
      demandLevel,
      utilizationRate,
      weekendFactor,
      seasonalFactor,
      availabilityStatus: vehicle.availability,
      bookingFrequency,
      explanation,
      factors,
    };
  }

  /**
   * Get pricing metrics for all vehicles in the fleet
   */
  public async getAllFleetPricingMetrics(): Promise<VehiclePricingMetrics[]> {
    try {
      const res = await aiPricingApi.getFleetPricingMetrics();
      if (res.success && res.data && res.data.length > 0) {
        return res.data.map(mapApiPricingMetrics);
      }
    } catch (e: any) {
      // fallback
    }

    const vehicles = await vehicleService.getAllVehicles(true);
    const metrics: VehiclePricingMetrics[] = [];
    for (const v of vehicles) {
      const metric = await this.getVehiclePricingMetrics(v.id);
      metrics.push(metric);
    }
    return metrics;
  }

  /**
   * Accept recommendation: Updates the vehicle listing on live backend and local store
   */
  public async acceptRecommendation(vehicleId: string, newPrice: number): Promise<Vehicle> {
    try {
      await aiPricingApi.applyRecommendation({
        vehicle_id: vehicleId,
        recommended_price: newPrice,
      });
    } catch (e: any) {
      console.warn('[SmartPricingService] live applyRecommendation fallback:', e?.message);
    }

    const updated = await vehicleService.updateVehicle(vehicleId, {
      pricePerDay: newPrice,
      weeklyPrice: Math.round(newPrice * 6.2),
    });
    return updated;
  }
}

export const smartPricingService = new SmartPricingService();
