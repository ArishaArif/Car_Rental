import {
  Booking,
  BookingCustomerDetails,
  BookingDraft,
  BookingPricing,
  PaymentMethod,
} from '../types';
import { MOCK_VEHICLES } from './vehicleData';

/**
 * Pre-seeded mock bookings for realistic prototype experience
 */
const INITIAL_MOCK_BOOKINGS: Booking[] = [
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
  },
];

class BookingService {
  private bookings: Booking[] = [...INITIAL_MOCK_BOOKINGS];

  /**
   * Calculate standard itemized pricing for a rental duration
   */
  public calculatePricing(dailyPrice: number, days: number): BookingPricing {
    const rentalDays = Math.max(1, days);
    const subtotal = dailyPrice * rentalDays;
    const serviceFee = Math.round(subtotal * 0.10); // 10% platform & roadside fee
    const taxes = Math.round(subtotal * 0.05); // 5% provincial/state sales tax
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
    };

    // Store at beginning of array for immediate visibility
    this.bookings = [newBooking, ...this.bookings];
    return newBooking;
  }

  /**
   * Cancel an existing booking
   */
  public async cancelBooking(id: string): Promise<boolean> {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.bookings[idx] = {
        ...this.bookings[idx],
        status: 'Cancelled',
      };
      return true;
    }
    return false;
  }
}

export const bookingService = new BookingService();
