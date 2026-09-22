import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  DamageReport,
  DamageReviewStatus,
  FleetInspection,
  FleetReturn,
  FleetTask,
  MaintenanceRecord,
  MaintenanceStatus,
  Vehicle,
  VehicleAvailability,
} from '../types';
import { vehicleService } from '../services/vehicleService';
import { fleetOperationsService } from '../services/fleetOperationsService';

export interface FleetContextType {
  vehicles: Vehicle[];
  refreshVehicles: () => Promise<void>;
  addVehicle: (data: Partial<Vehicle>) => Promise<Vehicle>;
  editVehicle: (id: string, updates: Partial<Vehicle>) => Promise<Vehicle>;
  publishVehicle: (id: string) => Promise<Vehicle>;
  unpublishVehicle: (id: string) => Promise<Vehicle>;
  archiveVehicle: (id: string) => Promise<Vehicle>;
  setAvailability: (id: string, status: VehicleAvailability) => Promise<Vehicle>;

  // Operations
  maintenanceList: MaintenanceRecord[];
  scheduleMaintenance: (record: Omit<MaintenanceRecord, 'id'>) => Promise<MaintenanceRecord>;
  updateMaintenanceStatus: (
    id: string,
    status: MaintenanceStatus,
    cost?: number,
    notes?: string
  ) => Promise<MaintenanceRecord>;

  inspectionsList: FleetInspection[];
  createInspection: (inspection: Omit<FleetInspection, 'id'>) => Promise<FleetInspection>;
  updateInspection: (id: string, updates: Partial<FleetInspection>) => Promise<FleetInspection>;

  returnsList: FleetReturn[];
  processReturn: (
    returnId: string,
    mileage: number,
    fuel: number,
    notes?: string
  ) => Promise<FleetReturn>;

  damageReports: DamageReport[];
  createDamageReport: (report: Omit<DamageReport, 'id' | 'reportedAt'>) => Promise<DamageReport>;
  resolveDamageReport: (
    id: string,
    resolution: DamageReviewStatus,
    notes?: string
  ) => Promise<DamageReport>;

  tasks: FleetTask[];
  toggleTask: (id: string) => Promise<FleetTask>;
  addTask: (task: Omit<FleetTask, 'id'>) => Promise<FleetTask>;

  getDashboardKPIs: () => ReturnType<typeof fleetOperationsService.getDashboardKPIs>;
  refreshOperations: () => Promise<void>;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceRecord[]>([]);
  const [inspectionsList, setInspectionsList] = useState<FleetInspection[]>([]);
  const [returnsList, setReturnsList] = useState<FleetReturn[]>([]);
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [tasks, setTasks] = useState<FleetTask[]>([]);

  const refreshVehicles = useCallback(async () => {
    const list = await vehicleService.getAllVehicles(true);
    setVehicles(list);
  }, []);

  const refreshOperations = useCallback(async () => {
    const [maint, insp, ret, dmg, tsk] = await Promise.all([
      fleetOperationsService.getMaintenanceList(),
      fleetOperationsService.getInspectionsList(),
      fleetOperationsService.getReturnsList(),
      fleetOperationsService.getDamageReports(),
      fleetOperationsService.getTasks(),
    ]);
    setMaintenanceList(maint);
    setInspectionsList(insp);
    setReturnsList(ret);
    setDamageReports(dmg);
    setTasks(tsk);
  }, []);

  useEffect(() => {
    refreshVehicles();
    refreshOperations();

    const unsubVehicles = vehicleService.subscribe(() => {
      refreshVehicles();
    });

    const unsubOperations = fleetOperationsService.subscribe(() => {
      refreshOperations();
    });

    return () => {
      unsubVehicles();
      unsubOperations();
    };
  }, [refreshVehicles, refreshOperations]);

  // Vehicle methods
  const addVehicle = async (data: Partial<Vehicle>): Promise<Vehicle> => {
    const created = await vehicleService.addVehicle(data);
    await refreshVehicles();
    return created;
  };

