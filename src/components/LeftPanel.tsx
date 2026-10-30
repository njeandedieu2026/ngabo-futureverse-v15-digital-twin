import React, { useState } from 'react';
import {
  Activity,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  Gauge,
  Droplets,
  Radio,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { PlcIoState, TelemetryState, WaterLabMetrics, VfdPreset } from '../types/scada';

interface LeftPanelProps {
  plcIo: PlcIoState;
  telemetry: TelemetryState;
  waterLab: WaterLabMetrics;
  onUpdateWaterLab: (partial: Partial<WaterLabMetrics>) => void;
  onSetVfdFrequency: (hz: number) => void;
  onToggleMcb: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const VFD_PRESETS: VfdPreset[] = [
  { id: '1', param: 'Pr.3-10-1', percent: 5.0, hz: 2.5, label: '5.0% [2.5 Hz]' },
  { id: '2', param: 'Pr.3-10-2', percent: 10.0, hz: 5.0, label: '10.0% [5.0 Hz]' },
  { id: '3', param: 'Pr.3-10-3', percent: 15.0, hz: 7.5, label: '15.0% [7.5 Hz]' },
  { id: '4', param: 'Pr.3-10-4', percent: 20.0, hz: 10.0, label: '20.0% [10.0 Hz]' },
  { id: '5', param: 'Pr.3-10-5', percent: 25.0, hz: 12.5, label: '25.0% [12.5 Hz]' },
  { id: '6', param: 'Pr.3-10-6', percent: 30.0, hz: 15.0, label: '30.0% [15.0 Hz]' },
  { id: '7', param: 'Pr.3-10-7', percent: 35.0, hz: 17.5, label: '35.0% [17.5 Hz]' },
];

export const LeftPanel: React.FC<LeftPanelProps> = ({
  plcIo,
  telemetry,
  waterLab,
  onUpdateWaterLab,
  onSetVfdFrequency,
  onToggleMcb,
  isOpen,
  onToggleOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'twin' | 'wiring' | 'vfd' | 'lab'>('twin');

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="absolute left-2 top-20 z-20 bg-slate-900/90 border-2 border-yellow-500/80 p-2 rounded-lg text-yellow-400 hover:bg-slate-800 shadow-xl"
        title="Open WinCC Digital Twin SCADA"
      >
        <Sliders className="w-5 h-5" />
      </button>
    );
  }

  return (
    <aside className="absolute left-3 top-20 z-20 w-80 max-h-[calc(100vh-140px)] flex flex-col bg-slate-950/95 border-2 border-yellow-500/80 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono select-none overflow-hidden text-slate-300">
      {/* Header bar */}
      <div className="bg-slate-900 px-3 py-2 border-b border-yellow-500/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          <span className="font-bold text-yellow-400 text-[11px] truncate">
            WinCC_Digital_Twin_T101.s7p
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
      <div className="grid grid-cols-4 bg-slate-900/60 border-b border-slate-800 text-[10px] text-center font-bold">
        <button
          onClick={() => setActiveTab('twin')}
          className={`py-1.5 transition-colors ${
            activeTab === 'twin'
              ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          TWIN
        </button>
        <button
          onClick={() => setActiveTab('wiring')}
          className={`py-1.5 transition-colors ${
            activeTab === 'wiring'
              ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          WIRING
        </button>
        <button
          onClick={() => setActiveTab('vfd')}
          className={`py-1.5 transition-colors ${
            activeTab === 'vfd'
              ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          VFD SPEED
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`py-1.5 transition-colors ${
            activeTab === 'lab'
              ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          WATER LAB
        </button>
      </div>

      {/* Content scroll area */}
      <div className="p-3 overflow-y-auto space-y-3 flex-1 text-[11px]">
        {/* TAB 1: DIGITAL TWIN TELEMETRY */}
        {activeTab === 'twin' && (
          <div className="space-y-3">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-yellow-400 font-bold border-b border-slate-800 pb-1">
                <span>RESERVOIR T-101 & PUMP</span>
                <span className="text-[10px] text-slate-400">TIA V17 ONLINE</span>
              </div>

              {/* Tank Level with bar */}
              <div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>LEVEL %MD132:</span>
                  <span className="text-cyan-400 font-bold">
                    {waterLab.tankLevelPercent.toFixed(1)}% ({waterLab.tankVolumeM3.toFixed(1)} m³)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, waterLab.tankLevelPercent)}%` }}
                  />
                </div>
              </div>

              {/* Setpoint Quick Buttons */}
              <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                <span className="text-slate-400">SETPOINT:</span>
                <button
                  onClick={() => onUpdateWaterLab({ tankLevelPercent: 50.0, tankVolumeM3: 500.0 })}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  50% Eco
                </button>
                <button
                  onClick={() => onUpdateWaterLab({ tankLevelPercent: 68.7, tankVolumeM3: 687.0 })}
                  className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded"
                >
                  68.7% Nom
                </button>
                <button
                  onClick={() => onUpdateWaterLab({ tankLevelPercent: 80.0, tankVolumeM3: 800.0 })}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  80% Peak
                </button>
              </div>

              {/* VFD & Motor Readings */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div className="bg-slate-950/60 p-1.5 rounded">
                  <span className="text-slate-400 text-[10px]">VFD %MD150</span>
                  <p className="text-yellow-400 font-bold text-sm">
                    {telemetry.vfdHz.toFixed(1)} Hz
                  </p>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded">
                  <span className="text-slate-400 text-[10px]">RPM %MD154</span>
                  <p className="text-cyan-400 font-bold text-sm">{telemetry.motorRpm} RPM</p>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded">
                  <span className="text-slate-400 text-[10px]">POWER %MD160</span>
                  <p className="text-emerald-400 font-bold text-sm">
                    {telemetry.powerMw.toFixed(1)} MW
                  </p>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded">
                  <span className="text-slate-400 text-[10px]">OUTFLOW P-101</span>
                  <p className="text-sky-400 font-bold text-sm">
                    {waterLab.outflowRate.toFixed(1)} m³/h
                  </p>
                </div>
              </div>

              {/* Inflow Rate & Valve Control */}
              <div className="pt-1 border-t border-slate-800">
                <div className="flex justify-between items-center text-slate-300 text-[10px]">
                  <span>INFLOW VALVE V-101 ({waterLab.valvePosition}%):</span>
                  <span className="text-sky-300 font-bold">{waterLab.inflowRate.toFixed(1)} m³/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={waterLab.valvePosition}
                  onChange={(e) => {
                    const pos = Number(e.target.value);
                    onUpdateWaterLab({
                      valvePosition: pos,
                      inflowRate: Number(((pos / 100) * 208.5).toFixed(1)),
                    });
                  }}
                  className="w-full accent-yellow-400 h-1 bg-slate-800 rounded cursor-pointer mt-1"
                />
              </div>

              {/* Bearing Temperature & Vibration */}
              <div className="pt-1 border-t border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">BEARING TEMP:</span>
                  <span className="text-orange-400 font-bold">
                    {telemetry.bearingTempC.toFixed(1)}°C (FLIR Infrared)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">VIBRATION RMS:</span>
                  <span className="text-emerald-400 font-bold">
                    {telemetry.vibrationRms.toFixed(2)} mm/s (ISO Safe)
                  </span>
                </div>
              </div>
            </div>

            {/* Actuators Summary */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold block border-b border-slate-800 pb-1">
                ACTUATOR = CONTROL SIGNAL
              </span>
              <div className="flex justify-between text-slate-300">
                <span>PNEUMATIC ACTUATOR:</span>
                <span className="text-sky-400">0.9% RMARE</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>ELECTRIC ACTUATOR:</span>
                <span className="text-emerald-400">1.19% ICX</span>
              </div>
              <div className="pt-1 text-[10px] text-slate-400 leading-tight">
                360° Acoustic & Optical Surveillance - Anti-drone detection & multi-layer defense.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLC-HMI-SCADA WIRING LIVE */}
        {activeTab === 'wiring' && (
          <div className="space-y-2.5">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="font-bold text-cyan-400">PLC-HMI-SCADA WIRING LIVE</span>
                <span className="text-[10px] text-emerald-400">CPU 1212C RUN</span>
              </div>

              {/* Digital Inputs */}
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between items-center">
                  <span>I0.0 START PB (NO):</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      plcIo.i00_start_no ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {plcIo.i00_start_no ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {plcIo.i00_start_no ? '● ON (PRESSED)' : '● OFF'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>I0.1 STOP PB (NC):</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      plcIo.i01_stop_nc ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {plcIo.i01_stop_nc ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {plcIo.i01_stop_nc ? '● CLOSED (SAFE)' : '● OPEN (STOPPED)'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>I0.2 FORWARD:</span>
                  <span className={plcIo.i02_fwd ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                    {plcIo.i02_fwd ? '● ON (ROAD 1.0m)' : '● OFF'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>I0.3 REVERSE:</span>
                  <span className={plcIo.i03_rev ? 'text-orange-400 font-bold' : 'text-slate-500'}>
                    {plcIo.i03_rev ? '● ON (DRY PORT)' : '● OFF'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>I0.4 UP/DOWN:</span>
                  <span className="text-slate-400">
                    {telemetry.flightAltitudeM > 0 ? `● ALT ${telemetry.flightAltitudeM.toFixed(1)}m` : '● GROUND LEVEL'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>I0.5 STEERING:</span>
                  <span className="text-slate-400">CENTER (0.0°)</span>
                </div>
              </div>

              {/* Digital Outputs & Relays */}
              <div className="pt-2 border-t border-slate-800 space-y-1 text-[10px]">
                <div className="flex justify-between items-center">
                  <span>Q0.0 CONTACTOR LC1D25:</span>
                  <span
                    className={`font-bold ${
                      plcIo.q00_contactor ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {plcIo.q00_contactor ? '● ENERGIZED (LATCHED)' : '● DE-ENERGIZED'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Q0.2 FWD CONTACTOR:</span>
                  <span className={plcIo.q02_fwd_drive ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                    {plcIo.q02_fwd_drive ? '● ON (FWD ROAD 49.16Hz)' : '● OFF'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Q0.3 REV CONTACTOR:</span>
                  <span className={plcIo.q03_rev_drive ? 'text-orange-400 font-bold' : 'text-slate-500'}>
                    {plcIo.q03_rev_drive ? '● ON (REV 7.5Hz)' : '● OFF'}
                  </span>
                </div>
              </div>

              {/* Hardware Protections */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[10px]">
                <div className="flex justify-between items-center">
                  <span>MCB IC60N C25 400V~:</span>
                  <button
                    onClick={onToggleMcb}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      !plcIo.mcb_tripped
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                    }`}
                  >
                    {!plcIo.mcb_tripped ? 'ON (HEALTHY)' : 'TRIPPED'}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span>PSU 24VDC SITOP:</span>
                  <span className="text-emerald-400 font-bold">24.1V OK</span>
                </div>
                <div className="text-slate-400 text-[10px] pt-1 leading-tight">
                  Seal-in Circuit: I0.0 NO + STOP I0.1 NC + Q0.0 Aux Contactor NO Latch.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VFD MULTI-SPEED Pr.3-10-x TABLE */}
        {activeTab === 'vfd' && (
          <div className="space-y-3">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                <span className="font-bold text-yellow-400">VFD MULTI-SPEED TABLE</span>
                <span className="text-[10px] text-cyan-400">Delta VFD-EL / Siemens</span>
              </div>

              <p className="text-[10px] text-slate-400 leading-tight">
                Select factory parameter presets Pr.3-10-x or adjust dynamic frequency:
              </p>

              {/* Presets List */}
              <div className="space-y-1">
                {VFD_PRESETS.map((p) => {
                  const isActive = Math.abs(telemetry.vfdHz - p.hz) < 0.2;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSetVfdFrequency(p.hz)}
                      className={`w-full flex justify-between items-center px-2 py-1.5 rounded transition-all text-[11px] ${
                        isActive
                          ? 'bg-yellow-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>
                        {p.param} = {p.label}
                      </span>
                      {isActive && <span className="text-[10px]">◀ ACTIVE</span>}
                    </button>
                  );
                })}
              </div>

              {/* Slider for custom frequency */}
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">CUSTOM FREQUENCY:</span>
                  <span className="text-yellow-400 font-bold">{telemetry.vfdHz.toFixed(1)} Hz</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="55"
                  step="0.5"
                  value={telemetry.vfdHz}
                  onChange={(e) => onSetVfdFrequency(Number(e.target.value))}
                  className="w-full accent-yellow-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Terminal Pinout Reference */}
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                <span className="text-slate-300 font-bold block">TERMINAL PINOUT:</span>
                <p className="font-mono text-cyan-300">
                  12 18 19 20 27 29 33 42 50 53 55 60
                </p>
                <p className="text-slate-400">
                  Wiring: Brown (18 FWD) + Blue (19/20/27/29 DI Speed Select).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WATER TREATMENT LAB */}
        {activeTab === 'lab' && (
          <div className="space-y-3">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                <span className="font-bold text-cyan-400">WATER TREATMENT LAB</span>
                <span className="text-[10px] text-emerald-400">WASAC ISO/WHO</span>
              </div>

              {/* Turbidity */}
              <div className="bg-slate-950/60 p-2 rounded space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">TURBIDITY:</span>
                  <span
                    className={`font-bold ${
                      waterLab.turbidity < 5.0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {waterLab.turbidity.toFixed(2)} NTU
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>WHO Limit: &lt; 5.0 NTU</span>
                  <span>{waterLab.turbidity < 5.0 ? 'POTABLE' : 'HIGH ALARM'}</span>
                </div>
              </div>

              {/* pH Level */}
              <div className="bg-slate-950/60 p-2 rounded space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">pH LEVEL:</span>
                  <span
                    className={`font-bold ${
                      waterLab.ph >= 6.5 && waterLab.ph <= 8.5
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {waterLab.ph.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Target: 6.5 - 8.5</span>
                  <span>OPTIMAL BUFFER</span>
                </div>
              </div>

              {/* Chlorine Residual */}
              <div className="bg-slate-950/60 p-2 rounded space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">CHLORINE RESIDUAL:</span>
                  <span className="text-cyan-400 font-bold">
                    {waterLab.chlorine.toFixed(2)} mg/L
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Target: 0.8 - 1.2 mg/L</span>
                  <span>DISINFECTION OK</span>
                </div>
              </div>

              {/* Conductivity */}
              <div className="bg-slate-950/60 p-2 rounded space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">CONDUCTIVITY:</span>
                  <span className="text-yellow-400 font-bold">
                    {waterLab.conductivity.toFixed(0)} µS/cm
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Mineral Balance</span>
                  <span>SAFE MINERALS</span>
                </div>
              </div>

              {/* Dosing Pumps */}
              <div className="pt-1 border-t border-slate-800 text-[10px] space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>DOSING PUMPS Y1-Y4:</span>
                  <span className="text-cyan-300 font-bold">
                    {waterLab.dosingPressureBar.toFixed(2)} bar · {waterLab.outflowRate.toFixed(1)} m³/h
                  </span>
                </div>
                <p className="text-slate-500">
                  Coagulant & Disinfectant Injection PID Cascade Control Active.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
