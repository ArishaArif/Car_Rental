import {
  Booking,
  BookingCustomerDetails,
  BookingDraft,
  BookingInvoice,
  BookingPricing,
  BookingStatus,
  PaymentMethod,
  VehicleInspection,
} from '../types';
import { MOCK_VEHICLES } from './vehicleData';
import { vehicleService } from './vehicleService';

export interface TopVehicleMetric {
  id: string;
  brand: string;
  model: string;
  category: string;
  image: string;
  tripsCount: number;
  revenue: number;
}

export interface RevenueMetrics {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  completedRentalsCount: number;
  cancelledBookingsCount: number;
  activeRentalsCount: number;
  pendingBookingsCount: number;
  cancellationRate: number;
  topVehicles: TopVehicleMetric[];
  revenueByCategory: { category: string; amount: number; percentage: number }[];
  weeklyTrend: { day: string; amount: number }[];
}

type BookingChangeListener = (bookings: Booking[]) => void;

/**
 * Pre-seeded mock bookings for realistic prototype experience
 */
const INITIAL_MOCK_BOOKINGS: Booking[] = [
  {
    id: 'VLX-BK-34901',
    vehicleId: 'veh-civic-02',
    vehicle: MOCK_VEHICLES[1], // Honda Civic Touring
    pickupDate: '2026-09-24',
    pickupTime: '11:00 AM',
    returnDate: '2026-09-28',
    returnTime: '11:00 AM',
    rentalDays: 4,
    pickupLocation: 'Downtown Tech District Hub',
    returnLocation: 'Downtown Tech District Hub',
    pricing: {
      dailyPrice: 62,
      rentalDays: 4,
      subtotal: 248,
      serviceFee: 25,
      taxes: 12,
      securityDeposit: 150,
      total: 435,
    },
    customer: {
      fullName: 'Sarah Jenkins',
      phone: '+1 (555) 432-8765',
      email: 's.jenkins@enterprise.io',
      licenseNumber: 'DL-CA-2022-8192',
      notes: 'Requires flight delay flexibility.',
    },
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    status: 'Pending',
    createdAt: '2026-09-21T08:30:00.000Z',
    pickupCode: '1849',
    pickupMileage: 18200,
  },
  {
    id: 'VLX-BK-91823',
    vehicleId: 'veh-tucson-04',
    vehicle: MOCK_VEHICLES[3], // Hyundai Tucson AWD
    pickupDate: '2026-09-18',
    pickupTime: '09:00 AM',
    returnDate: '2026-09-22',
    returnTime: '06:00 PM',
    rentalDays: 4,
    pickupLocation: 'Downtown Tech District Hub',
    returnLocation: 'Airport Terminal 1 - Hub West',
    pricing: {
      dailyPrice: 85,
      rentalDays: 4,
      subtotal: 340,
      serviceFee: 34,
      taxes: 17,
      securityDeposit: 150,
      total: 541,
    },
    customer: {
      fullName: 'Muhammad Ahmed',
      phone: '+92 300 1234567',
      email: 'ahmed@example.com',
      licenseNumber: 'PK-LHR-2021-9842',
    },
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    status: 'Active',
    createdAt: '2026-09-17T10:00:00.000Z',
    pickupCode: '3194',
    pickupMileage: 14280,
  },
  {
    id: 'VLX-BK-72914',
    vehicleId: 'veh-corolla-01',
    vehicle: MOCK_VEHICLES[0], // Toyota Corolla Hybrid
    pickupDate: '2026-10-01',
    pickupTime: '10:00 AM',
    returnDate: '2026-10-04',
    returnTime: '10:00 AM',
    rentalDays: 3,
    pickupLocation: 'Airport Terminal 1 - Hub West',
    returnLocation: 'Airport Terminal 1 - Hub West',
    pricing: {
      dailyPrice: 55,
      rentalDays: 3,
      subtotal: 165,
      serviceFee: 17,
      taxes: 8,
      securityDeposit: 150,
      total: 340,
    },
    customer: {
      fullName: 'Muhammad Ahmed',
      phone: '+92 300 1234567',
      email: 'ahmed@example.com',
      licenseNumber: 'PK-LHR-2021-9842',
    },
    paymentMethod: 'JazzCash',
    paymentStatus: 'Paid',
    status: 'Confirmed',
    createdAt: '2026-09-18T14:30:00.000Z',
    pickupCode: '4829',
    pickupMileage: 19540,
  },
  {
    id: 'VLX-BK-58102',
    vehicleId: 'veh-sportage-05',
    vehicle: MOCK_VEHICLES[4], // Kia Sportage
    pickupDate: '2026-08-15',
    pickupTime: '09:00 AM',
    returnDate: '2026-08-18',
    returnTime: '06:00 PM',
    rentalDays: 3,
    pickupLocation: 'Downtown Tech District Hub',
    returnLocation: 'Downtown Tech District Hub',
    pricing: {
      dailyPrice: 89,
      rentalDays: 3,
      subtotal: 267,
      serviceFee: 27,
      taxes: 13,
      securityDeposit: 150,
      total: 457,
    },
    customer: {
      fullName: 'Muhammad Ahmed',
      phone: '+92 300 1234567',
      email: 'ahmed@example.com',
      licenseNumber: 'PK-LHR-2021-9842',
    },
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    status: 'Completed',
    createdAt: '2026-08-10T11:15:00.000Z',
    pickupCode: '8210',
    pickupMileage: 28210,
    dropoffMileage: 28450,
    dropoffFuel: 100,
    inspection: {
      exteriorCondition: 'Good',
      interiorCondition: 'Clean',
      fuelLevel: 100,
      odometerReading: 28450,
      generalNotes: 'Vehicle returned in pristine condition. Keyless hub check complete.',
      inspectionPassed: true,
      inspectedAt: '2026-08-18T18:30:00.000Z',
    },
    invoice: {
      invoiceNumber: 'INV-2026-58102',
      bookingId: 'VLX-BK-58102',
      issuedAt: '2026-08-18T18:45:00.000Z',
      baseRental: 267,
      serviceFee: 27,
      taxes: 13,
      securityDeposit: 150,
      lateCharges: 0,
      damageCharges: 0,
      depositRefund: 150,
      finalAmount: 307,
      paymentMethod: 'Card',
      paymentStatus: 'Paid',
    },
  },
  {
    id: 'VLX-BK-11042',
    vehicleId: 'veh-fortuner-06',
    vehicle: MOCK_VEHICLES[5], // Toyota Fortuner
    pickupDate: '2026-09-05',
    pickupTime: '08:00 AM',
    returnDate: '2026-09-08',
    returnTime: '08:00 PM',
    rentalDays: 3,
    pickupLocation: 'Grand Plaza Fleet Depot',
    returnLocation: 'Grand Plaza Fleet Depot',
    pricing: {
      dailyPrice: 125,
      rentalDays: 3,
      subtotal: 375,
      serviceFee: 38,
      taxes: 19,
      securityDeposit: 200,
      total: 632,
    },
    customer: {
      fullName: 'David Ross',
      phone: '+1 (555) 901-4433',
      email: 'd.ross@adventures.net',
      licenseNumber: 'DL-TX-2020-4109',
    },
    paymentMethod: 'Card',
    paymentStatus: 'Failed',
    status: 'Cancelled',
    createdAt: '2026-09-04T12:00:00.000Z',
    pickupCode: '9041',
  },
];