  const editVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
    const updated = await vehicleService.updateVehicle(id, updates);
    await refreshVehicles();
    return updated;
  };

  const publishVehicle = async (id: string): Promise<Vehicle> => {
    const updated = await vehicleService.publishVehicle(id);
    await refreshVehicles();
    return updated;
  };

  const unpublishVehicle = async (id: string): Promise<Vehicle> => {
    const updated = await vehicleService.unpublishVehicle(id);
    await refreshVehicles();
    return updated;
  };

  const archiveVehicle = async (id: string): Promise<Vehicle> => {
    const updated = await vehicleService.archiveVehicle(id);
    await refreshVehicles();
    return updated;
  };

  const setAvailability = async (
    id: string,
    status: VehicleAvailability
  ): Promise<Vehicle> => {
    const updated = await vehicleService.updateAvailability(id, status);
    await refreshVehicles();
    return updated;
  };

  // Operations methods
  const scheduleMaintenance = async (
    record: Omit<MaintenanceRecord, 'id'>
  ): Promise<MaintenanceRecord> => {
    const created = await fleetOperationsService.scheduleMaintenance(record);
    await refreshOperations();
    return created;
  };

  const updateMaintenanceStatus = async (
    id: string,
    status: MaintenanceStatus,
    cost?: number,
    notes?: string
  ): Promise<MaintenanceRecord> => {
    const updated = await fleetOperationsService.updateMaintenanceStatus(id, status, cost, notes);
    await refreshOperations();
    return updated;
  };

  const createInspection = async (
    inspection: Omit<FleetInspection, 'id'>
  ): Promise<FleetInspection> => {
    const created = await fleetOperationsService.createInspection(inspection);
    await refreshOperations();
    return created;
  };

  const updateInspection = async (
    id: string,
    updates: Partial<FleetInspection>
  ): Promise<FleetInspection> => {
    const updated = await fleetOperationsService.updateInspection(id, updates);
    await refreshOperations();
    return updated;
  };

  const processReturn = async (
    returnId: string,
    mileage: number,
    fuel: number,
    notes?: string
  ): Promise<FleetReturn> => {
    const updated = await fleetOperationsService.processReturn(returnId, mileage, fuel, notes);
    await refreshOperations();
    return updated;
  };

  const createDamageReport = async (
    report: Omit<DamageReport, 'id' | 'reportedAt'>
  ): Promise<DamageReport> => {
    const created = await fleetOperationsService.createDamageReport(report);
    await refreshOperations();
    return created;
  };

  const resolveDamageReport = async (
    id: string,
    resolution: DamageReviewStatus,
    notes?: string
  ): Promise<DamageReport> => {
    const updated = await fleetOperationsService.resolveDamageReport(id, resolution, notes);
    await refreshOperations();
    return updated;
  };

  const toggleTask = async (id: string): Promise<FleetTask> => {
    const updated = await fleetOperationsService.toggleTask(id);
    await refreshOperations();
    return updated;
  };

  const addTask = async (task: Omit<FleetTask, 'id'>): Promise<FleetTask> => {
    const created = await fleetOperationsService.addTask(task);
    await refreshOperations();
    return created;
  };

  const getDashboardKPIs = () => {
    return fleetOperationsService.getDashboardKPIs();
  };

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        refreshVehicles,
        addVehicle,
        editVehicle,
        publishVehicle,
        unpublishVehicle,
        archiveVehicle,
        setAvailability,
        maintenanceList,
        scheduleMaintenance,
        updateMaintenanceStatus,
        inspectionsList,
        createInspection,
        updateInspection,
        returnsList,
        processReturn,
        damageReports,
        createDamageReport,
        resolveDamageReport,
        tasks,
        toggleTask,
        addTask,
        getDashboardKPIs,
        refreshOperations,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = (): FleetContextType => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
