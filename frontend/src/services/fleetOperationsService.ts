import {
  DamageReport,
  DamageReviewStatus,
  FleetInspection,
  FleetReturn,
  FleetTask,
  InspectionStatus,
  MaintenanceRecord,
  MaintenanceStatus,
  ReturnStatus,
} from '../types';
import { vehicleService } from './vehicleService';

type FleetChangeListener = () => void;

class FleetOperationsService {
  private maintenance: MaintenanceRecord[] = [
    {
      id: 'maint-01',
      vehicleId: 'veh-civic-02',
      vehicleName: 'Honda Civic Touring',
      vehiclePlate: 'WST-9284',
      type: 'Oil Change',
      dueDate: '2026-09-28',
      status: 'Scheduled',
      estimatedCost: 85,
      serviceCenter: 'Metro Honda Certified Center',
      notes: 'Standard 10,000 km synthetic oil & filter change.',
    },
    {
      id: 'maint-02',
      vehicleId: 'veh-bmw5-08',
      vehicleName: 'BMW 530e M Sport',
      vehiclePlate: 'LUX-4819',
      type: 'Brake Inspection',
      dueDate: '2026-09-22',
      status: 'In Progress',
      estimatedCost: 320,
      serviceCenter: 'Apex European Motors',
      notes: 'Front ceramic pad sensor check and rotor resurfacing.',
    },
    {
      id: 'maint-03',
      vehicleId: 'veh-eclass-07',
      vehicleName: 'Mercedes-Benz E 350 4MATIC',
      vehiclePlate: 'VIP-7701',
      type: 'Detailing & Cleaning',
      dueDate: '2026-09-19',
      completedDate: '2026-09-19',
      status: 'Completed',
      estimatedCost: 150,
      actualCost: 145,
      serviceCenter: 'Crystal Clear Auto Spa',
      notes: 'Exterior ceramic coat maintenance and interior leather conditioning.',
    },
    {
      id: 'maint-04',
      vehicleId: 'veh-sportage-05',
      vehicleName: 'Kia Sportage X-Line',
      vehiclePlate: 'SUV-3392',
      type: 'Tire Rotation',
      dueDate: '2026-09-15',
      status: 'Overdue',
      estimatedCost: 75,
      serviceCenter: 'Goodyear Fleet Care Hub',
      notes: 'Wheel alignment and 4-wheel rotation overdue by 6 days.',
    },
  ];

  private inspections: FleetInspection[] = [
    {
      id: 'insp-101',
      vehicleId: 'veh-q7-10',
      vehicleName: 'Audi Q7 Prestige',
      inspectorName: 'Marcus Chen',
      date: '2026-09-21',
      status: 'Pending',
      type: 'Routine',
      exteriorCondition: 'Good',
      interiorCondition: 'Clean',
      tiresAndBrakes: 'Good',
      fuelLevel: 85,
      odometerReading: 24350,
      passed: true,
      notes: 'Awaiting scheduled 30-day pre-trip telematics validation.',
    },
    {
      id: 'insp-102',
      vehicleId: 'veh-tucson-04',
      vehicleName: 'Hyundai Tucson AWD',
      bookingId: 'VLX-BK-91823',
      inspectorName: 'Elena Rostova',
      date: '2026-09-21',
      status: 'In Progress',
      type: 'Post-Return',
      exteriorCondition: 'Minor Scratches',
      interiorCondition: 'Clean',
      tiresAndBrakes: 'Good',
      fuelLevel: 75,
      odometerReading: 14450,
      passed: true,
      notes: 'Verifying minor rear bumper scuff reported at airport bay.',
    },
    {
      id: 'insp-103',
      vehicleId: 'veh-corolla-01',
      vehicleName: 'Toyota Corolla Hybrid',
      bookingId: 'VLX-BK-72914',
      inspectorName: 'Marcus Chen',
      date: '2026-09-18',
      status: 'Completed',
      type: 'Pre-Trip',
      exteriorCondition: 'Good',
      interiorCondition: 'Clean',
      tiresAndBrakes: 'Good',
      fuelLevel: 100,
      odometerReading: 19540,
      passed: true,
      notes: 'All 18 check points verified. Key card programmed.',
    },
    {
      id: 'insp-104',
      vehicleId: 'veh-elantra-09',
      vehicleName: 'Hyundai Elantra Preferred',
      inspectorName: 'Alex Rivera',
      date: '2026-09-12',
      status: 'Failed',
      type: 'Routine',
      exteriorCondition: 'Damaged',
      interiorCondition: 'Needs Cleaning',
      tiresAndBrakes: 'Needs Replacement',
      fuelLevel: 25,
      odometerReading: 31200,
      passed: false,
      notes: 'Low tread on passenger front tire. Routed to maintenance bay.',
    },
  ];

