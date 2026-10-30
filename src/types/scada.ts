export type SystemMode = 'rail' | 'road' | 'pipe' | 'flight' | 'underwater' | 'production_line';

export type AssemblyStationId =
  | 'Conveyor_RawMaterial'
  | 'SewingMachine_01'
  | 'GlueStation_01'
  | 'SolePress_01'
  | 'QualityCheck_01'
  | 'PackingRobot_01'
  | 'FinishedWarehouse';

export interface AssemblyStationInfo {
  id: AssemblyStationId;
  name: string;
  stepNumber: number;
  status: 'IDLE' | 'RUNNING' | 'WAITING' | 'MAINTENANCE' | 'BLOCKED';
  cycleTimeSec: number;
  unitsProcessed: number;
  targetPerHour: number;
  temperatureC?: number;
  pressureBar?: number;
  defectCount?: number;
  oeePercent: number;
  sensorIo: string;
  actuatorIo: string;
  description: string;
}

export interface AssemblyPlcBits {
  ProductionCount: number;
  MaterialAvailable: boolean;
  SewingComplete: boolean;
  GlueComplete: boolean;
  PressComplete: boolean;
  QC_OK: boolean;
}

export interface AccessLogEntry {
  id: string;
  idCard: string;
  fonCode: string;
  granted: boolean;
  timestamp: string;
  message: string;
}

export interface IncomeMonitoringState {
  m3Treated: number;
  revenueRwf: number;
  unitPriceRwf: number; // 65 RWF per m3 WASAC tariff
  flowRateM3h: number; // 4200 m3/h from Gihira
  processingTimeMs: number; // 0.05ms - S7-1200 TON timer (%DB4 T_1)
  imihigoAchievedPercent: number; // 92%
  stabilityUptimePercent: number; // 98.5%
  accountabilityTrackedPercent: number; // 100%
  fonPorteStatus: string; // "Hwenu Gbon"
  gateOpen: boolean;
  accessLogs: AccessLogEntry[];
}

export interface AssemblyLineMetrics {
  lineRunning: boolean;
  totalOutputUnits: number;
  shiftTargetUnits: number;
  overallOeePercent: number;
  lineSpeedMPerMin: number;
  activeStationId: AssemblyStationId;
  passRatePercent: number;
  batchCode: string;
  plcBits: AssemblyPlcBits;
  stations: Record<AssemblyStationId, AssemblyStationInfo>;
}

export interface VfdPreset {
  id: string;
  param: string;
  percent: number;
  hz: number;
  label: string;
}

export interface PlcIoState {
  i00_start_no: boolean;   // I0.0 Start push button (Normally Open)
  i01_stop_nc: boolean;    // I0.1 Stop push button (Normally Closed, default true)
  i02_fwd: boolean;        // I0.2 Forward direction
  i03_rev: boolean;        // I0.3 Reverse direction
  i04_up: boolean;         // I0.4 Up altitude / lift
  i05_left_right: number;  // I0.5 Steering offset (-1 to 1)
  q00_contactor: boolean;  // Q0.0 Contactor LC1D25 (Seal-in coil)
  q02_fwd_drive: boolean;  // Q0.2 Forward contactor
  q03_rev_drive: boolean;  // Q0.3 Reverse contactor
  mcb_tripped: boolean;    // MCB IC60N C25 400V~
  psu_sitop_ok: boolean;   // SITOP 24VDC
}

export interface WaterLabMetrics {
  turbidity: number;       // NTU (WHO < 5.0)
  ph: number;              // 6.5 - 8.5
  chlorine: number;        // mg/L (0.8 - 1.2)
  conductivity: number;    // µS/cm
  valvePosition: number;   // %
  tankLevelPercent: number;// %MD132
  tankVolumeM3: number;    // m³
  inflowRate: number;      // m³/h V-101
  outflowRate: number;     // m³/h P-101
  dosingPressureBar: number;
}

export interface TelemetryState {
  vfdHz: number;
  motorRpm: number;
  powerMw: number;
  bearingTempC: number;
  vibrationRms: number;
  kpiPowerMw: number;
  pipelinePressureBar: number;
  gasReserveBcm: number;
  droneSurveillanceRate: number;
  vehicleSpeedKmh: number;
  flightAltitudeM: number;
  flightFlapAngleDeg: number;
  autoDoorOpen: boolean;
  radarMotionDetected: boolean;
  conveyorRunning: boolean;
  routeProgressPercent: number;
  predictiveAiRisk: number;
}

export interface BluetoothDeviceStatus {
  connected: boolean;
  deviceName: string;
  deviceMac: string;
  rssi: number;
  batteryPct: number;
  simulated: boolean;
}