class BookingService {
  private bookings: Booking[] = [...INITIAL_MOCK_BOOKINGS];
  private listeners: BookingChangeListener[] = [];

  public subscribe(listener: BookingChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    const copy = [...this.bookings];
    this.listeners.forEach(listener => {
      try {
        listener(copy);
      } catch (err) {
        console.warn('Error in booking listener', err);
      }
    });
  }

  /**
   * Calculate standard itemized pricing for a rental duration
   */
  public calculatePricing(dailyPrice: number, days: number): BookingPricing {
    const rentalDays = Math.max(1, days);
    const subtotal = dailyPrice * rentalDays;
    const serviceFee = Math.round(subtotal * 0.1); // 10% platform & roadside fee
    const taxes = Math.round(subtotal * 0.05); // 5% sales tax
    const securityDeposit = 150; // Refundable deposit
    const total = subtotal + serviceFee + taxes + securityDeposit;

    return {
      dailyPrice,
      rentalDays,
      subtotal,
      serviceFee,
      taxes,
      securityDeposit,
      total,
    };
  }

  /**
   * Generate an official invoice object from booking pricing and adjustments
   */
  public generateInvoice(
    booking: Booking,
    lateCharges: number = 0,
    damageCharges: number = 0
  ): BookingInvoice {
    const { subtotal, serviceFee, taxes, securityDeposit } = booking.pricing;
    const totalCharges = lateCharges + damageCharges;
    const depositRefund = Math.max(0, securityDeposit - totalCharges);
    const finalAmount = subtotal + serviceFee + taxes + totalCharges;

    return {
      invoiceNumber: `INV-${booking.id.replace('VLX-BK-', '')}`,
      bookingId: booking.id,
      issuedAt: new Date().toISOString(),
      baseRental: subtotal,
      serviceFee,
      taxes,
      securityDeposit,
      lateCharges,
      damageCharges,
      depositRefund,
      finalAmount,
      paymentMethod: booking.paymentMethod,
      paymentStatus: 'Paid',
    };
  }

