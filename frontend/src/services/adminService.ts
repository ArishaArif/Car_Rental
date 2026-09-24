import {
  AdminKPIs,
  AdminPaymentRecord,
  AdminProviderRecord,
  AdminUserRecord,
  AdminVerificationItem,
  DisputeRecord,
  DisputeStatus,
  SystemConfig,
  VerificationStatus,
  Vehicle,
} from '../types';
import { MOCK_VEHICLES } from './vehicleData';
import { adminApi } from '../api/adminApi';

type AdminChangeListener = () => void;

class AdminService {
  private listeners: AdminChangeListener[] = [];

  // 1. Initial Mock Users
  private users: AdminUserRecord[] = [
    {
      id: 'usr-101',
      name: 'Alex Rivera',
      email: 'customer@carrental.com',
      role: 'Customer',
      phone: '+1 (555) 234-5678',
      city: 'San Francisco, CA',
      joinedDate: '2025-11-14',
      verificationStatus: 'Verified',
      status: 'Active',
      licenseNumber: 'DL-98421094',
      totalBookingsOrVehicles: 8,
    },
    {
      id: 'usr-102',
      name: 'Sophia Martinez',
      email: 'sophia.m@gmail.com',
      role: 'Customer',
      phone: '+1 (555) 432-8765',
      city: 'Austin, TX',
      joinedDate: '2026-02-01',
      verificationStatus: 'Pending',
      status: 'Active',
      licenseNumber: 'DL-44820199',
      totalBookingsOrVehicles: 3,
    },
    {
      id: 'usr-103',
      name: 'Liam Davies',
      email: 'liam.davies@outlook.com',
      role: 'Customer',
      phone: '+1 (555) 678-1234',
      city: 'Los Angeles, CA',
      joinedDate: '2026-01-19',
      verificationStatus: 'Verified',
      status: 'Active',
      licenseNumber: 'DL-39912044',
      totalBookingsOrVehicles: 12,
    },
    {
      id: 'usr-104',
      name: 'Tariq Mansoor',
      email: 'tariq.m@yahoo.com',
      role: 'Customer',
      phone: '+1 (555) 987-6543',
      city: 'Dallas, TX',
      joinedDate: '2026-03-05',
      verificationStatus: 'Rejected',
      status: 'Suspended',
      licenseNumber: 'DL-11029482',
      totalBookingsOrVehicles: 1,
    },
    {
      id: 'usr-201',
      name: 'Elena Vance',
      email: 'provider@fleetowner.com',
      role: 'Provider',
      phone: '+1 (555) 876-5432',
      city: 'Los Angeles, CA',
      joinedDate: '2025-08-10',
      verificationStatus: 'Verified',
      status: 'Active',
      businessName: 'Apex Luxury Mobility LLC',
      totalBookingsOrVehicles: 24,
    },
    {
      id: 'usr-202',
      name: 'Zackariah Sterling',
      email: 'sterling.auto@velocity.com',
      role: 'Provider',
      phone: '+1 (555) 765-4321',
      city: 'Miami, FL',
      joinedDate: '2026-01-12',
      verificationStatus: 'Pending',
      status: 'Active',
      businessName: 'Sterling Executive Fleet',
      totalBookingsOrVehicles: 14,
    },
    {
      id: 'usr-203',
      name: 'Farhan Qureshi',
      email: 'f.qureshi@skylinefleet.com',
      role: 'Provider',
      phone: '+1 (555) 654-3210',
      city: 'Austin, TX',
      joinedDate: '2025-10-22',
      verificationStatus: 'Verified',
      status: 'Active',
      businessName: 'Skyline Mobility Systems',
      totalBookingsOrVehicles: 18,
    },
    {
      id: 'usr-204',
      name: 'Nadia Volkova',
      email: 'nadia@primedrive.net',
      role: 'Provider',
      phone: '+1 (555) 543-2109',
      city: 'Seattle, WA',
      joinedDate: '2026-02-18',
      verificationStatus: 'Suspended',
      status: 'Suspended',
      businessName: 'PrimeDrive Northwest LLC',
      totalBookingsOrVehicles: 6,
    },
  ];

