import {
  BillingInvoiceRecord,
  ProviderSubscription,
  SubscriptionPlan,
  SubscriptionPlanId,
  SubscriptionUsage,
} from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For emerging hosts & small local operators',
    monthlyPrice: 49,
    annualPrice: 470,
    vehicleLimit: 5,
    bookingLimit: 30,
    aiAssistantAccess: 'Basic Customer Q&A',
    smartPricingAccess: 'Manual Rule-based only',
    analytics: 'Standard Monthly Revenue & Trips',
    teamMembers: 1,
    support: 'Standard Email (48h SLA)',
    features: [
      'Up to 5 fleet vehicles',
      '30 monthly reservations',
      'Basic Customer AI Q&A',
      'Standard revenue reports',
      'Digital key & contactless check-in',
      'Standard Email Support (48h SLA)',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'For scaling fleets & independent rental services',
    monthlyPrice: 149,
    annualPrice: 1430,
    vehicleLimit: 25,
    bookingLimit: 150,
    aiAssistantAccess: 'Full AI Voice & Damage Inspection',
    smartPricingAccess: 'Automated Demand Surge & Dynamic Yield',
    analytics: 'Live Fleet Telematics & Utilization Analysis',
    teamMembers: 5,
    support: 'Priority In-App & Email (4h SLA)',
    features: [
      'Up to 25 fleet vehicles',
      '150 monthly reservations',
      'Automated Smart Dynamic Pricing',
      'AI Damage & Photo Inspection',
      'Advanced Telematics & Turnaround Desk',
      '5 Team Member Logins',
      'Priority In-App Support (4h SLA)',
      'Automated deposit escrow settlements',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Enterprise-grade fleet operations & unlimited yield',
    monthlyPrice: 349,
    annualPrice: 3350,
    vehicleLimit: -1, // Unlimited
    bookingLimit: -1, // Unlimited
    aiAssistantAccess: 'Enterprise Custom AI Telematics',
    smartPricingAccess: 'Multi-zone Algorithmic Yield Optimization',
    analytics: 'Executive Custom Reports, Raw CSV & Webhooks',
    teamMembers: -1, // Unlimited
    support: 'Dedicated 24/7 Account Manager & Direct Phone',
    features: [
      'Unlimited fleet inventory',
      'Unlimited monthly reservations',
      'Multi-zone Smart Yield Engine',
      'Enterprise AI telematics suite',
      'Unlimited team logins & permissions',
      'Dedicated 24/7 Account Manager',
      'Custom data export & accounting integrations',
      'Custom SLA & platform onboarding',
    ],
  },
];

type SubscriptionChangeListener = () => void;

const delay = (ms = 400): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

class SubscriptionService {
  private listeners: SubscriptionChangeListener[] = [];

  private currentSubscription: ProviderSubscription = {
    id: 'sub-prov-201',
    providerId: 'prov-201',
    planId: 'professional',
    status: 'Active',
    billingCycle: 'monthly',
    startDate: '2025-08-15',
    renewalDate: '2026-10-15',
    usage: {
      vehiclesUsed: 12,
      vehicleLimit: 25,
      bookingsUsed: 46,
      bookingLimit: 150,
      teamSeatsUsed: 3,
      teamSeatsLimit: 5,
    },
    enabledFeatures: [
      'Up to 25 fleet vehicles',
      '150 monthly reservations',
      'Automated Smart Dynamic Pricing',
      'AI Damage & Photo Inspection',
      'Advanced Telematics & Turnaround Desk',
      '5 Team Member Logins',
      'Priority In-App Support (4h SLA)',
    ],
  };