  private returns: FleetReturn[] = [
    {
      id: 'ret-201',
      bookingId: 'VLX-BK-91823',
      vehicleId: 'veh-tucson-04',
      vehicleName: 'Hyundai Tucson N Line',
      customerName: 'Muhammad Ahmed',
      customerPhone: '+92 300 1234567',
      expectedReturnDate: '2026-09-22',
      expectedReturnTime: '06:00 PM',
      returnLocation: 'Airport Terminal 1 - Hub West',
      status: 'Expected',
    },
    {
      id: 'ret-202',
      bookingId: 'VLX-BK-72914',
      vehicleId: 'veh-corolla-01',
      vehicleName: 'Toyota Corolla Hybrid',
      customerName: 'Muhammad Ahmed',
      customerPhone: '+92 300 1234567',
      expectedReturnDate: '2026-10-04',
      expectedReturnTime: '10:00 AM',
      returnLocation: 'Airport Terminal 1 - Hub West',
      status: 'Expected',
    },
    {
      id: 'ret-203',
      bookingId: 'VLX-BK-58102',
      vehicleId: 'veh-sportage-05',
      vehicleName: 'Kia Sportage X-Line',
      customerName: 'Muhammad Ahmed',
      customerPhone: '+92 300 1234567',
      expectedReturnDate: '2026-08-18',
      expectedReturnTime: '06:00 PM',
      returnLocation: 'Downtown Tech District Hub',
      status: 'Completed',
      actualReturnDate: '2026-08-18 06:15 PM',
      dropoffMileage: 28450,
      dropoffFuel: 100,
      conditionNotes: 'Checked in on time. Fully cleaned.',
    },
    {
      id: 'ret-204',
      bookingId: 'VLX-BK-88192',
      vehicleId: 'veh-fortuner-06',
      vehicleName: 'Toyota Fortuner GR Sport',
      customerName: 'Tariq Mehmood',
      customerPhone: '+92 333 4567890',
      expectedReturnDate: '2026-09-21',
      expectedReturnTime: '02:00 PM',
      returnLocation: 'Grand Plaza Fleet Depot',
      status: 'Inspection Required',
      dropoffMileage: 18900,
      dropoffFuel: 80,
      conditionNotes: 'Returned with minor dust. Awaiting undercarriage inspection.',
    },
  ];

  private damageReports: DamageReport[] = [
    {
      id: 'dmg-301',
      vehicleId: 'veh-tucson-04',
      vehicleName: 'Hyundai Tucson AWD',
      bookingId: 'VLX-BK-91823',
      customerName: 'Muhammad Ahmed',
      reportedAt: '2026-09-21T09:30:00.000Z',
      damageStatus: 'Minor Scratches',
      description: 'Minor 4-inch clear-coat abrasion along rear right bumper panel.',
      estimatedCharge: 120,
      reviewStatus: 'Pending Review',
    },
    {
      id: 'dmg-302',
      vehicleId: 'veh-bmw5-08',
      vehicleName: 'BMW 530e M Sport',
      bookingId: 'VLX-BK-64210',
      customerName: 'Ayesha Khan',
      reportedAt: '2026-09-14T14:15:00.000Z',
      damageStatus: 'Wheel Rim Scuff',
      description: 'Curb rash on front driver alloy wheel rim (3 inches).',
      estimatedCharge: 250,
      reviewStatus: 'Approved',
    },
    {
      id: 'dmg-303',
      vehicleId: 'veh-corolla-01',
      vehicleName: 'Toyota Corolla Hybrid',
      bookingId: 'VLX-BK-51928',
      customerName: 'Usman Qureshi',
      reportedAt: '2026-08-29T16:00:00.000Z',
      damageStatus: 'Cracked Glass',
      description: 'Highway stone chip crack across lower front windshield.',
      estimatedCharge: 380,
      reviewStatus: 'Resolved',
      resolvedAt: '2026-09-02T11:00:00.000Z',
    },
  ];