  // 2. Initial Mock Providers
  private providers: AdminProviderRecord[] = [
    {
      id: 'prov-001',
      providerName: 'Elena Vance',
      businessName: 'Apex Luxury Mobility LLC',
      fleetSize: 24,
      verificationStatus: 'Verified',
      revenue: 58400,
      status: 'Active',
      email: 'provider@fleetowner.com',
      phone: '+1 (555) 876-5432',
      city: 'Los Angeles, CA',
      taxId: 'US-EIN-94810239',
      joinedDate: '2025-08-10',
    },
    {
      id: 'prov-002',
      providerName: 'Zackariah Sterling',
      businessName: 'Sterling Executive Fleet',
      fleetSize: 14,
      verificationStatus: 'Pending',
      revenue: 31200,
      status: 'Active',
      email: 'sterling.auto@velocity.com',
      phone: '+1 (555) 765-4321',
      city: 'Miami, FL',
      taxId: 'US-EIN-77291044',
      joinedDate: '2026-01-12',
    },
    {
      id: 'prov-003',
      providerName: 'Farhan Qureshi',
      businessName: 'Skyline Mobility Systems',
      fleetSize: 18,
      verificationStatus: 'Verified',
      revenue: 44900,
      status: 'Active',
      email: 'f.qureshi@skylinefleet.com',
      phone: '+1 (555) 654-3210',
      city: 'Austin, TX',
      taxId: 'US-EIN-44910283',
      joinedDate: '2025-10-22',
    },
    {
      id: 'prov-004',
      providerName: 'Nadia Volkova',
      businessName: 'PrimeDrive Northwest LLC',
      fleetSize: 6,
      verificationStatus: 'Suspended',
      revenue: 12850,
      status: 'Suspended',
      email: 'nadia@primedrive.net',
      phone: '+1 (555) 543-2109',
      city: 'Seattle, WA',
      taxId: 'US-EIN-88192031',
      joinedDate: '2026-02-18',
    },
    {
      id: 'prov-005',
      providerName: 'Marcus O’Connor',
      businessName: 'Pacific Coast Fleet Group',
      fleetSize: 9,
      verificationStatus: 'Rejected',
      revenue: 4300,
      status: 'Suspended',
      email: 'marcus@pacificrentals.com',
      phone: '+1 (555) 432-1098',
      city: 'San Francisco, CA',
      taxId: 'US-EIN-55019284',
      joinedDate: '2026-03-01',
    },
  ];

  // 3. Provider Verification Queue
  private providerVerifications: AdminVerificationItem[] = [
    {
      id: 'pver-001',
      targetId: 'prov-002',
      name: 'Sterling Executive Fleet',
      type: 'Provider',
      identifier: 'US-EIN-77291044',
      submittedDate: '2026-09-18',
      status: 'Pending',
      documentType: 'Corporate LLC Registration & Commercial Insurance',
      documentNumber: 'POL-FLT-8849201',
      expiryDate: '2027-09-15',
      notes: 'Submitted updated commercial liability coverage certificate.',
    },
    {
      id: 'pver-002',
      targetId: 'prov-001',
      name: 'Apex Luxury Mobility LLC',
      type: 'Provider',
      identifier: 'US-EIN-94810239',
      submittedDate: '2025-08-11',
      status: 'Verified',
      documentType: 'Business License & Fleet Title Certification',
      documentNumber: 'BL-CA-992019',
      expiryDate: '2027-08-10',
      notes: 'Audited and verified full fleet title proof.',
    },
    {
      id: 'pver-003',
      targetId: 'prov-005',
      name: 'Pacific Coast Fleet Group',
      type: 'Provider',
      identifier: 'US-EIN-55019284',
      submittedDate: '2026-09-12',
      status: 'Rejected',
      documentType: 'Commercial Fleet Insurance',
      documentNumber: 'POL-INS-3310',
      notes: 'Insurance policy expired 30 days prior to submission.',
    },
    {
      id: 'pver-004',
      targetId: 'prov-004',
      name: 'PrimeDrive Northwest LLC',
      type: 'Provider',
      identifier: 'US-EIN-88192031',
      submittedDate: '2026-08-20',
      status: 'Suspended',
      documentType: 'State Fleet Operating Permit',
      documentNumber: 'WA-DOT-449182',
      notes: 'Suspended pending investigation of unresolved damage claims.',
    },
  ];

