import { Vehicle, VehiclePricingMetrics } from '../types';
import { vehicleService } from './vehicleService';

export interface SmartPricingServiceInterface {
  getVehiclePricingMetrics(vehicleId: string): Promise<VehiclePricingMetrics>;
  getAllFleetPricingMetrics(): Promise<VehiclePricingMetrics[]>;
  acceptRecommendation(vehicleId: string, newPrice: number): Promise<Vehicle>;
}

class SmartPricingService implements SmartPricingServiceInterface {
  /**
   * Evaluates vehicle pricing metrics based on simulated market signals:
   * Demand, Fleet Utilization, Weekend Surge, Seasonal Index, and Historical Frequency.
   */
  public async getVehiclePricingMetrics(vehicleId: string): Promise<VehiclePricingMetrics> {
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle ${vehicleId} not found`);
    }

    const currentPrice = vehicle.pricePerDay;

    // Simulated market signals tailored to vehicle category & status
    let demandMultiplier = 1.05;
    let demandLevel: 'Low' | 'Moderate' | 'High' | 'Peak' = 'High';
    let utilizationRate = 82; // 82%
    let weekendFactor = 1.12;
    let seasonalFactor = 1.06;
    let bookingFrequency = 6.2; // bookings / month

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

    // Recommended daily rate calculation rounded to nearest 100 PKR
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
    const vehicles = await vehicleService.getAllVehicles(true);
    const metrics: VehiclePricingMetrics[] = [];
    for (const v of vehicles) {
      const metric = await this.getVehiclePricingMetrics(v.id);
      metrics.push(metric);
    }
    return metrics;
  }

  /**
   * Accept recommendation: Updates the SAME vehicle in unified vehicleService
   * Notifies all listeners so Provider Fleet & Customer views instantly reflect new pricing!
   */
  public async acceptRecommendation(vehicleId: string, newPrice: number): Promise<Vehicle> {
    const updated = await vehicleService.updateVehicle(vehicleId, {
      pricePerDay: newPrice,
      weeklyPrice: Math.round(newPrice * 6.2),
    });
    return updated;
  }
}

export const smartPricingService = new SmartPricingService();
