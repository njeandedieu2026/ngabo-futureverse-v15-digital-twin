import React from 'react';
import { X, Cpu, Check, AlertCircle } from 'lucide-react';
import { PlcIoState, TelemetryState, AssemblyPlcBits } from '../types/scada';

interface LadderLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  plcIo: PlcIoState;
  telemetry: TelemetryState;
  assemblyBits?: AssemblyPlcBits;
}

export const LadderLogicModal: React.FC<LadderLogicModalProps> = ({
  isOpen,
  onClose,
  plcIo,
  telemetry,
  assemblyBits,
}) => {
  if (!isOpen) return null;

  const isRung1Active = plcIo.q00_contactor;
  const isRung2Active = plcIo.q02_fwd_drive;
  const isRung3Active = plcIo.q03_rev_drive;
  const isRung4Active = plcIo.q00_contactor && telemetry.vfdHz > 0;
  const isRung5Active = Boolean(
    assemblyBits?.MaterialAvailable &&
    assemblyBits?.SewingComplete &&
    assemblyBits?.GlueComplete &&
    assemblyBits?.PressComplete &&
    assemblyBits?.QC_OK
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-slate-950 border-2 border-cyan-500/80 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col font-mono text-xs text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-sm text-cyan-400">
                SIEMENS S7-1200 / S7-1500 LADDER DIAGRAM (LD) LIVE MONITOR
              </h2>
              <p className="text-[10px] text-slate-400">
                File: WinCC_Digital_Twin_T101.s7p · Scan Cycle: 10ms · SIL-3 99.3% Safety
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1">
          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] bg-slate-900/60 p-2.5 rounded border border-slate-800">
            <span className="font-bold text-slate-300">POWER FLOW STATUS:</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-1 bg-emerald-400 inline-block rounded" />
              ENERGIZED (TRUE)
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-1 bg-slate-600 inline-block rounded" />
              DE-ENERGIZED (FALSE)
            </span>
            <span className="text-yellow-400 ml-auto">
              SITOP 24VDC: HEALTHY · MCB IC60N: {!plcIo.mcb_tripped ? 'CLOSED' : 'TRIPPED'}
            </span>
          </div>

          {/* RUNG 1: Master Contactor Seal-in Circuit */}
          <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/40 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-yellow-400">
              <span>RUNG 1: MASTER MOTOR CONTACTOR (LC1D25) SEAL-IN LATCH</span>
              <span className={isRung1Active ? 'text-emerald-400' : 'text-slate-500'}>
                {isRung1Active ? 'COIL Q0.0: ENERGIZED' : 'COIL Q0.0: OFF'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto">
              <div className="flex items-center min-w-[620px]">
                {/* Left Rail */}
                <div className="w-1.5 h-16 bg-emerald-500 rounded-full mr-3" />

                {/* Parallel Branch: I0.0 (NO) OR Q0.0 (Aux NO) */}
                <div className="flex flex-col gap-2 my-auto">
                  <div
                    className={`px-3 py-1.5 rounded border flex items-center gap-1.5 ${
                      plcIo.i00_start_no
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span>-| |- I0.0 (START PB NO)</span>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded border flex items-center gap-1.5 ${
                      plcIo.q00_contactor
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span>-| |- Q0.0 (AUX LATCH NO)</span>
                  </div>
                </div>

                {/* Wire connector */}
                <div
                  className={`w-8 h-1 ${
                    plcIo.i00_start_no || plcIo.q00_contactor ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />

                {/* Series NC: I0.1 (STOP PB NC) */}
                <div
                  className={`px-3 py-1.5 rounded border flex items-center gap-1.5 ${
                    plcIo.i01_stop_nc
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                      : 'bg-rose-500/20 text-rose-400 border-rose-400 font-bold'
                  }`}
                >
                  <span>-|/|- I0.1 (STOP PB NC)</span>
                </div>

                {/* Wire connector */}
                <div
                  className={`w-8 h-1 ${
                    (plcIo.i00_start_no || plcIo.q00_contactor) && plcIo.i01_stop_nc
                      ? 'bg-emerald-400'
                      : 'bg-slate-700'
                  }`}
                />

                {/* MCB Protection */}
                <div
                  className={`px-3 py-1.5 rounded border flex items-center gap-1.5 ${
                    !plcIo.mcb_tripped
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                      : 'bg-rose-500/20 text-rose-400 border-rose-400 font-bold'
                  }`}
                >
                  <span>-| |- MCB IC60N</span>
                </div>

                {/* Wire connector */}
                <div className={`w-8 h-1 ${isRung1Active ? 'bg-emerald-400' : 'bg-slate-700'}`} />

                {/* Output Coil: Q0.0 */}
                <div
                  className={`px-4 py-2 rounded-lg border font-bold flex items-center gap-1.5 ${
                    isRung1Active
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 ring-2 ring-emerald-400'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  <span>-( Q0.0 )- LC1D25</span>
                </div>

                {/* Right Rail */}
                <div className="w-1.5 h-16 bg-slate-600 rounded-full ml-auto" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Explanation: Pressing START (I0.0) closes the circuit to energize contactor Q0.0. Once energized, the auxiliary contact Q0.0 latches the power so the start button can be released. Pressing STOP (I0.1) breaks the normally closed path, dropping the coil immediately.
            </p>
          </div>

          {/* RUNG 2: Forward Motor Drive */}
          <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/40 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-cyan-400">
              <span>RUNG 2: FORWARD DIRECTION MOTOR DRIVE WITH ELECTRICAL INTERLOCK</span>
              <span className={isRung2Active ? 'text-cyan-400' : 'text-slate-500'}>
                {isRung2Active ? 'COIL Q0.2: ACTIVE (FWD ROAD 49.16Hz)' : 'COIL Q0.2: OFF'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto">
              <div className="flex items-center min-w-[620px]">
                <div className="w-1.5 h-12 bg-emerald-500 rounded-full mr-3" />

                <div
                  className={`px-3 py-1.5 rounded border ${
                    plcIo.q00_contactor
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <span>-| |- Q0.0 (MASTER)</span>
                </div>

                <div
                  className={`w-8 h-1 ${plcIo.q00_contactor ? 'bg-emerald-400' : 'bg-slate-700'}`}
                />

                <div
                  className={`px-3 py-1.5 rounded border ${
                    plcIo.i02_fwd
                      ? 'bg-sky-500/20 text-sky-400 border-sky-400 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <span>-| |- I0.2 (FWD CMD)</span>
                </div>

                <div
                  className={`w-8 h-1 ${
                    plcIo.q00_contactor && plcIo.i02_fwd ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />

                {/* Reverse Interlock Contact */}
                <div
                  className={`px-3 py-1.5 rounded border ${
                    !plcIo.q03_rev_drive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                      : 'bg-rose-500/20 text-rose-400 border-rose-400 font-bold'
                  }`}
                >
                  <span>-|/|- Q0.3 (REV INTERLOCK)</span>
                </div>

                <div className={`w-8 h-1 ${isRung2Active ? 'bg-emerald-400' : 'bg-slate-700'}`} />

                <div
                  className={`px-4 py-2 rounded-lg border font-bold ${
                    isRung2Active
                      ? 'bg-sky-500 text-slate-950 border-sky-300 ring-2 ring-sky-400'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  <span>-( Q0.2 )- FWD DRIVE</span>
                </div>

                <div className="w-1.5 h-12 bg-slate-600 rounded-full ml-auto" />
              </div>
            </div>
          </div>

          {/* RUNG 3: Reverse Motor Drive */}
          <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/40 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-orange-400">
              <span>RUNG 3: REVERSE DIRECTION MOTOR DRIVE WITH ELECTRICAL INTERLOCK</span>
              <span className={isRung3Active ? 'text-orange-400' : 'text-slate-500'}>
                {isRung3Active ? 'COIL Q0.3: ACTIVE (REV DRY PORT 7.5Hz)' : 'COIL Q0.3: OFF'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto">
              <div className="flex items-center min-w-[620px]">
                <div className="w-1.5 h-12 bg-emerald-500 rounded-full mr-3" />

                <div
                  className={`px-3 py-1.5 rounded border ${
                    plcIo.q00_contactor
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <span>-| |- Q0.0 (MASTER)</span>
                </div>

                <div
                  className={`w-8 h-1 ${plcIo.q00_contactor ? 'bg-emerald-400' : 'bg-slate-700'}`}
                />

                <div
                  className={`px-3 py-1.5 rounded border ${
                    plcIo.i03_rev
                      ? 'bg-orange-500/20 text-orange-400 border-orange-400 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <span>-| |- I0.3 (REV CMD)</span>
                </div>

                <div
                  className={`w-8 h-1 ${
                    plcIo.q00_contactor && plcIo.i03_rev ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />

                {/* Forward Interlock Contact */}
                <div
                  className={`px-3 py-1.5 rounded border ${
                    !plcIo.q02_fwd_drive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                      : 'bg-rose-500/20 text-rose-400 border-rose-400 font-bold'
                  }`}
                >
                  <span>-|/|- Q0.2 (FWD INTERLOCK)</span>
                </div>

                <div className={`w-8 h-1 ${isRung3Active ? 'bg-emerald-400' : 'bg-slate-700'}`} />

                <div
                  className={`px-4 py-2 rounded-lg border font-bold ${
                    isRung3Active
                      ? 'bg-orange-500 text-slate-950 border-orange-300 ring-2 ring-orange-400'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  <span>-( Q0.3 )- REV DRIVE</span>
                </div>

                <div className="w-1.5 h-12 bg-slate-600 rounded-full ml-auto" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Interlock Protection: The normally closed contact of Q0.2 opens when Forward is active, preventing reverse from ever energizing simultaneously, avoiding a short circuit on the motor lines.
            </p>
          </div>

          {/* RUNG 4: FOOTWEAR AUTOMATION SEQUENTIAL INTERLOCK & PRODUCTION COUNT INCREMENT */}
          <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/40 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
              <span>RUNG 4: FOOTWEAR AUTOMATION SEQUENTIAL INTERLOCK & PRODUCTION COUNT</span>
              <span className={isRung5Active ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {isRung5Active
                  ? `STAGE COMPLETE: INCREMENT ProductionCount (${assemblyBits?.ProductionCount ?? 0})`
                  : 'STAGE PENDING: AWAITING INTERLOCK CHAIN'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto">
              <div className="flex items-center min-w-[760px]">
                <div className="w-1.5 h-12 bg-emerald-500 rounded-full mr-3" />

                {/* 1. MaterialAvailable */}
                <div
                  className={`px-2.5 py-1.5 rounded border text-[10px] ${
                    assemblyBits?.MaterialAvailable
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  <span>-| |- MaterialAvailable</span>
                </div>

                <div
                  className={`w-6 h-1 ${
                    assemblyBits?.MaterialAvailable ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />

                {/* 2. SewingComplete */}
                <div
                  className={`px-2.5 py-1.5 rounded border text-[10px] ${
                    assemblyBits?.SewingComplete
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  <span>-| |- SewingComplete</span>
                </div>

                <div
                  className={`w-6 h-1 ${
                    assemblyBits?.MaterialAvailable && assemblyBits?.SewingComplete
                      ? 'bg-emerald-400'
                      : 'bg-slate-700'
                  }`}
                />

                {/* 3. GlueComplete */}
                <div
                  className={`px-2.5 py-1.5 rounded border text-[10px] ${
                    assemblyBits?.GlueComplete
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  <span>-| |- GlueComplete</span>
                </div>

                <div
                  className={`w-6 h-1 ${
                    assemblyBits?.MaterialAvailable &&
                    assemblyBits?.SewingComplete &&
                    assemblyBits?.GlueComplete
                      ? 'bg-emerald-400'
                      : 'bg-slate-700'
                  }`}
                />

                {/* 4. PressComplete */}
                <div
                  className={`px-2.5 py-1.5 rounded border text-[10px] ${
                    assemblyBits?.PressComplete
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  <span>-| |- PressComplete</span>
                </div>

                <div
                  className={`w-6 h-1 ${
                    assemblyBits?.MaterialAvailable &&
                    assemblyBits?.SewingComplete &&
                    assemblyBits?.GlueComplete &&
                    assemblyBits?.PressComplete
                      ? 'bg-emerald-400'
                      : 'bg-slate-700'
                  }`}
                />

                {/* 5. QC_OK */}
                <div
                  className={`px-2.5 py-1.5 rounded border text-[10px] ${
                    assemblyBits?.QC_OK
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 font-bold'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  <span>-| |- QC_OK</span>
                </div>

                <div className={`w-6 h-1 ${isRung5Active ? 'bg-emerald-400' : 'bg-slate-700'}`} />

                {/* Output Coil / Counter Block */}
                <div
                  className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] ${
                    isRung5Active
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 ring-2 ring-emerald-400'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  <span>-( CTU ) ProductionCount++ [{assemblyBits?.ProductionCount ?? 0}]</span>
                </div>

                <div className="w-1.5 h-12 bg-slate-600 rounded-full ml-auto" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Sequential Process Flow: The up-counter (CTU) only increments `ProductionCount` when the workpiece has verified raw material intake, completed upper stitching, passed precision adhesive priming, completed sole vulcanization press dwell, and passed high-speed optical vision QA.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-4 py-2.5 border-t border-cyan-500/40 flex justify-between items-center text-[11px]">
          <span className="text-emerald-400">
            PROFINET IO-DEVICE RUNNING · S7-1500 PLC REDUNDANT SIL-3 READY
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded shadow transition-colors"
          >
            CLOSE LADDER MONITOR
          </button>
        </div>
      </div>
    </div>
  );
};