  // 4. Customer KYC Verification Queue
  private customerVerifications: AdminVerificationItem[] = [
    {
      id: 'cver-001',
      targetId: 'usr-102',
      name: 'Sophia Martinez',
      type: 'Customer',
      identifier: 'DL-44820199',
      submittedDate: '2026-09-20',
      status: 'Pending',
      documentType: 'State Driving License & National Identity',
      documentNumber: 'DL-TX-44820199',
      expiryDate: '2029-05-14',
      notes: 'High resolution front/back photo of driver license submitted.',
    },
    {
      id: 'cver-002',
      targetId: 'usr-101',
      name: 'Alex Rivera',
      type: 'Customer',
      identifier: 'DL-98421094',
      submittedDate: '2025-11-15',
      status: 'Verified',
      documentType: 'California Class C Driver License',
      documentNumber: 'DL-CA-98421094',
      expiryDate: '2028-11-10',
      notes: 'Biometric selfie match score: 98.4%. Verified.',
    },
    {
      id: 'cver-003',
      targetId: 'usr-104',
      name: 'Tariq Mansoor',
      type: 'Customer',
      identifier: 'DL-11029482',
      submittedDate: '2026-09-15',
      status: 'Rejected',
      documentType: 'Temporary Driving Permit',
      documentNumber: 'TEMP-TX-11029',
      notes: 'Temporary paper permits are not accepted for premium rentals.',
    },
    {
      id: 'cver-004',
      targetId: 'usr-103',
      name: 'Liam Davies',
      type: 'Customer',
      identifier: 'DL-39912044',
      submittedDate: '2026-01-20',
      status: 'Verified',
      documentType: 'California Real ID Driver License',
      documentNumber: 'DL-CA-39912044',
      expiryDate: '2030-01-18',
      notes: 'Clean driving record verified with DMV telematics.',
    },
  ];

  // 5. Managed Vehicles (with suspension override)
  private vehicleOverrides: Record<string, { isSuspended?: boolean }> = {};

  // 6. Payments & Payouts Ledger
  private payments: AdminPaymentRecord[] = [
    {
      id: 'pay-001',
      bookingId: 'VLX-BK-34901',
      customerName: 'Alex Rivera',
      providerName: 'Apex Luxury Mobility LLC',
      vehicleName: 'Honda Civic Touring',
      rentalAmount: 248,
      platformCommission: 37.2, // 15%
      providerPayout: 210.8,
      securityDeposit: 200,
      refundStatus: 'No Refund Required',
      payoutStatus: 'Paid',
      transactionDate: '2026-09-24',
    },
    {
      id: 'pay-002',
      bookingId: 'VLX-BK-34902',
      customerName: 'Sophia Martinez',
      providerName: 'Apex Luxury Mobility LLC',
      vehicleName: 'Porsche Taycan Turbo S',
      rentalAmount: 897,
      platformCommission: 134.55,
      providerPayout: 762.45,
      securityDeposit: 500,
      refundStatus: 'Held',
      payoutStatus: 'Pending',
      transactionDate: '2026-09-26',
    },
    {
      id: 'pay-003',
      bookingId: 'VLX-BK-34903',
      customerName: 'Liam Davies',
      providerName: 'Skyline Mobility Systems',
      vehicleName: 'Tesla Model S Plaid',
      rentalAmount: 657,
      platformCommission: 98.55,
      providerPayout: 558.45,
      securityDeposit: 350,
      refundStatus: 'Refunded',
      payoutStatus: 'Paid',
      transactionDate: '2026-09-18',
    },
    {
      id: 'pay-004',
      bookingId: 'VLX-BK-34904',
      customerName: 'Tariq Mansoor',
      providerName: 'Sterling Executive Fleet',
      vehicleName: 'Mercedes-Benz G 63 AMG',
      rentalAmount: 1197,
      platformCommission: 179.55,
      providerPayout: 1017.45,
      securityDeposit: 750,
      refundStatus: 'Partially Refunded',
      payoutStatus: 'Processing',
      transactionDate: '2026-09-21',
    },
    {
      id: 'pay-005',
      bookingId: 'VLX-BK-34905',
      customerName: 'Nadia Volkova',
      providerName: 'Skyline Mobility Systems',
      vehicleName: 'Toyota Corolla Hybrid',
      rentalAmount: 220,
      platformCommission: 33.0,
      providerPayout: 187.0,
      securityDeposit: 150,
      refundStatus: 'Held',
      payoutStatus: 'Pending',
      transactionDate: '2026-09-22',
    },
  ];