  /**
   * Retrieve all bookings (sorted newest first)
   */
  public async getBookings(): Promise<Booking[]> {
    return [...this.bookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Find booking by unique ID
   */
  public async getBookingById(id: string): Promise<Booking | undefined> {
    return this.bookings.find(b => b.id === id);
  }

  /**
   * Retrieve currently active rental (if any)
   */
  public async getActiveRental(): Promise<Booking | undefined> {
    return this.bookings.find(b => b.status === 'Active');
  }

  /**
   * Activate a confirmed booking (when customer starts rental / picks up vehicle)
   */
  public async activateBooking(id: string): Promise<Booking | undefined> {
    return this.startRental(id);
  }

  /**
   * Provider: Approve a Pending booking
   */
  public async approveBooking(id: string): Promise<Booking> {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Booking with ID ${id} not found`);

    this.bookings[idx] = {
      ...this.bookings[idx],
      status: 'Confirmed',
    };

    // Update vehicle availability to Booked
    await vehicleService.updateAvailability(this.bookings[idx].vehicleId, 'Booked');

    this.notifyListeners();
    return this.bookings[idx];
  }

  /**
   * Provider: Reject a Pending booking
   */
  public async rejectBooking(id: string, reason?: string): Promise<Booking> {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Booking with ID ${id} not found`);

    this.bookings[idx] = {
      ...this.bookings[idx],
      status: 'Cancelled',
      customer: {
        ...this.bookings[idx].customer,
        notes: reason
          ? `${this.bookings[idx].customer.notes || ''} [Rejected: ${reason}]`.trim()
          : this.bookings[idx].customer.notes,
      },
    };

    // Release vehicle back to Available
    await vehicleService.updateAvailability(this.bookings[idx].vehicleId, 'Available');

    this.notifyListeners();
    return this.bookings[idx];
  }

  /**
   * Provider: Mark vehicle ready for customer handover
   */
  public async markReady(id: string): Promise<Booking> {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Booking with ID ${id} not found`);

    this.bookings[idx] = {
      ...this.bookings[idx],
      customer: {
        ...this.bookings[idx].customer,
        notes: `${this.bookings[idx].customer.notes || ''} [Vehicle Prepped & Ready at Hub]`.trim(),
      },
    };

    this.notifyListeners();
    return this.bookings[idx];
  }

  /**
   * Provider: Start Rental (transition Confirmed -> Active)
   */
  public async startRental(id: string): Promise<Booking> {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Booking with ID ${id} not found`);

    this.bookings[idx] = {
      ...this.bookings[idx],
      status: 'Active',
      pickupMileage: this.bookings[idx].pickupMileage || 15000,
    };

    // Synchronize vehicle availability to Active Rental
    await vehicleService.updateAvailability(this.bookings[idx].vehicleId, 'Active Rental');

    this.notifyListeners();
    return this.bookings[idx];
  }

