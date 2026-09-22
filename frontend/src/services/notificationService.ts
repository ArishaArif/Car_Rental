import { AppNotification, NotificationCategory, UserRole } from '../types';

type NotificationChangeListener = () => void;

const delay = (ms = 150): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

class NotificationService {
  private listeners: NotificationChangeListener[] = [];

  private notifications: AppNotification[] = [
    {
      id: 'notif-001',
      title: 'New Booking Request #VLX-BK-34908',
      message:
        'Alex Rivera requested a 4-day reservation for Porsche Taycan Turbo S starting Sep 28 from Downtown Tech District Hub.',
      category: 'Booking',
      timestamp: '15 mins ago',
      isRead: false,
      targetRole: 'Provider',
      actionRoute: 'ProviderBookings',
      metadata: { bookingId: 'VLX-BK-34908', vehicleId: 'veh-porsche-01' },
    },
    {
      id: 'notif-002',
      title: 'Platform Payout Disbursed',
      message:
        'Net rental payout of $762.45 for completed reservation #VLX-BK-34902 has been transferred to your primary business account.',
      category: 'Payment',
      timestamp: '1 hour ago',
      isRead: false,
      targetRole: 'Provider',
      actionRoute: 'RevenueDashboard',
      metadata: { bookingId: 'VLX-BK-34902', amount: 762.45 },
    },
    {
      id: 'notif-003',
      title: 'Return Inspection Check-in Passed',
      message:
        'Toyota Corolla Hybrid (DL-TX-4102) was returned at Airport Hub West. Digital post-trip inspection completed with zero excess damage.',
      category: 'Rental',
      timestamp: '3 hours ago',
      isRead: false,
      targetRole: 'Provider',
      actionRoute: 'FleetList',
      metadata: { vehicleId: 'veh-corolla-01' },
    },
    {
      id: 'notif-004',
      title: 'Listing Activated & Live',
      message:
        'Tesla Model S Plaid has been published and is now searchable for instant renter bookings across Westside Hub.',
      category: 'Vehicle',
      timestamp: 'Yesterday',
      isRead: true,
      targetRole: 'Provider',
      actionRoute: 'VehicleDetails',
      metadata: { vehicleId: 'veh-tesla-03' },
    },
    {
      id: 'notif-005',
      title: 'Scheduled Maintenance Due Soon',
      message:
        'Mercedes-Benz G 63 AMG has surpassed 14,800 km and is due for scheduled 15,000 km synthetic oil and brake pad inspection in 3 days.',
      category: 'Maintenance',
      timestamp: 'Yesterday',
      isRead: true,
      targetRole: 'Provider',
      actionRoute: 'FleetList',
      metadata: { vehicleId: 'veh-g63-04' },
    },
    {
      id: 'notif-006',
      title: 'SaaS Subscription Plan Active',
      message:
        'Your Professional Tier subscription renewed successfully for $149.00/mo. All 25 vehicle slots and Smart Pricing capabilities are active.',
      category: 'System',
      timestamp: '3 days ago',
      isRead: true,
      targetRole: 'Provider',
      actionRoute: 'SubscriptionOverview',
      metadata: { planId: 'professional' },
    },
    {
      id: 'notif-007',
      title: 'Booking Confirmed & Digital Key Issued',
      message:
        'Customer confirmed pickup check-in for Honda Civic Touring #VLX-BK-34901. Digital access key provisioned.',
      category: 'Booking',
      timestamp: '4 days ago',
      isRead: true,
      targetRole: 'Customer',
      actionRoute: 'MyBookings',
      metadata: { bookingId: 'VLX-BK-34901' },
    },
    {
      id: 'notif-008',
      title: 'Refund Disbursed to Card',
      message:
        'Security deposit refund of $200.00 for trip #VLX-BK-34888 has been released back to your payment card.',
      category: 'Payment',
      timestamp: '5 days ago',
      isRead: true,
      targetRole: 'Customer',
      metadata: { bookingId: 'VLX-BK-34888', amount: 200 },
    },
    {
      id: 'notif-009',
      title: 'AI Damage Inspection Completed',
      message:
        'Pre-trip digital photo audit verified clean exterior panels for booking #VLX-BK-34903. Safe travels!',
      category: 'Rental',
      timestamp: '6 days ago',
      isRead: true,
      targetRole: 'Customer',
      metadata: { bookingId: 'VLX-BK-34903' },
    },
    {
      id: 'notif-010',
      title: 'Turnaround Inspection Required',
      message:
        'Vehicle #veh-civic-02 expected at depot within 45 minutes. Turnaround bay #3 assigned.',
      category: 'Rental',
      timestamp: '1 day ago',
      isRead: false,
      targetRole: 'FleetManager',
    },
    {
      id: 'notif-011',
      title: 'Platform Policy & Compliance Update',
      message:
        'Velox Mobility terms of service and insurance liability schedule updated for all commercial hosts.',
      category: 'System',
      timestamp: '1 week ago',
      isRead: true,
      targetRole: 'Admin',
    },
  ];

  public subscribe(listener: NotificationChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  /**
   * Retrieve notifications optionally filtered by role
   */
  public async getNotifications(role?: UserRole): Promise<AppNotification[]> {
    await delay(80);
    if (!role) {
      return [...this.notifications];
    }
    // Return notifications targeted to this role or general system ones
    return this.notifications.filter(
      n => !n.targetRole || n.targetRole === role || n.category === 'System'
    );
  }

  /**
   * Retrieve total count of unread notifications
   */
  public async getUnreadCount(role?: UserRole): Promise<number> {
    const list = await this.getNotifications(role);
    return list.filter(n => !n.isRead).length;
  }

  /**
   * Mark a single notification as read
   */
  public async markAsRead(id: string): Promise<AppNotification> {
    await delay(50);
    const idx = this.notifications.findIndex(n => n.id === id);
    if (idx === -1) {
      throw new Error(`Notification ${id} not found`);
    }

    this.notifications[idx] = {
      ...this.notifications[idx],
      isRead: true,
    };

    this.notify();
    return { ...this.notifications[idx] };
  }

  /**
   * Mark all notifications as read
   */
  public async markAllAsRead(role?: UserRole): Promise<void> {
    await delay(80);
    this.notifications = this.notifications.map(n => {
      if (!role || !n.targetRole || n.targetRole === role || n.category === 'System') {
        return { ...n, isRead: true };
      }
      return n;
    });

    this.notify();
  }

  /**
   * Delete notification
   */
  public async deleteNotification(id: string): Promise<void> {
    await delay(50);
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }
}

export const notificationService = new NotificationService();
