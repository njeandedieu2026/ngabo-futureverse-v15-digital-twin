import React from 'react';
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Bluetooth,
  Gamepad2,
  Camera,
  Cpu,
  Layers,
  Maximize2,
  ShieldCheck,
  Activity,
  Sliders,
  Coins,
} from 'lucide-react';
import { SystemMode, BluetoothDeviceStatus, IncomeMonitoringState } from '../types/scada';

interface TopBarProps {
  mode: SystemMode;
  onSetMode: (mode: SystemMode) => void;
  onStart: () => void;
  onStop: () => void;
  isRunning: boolean;
  activeCameraPreset: string;
  onSelectCamera: (preset: string) => void;
  bluetoothStatus: BluetoothDeviceStatus;
  onOpenBluetooth: () => void;
  gamepadConnected: boolean;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onOpenLadder: () => void;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  showAssemblyPanel?: boolean;
  onToggleAssemblyPanel?: () => void;
  onOpenIncome?: () => void;
  incomeState?: IncomeMonitoringState;
}

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  onSetMode,
  onStart,
  onStop,
  isRunning,
  activeCameraPreset,
  onSelectCamera,
  bluetoothStatus,
  onOpenBluetooth,
  gamepadConnected,
  isAudioMuted,
  onToggleAudio,
  onOpenLadder,
  onToggleLeftPanel,
  onToggleRightPanel,
  showLeftPanel,
  showRightPanel,
  showAssemblyPanel,
  onToggleAssemblyPanel,
  onOpenIncome,
  incomeState,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-b-2 border-yellow-500/80 px-3 py-2 text-xs font-mono text-slate-200 shadow-2xl flex flex-wrap items-center justify-between gap-2 select-none">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1 rounded">
          <Activity className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          <span className="font-bold text-yellow-400 tracking-wide text-xs">
            WASAC K56 - NGABONZIMA(RQF5)
          </span>
        </div>
        <span className="text-slate-500 hidden xl:inline">|</span>
        <span className="text-slate-300 font-semibold text-[11px] hidden lg:inline tracking-tight">
          NGABO V17 6D RAILWAY ROAD PIPE · KIGALI-ETHIOPIA-K56 · V22
        </span>
      </div>

      {/* Primary PLC Drive Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onStart}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-all text-xs shadow-md ${
            isRunning
              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-950'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
          }`}
          title="Energize LC1D25 Contactor (Seal-in latch I0.0)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>START DRIVE</span>
        </button>

        <button
          onClick={onStop}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-all text-xs shadow-md ${
            !isRunning
              ? 'bg-rose-600/80 text-white'
              : 'bg-rose-600 hover:bg-rose-500 text-white active:scale-95 ring-2 ring-rose-400 ring-offset-1 ring-offset-slate-950'
          }`}
          title="Break NC contact I0.1 (Reset Q0.0 / Brake / Hold)"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>STOP BRAKE</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* System Modes */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 gap-0.5">
          <button
            onClick={() => onSetMode('rail')}
            className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
              mode === 'rail'
                ? 'bg-yellow-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            RAIL
          </button>
          <button
            onClick={() => onSetMode('road')}
            className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
              mode === 'road'
                ? 'bg-yellow-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            ROAD
          </button>
          <button
            onClick={() => onSetMode('pipe')}
            className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
              mode === 'pipe'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            PIPE K56
          </button>
          <button
            onClick={() => onSetMode('flight')}
            className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
              mode === 'flight'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            FLYING WINGS
          </button>
          <button
            onClick={() => onSetMode('underwater')}
            className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
              mode === 'underwater'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            AQUATIC
          </button>
          <button
            onClick={() => onSetMode('production_line')}
            className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${
              mode === 'production_line'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            7 STATIONS
          </button>
        </div>
      </div>

      {/* Camera Presets & Instrumentation Tools */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Camera Preset Selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-[11px] gap-1">
          <Camera className="w-3 h-3 text-cyan-400" />
          <select
            value={activeCameraPreset}
            onChange={(e) => onSelectCamera(e.target.value)}
            className="bg-transparent text-slate-300 font-mono text-[11px] outline-none cursor-pointer"
          >
            <option value="default" className="bg-slate-900 text-white">Cam: Main 3D View</option>
            <option value="assembly_line" className="bg-slate-900 text-white">Cam: 7-Station Line Overview</option>
            <option value="station_raw" className="bg-slate-900 text-white">Cam: 01. Raw Material Infeed</option>
            <option value="station_sewing" className="bg-slate-900 text-white">Cam: 02. Sewing Machine</option>
            <option value="station_glue" className="bg-slate-900 text-white">Cam: 03. Glue Dispenser</option>
            <option value="station_press" className="bg-slate-900 text-white">Cam: 04. Sole Press</option>
            <option value="station_qc" className="bg-slate-900 text-white">Cam: 05. Quality Check</option>
            <option value="station_packing" className="bg-slate-900 text-white">Cam: 06. Packing Robot</option>
            <option value="station_warehouse" className="bg-slate-900 text-white">Cam: 07. Warehouse AS/RS</option>
            <option value="tank" className="bg-slate-900 text-white">Cam: Reservoir Tank T-101</option>
            <option value="rail" className="bg-slate-900 text-white">Cam: Railway Loop & Train</option>
            <option value="road" className="bg-slate-900 text-white">Cam: Road & Telescopic Conveyor</option>
            <option value="pipe" className="bg-slate-900 text-white">Cam: Methane Pipeline K56</option>
            <option value="door" className="bg-slate-900 text-white">Cam: Microwave Radar Auto Door</option>
            <option value="drone" className="bg-slate-900 text-white">Cam: Drone Aerial 360°</option>
            <option value="underwater" className="bg-slate-900 text-white">Cam: Underwater Submersible</option>
          </select>
        </div>

        {/* 7-Station Line SCADA Toggle */}
        {onToggleAssemblyPanel && (
          <button
            onClick={onToggleAssemblyPanel}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded border transition-colors text-xs font-semibold ${
              showAssemblyPanel
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400'
                : 'bg-slate-900 hover:bg-slate-850 text-emerald-400 border-emerald-500/30 hover:border-emerald-400'
            }`}
            title="Toggle Footwear 7-Station Assembly Line SCADA"
          >
            <span>7 STATIONS</span>
          </button>
        )}

        {/* NGABO V60 Customer Income Monitoring & FON Access */}
        {onOpenIncome && (
          <button
            onClick={onOpenIncome}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-colors text-xs font-semibold shadow-sm"
            title="Open NGABO V60 Customer Income Monitoring 0.05ms & FON Porte de Contrôle"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span className="hidden sm:inline">INCOME 0.05ms</span>
            {incomeState && (
              <span className="bg-yellow-500/20 px-1.5 py-0.5 rounded text-[10px] text-yellow-300 font-bold border border-yellow-500/40">
                {Math.round(incomeState.revenueRwf).toLocaleString()} RWF
              </span>
            )}
          </button>
        )}

        {/* Ladder Logic Viewer */}
        <button
          onClick={onOpenLadder}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-850 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 transition-colors text-xs font-semibold"
          title="Open Live Ladder Logic Diagram"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">LADDER</span>
        </button>

        {/* Bluetooth HC-05 Button */}
        <button
          onClick={onOpenBluetooth}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded border transition-colors text-xs font-semibold ${
            bluetoothStatus.connected
              ? 'bg-sky-500/20 text-sky-400 border-sky-400'
              : 'bg-slate-900 hover:bg-slate-850 text-yellow-400 border-yellow-500/40 hover:border-yellow-400'
          }`}
          title="Connect Bluetooth HC-05 98:D3:31"
        >
          <Bluetooth className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {bluetoothStatus.connected ? 'HC-05 CONNECTED' : 'BLUETOOTH HC-05'}
          </span>
        </button>

        {/* Gamepad status icon */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border ${
            gamepadConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title={gamepadConnected ? 'Gamepad Connected: Active polling' : 'No Gamepad detected'}
        >
          <Gamepad2 className="w-3 h-3" />
          <span className="hidden xl:inline">{gamepadConnected ? 'GP: OK' : 'GP: OFF'}</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          title={isAudioMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {isAudioMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors hidden sm:block"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Panels Toggle for Mobile / Tablets */}
        <button
          onClick={onToggleLeftPanel}
          className={`p-1.5 rounded border transition-colors md:hidden ${
            showLeftPanel
              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title="Toggle SCADA Left Panel"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleRightPanel}
          className={`p-1.5 rounded border transition-colors md:hidden ${
            showRightPanel
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title="Toggle KPI Right Panel"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Telemetry Status Strip */}
      <div className="w-full flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            SCAN: 10ms
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">PROFINET: ONLINE S7-1200 / S7-1500</span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3 inline" />
            SIS SIL-3: 99.3% SAFE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-yellow-400">CASCADE PID AUTO: 1.87ms</span>
        </div>
        <div className="text-slate-400">
          LOCATION: RUBAVU KIVU COAST · LAKE KIVU METHANE 60 BCM · 12.8 BAR
        </div>
      </div>
    </header>
  );
};