  /**
   * Provider / Customer: Complete vehicle return and finalize rental
   */
  public async completeRental(
    bookingId: string,
    inspection?: VehicleInspection,
    lateCharges: number = 0,
    damageCharges: number = 0
  ): Promise<{ booking: Booking; invoice: BookingInvoice }> {
    const idx = this.bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) {
      throw new Error(`Booking with ID ${bookingId} not found`);
    }

    const currentBooking = this.bookings[idx];
    const invoice = this.generateInvoice(currentBooking, lateCharges, damageCharges);

    const defaultInspection: VehicleInspection = inspection || {
      exteriorCondition: 'Good',
      interiorCondition: 'Clean',
      fuelLevel: 100,
      odometerReading: (currentBooking.pickupMileage || 15000) + 180,
      inspectionPassed: true,
      inspectedAt: new Date().toISOString(),
      generalNotes: 'Provider completion check verified.',
    };

    const completedBooking: Booking = {
      ...currentBooking,
      status: 'Completed',
      inspection: defaultInspection,
      invoice,
      dropoffMileage: defaultInspection.odometerReading,
      dropoffFuel: defaultInspection.fuelLevel,
    };

    this.bookings[idx] = completedBooking;

    // Reset vehicle availability back to Available in shared fleet
    await vehicleService.updateAvailability(currentBooking.vehicleId, 'Available');

