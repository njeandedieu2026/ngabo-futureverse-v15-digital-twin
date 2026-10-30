import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThreeScene } from './components/ThreeScene';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { BottomBar } from './components/BottomBar';
import { LadderLogicModal } from './components/LadderLogicModal';
import { BluetoothModal } from './components/BluetoothModal';
import { AssemblyLinePanel } from './components/AssemblyLinePanel';
import { IncomeMonitoringModal } from './components/IncomeMonitoringModal';
import {
  SystemMode,
  PlcIoState,
  TelemetryState,
  WaterLabMetrics,
  BluetoothDeviceStatus,
  AssemblyStationId,
  AssemblyLineMetrics,
  AssemblyPlcBits,
  IncomeMonitoringState,
  AccessLogEntry,
} from './types/scada';
import { scadaAudio } from './utils/audio';

export default function App() {
  // Master mode
  const [mode, setMode] = useState<SystemMode>('rail');

  // PLC I/O status (S7-1200 / S7-1500)
  const [plcIo, setPlcIo] = useState<PlcIoState>({
    i00_start_no: false,
    i01_stop_nc: true, // Normally Closed (NC) is true when healthy
    i02_fwd: false,
    i03_rev: false,
    i04_up: false,
    i05_left_right: 0,
    q00_contactor: false, // LC1D25 Master coil
    q02_fwd_drive: false,
    q03_rev_drive: false,
    mcb_tripped: false,
    psu_sitop_ok: true,
  });

  // Telemetry variables
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    vfdHz: 15.0, // Default Pr.3-10-6 (30% = 15Hz)
    motorRpm: 1543,
    powerMw: 46.5,
    bearingTempC: 46.2,
    vibrationRms: 1.38,
    kpiPowerMw: 36.0,
    pipelinePressureBar: 12.8,
    gasReserveBcm: 60.0,
    droneSurveillanceRate: 0.743,
    vehicleSpeedKmh: 30.6,
    flightAltitudeM: 0.0,
    flightFlapAngleDeg: 0,
    autoDoorOpen: false,
    radarMotionDetected: false,
    conveyorRunning: false,
    routeProgressPercent: 38,
    predictiveAiRisk: 0.13,
  });

  // Water Treatment Laboratory Metrics
  const [waterLab, setWaterLab] = useState<WaterLabMetrics>({
    turbidity: 1.26,
    ph: 7.28,
    chlorine: 0.79,
    conductivity: 418,
    valvePosition: 65,
    tankLevelPercent: 69.0,
    tankVolumeM3: 690.1,
    inflowRate: 135.5,
    outflowRate: 184.2,
    dosingPressureBar: 4.05,
  });

  // Live PLC Logic Banner Text
  const [logicText, setLogicText] = useState<string>(
    'LOGIC: STOP NC CLOSED - READY FOR START - SCAN 10ms - HAND ON Auto Off - Pr.3-10-6 30.0% [15Hz] ACTIVE'
  );

  // Bluetooth HC-05 State
  const [bluetoothStatus, setBluetoothStatus] = useState<BluetoothDeviceStatus>({
    connected: false,
    deviceName: 'HC-05',
    deviceMac: '98:D3:31:FB:7E',
    rssi: -52,
    batteryPct: 94,
    simulated: true,
  });

  // UI state
  const [isLadderOpen, setIsLadderOpen] = useState<boolean>(false);
  const [isBluetoothOpen, setIsBluetoothOpen] = useState<boolean>(false);
  const [showLeftPanel, setShowLeftPanel] = useState<boolean>(true);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(true);
  const [gamepadConnected, setGamepadConnected] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [activeCameraPreset, setActiveCameraPreset] = useState<string>('default');
  const [showAssemblyPanel, setShowAssemblyPanel] = useState<boolean>(true);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState<boolean>(false);

  // NGABO V60 - Customer Income Monitoring State (Rubavu Urban DDS IMIHIGO)
  const [incomeState, setIncomeState] = useState<IncomeMonitoringState>({
    m3Treated: 0,
    revenueRwf: 0,
    unitPriceRwf: 65,
    flowRateM3h: 4200,
    processingTimeMs: 0.05,
    imihigoAchievedPercent: 92,
    stabilityUptimePercent: 98.5,
    accountabilityTrackedPercent: 100,
    fonPorteStatus: 'Hwenu Gbon',
    gateOpen: false,
    accessLogs: [],
  });

  // 7-Station Footwear Manufacturing Assembly Line State
  const [assemblyLine, setAssemblyLine] = useState<AssemblyLineMetrics>({
    lineRunning: true,
    totalOutputUnits: 1482,
    shiftTargetUnits: 1600,
    overallOeePercent: 88.4,
    lineSpeedMPerMin: 12.5,
    activeStationId: 'Conveyor_RawMaterial',
    passRatePercent: 99.4,
    batchCode: 'K56-FW-20261012-A',
    plcBits: {
      ProductionCount: 0,
      MaterialAvailable: true,
      SewingComplete: false,
      GlueComplete: false,
      PressComplete: false,
      QC_OK: false,
    },
    stations: {
      Conveyor_RawMaterial: {
        id: 'Conveyor_RawMaterial',
        name: 'Conveyor_RawMaterial',
        stepNumber: 1,
        status: 'RUNNING',
        cycleTimeSec: 4.8,
        unitsProcessed: 1482,
        targetPerHour: 400,
        oeePercent: 92.5,
        sensorIo: 'I1.0 (Photo-eye PE101 Infeed)',
        actuatorIo: 'Q1.0 (Infeed Belt Roller Motor)',
        description: 'Raw material fabric & leather intake conveyor with optical edge alignment',
      },
      SewingMachine_01: {
        id: 'SewingMachine_01',
        name: 'SewingMachine_01',
        stepNumber: 2,
        status: 'RUNNING',
        cycleTimeSec: 8.5,
        unitsProcessed: 1480,
        targetPerHour: 380,
        temperatureC: 48.2,
        oeePercent: 89.2,
        sensorIo: 'I1.1 (Needle Top Dead Center + Thread Tension Sensor)',
        actuatorIo: 'Q1.1 (Needle Drive Servo + Presser Foot Cylinder)',
        description: 'CNC automated upper stitching & seam joining workstation',
      },
      GlueStation_01: {
        id: 'GlueStation_01',
        name: 'GlueStation_01',
        stepNumber: 3,
        status: 'RUNNING',
        cycleTimeSec: 6.2,
        unitsProcessed: 1478,
        targetPerHour: 400,
        temperatureC: 165.0,
        pressureBar: 4.2,
        oeePercent: 91.0,
        sensorIo: 'I1.2 (Tank Level Float + Temperature RTD PT100)',
        actuatorIo: 'Q1.2 (Nozzle Dispensing Solenoid + Heating Cartridge)',
        description: 'Precision hot-melt polyurethane sole primer & perimeter adhesive dispenser',
      },
      SolePress_01: {
        id: 'SolePress_01',
        name: 'SolePress_01',
        stepNumber: 4,
        status: 'RUNNING',
        cycleTimeSec: 14.0,
        unitsProcessed: 1475,
        targetPerHour: 260,
        temperatureC: 85.0,
        pressureBar: 6.8,
        oeePercent: 86.8,
        sensorIo: 'I1.3 (Mold Clamped Proximity + Pressure Switch 6.8 bar)',
        actuatorIo: 'Q1.3 (Hydraulic Down Valve + Mold Cooling Circuit)',
        description: 'Hydraulic dual-ram vulcanizing sole attachment press mold',
      },
      QualityCheck_01: {
        id: 'QualityCheck_01',
        name: 'QualityCheck_01',
        stepNumber: 5,
        status: 'RUNNING',
        cycleTimeSec: 3.5,
        unitsProcessed: 1475,
        defectCount: 9,
        targetPerHour: 500,
        oeePercent: 95.4,
        sensorIo: 'I1.4 (Trigger Optical Proximity + High-Res Cognex Camera)',
        actuatorIo: 'Q1.4 (Laser Scanner Strobe + Defect Ejector Gate)',
        description: 'Machine vision geometric alignment & adhesive boundary laser scanner',
      },
      PackingRobot_01: {
        id: 'PackingRobot_01',
        name: 'PackingRobot_01',
        stepNumber: 6,
        status: 'RUNNING',
        cycleTimeSec: 5.2,
        unitsProcessed: 1466,
        targetPerHour: 420,
        pressureBar: -0.82,
        oeePercent: 89.8,
        sensorIo: 'I1.5 (Box Magazine Present Sensor + Vacuum Switch -82kPa)',
        actuatorIo: 'Q1.5 (6-Axis Robot Controller + Vacuum Venturi Ejector)',
        description: '6-Axis articulated robotic arm shoe boxing & cartoning cell',
      },
      FinishedWarehouse: {
        id: 'FinishedWarehouse',
        name: 'FinishedWarehouse',
        stepNumber: 7,
        status: 'RUNNING',
        cycleTimeSec: 9.0,
        unitsProcessed: 1466,
        targetPerHour: 350,
        oeePercent: 94.2,
        sensorIo: 'I1.6 (Stacker Crane Height Encoder + Barcode Scanner BCR201)',
        actuatorIo: 'Q1.6 (AS/RS Vertical Hoist Servo + Shuttle Fork Drive)',
        description: 'Automated high-bay storage and retrieval system (AS/RS) rack',
      },
    },
  });

  // Helper to recalculate VFD dependent parameters
  const updateVfdDerived = useCallback((hz: number, isFwd: boolean) => {
    const rpm = Math.round(hz * 30.86 + 1000);
    const power = Number((hz * 0.9 + 20).toFixed(1));
    const speedKmh = Number((hz * 0.612).toFixed(1));
    setTelemetry((prev) => ({
      ...prev,
      vfdHz: hz,
      motorRpm: rpm,
      powerMw: power,
      vehicleSpeedKmh: isFwd ? speedKmh : 0,
    }));
    scadaAudio.updateVfdMotorSound(true, hz);
  }, []);

  // ----------------------------------------------------------------------
  // PLC CONTROL HANDLERS (EXACT EQUIVALENT OF USER'S INLINE LOGIC)
  // ----------------------------------------------------------------------

  // 1. PLC START (I0.0 NO Seal-in circuit)
  const plcStart = useCallback(() => {
    if (plcIo.mcb_tripped) {
      setLogicText('FAULT: MCB IC60N IS TRIPPED! Reset breaker before starting.');
      return;
    }

    scadaAudio.playContactorClick('on');
    setPlcIo((prev) => ({
      ...prev,
      i00_start_no: true,
      i01_stop_nc: true,
      q00_contactor: true, // Latch Q0.0 coil
    }));

    setLogicText(
      'LOGIC: Q0.0 LATCH ACTIVE Seal-in I0.0 + STOP NC + Q0.0 -> Q0.0 Contactor | SCAN 10ms PROFINET ONLINE SIS OK SIL-3 99.3% SAFE K56 | HAND ON | Pr.3-10-6 30.0% [15.0Hz] ACTIVE'
    );

    scadaAudio.updateVfdMotorSound(true, telemetry.vfdHz);

    // Release push-button after 200ms (pulse simulation)
    setTimeout(() => {
      setPlcIo((prev) => ({ ...prev, i00_start_no: false }));
    }, 200);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [plcIo.mcb_tripped, telemetry.vfdHz]);

  // 2. PLC STOP (I0.1 NC Reset Q0.0)
  const plcStop = useCallback(() => {
    scadaAudio.playContactorClick('off');
    scadaAudio.updateVfdMotorSound(false, 0);

    setPlcIo((prev) => ({
      ...prev,
      i01_stop_nc: false, // NC opened
      q00_contactor: false,
      q02_fwd_drive: false,
      q03_rev_drive: false,
      i02_fwd: false,
      i03_rev: false,
    }));

    setTelemetry((prev) => ({
      ...prev,
      vehicleSpeedKmh: 0,
    }));

    setLogicText(
      'STOP: NC OPEN -> Q0.0 RESET -> VFD 0Hz Off Reset -> MCB READY | Emergency Ready S2B GELA SIL-3'
    );

    // Return NC button to closed state after 250ms
    setTimeout(() => {
      setPlcIo((prev) => ({ ...prev, i01_stop_nc: true }));
    }, 250);
  }, []);

  // 3. PLC FORWARD (I0.2 -> Q0.2 with Q0.3 Reverse Interlock)
  const plcFwd = useCallback(() => {
    if (!plcIo.q00_contactor) {
      setLogicText('INTERLOCK WARNING: PRESS START FIRST - Q0.0 Contactor must be energized before FWD!');
      return;
    }

    const currentHz = telemetry.vfdHz > 0 ? telemetry.vfdHz : 15.0;
    setPlcIo((prev) => ({
      ...prev,
      i02_fwd: true,
      i03_rev: false,
      q02_fwd_drive: true,
      q03_rev_drive: false, // Interlocked
    }));

    updateVfdDerived(currentHz, true);

    setLogicText(
      `FORWARD LOGIC: Q0.0 AND I0.2 AND NOT I0.3 -> Q0.2 FWD | Truck Loading 1.0m LIVE | Train Loop 20.3cm/s | VFD Pr.3-10-6 30% | R S T 380V AVI 18V M1 FWD | Conveyor Transport 184.2m³/h | Kigali->Ethiopia 56.3MW`
    );
  }, [plcIo.q00_contactor, telemetry.vfdHz, updateVfdDerived]);

  // 4. PLC REVERSE (I0.3 -> Q0.3 with Q0.2 Forward Interlock)
  const plcRev = useCallback(() => {
    if (!plcIo.q00_contactor) {
      setLogicText('INTERLOCK WARNING: PRESS START FIRST - Q0.0 Contactor must be energized before REV!');
      return;
    }

    const revHz = 7.5; // Pr.3-10-3
    setPlcIo((prev) => ({
      ...prev,
      i03_rev: true,
      i02_fwd: false,
      q03_rev_drive: true,
      q02_fwd_drive: false, // Interlocked
    }));

    updateVfdDerived(revHz, false);

    setLogicText(
      `REVERSE LOGIC: Q0.0 AND I0.3 AND NOT I0.2 -> Q0.3 REV | Return Dry Port | Motor reverse | Interlock prevents FWD+REV both ON SIL-3 | Pr.3-10-3 15% [7.5Hz]`
    );
  }, [plcIo.q00_contactor, updateVfdDerived]);

  // 5. EMERGENCY STOP (S2B GELA SIL-3)
  const plcEstop = useCallback(() => {
    scadaAudio.playEstopAlarm();
    scadaAudio.updateVfdMotorSound(false, 0);

    setPlcIo((prev) => ({
      ...prev,
      i00_start_no: false,
      i01_stop_nc: false,
      q00_contactor: false,
      q02_fwd_drive: false,
      q03_rev_drive: false,
      i02_fwd: false,
      i03_rev: false,
      mcb_tripped: true, // Trip MCB
    }));

    setTelemetry((prev) => ({
      ...prev,
      vehicleSpeedKmh: 0,
      flightAltitudeM: 0,
    }));

    setMode('rail');

    setLogicText(
      'EMERGENCY RESET S2B GELA ACTIVATED - SIS Safety Instrumented System OK - All Q OFF - VFD 0Hz Off Reset - MCB IC60N C25 TRIP - LC1D25 OFF - PSU 24VDC SAFE - Hand ON Warn Alarm Auto Off | E-STOP RESET REQUIRED'
    );
  }, []);

  // 6. UP / ALTITUDE / UPLIFTING STRATEGY
  const plcUp = useCallback(() => {
    setTelemetry((prev) => {
      const nextAlt = Math.min(14, prev.flightAltitudeM + 0.8);
      if (nextAlt > 1.5 && mode !== 'flight') {
        setMode('flight');
      }
      return { ...prev, flightAltitudeM: nextAlt };
    });

    setLogicText(
      `UP: Uplifting Strategy Partnership - Flying wings Technology Design Innovation - Altitude + VTOL HOVER | VFD 51.0Hz | 1511 RPM | CRUISE (0°)`
    );
  }, [mode]);

  // 7. DOWN / WATER TREATMENT INFLOW
  const plcDown = useCallback(() => {
    setTelemetry((prev) => {
      const nextAlt = Math.max(0, prev.flightAltitudeM - 0.8);
      if (nextAlt <= 0.5 && mode === 'flight') {
        setMode('road');
      }
      return { ...prev, flightAltitudeM: nextAlt };
    });

    setLogicText(
      `DOWN: Water Treatment Inflow Valve V-101 Position ${waterLab.valvePosition}% NOMINAL - Turbidity ${waterLab.turbidity.toFixed(2)} NTU - pH ${waterLab.ph.toFixed(2)} - Chlorine ${waterLab.chlorine.toFixed(2)}mg/L`
    );
  }, [mode, waterLab]);

  // 8. STEERING LEFT
  const plcLeft = useCallback(() => {
    setPlcIo((prev) => ({ ...prev, i05_left_right: prev.i05_left_right - 0.3 }));
    setLogicText(
      'LEFT: Steering Building Road Safety - Motion Sensor Microwave Radar DETECT→SIGNAL→ACTIVATE→OPEN - Drive Belt & Rollers - Safety Sensor Infrared'
    );
  }, []);

  // 9. STEERING RIGHT
  const plcRight = useCallback(() => {
    setPlcIo((prev) => ({ ...prev, i05_left_right: prev.i05_left_right + 0.3 }));
    setLogicText(
      'RIGHT: Steering Building Road Safety - Electric Motor Drive Belt & Rollers + Approaching Person Detection Waves'
    );
  }, []);

  // 10. FLYING WINGS CRUISE
  const flyingWings = useCallback(() => {
    setMode('flight');
    if (!plcIo.q00_contactor) plcStart();
    plcFwd();
    setTelemetry((prev) => ({
      ...prev,
      flightAltitudeM: 8.0,
      flightFlapAngleDeg: 0,
      vehicleSpeedKmh: 48.0,
    }));
    setActiveCameraPreset('drone');
    setLogicText(
      'FLYING WINGS TECHNOLOGY DESIGN INNOVATION: 2PAC HYBRID [BSP-21] CHIP + FLOATING AIRPORT [V19] 3000lbs + 6D RAIL+PIPE [V17] 20.3cm/s + CASCADE PID [V7] 37.3Hz + DIAMOND GOLD [V6] 13.7lb + KIVU SKY ROAD [V5] CRUISE (0°) + RWANDA DRONE SCADA [K56] 573% + GRID [60 BCM] 30.0MW + BRETT FLEET + NGABO V27'
    );
  }, [plcIo.q00_contactor, plcStart, plcFwd]);

  // 11. UNDERWATER CAR 3-PASSENGER
  const underwater = useCallback(() => {
    setMode('underwater');
    setActiveCameraPreset('underwater');
    setLogicText(
      'UNDERWATER CAR 3-PASSENGER: White submersible blue neon thrusters Glass dome 360° Turtle Coral Reef Fish Clownfish Diver Hybrid 4 Thrusters Underwater Propulsion Live IoT Kivu Lake Tourist Center Basement 5 - Main Water system Treatment Prototype'
    );
  }, []);

  // 12. AUTOMATIC DOOR RADAR MOTION SENSOR
  const autoDoor = useCallback(() => {
    scadaAudio.playRadarChime();
    setTelemetry((prev) => ({
      ...prev,
      radarMotionDetected: true,
      autoDoorOpen: !prev.autoDoorOpen,
    }));

    setLogicText(
      'AUTOMATIC DOOR: MOTION SENSOR (Microwave Radar) -> CONTROL UNIT (The Brain) -> ELECTRIC MOTOR -> DRIVE BELT & ROLLERS -> SAFETY SENSOR (Infrared) -> HOW IT WORKS: 1 DETECT The sensor detects a person approaching using microwave radar. 2 SIGNAL The sensor sends an electronic signal to the control unit. 3 ACTIVATE The control unit processes data & activates electric motor. 4 OPEN The motor drives the belt and rollers, sliding doors open.'
    );

    setTimeout(() => {
      setTelemetry((prev) => ({ ...prev, radarMotionDetected: false }));
    }, 2500);
  }, []);

  // 13. CIRCULAR CONVEYOR
  const circularConveyor = useCallback(() => {
    setTelemetry((prev) => ({ ...prev, conveyorRunning: !prev.conveyorRunning }));
    setLogicText(
      'CIRCULAR CONVEYOR: Continuous movement Precise positioning - Chain + Aluminum Profiles + Green Guides - Factory Floor 12 Stations - Loading Unloading Code Conveyor + MCB IC60N + Contactor LC1D25 + Limit XCK-M IP65 - Conveyor transport Uplifting strategy - Transport 184.2 m³/h - KNK motion - VFD 49.16Hz FWD ROAD'
    );
  }, []);

  // 14. RESET MCB BREAKER
  const toggleMcb = useCallback(() => {
    setPlcIo((prev) => ({
      ...prev,
      mcb_tripped: !prev.mcb_tripped,
    }));
    setLogicText(
      plcIo.mcb_tripped
        ? 'MCB IC60N RESET: Closed contacts. SITOP 24VDC Normal. System ready for START.'
        : 'MCB IC60N TRIPPED: Breaker opened manually. Power rail dropped.'
    );
  }, [plcIo.mcb_tripped]);

  // Set VFD Frequency
  const setVfdFrequency = useCallback(
    (hz: number) => {
      updateVfdDerived(hz, plcIo.q02_fwd_drive);
      setLogicText(
        `VFD PARAMETER UPDATE: Pr.3-10 set to ${hz.toFixed(1)} Hz (${((hz / 50) * 100).toFixed(1)}%) - Hand Off Auto - Terminal 18 FWD Active`
      );
    },
    [plcIo.q02_fwd_drive, updateVfdDerived]
  );

  // Set system mode
  const handleSetMode = useCallback((newMode: SystemMode) => {
    setMode(newMode);
    if (newMode === 'rail') setActiveCameraPreset('rail');
    else if (newMode === 'road') setActiveCameraPreset('road');
    else if (newMode === 'pipe') setActiveCameraPreset('pipe');
    else if (newMode === 'flight') setActiveCameraPreset('drone');
    else if (newMode === 'underwater') setActiveCameraPreset('underwater');
    else if (newMode === 'production_line') {
      setActiveCameraPreset('assembly_line');
      setShowAssemblyPanel(true);
    }

    setLogicText(
      `MODE ${newMode.toUpperCase()} - Footwear Automation 7 Stations [RawMaterial → Sewing → Glue → SolePress → QC → Robot → Warehouse] - S7-1500 PLC Cascade Active`
    );
  }, []);

  // Assembly Line Handlers
  const handleSelectAssemblyStation = useCallback((id: AssemblyStationId) => {
    setAssemblyLine((prev) => ({
      ...prev,
      activeStationId: id,
    }));
    setActiveCameraPreset(id);
    setLogicText(
      `STATION SELECTED: ${id} - S7-1500 Digital Twin Telemetry Focused`
    );
  }, []);

  const handleToggleAssemblyLine = useCallback(() => {
    setAssemblyLine((prev) => {
      const nextRunning = !prev.lineRunning;
      if (nextRunning) {
        scadaAudio.playContactorClick('on');
      } else {
        scadaAudio.playContactorClick('off');
      }
      return {
        ...prev,
        lineRunning: nextRunning,
      };
    });
    setLogicText(
      assemblyLine.lineRunning
        ? 'FOOTWEAR ASSEMBLY LINE: PAUSED - Interlock Hold All 7 Stations'
        : 'FOOTWEAR ASSEMBLY LINE: RUNNING - Continuous Conveyor Flow 7 Stations Active'
    );
  }, [assemblyLine.lineRunning]);

  const handleFocusStationCamera = useCallback((id: AssemblyStationId) => {
    setActiveCameraPreset(id);
  }, []);

  // PLC Data Block Bit Controls
  const handleTogglePlcBit = useCallback((key: keyof AssemblyPlcBits) => {
    setAssemblyLine((prev) => {
      if (key === 'ProductionCount') {
        const nextVal = prev.plcBits.ProductionCount + 1;
        scadaAudio.playRobotServo();
        return {
          ...prev,
          plcBits: { ...prev.plcBits, ProductionCount: nextVal },
        };
      }
      const boolKey = key as Exclude<keyof AssemblyPlcBits, 'ProductionCount'>;
      const nextBool = !prev.plcBits[boolKey];
      if (boolKey === 'SewingComplete' && nextBool) scadaAudio.playSewingStitch();
      if (boolKey === 'PressComplete' && nextBool) scadaAudio.playPressRelease();
      if (boolKey === 'QC_OK') scadaAudio.playQcScanBeep(nextBool);

      return {
        ...prev,
        plcBits: { ...prev.plcBits, [boolKey]: nextBool },
      };
    });
    setLogicText(`PLC DB1 BIT FORCED: ${String(key)} updated`);
  }, []);

  const handleStepSequence = useCallback(() => {
    setAssemblyLine((prev) => {
      const bits = prev.plcBits;
      if (!bits.MaterialAvailable) {
        setLogicText('STEP 1: Conveyor_RawMaterial infeed verified -> MaterialAvailable = true');
        return {
          ...prev,
          activeStationId: 'Conveyor_RawMaterial',
          plcBits: { ...bits, MaterialAvailable: true },
        };
      }
      if (!bits.SewingComplete) {
        scadaAudio.playSewingStitch();
        setLogicText('STEP 2: SewingMachine_01 seam completed -> SewingComplete = true');
        return {
          ...prev,
          activeStationId: 'SewingMachine_01',
          plcBits: { ...bits, SewingComplete: true },
        };
      }
      if (!bits.GlueComplete) {
        setLogicText('STEP 3: GlueStation_01 adhesive primed -> GlueComplete = true');
        return {
          ...prev,
          activeStationId: 'GlueStation_01',
          plcBits: { ...bits, GlueComplete: true },
        };
      }
      if (!bits.PressComplete) {
        scadaAudio.playPressRelease();
        setLogicText('STEP 4: SolePress_01 vulcanization dwell complete -> PressComplete = true');
        return {
          ...prev,
          activeStationId: 'SolePress_01',
          plcBits: { ...bits, PressComplete: true },
        };
      }
      if (!bits.QC_OK) {
        scadaAudio.playQcScanBeep(true);
        setLogicText('STEP 5: QualityCheck_01 vision inspection PASSED -> QC_OK = true');
        return {
          ...prev,
          activeStationId: 'QualityCheck_01',
          plcBits: { ...bits, QC_OK: true },
        };
      }

      // If all 5 conditions were met, finish packing and warehousing, increment ProductionCount, reset for next shoe!
      scadaAudio.playRobotServo();
      const nextCount = bits.ProductionCount + 1;
      setLogicText(
        `STEP 6 & 7: PackingRobot_01 boxed shoe -> FinishedWarehouse stored pallet -> ProductionCount = ${nextCount}!`
      );
      return {
        ...prev,
        activeStationId: 'FinishedWarehouse',
        plcBits: {
          ProductionCount: nextCount,
          MaterialAvailable: true,
          SewingComplete: false,
          GlueComplete: false,
          PressComplete: false,
          QC_OK: false,
        },
      };
    });
  }, []);

  const handleResetPlcBits = useCallback(() => {
    setAssemblyLine((prev) => ({
      ...prev,
      plcBits: {
        ...prev.plcBits,
        MaterialAvailable: true,
        SewingComplete: false,
        GlueComplete: false,
        PressComplete: false,
        QC_OK: false,
      },
    }));
    setLogicText('PLC SEQUENCE BITS RESET: MaterialAvailable=true, all stage completion bits cleared');
  }, []);

  // ----------------------------------------------------------------------
  // NGABO V60 - CUSTOMER INCOME MONITORING 0.05ms - Rubavu Urban DDS IMIHIGO
  // ----------------------------------------------------------------------
  useEffect(() => {
    // Runs via high-speed PLC TON timer accumulation (4,200 m3/h from Gihira at 65 RWF/m3)
    // Flow: 4,200 / 3,600 = 1.16667 m3/sec
    const flowRateM3Sec = 4200 / 3600;
    const tickIntervalMs = 50; // smooth 20fps SCADA accumulator matching 1,000 x 0.05ms TON timer cycles
    const deltaM3PerTick = flowRateM3Sec * (tickIntervalMs / 1000);

    const incomeTimer = setInterval(() => {
      setIncomeState((prev) => {
        const nextM3 = prev.m3Treated + deltaM3PerTick;
        const nextRev = nextM3 * prev.unitPriceRwf;
        return {
          ...prev,
          m3Treated: nextM3,
          revenueRwf: nextRev,
        };
      });
    }, tickIntervalMs);

    return () => clearInterval(incomeTimer);
  }, []);

  // ACCESS CONTROL CODE - FON + Kinyarwanda
  const checkAccess = useCallback((idCard: string, fonCode: string) => {
    const isGranted = idCard === 'NGABO-RP-2026' && fonCode === 'Hwenu Gbon';
    const now = new Date().toTimeString().slice(0, 8);
    const entry: AccessLogEntry = {
      id: String(Date.now()),
      idCard,
      fonCode,
      granted: isGranted,
      timestamp: now,
      message: isGranted
        ? 'Accès Autorisé - WELKOME - Kwinjira - Murakaza Neza'
        : 'Accès Refusé - Invalid Credentials',
    };

    setIncomeState((prev) => ({
      ...prev,
      gateOpen: isGranted,
      accessLogs: [entry, ...prev.accessLogs.slice(0, 19)],
    }));

    if (isGranted) {
      setTelemetry((prev) => ({ ...prev, autoDoorOpen: true }));
      scadaAudio.playRadarChime();
      setLogicText(
        'FON PORTE DE CONTRÔLE: Hwenu Gbon - Accès Autorisé - WELKOME - Kwinjira - Murakaza Neza - Gate OPEN'
      );
    } else {
      scadaAudio.playEstopAlarm();
      setLogicText('FON PORTE DE CONTRÔLE: Accès Refusé - Access Denied - Security Alert Logged');
    }

    return isGranted;
  }, []);

  const resetIncomeAccumulator = useCallback(() => {
    setIncomeState((prev) => ({
      ...prev,
      m3Treated: 0,
      revenueRwf: 0,
    }));
    setLogicText('WASAC RUBAVU GIHIRA: Income accumulator reset to 0 m³ / 0 RWF');
  }, []);

  // ----------------------------------------------------------------------
  // BLUETOOTH HC-05 INTEGRATION
  // ----------------------------------------------------------------------
  const connectRealBluetooth = useCallback(async () => {
    try {
      const navBluetooth = (navigator as unknown as { bluetooth?: { requestDevice: (opts: unknown) => Promise<{ name?: string }> } }).bluetooth;
      if (!navBluetooth) {
        setBluetoothStatus((prev) => ({ ...prev, connected: true, simulated: true }));
        setLogicText('BLUETOOTH: Simulated HC-05 Connected (Web Bluetooth not supported in browser environment)');
        return;
      }
      const device = await navBluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'],
      });
      setBluetoothStatus({
        connected: true,
        deviceName: device.name || 'HC-05-98D331',
        deviceMac: '98:D3:31:FB:7E',
        rssi: -48,
        batteryPct: 96,
        simulated: false,
      });
      setLogicText(`BLUETOOTH: Connected to hardware ${device.name} - Wireless Gamepad & Telemetry Online`);
    } catch {
      // Fallback to simulated HC-05
      setBluetoothStatus((prev) => ({ ...prev, connected: true, simulated: true }));
      setLogicText('BLUETOOTH: SIMULATED HC-05 CONNECTED - 98:D3:31:FB:7E - 3.7V LiPo - SPP 9600 Baud Active');
    }
  }, []);

  const toggleSimulatedBluetooth = useCallback(() => {
    setBluetoothStatus((prev) => ({
      ...prev,
      connected: !prev.connected,
    }));
  }, []);

  const handleBluetoothCommand = useCallback(
    (cmd: string) => {
      switch (cmd) {
        case 'START':
          plcStart();
          break;
        case 'STOP':
          plcStop();
        break;
        case 'FWD':
          plcFwd();
          break;
        case 'REV':
          plcRev();
          break;
        case 'UP':
          plcUp();
          break;
        case 'DOWN':
          plcDown();
          break;
        case 'ESTOP':
          plcEstop();
          break;
        default:
          break;
      }
    },
    [plcStart, plcStop, plcFwd, plcRev, plcUp, plcDown, plcEstop]
  );

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    const active = scadaAudio.toggleMute();
    setIsAudioMuted(!active);
  }, []);

  // ----------------------------------------------------------------------
  // KEYBOARD HOTKEYS LISTENER
  // ----------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          plcStart();
          break;
        case 'x':
          plcStop();
          break;
        case 'escape':
          plcEstop();
          break;
        case 'w':
        case 'arrowup':
          plcFwd();
          break;
        case 's':
        case 'arrowdown':
          plcRev();
          break;
        case 'a':
        case 'arrowleft':
          plcLeft();
          break;
        case 'd':
        case 'arrowright':
          plcRight();
          break;
        case 'r':
          flyingWings();
          break;
        case 'u':
          underwater();
          break;
        case 'o':
          autoDoor();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [plcStart, plcStop, plcEstop, plcFwd, plcRev, plcLeft, plcRight, flyingWings, underwater, autoDoor]);

  // ----------------------------------------------------------------------
  // GAMEPAD API POLLING LOOP (120ms INTERVAL)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const onGpConnect = () => setGamepadConnected(true);
    const onGpDisconnect = () => setGamepadConnected(false);

    window.addEventListener('gamepadconnected', onGpConnect);
    window.addEventListener('gamepaddisconnected', onGpDisconnect);

    const gpTimer = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0];
        if (gp) {
          setGamepadConnected(true);
          // Button 0 (A): START
          if (gp.buttons[0]?.pressed) plcStart();
          // Button 1 (B): STOP
          if (gp.buttons[1]?.pressed) plcStop();
          // Button 2 (X): E-STOP
          if (gp.buttons[2]?.pressed) plcEstop();
          // Axes
          if (gp.axes[1] < -0.5) plcFwd();
          else if (gp.axes[1] > 0.5) plcRev();
          if (gp.axes[0] < -0.5) plcLeft();
          else if (gp.axes[0] > 0.5) plcRight();
        }
      }
    }, 120);

    return () => {
      window.removeEventListener('gamepadconnected', onGpConnect);
      window.removeEventListener('gamepaddisconnected', onGpDisconnect);
      clearInterval(gpTimer);
    };
  }, [plcStart, plcStop, plcEstop, plcFwd, plcRev, plcLeft, plcRight]);

  // ----------------------------------------------------------------------
  // SENSOR RANDOM TELEMETRY JITTER (REAL INDUSTRIAL DIGITAL TWIN FEEL)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const sensorTimer = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        bearingTempC: Number((45.5 + Math.random() * 1.6).toFixed(1)),
        vibrationRms: Number((1.3 + Math.random() * 0.18).toFixed(2)),
        pipelinePressureBar: Number((12.7 + Math.random() * 0.25).toFixed(1)),
        droneSurveillanceRate: Number((0.74 + Math.random() * 0.02).toFixed(3)),
      }));

      setWaterLab((prev) => ({
        ...prev,
        turbidity: Number((1.2 + Math.random() * 0.2).toFixed(2)),
        ph: Number((7.25 + Math.random() * 0.1).toFixed(2)),
        chlorine: Number((0.78 + Math.random() * 0.05).toFixed(2)),
        conductivity: Math.round(416 + Math.random() * 6),
      }));

      setAssemblyLine((prev) => {
        if (!prev.lineRunning) return prev;
        const addUnit = Math.random() < 0.45;
        const nextTotal = prev.totalOutputUnits + (addUnit ? 1 : 0);

        if (addUnit) {
          const rand = Math.random();
          if (rand < 0.25) scadaAudio.playSewingStitch();
          else if (rand < 0.5) scadaAudio.playPressRelease();
          else if (rand < 0.75) scadaAudio.playQcScanBeep(true);
          else scadaAudio.playRobotServo();
        }

        return {
          ...prev,
          totalOutputUnits: nextTotal,
        };
      });
    }, 1200);

    return () => clearInterval(sensorTimer);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-mono text-slate-100 select-none">
      {/* 3D WebGL Canvas Layer */}
      <ThreeScene
        mode={mode}
        telemetry={telemetry}
        waterLab={waterLab}
        plcIo={plcIo}
        activeCameraPreset={activeCameraPreset}
        assemblyLine={assemblyLine}
      />

      {/* Top SCADA Navigation Bar */}
      <TopBar
        mode={mode}
        onSetMode={handleSetMode}
        onStart={plcStart}
        onStop={plcStop}
        isRunning={plcIo.q00_contactor}
        activeCameraPreset={activeCameraPreset}
        onSelectCamera={setActiveCameraPreset}
        bluetoothStatus={bluetoothStatus}
        onOpenBluetooth={() => setIsBluetoothOpen(true)}
        gamepadConnected={gamepadConnected}
        isAudioMuted={isAudioMuted}
        onToggleAudio={toggleAudio}
        onOpenLadder={() => setIsLadderOpen(true)}
        onToggleLeftPanel={() => setShowLeftPanel(!showLeftPanel)}
        onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
        showLeftPanel={showLeftPanel}
        showRightPanel={showRightPanel}
        showAssemblyPanel={showAssemblyPanel}
        onToggleAssemblyPanel={() => setShowAssemblyPanel(!showAssemblyPanel)}
        onOpenIncome={() => setIsIncomeModalOpen(true)}
        incomeState={incomeState}
      />

      {/* Left Panel: WinCC Digital Twin, Wiring, VFD Speed Table, Water Lab */}
      <LeftPanel
        plcIo={plcIo}
        telemetry={telemetry}
        waterLab={waterLab}
        onUpdateWaterLab={(partial) => setWaterLab((prev) => ({ ...prev, ...partial }))}
        onSetVfdFrequency={setVfdFrequency}
        onToggleMcb={toggleMcb}
        isOpen={showLeftPanel}
        onToggleOpen={() => setShowLeftPanel(!showLeftPanel)}
      />

      {/* Right Panel: Global KPI, Drone Robotics, Flight/Drive Controller, Strategy */}
      <RightPanel
        telemetry={telemetry}
        plcIo={plcIo}
        onStart={plcStart}
        onStop={plcStop}
        onEstop={plcEstop}
        onFwd={plcFwd}
        onRev={plcRev}
        onUp={plcUp}
        onDown={plcDown}
        onLeft={plcLeft}
        onRight={plcRight}
        onFlyingWings={flyingWings}
        onAutoDoor={autoDoor}
        onCircularConveyor={circularConveyor}
        isOpen={showRightPanel}
        onToggleOpen={() => setShowRightPanel(!showRightPanel)}
      />

      {/* Bottom Bar: Quick PLC Buttons & Live Ladder Logic Readout */}
      <BottomBar
        plcIo={plcIo}
        logicText={logicText}
        onStart={plcStart}
        onStop={plcStop}
        onFwd={plcFwd}
        onRev={plcRev}
        onUp={plcUp}
        onDown={plcDown}
        onLeft={plcLeft}
        onRight={plcRight}
        onFlyingWings={flyingWings}
        onUnderwater={underwater}
        onEstop={plcEstop}
      />

      {/* Ladder Logic Diagram Modal */}
      <LadderLogicModal
        isOpen={isLadderOpen}
        onClose={() => setIsLadderOpen(false)}
        plcIo={plcIo}
        telemetry={telemetry}
        assemblyBits={assemblyLine.plcBits}
      />

      {/* Bluetooth HC-05 Serial Terminal Modal */}
      <BluetoothModal
        isOpen={isBluetoothOpen}
        onClose={() => setIsBluetoothOpen(false)}
        status={bluetoothStatus}
        onConnectReal={connectRealBluetooth}
        onToggleSimulated={toggleSimulatedBluetooth}
        onSendCommand={handleBluetoothCommand}
      />

      {/* Footwear 7-Station Assembly Line Panel */}
      <AssemblyLinePanel
        metrics={assemblyLine}
        onSelectStation={handleSelectAssemblyStation}
        onToggleLine={handleToggleAssemblyLine}
        onFocusCamera={handleFocusStationCamera}
        onTogglePlcBit={handleTogglePlcBit}
        onStepSequence={handleStepSequence}
        onResetPlcBits={handleResetPlcBits}
        isOpen={showAssemblyPanel}
        onToggleOpen={() => setShowAssemblyPanel(!showAssemblyPanel)}
      />

      {/* NGABO V60 Customer Income Monitoring & FON Access Modal */}
      <IncomeMonitoringModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        incomeState={incomeState}
        onCheckAccess={checkAccess}
        onResetAccumulator={resetIncomeAccumulator}
      />
    </div>
  );
}
