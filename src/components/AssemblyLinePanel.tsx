import React from 'react';
import {
  Factory,
  ChevronRight,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Camera,
  Layers,
  ArrowRight,
  Sparkles,
  Barcode,
  Package,
  Wrench,
  Radio,
  Sliders,
} from 'lucide-react';
import { AssemblyStationId, AssemblyLineMetrics, AssemblyPlcBits } from '../types/scada';

interface AssemblyLinePanelProps {
  metrics: AssemblyLineMetrics;
  onSelectStation: (id: AssemblyStationId) => void;
  onToggleLine: () => void;
  onFocusCamera: (stationId: AssemblyStationId) => void;
  onTogglePlcBit?: (key: keyof AssemblyPlcBits) => void;
  onStepSequence?: () => void;
  onResetPlcBits?: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const AssemblyLinePanel: React.FC<AssemblyLinePanelProps> = ({
  metrics,
  onSelectStation,
  onToggleLine,
  onFocusCamera,
  onTogglePlcBit,
  onStepSequence,
  onResetPlcBits,
  isOpen,
  onToggleOpen,
}) => {
  const activeStation = metrics.stations[metrics.activeStationId];

  const stationIcons: Record<AssemblyStationId, string> = {
    Conveyor_RawMaterial: '📦',
    SewingMachine_01: '🪡',
    GlueStation_01: '🧴',
    SolePress_01: '⚙️',
    QualityCheck_01: '🔬',
    PackingRobot_01: '🦾',
    FinishedWarehouse: '🏭',
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed bottom-20 right-4 z-20 bg-slate-900/95 border-2 border-emerald-500/80 p-2.5 rounded-xl text-emerald-400 hover:bg-slate-800 shadow-2xl flex items-center gap-2 font-mono text-xs font-bold transition-all hover:scale-105"
        title="Open Footwear Assembly Line SCADA"
      >
        <Factory className="w-5 h-5 animate-pulse text-emerald-400" />
        <span className="hidden sm:inline">7-STATION ASSEMBLY LINE</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-16 left-3 right-3 sm:left-auto sm:right-3 sm:w-[540px] max-h-[85vh] z-30 flex flex-col bg-slate-950/98 border-2 border-emerald-500/80 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono select-none overflow-hidden text-slate-200">
      {/* Header bar */}
      <div className="bg-slate-900 px-3.5 py-2.5 border-b border-emerald-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Factory className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
              <span>FOOTWEAR AUTOMATION ASSEMBLY LINE</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                7 STATIONS
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Batch: {metrics.batchCode} · OEE: {metrics.overallOeePercent.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLine}
            className={`px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow transition-colors ${
              metrics.lineRunning
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {metrics.lineRunning ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>RUNNING</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>PAUSED</span>
              </>
            )}
          </button>
          <button
            onClick={onToggleOpen}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Production KPIs Strip */}
      <div className="grid grid-cols-4 bg-slate-900/60 p-2 border-b border-slate-800 text-[10px] gap-2 text-center">
        <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
          <span className="text-slate-400 block">TOTAL OUTPUT</span>
          <span className="text-emerald-400 font-bold text-xs">
            {metrics.totalOutputUnits} / {metrics.shiftTargetUnits}
          </span>
        </div>
        <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
          <span className="text-slate-400 block">LINE SPEED</span>
          <span className="text-yellow-400 font-bold text-xs">
            {metrics.lineSpeedMPerMin.toFixed(1)} m/min
          </span>
        </div>
        <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
          <span className="text-slate-400 block">PASS RATE</span>
          <span className="text-cyan-400 font-bold text-xs">
            {metrics.passRatePercent.toFixed(1)}%
          </span>
        </div>
        <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
          <span className="text-slate-400 block">OVERALL OEE</span>
          <span className="text-emerald-300 font-bold text-xs">
            {metrics.overallOeePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 7-Station Interactive Sequential Flow */}
      <div className="px-3 py-2 border-b border-slate-800 bg-slate-950">
        <div className="text-[10px] text-slate-400 mb-1.5 flex justify-between items-center">
          <span className="font-bold text-slate-300">STATION SEQUENCE PIPELINE:</span>
          <span className="text-emerald-400">Click to inspect & focus 3D camera</span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {(Object.keys(metrics.stations) as AssemblyStationId[]).map((stationId, idx) => {
            const st = metrics.stations[stationId];
            const isSelected = metrics.activeStationId === stationId;
            return (
              <React.Fragment key={stationId}>
                <button
                  onClick={() => {
                    onSelectStation(stationId);
                    onFocusCamera(stationId);
                  }}
                  className={`flex flex-col items-center px-2 py-1.5 rounded-lg border text-[10px] shrink-0 transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg ring-1 ring-emerald-400 scale-102'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                  title={`${st.name} - ${st.description}`}
                >
                  <span className="text-sm">{stationIcons[stationId]}</span>
                  <span className="font-bold mt-0.5">{`0${st.stepNumber}`}</span>
                  <span className="text-[9px] truncate max-w-[62px]">
                    {st.name.replace(/_\d+$/, '')}
                  </span>
                </button>
                {idx < 6 && (
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* PLC DATA BLOCK DB1: SEQUENTIAL INTERLOCK & PRODUCTION COUNT */}
      <div className="mx-3.5 mt-2.5 p-3 rounded-lg bg-slate-900/90 border border-emerald-500/50 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-yellow-400 text-xs">
              PLC MEMORY DB1: SEQUENCE FLAGS & COUNT
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onStepSequence && (
              <button
                onClick={onStepSequence}
                className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-[10px] shadow"
                title="Advance workpiece to next sequential station flag"
              >
                ⚡ STEP NEXT
              </button>
            )}
            {onResetPlcBits && (
              <button
                onClick={onResetPlcBits}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                title="Reset sequence flags to initial state"
              >
                RESET BITS
              </button>
            )}
          </div>
        </div>

        {/* Master ProductionCount integer */}
        <div className="flex items-center justify-between bg-slate-950/70 p-2 rounded border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">int ProductionCount</span>
            <span className="text-emerald-400 font-bold text-base font-mono">
              {metrics.plcBits.ProductionCount}
            </span>
            <span className="text-[9px] text-slate-500 ml-1.5">completed pairs</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onTogglePlcBit && onTogglePlcBit('ProductionCount')}
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
              title="Increment ProductionCount by 1"
            >
              +1 UNIT
            </button>
          </div>
        </div>

        {/* 5 Sequential Boolean Interlock Bits */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
          {/* MaterialAvailable */}
          <button
            onClick={() => onTogglePlcBit && onTogglePlcBit('MaterialAvailable')}
            className={`p-1.5 rounded border flex items-center justify-between transition-colors ${
              metrics.plcBits.MaterialAvailable
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}
          >
            <span>bool MaterialAvailable:</span>
            <span className="font-bold">
              {metrics.plcBits.MaterialAvailable ? 'TRUE' : 'FALSE'}
            </span>
          </button>

          {/* SewingComplete */}
          <button
            onClick={() => onTogglePlcBit && onTogglePlcBit('SewingComplete')}
            className={`p-1.5 rounded border flex items-center justify-between transition-colors ${
              metrics.plcBits.SewingComplete
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}
          >
            <span>bool SewingComplete:</span>
            <span className="font-bold">
              {metrics.plcBits.SewingComplete ? 'TRUE' : 'FALSE'}
            </span>
          </button>

          {/* GlueComplete */}
          <button
            onClick={() => onTogglePlcBit && onTogglePlcBit('GlueComplete')}
            className={`p-1.5 rounded border flex items-center justify-between transition-colors ${
              metrics.plcBits.GlueComplete
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}
          >
            <span>bool GlueComplete:</span>
            <span className="font-bold">
              {metrics.plcBits.GlueComplete ? 'TRUE' : 'FALSE'}
            </span>
          </button>

          {/* PressComplete */}
          <button
            onClick={() => onTogglePlcBit && onTogglePlcBit('PressComplete')}
            className={`p-1.5 rounded border flex items-center justify-between transition-colors ${
              metrics.plcBits.PressComplete
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}
          >
            <span>bool PressComplete:</span>
            <span className="font-bold">
              {metrics.plcBits.PressComplete ? 'TRUE' : 'FALSE'}
            </span>
          </button>

          {/* QC_OK */}
          <button
            onClick={() => onTogglePlcBit && onTogglePlcBit('QC_OK')}
            className={`col-span-2 p-1.5 rounded border flex items-center justify-between transition-colors ${
              metrics.plcBits.QC_OK
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}
          >
            <span>bool QC_OK:</span>
            <span>
              {metrics.plcBits.QC_OK ? 'TRUE (READY TO PACK & STORE)' : 'FALSE (INSPECTION PENDING)'}
            </span>
          </button>
        </div>
      </div>

      {/* Selected Station Deep-Dive Telemetry */}
      {activeStation && (
        <div className="p-3.5 overflow-y-auto space-y-3 flex-1 text-[11px]">
          {/* Station Title & Status */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{stationIcons[activeStation.id]}</span>
                <div>
                  <h4 className="font-bold text-yellow-400 text-xs">
                    {`STATION 0${activeStation.stepNumber}: ${activeStation.name}`}
                  </h4>
                  <p className="text-[10px] text-slate-400">{activeStation.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onFocusCamera(activeStation.id)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-cyan-400 transition-colors flex items-center gap-1 text-[10px]"
                  title="Align 3D Viewport to this station"
                >
                  <Camera className="w-3 h-3" />
                  <span>3D CAM</span>
                </button>
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    activeStation.status === 'RUNNING'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {activeStation.status}
                </span>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="bg-slate-950/70 p-1.5 rounded">
                <span className="text-slate-400">CYCLE TIME</span>
                <p className="text-yellow-400 font-bold text-sm">
                  {activeStation.cycleTimeSec.toFixed(1)} s
                </p>
              </div>
              <div className="bg-slate-950/70 p-1.5 rounded">
                <span className="text-slate-400">UNITS PROCESSED</span>
                <p className="text-cyan-400 font-bold text-sm">
                  {activeStation.unitsProcessed}
                </p>
              </div>
              <div className="bg-slate-950/70 p-1.5 rounded">
                <span className="text-slate-400">STATION OEE</span>
                <p className="text-emerald-400 font-bold text-sm">
                  {activeStation.oeePercent.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Specific Station Engineering Variables */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[10px]">
              {activeStation.temperatureC !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">OPERATING TEMP:</span>
                  <span className="text-orange-400 font-bold">
                    {activeStation.temperatureC.toFixed(1)} °C
                  </span>
                </div>
              )}

              {activeStation.pressureBar !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">HYDRAULIC / PNEUMATIC PRESSURE:</span>
                  <span className="text-cyan-400 font-bold">
                    {activeStation.pressureBar.toFixed(1)} bar
                  </span>
                </div>
              )}

              {activeStation.defectCount !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">QA DEFECT COUNT:</span>
                  <span className="text-rose-400 font-bold">
                    {activeStation.defectCount} units rejected
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-400">TARGET THROUGHPUT:</span>
                <span className="text-slate-200 font-bold">
                  {activeStation.targetPerHour} pairs / hour
                </span>
              </div>
            </div>

            {/* PLC I/O Mapping */}
            <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1">
              <span className="text-slate-300 font-bold block">PLC S7-1500 I/O MAPPING:</span>
              <div className="flex justify-between text-slate-400">
                <span>DIGITAL INPUT (SENSOR):</span>
                <span className="font-mono text-cyan-300">{activeStation.sensorIo}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>DIGITAL OUTPUT (ACTUATOR):</span>
                <span className="font-mono text-emerald-300">{activeStation.actuatorIo}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
