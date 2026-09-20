import {
  Booking,
  BookingCustomerDetails,
  BookingDraft,
  BookingInvoice,
  BookingPricing,
  PaymentMethod,
  VehicleInspection,
} from '../types';
import { MOCK_VEHICLES } from './vehicleData';

/**
 * Pre-seeded mock bookings for realistic prototype experience
 */
const INITIAL_MOCK_BOOKINGS: Booking[] = [
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
    // Final billed amount for rental + any extra penalty charges
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
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.bookings[idx] = {
        ...this.bookings[idx],
        status: 'Active',
      };
      return this.bookings[idx];
    }
    return undefined;
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
    const idx = this.bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) {
      throw new Error(`Booking with ID ${bookingId} not found`);
    }

    const currentBooking = this.bookings[idx];
    const invoice = this.generateInvoice(currentBooking, lateCharges, damageCharges);

    const completedBooking: Booking = {
      ...currentBooking,
      status: 'Completed',
      inspection,
      invoice,
      dropoffMileage: inspection.odometerReading,
      dropoffFuel: inspection.fuelLevel,
    };

    this.bookings[idx] = completedBooking;

    return {
      booking: completedBooking,
      invoice,
    };
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
      pickupMileage: 12500,
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