  // 7. Platform Disputes
  private disputes: DisputeRecord[] = [
    {
      id: 'disp-101',
      bookingId: 'VLX-BK-34902',
      customerName: 'Sophia Martinez',
      providerName: 'Apex Luxury Mobility LLC',
      vehicleName: 'Porsche Taycan Turbo S',
      disputedAmount: 350,
      reason: 'Provider claimed minor rim scuff charge; renter asserts rim was scuffed prior to pickup.',
      status: 'Open',
      reportedAt: '2026-09-27',
      evidence: 'High-definition pre-trip walkaround photo attached by renter at 11:02 AM showing pre-existing paint scuff.',
      adminNotes: 'Awaiting provider rebuttal inspection report.',
    },
    {
      id: 'disp-102',
      bookingId: 'VLX-BK-34904',
      customerName: 'Tariq Mansoor',
      providerName: 'Sterling Executive Fleet',
      vehicleName: 'Mercedes-Benz G 63 AMG',
      disputedAmount: 480,
      reason: 'Late return fee of 3 hours assessed due to airport depot gate breakdown.',
      status: 'Under Review',
      reportedAt: '2026-09-22',
      evidence: 'Depot surveillance timestamp shows vehicle entered holding lot on time at 4:55 PM.',
      adminNotes: 'Reviewing depot access logs with depot fleet supervisor.',
    },
    {
      id: 'disp-103',
      bookingId: 'VLX-BK-34888',
      customerName: 'Liam Davies',
      providerName: 'Skyline Mobility Systems',
      vehicleName: 'Tesla Model S Plaid',
      disputedAmount: 120,
      reason: 'Supercharging idle fee mistakenly attributed during trip.',
      status: 'Resolved',
      reportedAt: '2026-09-14',
      evidence: 'Tesla billing receipt verified off-peak recharge timestamp.',
      adminNotes: 'Resolved: $120 refunded to customer wallet; provider notified.',
    },
  ];