    this.notifyListeners();
    return {
      booking: completedBooking,
      invoice,
    };
  }

  /**
   * Generic status update with vehicle synchronization
   */
  public async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Booking with ID ${id} not found`);

    this.bookings[idx] = {
      ...this.bookings[idx],
      status,
    };

    if (status === 'Active') {
      await vehicleService.updateAvailability(this.bookings[idx].vehicleId, 'Active Rental');
    } else if (status === 'Completed' || status === 'Cancelled') {
      await vehicleService.updateAvailability(this.bookings[idx].vehicleId, 'Available');
    } else if (status === 'Confirmed') {
      await vehicleService.updateAvailability(this.bookings[idx].vehicleId, 'Booked');
    }

    this.notifyListeners();
    return this.bookings[idx];
  }

  /**
   * Complete vehicle return, perform inspection and issue invoice
   */
  public async completeReturn(
    bookingId: string,
    inspection: VehicleInspection,
    lateCharges: number = 0,
    damageCharges: number = 0
  ): Promise<{ booking: Booking; invoice: BookingInvoice }> {
    return this.completeRental(bookingId, inspection, lateCharges, damageCharges);
  }

  /**
   * Retrieve invoice for a specific booking
   */
  public async getInvoiceForBooking(bookingId: string): Promise<BookingInvoice | undefined> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) return undefined;
    if (booking.invoice) return booking.invoice;

    // If completed without invoice, generate on the fly
    if (booking.status === 'Completed') {
      const generated = this.generateInvoice(booking);
      booking.invoice = generated;
      return generated;
    }
    return undefined;
  }

  /**
   * Persist a new confirmed booking in local storage
   */
  public async createBooking(
    draft: BookingDraft,
    customer: BookingCustomerDetails,
    paymentMethod: PaymentMethod
  ): Promise<Booking> {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `VLX-BK-${randomSuffix}`;
    const pickupPin = `${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: bookingId,
      vehicleId: draft.vehicle.id,
      vehicle: draft.vehicle,
      pickupDate: draft.pickupDate,
      pickupTime: draft.pickupTime,
      returnDate: draft.returnDate,
      returnTime: draft.returnTime,
      rentalDays: draft.rentalDays,
      pickupLocation: draft.pickupLocation,
      returnLocation: draft.returnLocation,
      pricing: draft.pricing,
      customer,
      paymentMethod,
      paymentStatus: 'Paid',
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      pickupCode: pickupPin,
      pickupMileage: draft.vehicle.mileage || 12500,
    };

    // Mark vehicle booked
    await vehicleService.updateAvailability(draft.vehicle.id, 'Booked');

    this.bookings = [newBooking, ...this.bookings];
    this.notifyListeners();
    return newBooking;
  }

  /**
   * Cancel an existing booking
   */
  public async cancelBooking(id: string): Promise<boolean> {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      const vehicleId = this.bookings[idx].vehicleId;
      this.bookings[idx] = {
        ...this.bookings[idx],
        status: 'Cancelled',
      };
      await vehicleService.updateAvailability(vehicleId, 'Available');
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Compute comprehensive financial and operational reports
   */
  public getRevenueMetrics(): RevenueMetrics {
    const completed = this.bookings.filter(b => b.status === 'Completed');
    const active = this.bookings.filter(b => b.status === 'Active');
    const confirmed = this.bookings.filter(b => b.status === 'Confirmed');
    const pending = this.bookings.filter(b => b.status === 'Pending');
    const cancelled = this.bookings.filter(b => b.status === 'Cancelled');

    // Revenue totals
    const completedTotal = completed.reduce((sum, b) => sum + (b.invoice?.finalAmount || b.pricing.subtotal), 0);
    const activeTotal = active.reduce((sum, b) => sum + b.pricing.subtotal, 0);
    const confirmedTotal = confirmed.reduce((sum, b) => sum + b.pricing.subtotal, 0);

    const totalRevenue = completedTotal + activeTotal + confirmedTotal;
    const monthlyRevenue = Math.round(totalRevenue * 0.85);
    const weeklyRevenue = Math.round(totalRevenue * 0.28);
    const dailyRevenue = Math.round(weeklyRevenue / 7);

    const totalOrders = this.bookings.length;
    const cancellationRate = totalOrders > 0 ? Math.round((cancelled.length / totalOrders) * 100) : 0;

    // Top vehicles aggregated
    const vehicleMap = new Map<string, { brand: string; model: string; category: string; image: string; trips: number; revenue: number }>();

    this.bookings.forEach(b => {
      const vid = b.vehicleId;
      const amount = b.invoice?.finalAmount || b.pricing.subtotal;
      const isCountable = b.status === 'Completed' || b.status === 'Active' || b.status === 'Confirmed';
      if (!vehicleMap.has(vid)) {
        vehicleMap.set(vid, {
          brand: b.vehicle.brand,
          model: b.vehicle.model,
          category: b.vehicle.category,
          image: b.vehicle.image,
          trips: isCountable ? 1 : 0,
          revenue: isCountable ? amount : 0,
        });
      } else {
        const item = vehicleMap.get(vid)!;
        if (isCountable) {
          item.trips += 1;
          item.revenue += amount;
        }
      }
    });

    const topVehicles: TopVehicleMetric[] = Array.from(vehicleMap.entries())
      .map(([id, data]) => ({
        id,
        brand: data.brand,
        model: data.model,
        category: data.category,
        image: data.image,
        tripsCount: data.trips,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Revenue by category breakdown
    const categoryTotals: Record<string, number> = {
      Luxury: 0,
      SUV: 0,
      Sedan: 0,
      Economy: 0,
    };

    this.bookings.forEach(b => {
      if (b.status === 'Completed' || b.status === 'Active' || b.status === 'Confirmed') {
        const cat = b.vehicle.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (b.invoice?.finalAmount || b.pricing.subtotal);
      }
    });

    const revenueByCategory = Object.keys(categoryTotals).map(cat => ({
      category: cat,
      amount: categoryTotals[cat],
      percentage: totalRevenue > 0 ? Math.round((categoryTotals[cat] / totalRevenue) * 100) : 0,
    }));

    // Weekly trend (simulated last 7 days)
    const weeklyTrend = [
      { day: 'Mon', amount: Math.round(dailyRevenue * 0.85) },
      { day: 'Tue', amount: Math.round(dailyRevenue * 0.92) },
      { day: 'Wed', amount: Math.round(dailyRevenue * 1.05) },
      { day: 'Thu', amount: Math.round(dailyRevenue * 1.15) },
      { day: 'Fri', amount: Math.round(dailyRevenue * 1.45) },
      { day: 'Sat', amount: Math.round(dailyRevenue * 1.6) },
      { day: 'Sun', amount: Math.round(dailyRevenue * 1.3) },
    ];

    return {
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      totalRevenue,
      completedRentalsCount: completed.length,
      cancelledBookingsCount: cancelled.length,
      activeRentalsCount: active.length,
      pendingBookingsCount: pending.length,
      cancellationRate,
      topVehicles,
      revenueByCategory,
      weeklyTrend,
    };
  }
}

export const bookingService = new BookingService();
