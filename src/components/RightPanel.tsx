import React, { useState } from 'react';
import {
  Compass,
  ChevronUp,
  Cpu,
  Layers,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plane,
  DoorOpen,
  RotateCw,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';
import { TelemetryState, PlcIoState } from '../types/scada';

interface RightPanelProps {
  telemetry: TelemetryState;
  plcIo: PlcIoState;
  onStart: () => void;
  onStop: () => void;
  onEstop: () => void;
  onFwd: () => void;
  onRev: () => void;
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onFlyingWings: () => void;
  onAutoDoor: () => void;
  onCircularConveyor: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  telemetry,
  plcIo,
  onStart,
  onStop,
  onEstop,
  onFwd,
  onRev,
  onUp,
  onDown,
  onLeft,
  onRight,
  onFlyingWings,
  onAutoDoor,
  onCircularConveyor,
  isOpen,
  onToggleOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'kpi' | 'controller' | 'strategy'>('controller');
  const [sisSpeed, setSisSpeed] = useState<'1x' | '2x' | '4x'>('1x');

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="absolute right-2 top-20 z-20 bg-slate-900/90 border-2 border-cyan-500/80 p-2 rounded-lg text-cyan-400 hover:bg-slate-800 shadow-xl"
        title="Open Project KPI & Flight/Drive Controller"
      >
        <Layers className="w-5 h-5" />
      </button>
    );
  }

  return (
    <aside className="absolute right-3 top-20 z-20 w-84 max-h-[calc(100vh-140px)] flex flex-col bg-slate-950/95 border-2 border-cyan-500/80 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono select-none overflow-hidden text-slate-300">
      {/* Header bar */}
      <div className="bg-slate-900 px-3 py-2 border-b border-cyan-500/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span className="font-bold text-cyan-400 text-[11px] truncate">
            GLOBAL SCADA KPI & CONTROLLER
          </span>
        </div>
        <button
          onClick={onToggleOpen}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 bg-slate-900/60 border-b border-slate-800 text-[10px] text-center font-bold">
        <button
          onClick={() => setActiveTab('controller')}
          className={`py-1.5 transition-colors ${
            activeTab === 'controller'
              ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          DRIVE / FLIGHT
        </button>
        <button
          onClick={() => setActiveTab('kpi')}
          className={`py-1.5 transition-colors ${
            activeTab === 'kpi'
              ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          IOT & DRONE
        </button>
        <button
          onClick={() => setActiveTab('strategy')}
          className={`py-1.5 transition-colors ${
            activeTab === 'strategy'
              ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          STRATEGY
        </button>
      </div>

      {/* Content scroll area */}
      <div className="p-3 overflow-y-auto space-y-3 flex-1 text-[11px]">
        {/* TAB 1: FLIGHT & DRIVE CONTROLLER */}
        {activeTab === 'controller' && (
          <div className="space-y-3">
            {/* Speed & Direction Overview */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-cyan-400 font-bold border-b border-slate-800 pb-1">
                <span>FLIGHT & DRIVE CONTROLLER</span>
                <span className="text-[10px] text-yellow-400">KEYS: W/S / SPACE</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-950/60 p-1.5 rounded">
                  <span className="text-slate-400">VEHICLE SPEED</span>
                  <p className="text-yellow-400 font-bold text-sm">
                    {telemetry.vehicleSpeedKmh.toFixed(1)} km/h
                  </p>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded">
                  <span className="text-slate-400">ALTITUDE</span>
                  <p className="text-cyan-400 font-bold text-sm">
                    {telemetry.flightAltitudeM.toFixed(1)} m
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Grid Buttons */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                onClick={onStart}
                className="py-2 px-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex flex-col items-center justify-center gap-1 shadow"
              >
                <span>START DRIVE</span>
                <span className="text-[9px] text-emerald-200">I0.0 NO</span>
              </button>

              <button
                onClick={onStop}
                className="py-2 px-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded flex flex-col items-center justify-center gap-1 shadow"
              >
                <span>STOP BRAKE</span>
                <span className="text-[9px] text-rose-200">I0.1 NC</span>
              </button>

              <button
                onClick={onEstop}
                className="py-2 px-1 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded flex flex-col items-center justify-center gap-1 shadow border border-rose-400"
              >
                <span>E-STOP</span>
                <span className="text-[9px] text-yellow-300">SIL-3 S2B</span>
              </button>

              <button
                onClick={onFwd}
                className="col-span-2 py-2 px-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded flex items-center justify-center gap-1.5 shadow"
              >
                <span>▶ FORWARD TO K56 HQ</span>
              </button>

              <button
                onClick={onRev}
                className="py-2 px-1 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded flex items-center justify-center gap-1 shadow"
              >
                <span>◀ REVERSE</span>
              </button>

              {/* D-Pad controls */}
              <button
                onClick={onLeft}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>LEFT</span>
              </button>

              <button
                onClick={onUp}
                className="py-1.5 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded flex items-center justify-center gap-1"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>UP ALT</span>
              </button>

              <button
                onClick={onRight}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded flex items-center justify-center gap-1"
              >
                <span>RIGHT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onDown}
                className="col-span-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded flex items-center justify-center gap-1"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>DOWN ALTITUDE (WATER INFLOW)</span>
              </button>

              {/* Advanced Actions */}
              <button
                onClick={onFlyingWings}
                className="col-span-3 py-2 px-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded flex items-center justify-center gap-1.5 shadow"
              >
                <Plane className="w-3.5 h-3.5" />
                <span>CRUISE FLYING WINGS VTOL (FLAP 0°)</span>
              </button>

              <button
                onClick={onAutoDoor}
                className={`col-span-3 py-2 px-2 rounded font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  telemetry.autoDoorOpen
                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <DoorOpen className="w-3.5 h-3.5 text-yellow-400" />
                <span>
                  {telemetry.autoDoorOpen
                    ? 'RADAR DOOR: OPEN (MOTOR DRIVE ACTUATED)'
                    : 'RADAR AUTO DOOR: DETECT → ACTIVATE → OPEN'}
                </span>
              </button>

              <button
                onClick={onCircularConveyor}
                className="col-span-3 py-2 px-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded flex items-center justify-center gap-1.5 shadow"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>CIRCULAR CONVEYOR (12 PALLETS PRECISE)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IOT & ROBOTICS DRONE SCADA */}
        {activeTab === 'kpi' && (
          <div className="space-y-3">
            {/* Lake Kivu Methane Reserve */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-yellow-400 font-bold border-b border-slate-800 pb-1">
                <span>LAKE KIVU METHANE K56</span>
                <span className="text-emerald-400 text-[10px]">60 BCM (~300 YRS)</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-950/60 p-1.5 rounded">
                  <span className="text-slate-400">TURBINE POWER</span>
                  <p className="text-yellow-400 font-bold text-sm">
                    {telemetry.kpiPowerMw.toFixed(1)} MW
                  </p>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded">
                  <span className="text-slate-400">PIPE PRESSURE</span>
                  <p className="text-cyan-400 font-bold text-sm">
                    {telemetry.pipelinePressureBar.toFixed(1)} bar
                  </p>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded">
                  <span className="text-slate-400">UPTIME MTBF</span>
                  <p className="text-emerald-400 font-bold text-sm">99.85% (4,200h)</p>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded">
                  <span className="text-slate-400">AI RISK SCORE</span>
                  <p className="text-emerald-400 font-bold text-sm">
                    {telemetry.predictiveAiRisk.toFixed(2)} (SAFE)
                  </p>
                </div>
              </div>

              {/* SIS Speed Selector */}
              <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[10px]">
                <span className="text-slate-400">SIS SCAN SPEED:</span>
                <div className="flex gap-1">
                  {(['1x', '2x', '4x'] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSisSpeed(spd)}
                      className={`px-2 py-0.5 rounded ${
                        sisSpeed === spd
                          ? 'bg-yellow-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rwanda Pipeline GPS Route */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <span className="font-bold text-cyan-400 block border-b border-slate-800 pb-1">
                RUBAVU PIPELINE MONITORING
              </span>

              <p className="text-[10px] text-slate-400">
                Sectors: Rubavu · Nyamyumba · Busoro · Kanembwe · Bugeshi
              </p>

              <div>
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>ROUTE: Rudgero → Rubavu Coast → K56 HQ</span>
                  <span className="text-cyan-400 font-bold">
                    {telemetry.routeProgressPercent.toFixed(0)}% ARRIVED
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                    style={{ width: `${telemetry.routeProgressPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1 text-[10px] text-slate-400">
                <div className="flex justify-between">
                  <span>PLC_1 CPU:</span>
                  <span className="text-emerald-400 font-bold">CPU 1212C (O83/F01-0) RUN</span>
                </div>
                <div className="flex justify-between">
                  <span>HMI_1 PANEL:</span>
                  <span className="text-slate-300">KTP700 BASIC PN RO-ID</span>
                </div>
                <div className="flex justify-between">
                  <span>MQTT BROKER:</span>
                  <span className="text-emerald-400 font-bold">test.mosquitto.org LIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>OPC UA PROTOCOL:</span>
                  <span className="text-cyan-400 font-bold">CONNECTED TO S7-1500</span>
                </div>
                <div className="flex justify-between">
                  <span>DRONE SURVEILLANCE:</span>
                  <span className="text-yellow-400 font-bold">0.743 RATE · ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UPLIFTING STRATEGY & INFRASTRUCTURE */}
        {activeTab === 'strategy' && (
          <div className="space-y-3 text-[10px] leading-relaxed">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <span className="font-bold text-yellow-400 block border-b border-slate-800 pb-1 text-xs">
                UPLIFTING STRATEGY & INFRASTRUCTURE
              </span>

              <p className="text-slate-300 font-semibold">Infrastructure:</p>
              <p className="text-slate-400">
                Railway Model Loop + Station Signal Red/Green + Road Container + Telescopic Conveyor 100T/D → 500T/D + Pipe Pressure Switch 1.17bar Threshold 1.2bar K56 + Robot 3-DOF J1 45° J2 30° J3 33° 60° Pick Box.
              </p>

              <p className="text-slate-300 font-semibold pt-1 border-t border-slate-800">
                Enterprise Customers:
              </p>
              <p className="text-cyan-300">
                WASAC · SPLK 56.3MW · Bank of Kigali · MTN Rwanda · RwandAir · MINICT · RDB · TVET · Ikigugu Group.
              </p>

              <p className="text-slate-300 font-semibold pt-1 border-t border-slate-800">
                Strategic Technology Partnerships:
              </p>
              <p className="text-emerald-300">
                Microsoft · AWS · Google Cloud · University of Rwanda · IPRC · INES Ruhengeri.
              </p>

              <p className="text-slate-300 font-semibold pt-1 border-t border-slate-800">
                Building Road Safety & Radar Automation:
              </p>
              <p className="text-slate-400">
                Autonomous Drive with Safety Sensor Infrared + Electric Motor Drive Belt & Rollers + Safety Sensor (Infrared) + CONTROL UNIT (The Brain) + MOTION SENSOR (Microwave Radar) + Approaching Person Detection Waves.
              </p>

              <p className="text-slate-300 font-semibold pt-1 border-t border-slate-800">
                Flying Wings Design Innovation:
              </p>
              <p className="text-slate-400">
                2PAC HYBRID [BSP-21] CHIP + FLOATING AIRPORT [V19] 3,000lbs + 6D RAIL+PIPE [V17] + CASCADE PID [V7] 37.3Hz + DIAMOND GOLD [V6] 13.7lb + KIVU SKY ROAD [V5] + RWANDA DRONE SCADA [K56] 573% + GRID [60 BCM] + BRETT [FLEET] + NGABO V27 [131519].
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