  private tasks: FleetTask[] = [
    {
      id: 'task-01',
      title: 'Full detailing & sanitization',
      description: 'Prepare for VIP rental pickup tomorrow at Terminal 1.',
      vehicleId: 'veh-eclass-07',
      vehicleName: 'Mercedes-Benz E 350',
      priority: 'High',
      dueTime: 'Today 04:00 PM',
      status: 'Pending',
      category: 'Cleaning',
    },
    {
      id: 'task-02',
      title: 'Digital key fob calibration',
      description: 'Re-sync BLE transponder with cloud hub.',
      vehicleId: 'veh-bmw5-08',
      vehicleName: 'BMW 530e M Sport',
      priority: 'Medium',
      dueTime: 'Today 05:30 PM',
      status: 'Completed',
      category: 'Preparation',
    },
    {
      id: 'task-03',
      title: 'Depot shuttle relocation',
      description: 'Move vehicle from Downtown Hub to Airport West.',
      vehicleId: 'veh-corolla-01',
      vehicleName: 'Toyota Corolla Hybrid',
      priority: 'High',
      dueTime: 'Tomorrow 09:00 AM',
      status: 'Pending',
      category: 'Shuttle',
    },
    {
      id: 'task-04',
      title: 'Post-return 18-point inspection',
      description: 'Inspect vehicle returned by customer Muhammad Ahmed.',
      vehicleId: 'veh-tucson-04',
      vehicleName: 'Hyundai Tucson AWD',
      priority: 'High',
      dueTime: 'Today 06:30 PM',
      status: 'Pending',
      category: 'Inspection',
    },
    {
      id: 'task-05',
      title: 'Tire pressure & wiper fluid top-off',
      description: 'Routine maintenance check before weekend departures.',
      vehicleId: 'veh-sportage-05',
      vehicleName: 'Kia Sportage X-Line',
      priority: 'Low',
      dueTime: 'Tomorrow 11:00 AM',
      status: 'Pending',
      category: 'Maintenance',
    },
  ];

  private listeners: FleetChangeListener[] = [];

