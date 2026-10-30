import React from 'react';
import {
  Play,
  Square,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plane,
  Waves,
  AlertOctagon,
  Keyboard,
} from 'lucide-react';
import { PlcIoState } from '../types/scada';

interface BottomBarProps {
  plcIo: PlcIoState;
  logicText: string;
  onStart: () => void;
  onStop: () => void;
  onFwd: () => void;
  onRev: () => void;
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onFlyingWings: () => void;
  onUnderwater: () => void;
  onEstop: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  plcIo,
  logicText,
  onStart,
  onStop,
  onFwd,
  onRev,
  onUp,
  onDown,
  onLeft,
  onRight,
  onFlyingWings,
  onUnderwater,
  onEstop,
}) => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t-2 border-emerald-500/80 px-3 py-2 text-xs font-mono text-slate-200 shadow-2xl flex flex-col gap-1.5 select-none">
      {/* Quick PLC push buttons */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center overflow-x-auto">
        <button
          onClick={onStart}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-bold transition-all text-[11px] shadow ${
            plcIo.q00_contactor
              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          title="START PB (Normally Open I0.0) - Latches LC1D25"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>START (I0.0 NO) Seal-in</span>
        </button>

        <button
          onClick={onStop}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-bold transition-all text-[11px] shadow ${
            !plcIo.q00_contactor
              ? 'bg-rose-700/80 text-white'
              : 'bg-rose-600 hover:bg-rose-500 text-white'
          }`}
          title="STOP PB (Normally Closed I0.1) - De-energizes Q0.0"
        >
          <Square className="w-3 h-3 fill-current" />
          <span>STOP (I0.1 NC) Reset Q0.0</span>
        </button>

        <button
          onClick={onFwd}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-bold transition-all text-[11px] shadow ${
            plcIo.q02_fwd_drive
              ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-300'
              : 'bg-sky-600 hover:bg-sky-500 text-white'
          }`}
        >
          <ArrowRight className="w-3 h-3" />
          <span>FORWARD (I0.2→Q0.2) FWD ROAD 1.0m</span>
        </button>

        <button
          onClick={onRev}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-bold transition-all text-[11px] shadow ${
            plcIo.q03_rev_drive
              ? 'bg-orange-500 text-slate-950 ring-2 ring-orange-300'
              : 'bg-orange-600 hover:bg-orange-500 text-white'
          }`}
        >
          <ArrowLeft className="w-3 h-3" />
          <span>REVERSE (I0.3→Q0.3) REV Dry Port</span>
        </button>

        <button
          onClick={onUp}
          className="flex items-center gap-1 px-2 py-1.5 rounded font-bold bg-yellow-600 hover:bg-yellow-500 text-slate-950 text-[11px] shadow"
        >
          <ArrowUp className="w-3 h-3" />
          <span>UP Uplifting</span>
        </button>

        <button
          onClick={onDown}
          className="flex items-center gap-1 px-2 py-1.5 rounded font-bold bg-yellow-600 hover:bg-yellow-500 text-slate-950 text-[11px] shadow"
        >
          <ArrowDown className="w-3 h-3" />
          <span>DOWN Inflow</span>
        </button>

        <button
          onClick={onLeft}
          className="px-2 py-1.5 rounded font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] border border-slate-700"
        >
          ◀ LEFT
        </button>

        <button
          onClick={onRight}
          className="px-2 py-1.5 rounded font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] border border-slate-700"
        >
          ▶ RIGHT
        </button>

        <button
          onClick={onFlyingWings}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded font-bold bg-slate-200 hover:bg-white text-slate-950 text-[11px] shadow"
        >
          <Plane className="w-3 h-3 text-cyan-700" />
          <span>FLYING WINGS 8m CRUISE</span>
        </button>

        <button
          onClick={onUnderwater}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded font-bold bg-cyan-700 hover:bg-cyan-600 text-white text-[11px] shadow"
        >
          <Waves className="w-3 h-3" />
          <span>UNDERWATER CAR 3-PASS</span>
        </button>

        <button
          onClick={onEstop}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded font-bold bg-rose-700 hover:bg-rose-600 text-white text-[11px] border border-rose-400 shadow animate-pulse"
        >
          <AlertOctagon className="w-3 h-3" />
          <span>EMERGENCY RESET S2B GELA SIL-3 99.3%</span>
        </button>
      </div>

      {/* Live Logic Output Line */}
      <div className="flex items-center justify-between text-[11px] gap-2 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-emerald-400">
          <span className="font-bold text-yellow-400 shrink-0">LOGIC STATE:</span>
          <span className="truncate">{logicText}</span>
        </div>

        {/* Hotkey helper */}
        <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
          <Keyboard className="w-3 h-3" />
          <span>W/S: FWD/REV · Space: START · X: STOP · Esc: E-STOP · R: FLIGHT · U: AQUATIC · O: DOOR</span>
        </div>
      </div>
    </footer>
  );
};
