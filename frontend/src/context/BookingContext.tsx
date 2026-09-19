import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Booking,
  BookingCustomerDetails,
  BookingDraft,
  PaymentMethod,
  Vehicle,
} from '../types';
import { bookingService } from '../services/bookingService';

export interface BookingContextType {
  draft: BookingDraft | null;
  bookings: Booking[];
  initDraft: (vehicle: Vehicle) => void;
  updateDraft: (patch: Partial<BookingDraft>) => void;
  setDates: (
    pickupDate: string,
    pickupTime: string,
    returnDate: string,
    returnTime: string,
    days: number
  ) => void;
  setLocations: (
    pickupLocation: string,
    returnLocation: string,
    sameLocation: boolean
  ) => void;
  setCustomerDetails: (customer: BookingCustomerDetails) => void;
  confirmBooking: (paymentMethod: PaymentMethod) => Promise<Booking>;
  clearDraft: () => void;
  refreshBookings: () => Promise<void>;
  cancelBooking: (id: string) => Promise<boolean>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    refreshBookings();
  }, []);

  const refreshBookings = async () => {
    const list = await bookingService.getBookings();
    setBookings(list);
  };

  const initDraft = (vehicle: Vehicle) => {
    // If draft already has this vehicle, preserve dates/locations
    if (draft && draft.vehicle.id === vehicle.id) {
      return;
    }

    const today = new Date();
    const pickup = new Date(today);
    pickup.setDate(today.getDate() + 1);

    const dropoff = new Date(pickup);
    dropoff.setDate(pickup.getDate() + 3);

    const pickupDateStr = pickup.toISOString().split('T')[0];
    const dropoffDateStr = dropoff.toISOString().split('T')[0];
    const initialDays = 3;

    const pricing = bookingService.calculatePricing(vehicle.pricePerDay, initialDays);

    setDraft({
      vehicle,
      pickupDate: pickupDateStr,
      pickupTime: '10:00 AM',
      returnDate: dropoffDateStr,
      returnTime: '10:00 AM',
      rentalDays: initialDays,
      pickupLocation: vehicle.location,
      returnLocation: vehicle.location,
      sameLocation: true,
      pricing,
    });
  };

  const updateDraft = (patch: Partial<BookingDraft>) => {
    setDraft(prev => {
      if (!prev) return null;
      return { ...prev, ...patch };
    });
  };

  const setDates = (
    pickupDate: string,
    pickupTime: string,
    returnDate: string,
    returnTime: string,
    days: number
  ) => {
    setDraft(prev => {
      if (!prev) return null;
      const validDays = Math.max(1, days);
      const newPricing = bookingService.calculatePricing(
        prev.vehicle.pricePerDay,
        validDays
      );
      return {
        ...prev,
        pickupDate,
        pickupTime,
        returnDate,
        returnTime,
        rentalDays: validDays,
        pricing: newPricing,
      };
    });
  };

  const setLocations = (
    pickupLocation: string,
    returnLocation: string,
    sameLocation: boolean
  ) => {
    setDraft(prev => {
      if (!prev) return null;
      return {
        ...prev,
        pickupLocation,
        returnLocation: sameLocation ? pickupLocation : returnLocation,
        sameLocation,
      };
    });
  };

  const setCustomerDetails = (customer: BookingCustomerDetails) => {
    setDraft(prev => {
      if (!prev) return null;
      return {
        ...prev,
        customer,
      };
    });
  };

  const confirmBooking = async (paymentMethod: PaymentMethod): Promise<Booking> => {
    if (!draft || !draft.customer) {
      throw new Error('Booking draft is missing customer information');
    }

    const created = await bookingService.createBooking(
      draft,
      draft.customer,
      paymentMethod
    );
    await refreshBookings();
    return created;
  };

  const clearDraft = () => {
    setDraft(null);
  };

  const cancelBooking = async (id: string): Promise<boolean> => {
    const ok = await bookingService.cancelBooking(id);
    if (ok) {
      await refreshBookings();
    }
    return ok;
  };

  return (
    <BookingContext.Provider
      value={{
        draft,
        bookings,
        initDraft,
        updateDraft,
        setDates,
        setLocations,
        setCustomerDetails,
        confirmBooking,
        clearDraft,
        refreshBookings,
        cancelBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
