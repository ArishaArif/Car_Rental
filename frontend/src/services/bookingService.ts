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
import { apiClient } from './apiClient';

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

function mapBackendBooking(b: any): Booking {
  const vehicleData = b.vehicle ? {
    id: String(b.vehicle.id),
    brand: b.vehicle.brand,
    model: b.vehicle.model,
    year: b.vehicle.year,
    category: b.vehicle.category,
    image: b.vehicle.image,
    images: b.vehicle.images || [b.vehicle.image],
    pricePerDay: b.vehicle.price_per_day,
    weeklyPrice: b.vehicle.weekly_price || Math.round(b.vehicle.price_per_day * 6.2),
    securityDeposit: b.vehicle.security_deposit || 150,
    rating: b.vehicle.rating || 5.0,
    seats: b.vehicle.seats || 5,
    doors: b.vehicle.doors || 4,
    transmission: b.vehicle.transmission || 'Automatic',
    fuel: b.vehicle.fuel || 'Petrol',
    location: b.vehicle.location || 'Downtown Hub',
    mileage: b.vehicle.mileage || 1500,
    availability: b.vehicle.availability || 'Available',
    features: b.vehicle.features || [],
    description: b.vehicle.description || '',
    isPublished: b.vehicle.is_published ?? true,
  } : MOCK_VEHICLES[0];

  const pricing = b.pricing || {
    dailyPrice: b.rental_days > 0 ? (b.pricing?.subtotal || 200) / b.rental_days : 65,
    rentalDays: b.rental_days || 1,
    subtotal: b.pricing?.subtotal || 150,
    serviceFee: b.pricing?.service_fee || 15,
    taxes: b.pricing?.taxes || 10,
    securityDeposit: b.pricing?.security_deposit || 150,
    total: b.pricing?.total || 325,
  };

  const customer: BookingCustomerDetails = {
    fullName: b.customer_details?.fullName || b.customer_details?.full_name || 'Customer',
    phone: b.customer_details?.phone || '+1 555 000 0000',
    email: b.customer_details?.email || 'customer@carrental.com',
    licenseNumber: b.customer_details?.licenseNumber || b.customer_details?.license_number || 'DL-98421094',
    notes: b.customer_details?.notes || '',
  };

  return {
    id: b.id,
    vehicleId: String(b.vehicle_id),
    vehicle: vehicleData,
    pickupDate: b.pickup_date,
    pickupTime: b.pickup_time || '10:00 AM',
    returnDate: b.return_date,
    returnTime: b.return_time || '10:00 AM',
    rentalDays: b.rental_days,
    pickupLocation: b.pickup_location,
    returnLocation: b.return_location,
    pricing: {
      dailyPrice: pricing.dailyPrice || (b.rental_days > 0 ? pricing.subtotal / b.rental_days : 65),
      rentalDays: b.rental_days,
      subtotal: pricing.subtotal || pricing.dailyPrice * b.rental_days,
      serviceFee: pricing.serviceFee || pricing.service_fee || Math.round(pricing.subtotal * 0.1),
      taxes: pricing.taxes || Math.round(pricing.subtotal * 0.05),
      securityDeposit: pricing.securityDeposit || pricing.security_deposit || 150,
      total: pricing.total || pricing.subtotal + 150,
    },
    customer,
    paymentMethod: (b.payment_method as PaymentMethod) || 'Card',
    paymentStatus: b.payment_status || 'Paid',
    status: (b.status as BookingStatus) || 'Pending',
    createdAt: b.created_at || new Date().toISOString(),
    pickupCode: b.pickup_code || '1234',
    pickupMileage: b.pickup_mileage || 15000,
    dropoffMileage: b.dropoff_mileage,
    dropoffFuel: b.dropoff_fuel,
  };
}