  private billingHistory: BillingInvoiceRecord[] = [
    {
      id: 'inv-sub-001',
      invoiceNumber: 'INV-SUB-2026-09',
      date: '2026-09-15',
      amount: 149.0,
      planName: 'Professional Plan',
      billingCycle: 'monthly',
      status: 'Paid',
      paymentMethod: 'Visa •••• 4242',
      pdfUrl: 'https://velox.mobility/invoices/INV-SUB-2026-09.pdf',
    },
    {
      id: 'inv-sub-002',
      invoiceNumber: 'INV-SUB-2026-08',
      date: '2026-08-15',
      amount: 149.0,
      planName: 'Professional Plan',
      billingCycle: 'monthly',
      status: 'Paid',
      paymentMethod: 'Visa •••• 4242',
      pdfUrl: 'https://velox.mobility/invoices/INV-SUB-2026-08.pdf',
    },
    {
      id: 'inv-sub-003',
      invoiceNumber: 'INV-SUB-2026-07',
      date: '2026-07-15',
      amount: 149.0,
      planName: 'Professional Plan',
      billingCycle: 'monthly',
      status: 'Paid',
      paymentMethod: 'Visa •••• 4242',
      pdfUrl: 'https://velox.mobility/invoices/INV-SUB-2026-07.pdf',
    },
    {
      id: 'inv-sub-004',
      invoiceNumber: 'INV-SUB-2026-06',
      date: '2026-06-15',
      amount: 149.0,
      planName: 'Professional Plan',
      billingCycle: 'monthly',
      status: 'Paid',
      paymentMethod: 'Visa •••• 4242',
      pdfUrl: 'https://velox.mobility/invoices/INV-SUB-2026-06.pdf',
    },
  ];

  public subscribe(listener: SubscriptionChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  /**
   * Retrieve active subscription overview
   */
  public async getCurrentSubscription(): Promise<ProviderSubscription> {
    await delay(100);
    return JSON.parse(JSON.stringify(this.currentSubscription));
  }

  /**
   * Retrieve all available plans
   */
  public async getPlans(): Promise<SubscriptionPlan[]> {
    await delay(100);
    return [...SUBSCRIPTION_PLANS];
  }

  /**
   * Get plan details by ID
   */
  public async getPlanById(planId: SubscriptionPlanId): Promise<SubscriptionPlan | undefined> {
    return SUBSCRIPTION_PLANS.find(p => p.id === planId);
  }

  /**
   * Retrieve live usage stats
   */
  public async getUsage(): Promise<SubscriptionUsage> {
    await delay(100);
    return { ...this.currentSubscription.usage };
  }

  /**
   * Retrieve invoice billing history
   */
  public async getBillingHistory(): Promise<BillingInvoiceRecord[]> {
    await delay(150);
    return [...this.billingHistory];
  }

  /**
   * Execute upgrade/change plan flow
   */
  public async upgradePlan(
    targetPlanId: SubscriptionPlanId,
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): Promise<ProviderSubscription> {
    await delay(700); // Simulate API latency

    const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === targetPlanId);
    if (!targetPlan) {
      throw new Error(`Invalid plan ID: ${targetPlanId}`);
    }

    const price = billingCycle === 'annual' ? targetPlan.annualPrice : targetPlan.monthlyPrice;

    // Add new billing invoice record
    const newInvoice: BillingInvoiceRecord = {
      id: `inv-sub-${Date.now().toString().slice(-4)}`,
      invoiceNumber: `INV-SUB-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      date: new Date().toISOString().split('T')[0],
      amount: price,
      planName: `${targetPlan.name} Plan`,
      billingCycle,
      status: 'Paid',
      paymentMethod: 'Visa •••• 4242',
      pdfUrl: `https://velox.mobility/invoices/INV-SUB-${Date.now()}.pdf`,
    };

    this.billingHistory.unshift(newInvoice);

    // Update active subscription
    this.currentSubscription = {
      ...this.currentSubscription,
      planId: targetPlanId,
      status: 'Active',
      billingCycle,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usage: {
        ...this.currentSubscription.usage,
        vehicleLimit: targetPlan.vehicleLimit,
        bookingLimit: targetPlan.bookingLimit,
        teamSeatsLimit: targetPlan.teamMembers,
      },
      enabledFeatures: [...targetPlan.features],
    };

    this.notify();
    return JSON.parse(JSON.stringify(this.currentSubscription));
  }

  /**
   * Cancel subscription (downgrade to Starter at period end)
   */
  public async cancelSubscription(): Promise<ProviderSubscription> {
    await delay(400);
    this.currentSubscription.status = 'Cancelled';
    this.notify();
    return JSON.parse(JSON.stringify(this.currentSubscription));
  }
}

export const subscriptionService = new SubscriptionService();
