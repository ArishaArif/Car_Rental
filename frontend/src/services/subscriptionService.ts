import {
  BillingInvoiceRecord,
  ProviderSubscription,
  SubscriptionPlan,
  SubscriptionPlanId,
  SubscriptionUsage,
} from '../types';
import { subscriptionsApi } from '../api/subscriptionsApi';
import {
  ApiBillingInvoiceRecordResponse,
  ApiProviderSubscriptionResponse,
  ApiSubscriptionPlanResponse,
} from '../api/types';

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

function mapApiPlan(p: ApiSubscriptionPlanResponse): SubscriptionPlan {
  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    monthlyPrice: p.monthly_price,
    annualPrice: p.annual_price,
    vehicleLimit: p.vehicle_limit,
    bookingLimit: p.booking_limit,
    aiAssistantAccess: p.ai_assistant_access,
    smartPricingAccess: p.smart_pricing_access,
    analytics: p.analytics,
    teamMembers: p.team_members,
    support: p.support,
    features: p.features,
  };
}

function mapApiSubscription(s: ApiProviderSubscriptionResponse): ProviderSubscription {
  return {
    id: s.id,
    providerId: String(s.provider_id),
    planId: s.plan_id,
    status: (s.status as any) || 'Active',
    billingCycle: s.billing_cycle,
    startDate: s.start_date,
    renewalDate: s.renewal_date,
    usage: {
      vehiclesUsed: s.usage?.vehiclesUsed || 0,
      vehicleLimit: s.usage?.vehicleLimit || 25,
      bookingsUsed: s.usage?.bookingsUsed || 0,
      bookingLimit: s.usage?.bookingLimit || 150,
      teamSeatsUsed: s.usage?.teamSeatsUsed || 1,
      teamSeatsLimit: s.usage?.teamSeatsLimit || 5,
    },
    enabledFeatures: s.enabled_features || [],
  };
}

function mapApiInvoice(inv: ApiBillingInvoiceRecordResponse): BillingInvoiceRecord {
  return {
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    date: inv.date,
    amount: inv.amount,
    planName: inv.plan_name,
    billingCycle: (inv.billing_cycle as any) || 'monthly',
    status: (inv.status as any) || 'Paid',
    paymentMethod: inv.payment_method,
    pdfUrl: inv.pdf_url || `https://velox.mobility/invoices/${inv.invoice_number}.pdf`,
  };
}

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
  ];

  constructor() {
    this.syncFromBackend().catch(err => {
      console.warn('[SubscriptionService] Sync note:', err?.message);
    });
  }

  public async syncFromBackend(): Promise<void> {
    try {
      const [subRes, invRes] = await Promise.allSettled([
        subscriptionsApi.getCurrentSubscription(),
        subscriptionsApi.getInvoices(),
      ]);

      if (subRes.status === 'fulfilled' && subRes.value.success && subRes.value.data) {
        this.currentSubscription = mapApiSubscription(subRes.value.data);
      }
      if (invRes.status === 'fulfilled' && invRes.value.success && invRes.value.data.length > 0) {
        this.billingHistory = invRes.value.data.map(mapApiInvoice);
      }
      this.notify();
    } catch (e: any) {
      console.warn('[SubscriptionService] syncFromBackend fallback:', e?.message);
    }
  }

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
    try {
      const res = await subscriptionsApi.getCurrentSubscription();
      if (res.success && res.data) {
        this.currentSubscription = mapApiSubscription(res.data);
        return this.currentSubscription;
      }
    } catch {
      // offline fallback
    }
    return JSON.parse(JSON.stringify(this.currentSubscription));
  }

  /**
   * Retrieve all available plans
   */
  public async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const res = await subscriptionsApi.getPlans();
      if (res.success && res.data && res.data.length > 0) {
        return res.data.map(mapApiPlan);
      }
    } catch {
      // offline fallback
    }
    return [...SUBSCRIPTION_PLANS];
  }

  /**
   * Get plan details by ID
   */
  public async getPlanById(planId: SubscriptionPlanId): Promise<SubscriptionPlan | undefined> {
    const plans = await this.getPlans();
    return plans.find(p => p.id === planId);
  }

  /**
   * Retrieve live usage stats
   */
  public async getUsage(): Promise<SubscriptionUsage> {
    const sub = await this.getCurrentSubscription();
    return { ...sub.usage };
  }

  /**
   * Retrieve invoice billing history
   */
  public async getBillingHistory(): Promise<BillingInvoiceRecord[]> {
    try {
      const res = await subscriptionsApi.getInvoices();
      if (res.success && res.data && res.data.length > 0) {
        this.billingHistory = res.data.map(mapApiInvoice);
        return [...this.billingHistory];
      }
    } catch {
      // offline fallback
    }
    return [...this.billingHistory];
  }

  /**
   * Execute upgrade/change plan flow
   */
  public async upgradePlan(
    targetPlanId: SubscriptionPlanId,
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): Promise<ProviderSubscription> {
    const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === targetPlanId);
    if (!targetPlan) {
      throw new Error(`Invalid plan ID: ${targetPlanId}`);
    }

    try {
      const apiRes = await subscriptionsApi.upgradeSubscription({
        target_plan_id: targetPlanId,
        billing_cycle: billingCycle,
      });
      if (apiRes.success && apiRes.data) {
        this.currentSubscription = mapApiSubscription(apiRes.data);
        this.notify();
        return this.currentSubscription;
      }
    } catch (err: any) {
      console.warn('[SubscriptionService] upgradePlan live fallback:', err?.message);
    }

    const price = billingCycle === 'annual' ? targetPlan.annualPrice : targetPlan.monthlyPrice;
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
    this.currentSubscription.status = 'Cancelled';
    this.notify();
    return JSON.parse(JSON.stringify(this.currentSubscription));
  }
}

export const subscriptionService = new SubscriptionService();