  public subscribe(listener: FleetChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (err) {
        console.warn('Error in fleet listener', err);
      }
    });
  }

  // ==================== Maintenance ====================
  public async getMaintenanceList(status?: MaintenanceStatus): Promise<MaintenanceRecord[]> {
    if (status) {
      return this.maintenance.filter(m => m.status === status);
    }
    return [...this.maintenance];
  }

  public async getMaintenanceById(id: string): Promise<MaintenanceRecord | undefined> {
    return this.maintenance.find(m => m.id === id);
  }

  public async scheduleMaintenance(
    record: Omit<MaintenanceRecord, 'id'>
  ): Promise<MaintenanceRecord> {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: `maint-${Date.now().toString().slice(-4)}`,
    };
    this.maintenance = [newRecord, ...this.maintenance];

    // Mark vehicle status as Maintenance if scheduled immediately
    if (record.status === 'In Progress' || record.status === 'Scheduled') {
      await vehicleService.updateAvailability(record.vehicleId, 'Maintenance');
    }

    this.notify();
    return newRecord;
  }

  public async updateMaintenanceStatus(
    id: string,
    status: MaintenanceStatus,
    actualCost?: number,
    notes?: string
  ): Promise<MaintenanceRecord> {
    const idx = this.maintenance.findIndex(m => m.id === id);
    if (idx === -1) throw new Error(`Maintenance record ${id} not found`);

    const current = this.maintenance[idx];
    this.maintenance[idx] = {
      ...current,
      status,
      actualCost: actualCost !== undefined ? actualCost : current.actualCost,
      notes: notes || current.notes,
      completedDate: status === 'Completed' ? new Date().toISOString().split('T')[0] : current.completedDate,
    };

    // If maintenance completed, return vehicle back to Available
    if (status === 'Completed') {
      await vehicleService.updateAvailability(current.vehicleId, 'Available');
    } else if (status === 'In Progress') {
      await vehicleService.updateAvailability(current.vehicleId, 'Maintenance');
    }

    this.notify();
    return this.maintenance[idx];
  }

  // ==================== Inspections ====================
  public async getInspectionsList(status?: InspectionStatus): Promise<FleetInspection[]> {
    if (status) {
      return this.inspections.filter(i => i.status === status);
    }
    return [...this.inspections];
  }

  public async getInspectionById(id: string): Promise<FleetInspection | undefined> {
    return this.inspections.find(i => i.id === id);
  }

  public async createInspection(
    inspection: Omit<FleetInspection, 'id'>
  ): Promise<FleetInspection> {
    const newInsp: FleetInspection = {
      ...inspection,
      id: `insp-${Date.now().toString().slice(-4)}`,
    };
    this.inspections = [newInsp, ...this.inspections];

    // If failed, route vehicle to Maintenance
    if (!inspection.passed || inspection.status === 'Failed') {
      await vehicleService.updateAvailability(inspection.vehicleId, 'Maintenance');
    }

    this.notify();
    return newInsp;
  }

  public async updateInspection(
    id: string,
    updates: Partial<FleetInspection>
  ): Promise<FleetInspection> {
    const idx = this.inspections.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Inspection ${id} not found`);

    this.inspections[idx] = {
      ...this.inspections[idx],
      ...updates,
    };

    this.notify();
    return this.inspections[idx];
  }

  // ==================== Returns ====================
  public async getReturnsList(status?: ReturnStatus): Promise<FleetReturn[]> {
    if (status) {
      return this.returns.filter(r => r.status === status);
    }
    return [...this.returns];
  }

  public async getReturnById(id: string): Promise<FleetReturn | undefined> {
    return this.returns.find(r => r.id === id);
  }

  public async processReturn(
    returnId: string,
    mileage: number,
    fuel: number,
    conditionNotes?: string
  ): Promise<FleetReturn> {
    const idx = this.returns.findIndex(r => r.id === returnId);
    if (idx === -1) throw new Error(`Return record ${returnId} not found`);

    const current = this.returns[idx];
    const completedReturn: FleetReturn = {
      ...current,
      status: 'Completed',
      actualReturnDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      dropoffMileage: mileage,
      dropoffFuel: fuel,
      conditionNotes: conditionNotes || 'Checked in successfully by fleet manager.',
    };

    this.returns[idx] = completedReturn;

    // Reset vehicle availability back to Available
    await vehicleService.updateAvailability(current.vehicleId, 'Available');

    this.notify();
    return completedReturn;
  }

  // ==================== Damage Reports ====================
  public async getDamageReports(status?: DamageReviewStatus): Promise<DamageReport[]> {
    if (status) {
      return this.damageReports.filter(d => d.reviewStatus === status);
    }
    return [...this.damageReports];
  }

  public async getDamageReportById(id: string): Promise<DamageReport | undefined> {
    return this.damageReports.find(d => d.id === id);
  }

  public async createDamageReport(
    report: Omit<DamageReport, 'id' | 'reportedAt'>
  ): Promise<DamageReport> {
    const newReport: DamageReport = {
      ...report,
      id: `dmg-${Date.now().toString().slice(-4)}`,
      reportedAt: new Date().toISOString(),
    };
    this.damageReports = [newReport, ...this.damageReports];
    this.notify();
    return newReport;
  }

  public async resolveDamageReport(
    id: string,
    resolution: DamageReviewStatus,
    notes?: string
  ): Promise<DamageReport> {
    const idx = this.damageReports.findIndex(d => d.id === id);
    if (idx === -1) throw new Error(`Damage report ${id} not found`);

    this.damageReports[idx] = {
      ...this.damageReports[idx],
      reviewStatus: resolution,
      resolvedAt: new Date().toISOString(),
      description: notes
        ? `${this.damageReports[idx].description} [Resolution: ${notes}]`
        : this.damageReports[idx].description,
    };

    this.notify();
    return this.damageReports[idx];
  }

  // ==================== Tasks ====================
  public async getTasks(): Promise<FleetTask[]> {
    return [...this.tasks];
  }

  public async toggleTask(id: string): Promise<FleetTask> {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Task ${id} not found`);

    this.tasks[idx] = {
      ...this.tasks[idx],
      status: this.tasks[idx].status === 'Completed' ? 'Pending' : 'Completed',
    };

    this.notify();
    return this.tasks[idx];
  }

  public async addTask(task: Omit<FleetTask, 'id'>): Promise<FleetTask> {
    const newTask: FleetTask = {
      ...task,
      id: `task-${Date.now().toString().slice(-4)}`,
    };
    this.tasks = [newTask, ...this.tasks];
    this.notify();
    return newTask;
  }

  // ==================== Operations Dashboard KPIs ====================
  public getDashboardKPIs() {
    const fleetStats = vehicleService.getFleetStats();
    const pendingInspections = this.inspections.filter(i => i.status === 'Pending' || i.status === 'In Progress').length;
    const pendingReturns = this.returns.filter(r => r.status === 'Expected' || r.status === 'Inspection Required').length;
    const pendingMaintenance = this.maintenance.filter(m => m.status === 'Scheduled' || m.status === 'In Progress' || m.status === 'Overdue').length;
    const pendingDamageReviews = this.damageReports.filter(d => d.reviewStatus === 'Pending Review').length;

    return {
      vehicles: fleetStats.totalVehicles,
      available: fleetStats.availableVehicles,
      inRental: fleetStats.rentedVehicles,
      maintenance: fleetStats.maintenanceVehicles || pendingMaintenance,
      pendingInspections,
      pendingReturns,
      pendingDamageReviews,
      utilizationRate: fleetStats.utilizationRate,
    };
  }
}

export const fleetOperationsService = new FleetOperationsService();