const INITIAL_MOCK_BOOKINGS: Booking[] = [
  {
    id: 'VLX-BK-34901',
    vehicleId: 'veh-civic-02',
    vehicle: MOCK_VEHICLES[1],
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
    vehicle: MOCK_VEHICLES[3],
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
];

class BookingService {
  private bookings: Booking[] = [...INITIAL_MOCK_BOOKINGS];
  private listeners: BookingChangeListener[] = [];
  private isLoadedFromBackend: boolean = false;

  constructor() {
    this.refreshFromBackend().catch(e => {
      console.warn('[BookingService] Initial bookings sync deferred:', e?.message);
    });
  }

  public async refreshFromBackend(): Promise<Booking[]> {
    try {
      const res = await apiClient.get<any[]>('/bookings');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const liveBookings = res.data.map(mapBackendBooking);
        this.bookings = liveBookings;
        this.isLoadedFromBackend = true;
        this.notifyListeners();
        return liveBookings;
      }
    } catch (e: any) {
      console.warn('[BookingService] refreshFromBackend fallback:', e?.message);
    }
    return this.bookings;
  }

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

  public calculatePricing(dailyPrice: number, days: number): BookingPricing {
    const rentalDays = Math.max(1, days);
    const subtotal = dailyPrice * rentalDays;
    const serviceFee = Math.round(subtotal * 0.1);
    const taxes = Math.round(subtotal * 0.05);
    const securityDeposit = 150;
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

  public async getBookings(): Promise<Booking[]> {
    if (!this.isLoadedFromBackend) {
      await this.refreshFromBackend();
    }
    return [...this.bookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async getBookingById(id: string): Promise<Booking | undefined> {
    try {
      const res = await apiClient.get<any>(`/bookings/${id}`);
      if (res.success && res.data) {
        const liveB = mapBackendBooking(res.data);
        const idx = this.bookings.findIndex(b => b.id === id);
        if (idx !== -1) {
          this.bookings[idx] = liveB;
        } else {
          this.bookings.push(liveB);
        }
        return liveB;
      }
    } catch (e) {
      // Fallback to local
    }
    return this.bookings.find(b => b.id === id);
  }

  public async getActiveRental(): Promise<Booking | undefined> {
    return this.bookings.find(b => b.status === 'Active');
  }

  public async activateBooking(id: string): Promise<Booking | undefined> {
    return this.startRental(id);
  }

  public async approveBooking(id: string): Promise<Booking> {
    try {
      await apiClient.post(`/bookings/${id}/confirm`);
    } catch (e) {
      console.warn('[BookingService] Live approveBooking fallback:', e);
    }
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Booking with ID ${id} not found`);
    this.bookings[idx] = { ...this.bookings[idx], status: 'Confirmed' };
    await vehicleService.updateAvailability(this.bookings[idx].vehicleId, 'Booked');
    this.notifyListeners();
    return this.bookings[idx];
  }

  public async rejectBooking(id: string, reason?: string): Promise<Booking> {
    try {
      await apiClient.post(`/bookings/${id}/cancel`, { reason });
    } catch (e) {
      console.warn('[BookingService] Live rejectBooking fallback:', e);
    }
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Booking with ID ${id} not found`);
    this.bookings[idx] = { ...this.bookings[idx], status: 'Cancelled' };
    await vehicleService.updateAvailability(this.bookings[idx].vehicleId, 'Available');
    this.notifyListeners();
    return this.bookings[idx];
  }

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

  public async startRental(id: string, pickupCode?: string): Promise<Booking> {
    const current = this.bookings.find(b => b.id === id);
    const code = pickupCode || current?.pickupCode || '1234';

    try {
      await apiClient.post(`/bookings/${id}/pickup`, {
        pickup_code: code,
        pickup_mileage: current?.pickupMileage || 15000,
      });
    } catch (e) {
      console.warn('[BookingService] Live pickup failed, using local transition:', e);
    }

    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Booking with ID ${id} not found`);
    this.bookings[idx] = { ...this.bookings[idx], status: 'Active' };
    await vehicleService.updateAvailability(this.bookings[idx].vehicleId, 'Active Rental');
    this.notifyListeners();
    return this.bookings[idx];
  }

  public async completeRental(
    bookingId: string,
    inspection?: VehicleInspection,
    lateCharges: number = 0,
    damageCharges: number = 0
  ): Promise<{ booking: Booking; invoice: BookingInvoice }> {
    const idx = this.bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) throw new Error(`Booking with ID ${bookingId} not found`);

    const currentBooking = this.bookings[idx];

    try {
      await apiClient.post(`/bookings/${bookingId}/return`, {
        dropoff_mileage: inspection?.odometerReading || (currentBooking.pickupMileage || 15000) + 150,
        dropoff_fuel: inspection?.fuelLevel || 100,
        late_hours: Math.round(lateCharges / 25),
        damage_charges: damageCharges,
        notes: inspection?.generalNotes || 'Return checkout verified.',
      });
    } catch (e) {
      console.warn('[BookingService] Live return failed, using local settlement:', e);
    }

    const invoice = this.generateInvoice(currentBooking, lateCharges, damageCharges);
    const completedBooking: Booking = {
      ...currentBooking,
      status: 'Completed',
      inspection,
      invoice,
    };

    this.bookings[idx] = completedBooking;
    await vehicleService.updateAvailability(currentBooking.vehicleId, 'Available');
    this.notifyListeners();
    return { booking: completedBooking, invoice };
  }

  public async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Booking with ID ${id} not found`);
    this.bookings[idx] = { ...this.bookings[idx], status };
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

  public async completeReturn(
    bookingId: string,
    inspection: VehicleInspection,
    lateCharges: number = 0,
    damageCharges: number = 0
  ): Promise<{ booking: Booking; invoice: BookingInvoice }> {
    return this.completeRental(bookingId, inspection, lateCharges, damageCharges);
  }

  public async getInvoiceForBooking(bookingId: string): Promise<BookingInvoice | undefined> {
    try {
      const res = await apiClient.get<any>(`/bookings/${bookingId}/invoice`);
      if (res.success && res.data) {
        const inv = res.data;
        return {
          invoiceNumber: inv.invoice_number,
          bookingId: inv.booking_id,
          issuedAt: inv.issued_at,
          baseRental: inv.base_rental,
          serviceFee: inv.service_fee,
          taxes: inv.taxes,
          securityDeposit: inv.security_deposit,
          lateCharges: inv.late_charges,
          damageCharges: inv.damage_charges,
          depositRefund: inv.deposit_refund,
          finalAmount: inv.final_amount,
          paymentMethod: inv.payment_method,
          paymentStatus: inv.payment_status,
        };
      }
    } catch (e) {
      // Fallback
    }

    const booking = await this.getBookingById(bookingId);
    if (!booking) return undefined;
    if (booking.invoice) return booking.invoice;
    if (booking.status === 'Completed') {
      const generated = this.generateInvoice(booking);
      booking.invoice = generated;
      return generated;
    }
    return undefined;
  }

  public async createBooking(
    draft: BookingDraft,
    customer: BookingCustomerDetails,
    paymentMethod: PaymentMethod
  ): Promise<Booking> {
    try {
      const payload = {
        vehicle_id: draft.vehicle.id,
        pickup_date: draft.pickupDate,
        pickup_time: draft.pickupTime,
        return_date: draft.returnDate,
        return_time: draft.returnTime,
        rental_days: draft.rentalDays,
        pickup_location: draft.pickupLocation,
        return_location: draft.returnLocation,
        payment_method: paymentMethod,
        customer_details: {
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email,
          licenseNumber: customer.licenseNumber,
          notes: customer.notes || '',
        },
      };

      const res = await apiClient.post<any>('/bookings', payload);
      if (res.success && res.data) {
        const liveB = mapBackendBooking(res.data);
        liveB.vehicle = draft.vehicle;
        this.bookings = [liveB, ...this.bookings];
        await vehicleService.updateAvailability(draft.vehicle.id, 'Booked');
        this.notifyListeners();
        return liveB;
      }
    } catch (e: any) {
      console.warn('[BookingService] Live createBooking error, using local fallback:', e?.message);
    }

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

    await vehicleService.updateAvailability(draft.vehicle.id, 'Booked');
    this.bookings = [newBooking, ...this.bookings];
    this.notifyListeners();
    return newBooking;
  }

  public async cancelBooking(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/bookings/${id}/cancel`);
    } catch (e) {
      console.warn('[BookingService] Live cancelBooking fallback:', e);
    }
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      const vehicleId = this.bookings[idx].vehicleId;
      this.bookings[idx] = { ...this.bookings[idx], status: 'Cancelled' };
      await vehicleService.updateAvailability(vehicleId, 'Available');
      this.notifyListeners();
      return true;
    }
    return false;
  }

  public getRevenueMetrics(): RevenueMetrics {
    const completed = this.bookings.filter(b => b.status === 'Completed');
    const active = this.bookings.filter(b => b.status === 'Active');
    const confirmed = this.bookings.filter(b => b.status === 'Confirmed');
    const pending = this.bookings.filter(b => b.status === 'Pending');
    const cancelled = this.bookings.filter(b => b.status === 'Cancelled');

    const completedTotal = completed.reduce((sum, b) => sum + (b.invoice?.finalAmount || b.pricing.subtotal), 0);
    const activeTotal = active.reduce((sum, b) => sum + b.pricing.subtotal, 0);
    const confirmedTotal = confirmed.reduce((sum, b) => sum + b.pricing.subtotal, 0);

    const totalRevenue = completedTotal + activeTotal + confirmedTotal;
    const monthlyRevenue = Math.round(totalRevenue * 0.85);
    const weeklyRevenue = Math.round(totalRevenue * 0.28);
    const dailyRevenue = Math.round(weeklyRevenue / 7);

    const totalOrders = this.bookings.length;
    const cancellationRate = totalOrders > 0 ? Math.round((cancelled.length / totalOrders) * 100) : 0;

    const vehicleMap = new Map<string, { brand: string; model: string; category: string; image: string; trips: number; revenue: number }>();

    this.bookings.forEach(b => {
      const vid = b.vehicleId;
      const amount = b.invoice?.finalAmount || b.pricing.subtotal;
      const isCountable = b.status === 'Completed' || b.status === 'Active' || b.status === 'Confirmed';
      if (!vehicleMap.has(vid)) {
        vehicleMap.set(vid, {
          brand: b.vehicle?.brand || 'Vehicle',
          model: b.vehicle?.model || '',
          category: b.vehicle?.category || 'Luxury',
          image: b.vehicle?.image || '',
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

    const categoryTotals: Record<string, number> = {
      Luxury: 0,
      SUV: 0,
      Sedan: 0,
      Economy: 0,
    };

    this.bookings.forEach(b => {
      if (b.status === 'Completed' || b.status === 'Active' || b.status === 'Confirmed') {
        const cat = b.vehicle?.category || 'Luxury';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (b.invoice?.finalAmount || b.pricing.subtotal);
      }
    });

    const revenueByCategory = Object.keys(categoryTotals).map(cat => ({
      category: cat,
      amount: categoryTotals[cat],
      percentage: totalRevenue > 0 ? Math.round((categoryTotals[cat] / totalRevenue) * 100) : 0,
    }));

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