  // 8. System Configuration Prototype
  private config: SystemConfig = {
    vehicleCategories: [
      { id: 'cat-1', name: 'Sedan', isActive: true, basePrice: 55 },
      { id: 'cat-2', name: 'SUV', isActive: true, basePrice: 85 },
      { id: 'cat-3', name: 'Luxury', isActive: true, basePrice: 180 },
      { id: 'cat-4', name: 'Electric', isActive: true, basePrice: 120 },
      { id: 'cat-5', name: 'Sports', isActive: true, basePrice: 220 },
      { id: 'cat-6', name: 'Compact', isActive: true, basePrice: 42 },
    ],
    commissionRate: 15.0, // 15%
    regions: [
      { id: 'reg-1', name: 'Austin Hub Central', stateOrCountry: 'Texas, USA', isActive: true },
      { id: 'reg-2', name: 'Los Angeles Metro', stateOrCountry: 'California, USA', isActive: true },
      { id: 'reg-3', name: 'San Francisco Bay Area', stateOrCountry: 'California, USA', isActive: true },
      { id: 'reg-4', name: 'Miami South Beach', stateOrCountry: 'Florida, USA', isActive: true },
      { id: 'reg-5', name: 'Seattle Tech Core', stateOrCountry: 'Washington, USA', isActive: false },
      { id: 'reg-6', name: 'Dallas Fort Worth Hub', stateOrCountry: 'Texas, USA', isActive: true },
    ],
    pricingBaseline: {
      minDailyRate: 40,
      defaultDeposit: 250,
      peakMultiplierBaseline: 1.25,
    },
  };

