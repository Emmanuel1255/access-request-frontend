// src/store/settingsStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// You can seed these from your current demoData constants if you like.
// I’m starting with sensible defaults that match your dataset.
const DEFAULTS = {
  templateCategories: ['IT Security', 'HR', 'Finance', 'Operations', 'Facilities'],
  facilityTypes: [
    'switch_room',
    'server_room',
    'data_center',
    'network_operations_center',
    'transmission_room',
    'telecom_equipment_room',
    'backup_power_room',
    'mdf_room',
    'idf_room',
    'fiber_splice_room',
  ],
  securityClearanceLevels: ['none', 'basic', 'intermediate', 'advanced', 'critical'],
  telecomSystems: [
    'network_management',
    'billing_system',
    'customer_management',
    'inventory_management',
    'workforce_management',
    'trouble_ticketing',
    'provisioning_system',
    'monitoring_tools',
    'configuration_management',
    'security_systems',
  ],
  workShifts: [
    'day_shift',
    'night_shift',
    'rotating_shift',
    'on_call',
    'maintenance_window',
  ],
};

const normalize = (s) => String(s || '').trim();

const removeItem = (arr, value) => arr.filter((x) => x !== value);
const addItem = (arr, value) => {
  const v = normalize(value);
  if (!v) return arr;
  if (arr.includes(v)) return arr;
  return [...arr, v];
};

const useSettingsStore = create(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      // Template Categories
      addTemplateCategory: (name) =>
        set((state) => ({ templateCategories: addItem(state.templateCategories, name) })),
      removeTemplateCategory: (name) =>
        set((state) => ({ templateCategories: removeItem(state.templateCategories, name) })),

      // Facility Types
      addFacilityType: (name) =>
        set((state) => ({ facilityTypes: addItem(state.facilityTypes, name) })),
      removeFacilityType: (name) =>
        set((state) => ({ facilityTypes: removeItem(state.facilityTypes, name) })),

      // Security Clearance Levels
      addSecurityLevel: (name) =>
        set((state) => ({ securityClearanceLevels: addItem(state.securityClearanceLevels, name) })),
      removeSecurityLevel: (name) =>
        set((state) => ({ securityClearanceLevels: removeItem(state.securityClearanceLevels, name) })),

      // Telecom Systems
      addTelecomSystem: (name) =>
        set((state) => ({ telecomSystems: addItem(state.telecomSystems, name) })),
      removeTelecomSystem: (name) =>
        set((state) => ({ telecomSystems: removeItem(state.telecomSystems, name) })),

      // Work Shifts
      addWorkShift: (name) =>
        set((state) => ({ workShifts: addItem(state.workShifts, name) })),
      removeWorkShift: (name) =>
        set((state) => ({ workShifts: removeItem(state.workShifts, name) })),

      // Utilities
      resetToDefaults: () => set({ ...DEFAULTS }),
      exportSettings: () => {
        const { templateCategories, facilityTypes, securityClearanceLevels, telecomSystems, workShifts } = get();
        return JSON.stringify(
          { templateCategories, facilityTypes, securityClearanceLevels, telecomSystems, workShifts },
          null,
          2
        );
      },
      importSettings: (json) => {
        try {
          const obj = JSON.parse(json);
          set({
            templateCategories: Array.isArray(obj.templateCategories) ? obj.templateCategories : DEFAULTS.templateCategories,
            facilityTypes: Array.isArray(obj.facilityTypes) ? obj.facilityTypes : DEFAULTS.facilityTypes,
            securityClearanceLevels: Array.isArray(obj.securityClearanceLevels) ? obj.securityClearanceLevels : DEFAULTS.securityClearanceLevels,
            telecomSystems: Array.isArray(obj.telecomSystems) ? obj.telecomSystems : DEFAULTS.telecomSystems,
            workShifts: Array.isArray(obj.workShifts) ? obj.workShifts : DEFAULTS.workShifts,
          });
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e?.message || 'Invalid JSON' };
        }
      },
    }),
    { name: 'settings-store-v1' }
  )
);

export default useSettingsStore;