  public subscribe(listener: AdminChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public async syncFromBackend(): Promise<void> {
    try {
      const [kpisRes, usersRes, provsRes, verifsRes, payRes, dispRes] = await Promise.allSettled([
        adminApi.getKPIs(),
        adminApi.getUsers(),
        adminApi.getProviders(),
        adminApi.getVerifications(),
        adminApi.getPayments(),
        adminApi.getDisputes(),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value.success && usersRes.value.data.length > 0) {
        this.users = usersRes.value.data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone || '+1 555 000 0000',
          city: u.city || 'Austin, TX',
          joinedDate: u.joinedDate || '2026-01-01',
          verificationStatus: u.verificationStatus || 'Verified',
          status: u.status || 'Active',
          licenseNumber: u.licenseNumber,
          businessName: u.businessName,
          totalBookingsOrVehicles: u.totalBookingsOrVehicles || 0,
        }));
      }

      if (dispRes.status === 'fulfilled' && dispRes.value.success && dispRes.value.data.length > 0) {
        this.disputes = dispRes.value.data.map(d => ({
          id: d.id,
          bookingId: d.bookingId,
          customerName: d.customerName,
          providerName: d.providerName,
          vehicleName: d.vehicleName,
          disputedAmount: d.disputedAmount,
          reason: d.reason,
          status: d.status,
          reportedAt: d.reportedAt,
          evidence: d.evidence,
          adminNotes: d.adminNotes,
        }));
      }

      this.notify();
    } catch (e: any) {
      console.warn('[AdminService] syncFromBackend fallback:', e?.message);
    }
  }

  // --- Metrics ---
  public getKPIs(): AdminKPIs {
    const totalCustomers = this.users.filter(u => u.role === 'Customer').length * 156; // realistic extrapolation
    const totalProviders = this.providers.length + 41;
    const totalVehicles = MOCK_VEHICLES.length * 8;
    const activeRentals = 32;
    const totalBookings = 384;
    const platformRevenue = 128450;
    const pendingVerifications =
      this.providerVerifications.filter(v => v.status === 'Pending').length +
      this.customerVerifications.filter(v => v.status === 'Pending').length;
    const openDisputes = this.disputes.filter(d => d.status !== 'Resolved').length;

    return {
      totalCustomers,
      totalProviders,
      totalVehicles,
      activeRentals,
      totalBookings,
      platformRevenue,
      pendingVerifications,
      openDisputes,
    };
  }

  // --- Users Methods ---
  public getUsers(): AdminUserRecord[] {
    return [...this.users];
  }

  public updateUserStatus(id: string, status: 'Active' | 'Suspended'): void {
    adminApi.updateUserStatus(id, status === 'Active').catch(e => {
      console.warn('[AdminService] live updateUserStatus fallback:', e?.message);
    });
    this.users = this.users.map(u => (u.id === id ? { ...u, status } : u));
    this.notify();
  }

  public verifyUser(id: string, verificationStatus: VerificationStatus): void {
    this.users = this.users.map(u => (u.id === id ? { ...u, verificationStatus } : u));
    this.notify();
  }

  // --- Providers Methods ---
  public getProviders(): AdminProviderRecord[] {
    return [...this.providers];
  }

  public updateProviderStatus(id: string, status: 'Active' | 'Suspended'): void {
    this.providers = this.providers.map(p => (p.id === id ? { ...p, status } : p));
    this.notify();
  }

  public updateProviderVerification(id: string, verificationStatus: VerificationStatus): void {
    this.providers = this.providers.map(p => (p.id === id ? { ...p, verificationStatus } : p));
    this.providerVerifications = this.providerVerifications.map(v =>
      v.targetId === id ? { ...v, status: verificationStatus } : v
    );
    this.notify();
  }

  // --- Verifications Methods ---
  public getProviderVerifications(): AdminVerificationItem[] {
    return [...this.providerVerifications];
  }

  public getCustomerVerifications(): AdminVerificationItem[] {
    return [...this.customerVerifications];
  }

  public updateVerificationItemStatus(
    id: string,
    status: VerificationStatus,
    notes?: string
  ): void {
    adminApi.reviewVerification(id, { status, notes }).catch(e => {
      console.warn('[AdminService] live reviewVerification fallback:', e?.message);
    });
    this.providerVerifications = this.providerVerifications.map(item =>
      item.id === id ? { ...item, status, notes: notes || item.notes } : item
    );
    this.customerVerifications = this.customerVerifications.map(item =>
      item.id === id ? { ...item, status, notes: notes || item.notes } : item
    );
    this.notify();
  }

  // --- Vehicles Oversight ---
  public getVehicles(): (Vehicle & { isSuspended?: boolean })[] {
    return MOCK_VEHICLES.map(v => ({
      ...v,
      isSuspended: this.vehicleOverrides[v.id]?.isSuspended || false,
    }));
  }

  public toggleVehicleSuspension(vehicleId: string): boolean {
    const current = this.vehicleOverrides[vehicleId]?.isSuspended || false;
    this.vehicleOverrides[vehicleId] = { isSuspended: !current };
    this.notify();
    return !current;
  }

  // --- Payments / Payouts ---
  public getPayments(): AdminPaymentRecord[] {
    return [...this.payments];
  }

  public processRefund(paymentId: string): void {
    this.payments = this.payments.map(p =>
      p.id === paymentId ? { ...p, refundStatus: 'Refunded' } : p
    );
    this.notify();
  }

  public releasePayout(paymentId: string): void {
    this.payments = this.payments.map(p =>
      p.id === paymentId ? { ...p, payoutStatus: 'Paid' } : p
    );
    this.notify();
  }

  // --- Disputes ---
  public getDisputes(): DisputeRecord[] {
    return [...this.disputes];
  }

  public updateDisputeStatus(id: string, status: DisputeStatus, adminNotes?: string): void {
    adminApi.updateDispute(id, { status, admin_notes: adminNotes }).catch(e => {
      console.warn('[AdminService] live updateDispute fallback:', e?.message);
    });
    this.disputes = this.disputes.map(d =>
      d.id === id
        ? {
            ...d,
            status,
            adminNotes: adminNotes || d.adminNotes,
          }
        : d
    );
    this.notify();
  }

  // --- System Configuration ---
  public getConfig(): SystemConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  public updateConfig(newConfig: Partial<SystemConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
    this.notify();
  }

  public toggleCategory(id: string): void {
    this.config.vehicleCategories = this.config.vehicleCategories.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    this.notify();
  }

  public toggleRegion(id: string): void {
    this.config.regions = this.config.regions.map(r =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    this.notify();
  }

  public setCommissionRate(rate: number): void {
    this.config.commissionRate = rate;
    this.notify();
  }

  public updatePricingBaseline(updates: Partial<SystemConfig['pricingBaseline']>): void {
    this.config.pricingBaseline = {
      ...this.config.pricingBaseline,
      ...updates,
    };
    this.notify();
  }
}

export const adminService = new AdminService();
