import React, { useState } from 'react';
import {
  X,
  Droplets,
  Coins,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  XCircle,
  Radio,
  Send,
  Building2,
  Award,
  Clock,
  Unlock,
  Lock,
} from 'lucide-react';
import { IncomeMonitoringState } from '../types/scada';

interface IncomeMonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomeState: IncomeMonitoringState;
  onCheckAccess: (idCard: string, fonCode: string) => boolean;
  onResetAccumulator: () => void;
}

export const IncomeMonitoringModal: React.FC<IncomeMonitoringModalProps> = ({
  isOpen,
  onClose,
  incomeState,
  onCheckAccess,
  onResetAccumulator,
}) => {
  const [idCardInput, setIdCardInput] = useState('NGABO-RP-2026');
  const [fonCodeInput, setFonCodeInput] = useState('Hwenu Gbon');
  const [verificationFeedback, setVerificationFeedback] = useState<{
    status: 'idle' | 'success' | 'fail';
    message: string;
  }>({ status: 'idle', message: '' });

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const isGranted = onCheckAccess(idCardInput.trim(), fonCodeInput.trim());
    if (isGranted) {
      setVerificationFeedback({
        status: 'success',
        message: 'Accès Autorisé - WELKOME - Kwinjira - Murakaza Neza (Porte de Contrôle FON Ouverte)',
      });
    } else {
      setVerificationFeedback({
        status: 'fail',
        message: 'Accès Refusé - Invalid ID Card or FON Security Code',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="bg-slate-950 border-2 border-yellow-500/90 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col font-mono text-xs text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 px-4 py-3 border-b border-yellow-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400 font-bold">
              V60
            </div>
            <div>
              <h2 className="font-bold text-sm text-yellow-400 tracking-wide flex items-center gap-2">
                <span>NGABO V60 - CUSTOMER INCOME MONITORING 0.05ms</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                  RUBAVU URBAN DDS IMIHIGO
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                WASAC Gihira Water Treatment Plant · High-Speed S7-1200 TON Timer (%DB4 T_1)
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

        {/* Content body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Real-time Income Dashboard Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* m3 Treated */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>m³ TREATED</span>
                </span>
                <span className="text-cyan-400 font-bold">GIHIRA</span>
              </div>
              <p className="text-cyan-300 font-bold text-lg tabular-nums">
                {incomeState.m3Treated.toFixed(2)}{' '}
                <span className="text-xs text-slate-400 font-normal">m³</span>
              </p>
              <span className="text-[9px] text-slate-500 block">Flow: 4,200 m³/h</span>
            </div>

            {/* Total Revenue RWF */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span>REVENUE (RWF)</span>
                </span>
                <span className="text-yellow-400 font-bold">65 RWF/m³</span>
              </div>
              <p className="text-yellow-400 font-bold text-lg tabular-nums">
                {incomeState.revenueRwf.toLocaleString('en-US', { maximumFractionDigits: 0 })}{' '}
                <span className="text-xs text-slate-400 font-normal">RWF</span>
              </p>
              <span className="text-[9px] text-slate-500 block">WASAC Official Tariff</span>
            </div>

            {/* Scan Cycle Time */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PLC SCAN SPEED</span>
                </span>
                <span className="text-emerald-400 font-bold">%DB4 T_1</span>
              </div>
              <p className="text-emerald-400 font-bold text-lg tabular-nums">
                {incomeState.processingTimeMs.toFixed(2)}{' '}
                <span className="text-xs text-slate-400 font-normal">ms</span>
              </p>
              <span className="text-[9px] text-slate-500 block">High-Speed TON Timer</span>
            </div>

            {/* Rubavu DDS IMIHIGO */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>DDS IMIHIGO</span>
                </span>
                <span className="text-purple-400 font-bold">RUBAVU</span>
              </div>
              <p className="text-purple-300 font-bold text-lg tabular-nums">
                {incomeState.imihigoAchievedPercent}%{' '}
                <span className="text-xs text-slate-400 font-normal">Achieved</span>
              </p>
              <span className="text-[9px] text-slate-500 block">Stability 98.5% Uptime</span>
            </div>
          </div>

          {/* Tri-Lingual Status Banner (FON + Kinyarwanda + French) */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-cyan-950/40 p-3 rounded-xl border border-emerald-500/40 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-yellow-400 font-bold border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>FON &middot; KINYARWANDA &middot; FRANÇAIS TRI-LINGUAL DASHBOARD</span>
              </span>
              <span className="text-emerald-400 text-[10px]">ACCOUNTABILITY: 100% TRACKED</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] pt-0.5">
              <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
                <span className="text-amber-400 font-bold block">FON LANGUAGE:</span>
                <p className="text-slate-300 mt-0.5">Porte de Contrôle FON: Hwenu Gbon</p>
              </div>
              <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
                <span className="text-emerald-400 font-bold block">IKINYARWANDA:</span>
                <p className="text-slate-300 mt-0.5">Rubavu DDS IMIHIGO: 92% Byagezweho &middot; Kwinjira</p>
              </div>
              <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
                <span className="text-cyan-400 font-bold block">FRANÇAIS:</span>
                <p className="text-slate-300 mt-0.5">Accès Autorisé &middot; Stabilité 98.5% &middot; Traçabilité 100%</p>
              </div>
            </div>
          </div>

          {/* Access Control Verification Form ("Porte de Contrôle FON") */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-yellow-500/50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-yellow-400" />
                <span className="font-bold text-yellow-400 text-xs">
                  PORTE DE CONTRÔLE FON &middot; KWINJIRA ACCESS VERIFICATION
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                {incomeState.gateOpen ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Unlock className="w-3.5 h-3.5" />
                    <span>GATE: OPEN (ACCÈS AUTORISÉ)</span>
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>GATE: SECURED</span>
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleVerify} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">ID CARD CODE:</label>
                <input
                  type="text"
                  value={idCardInput}
                  onChange={(e) => setIdCardInput(e.target.value)}
                  placeholder="e.g. NGABO-RP-2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-yellow-400 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">FON PASSCODE:</label>
                <input
                  type="text"
                  value={fonCodeInput}
                  onChange={(e) => setFonCodeInput(e.target.value)}
                  placeholder="e.g. Hwenu Gbon"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-yellow-400 font-mono text-xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold rounded shadow transition-all flex items-center justify-center gap-1.5 text-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>VÉRIFIER / KWINJIRA</span>
                </button>
              </div>
            </form>

            {/* Verification message banner */}
            {verificationFeedback.status !== 'idle' && (
              <div
                className={`p-2.5 rounded-lg border text-[11px] flex items-center gap-2 ${
                  verificationFeedback.status === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-rose-950/60 border-rose-500 text-rose-300'
                }`}
              >
                {verificationFeedback.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{verificationFeedback.message}</span>
              </div>
            )}
          </div>

          {/* MQTT Broadcast Stream & Audit Trail */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/80 pb-1">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Radio className="w-3.5 h-3.5" />
                <span>MQTT BROADCAST & AUDIT LOGS (wasac/rubavu/income/*)</span>
              </span>
              <span className="text-emerald-400">BROKER: test.mosquitto.org LIVE</span>
            </div>

            <div className="space-y-1 font-mono text-[10px] text-slate-400 max-h-28 overflow-y-auto">
              <div className="text-cyan-300">
                [MQTT PUBLISH] wasac/rubavu/income/revenue &rarr; &#123; m3: {incomeState.m3Treated.toFixed(2)}, revenue: {incomeState.revenueRwf.toFixed(0)}, unitPrice: 65, fon: "Hwenu Gbon" &#125;
              </div>
              <div className="text-emerald-300">
                [MQTT PUBLISH] wasac/rubavu/stability/uptime &rarr; &#123; uptime: "98.5%", dds_imihigo: "92%", accountability: "100%" &#125;
              </div>
              {incomeState.accessLogs.slice(-3).map((log) => (
                <div
                  key={log.id}
                  className={log.granted ? 'text-emerald-400' : 'text-rose-400'}
                >
                  [{log.timestamp}] wasac/gihira/access/log &rarr; ID: {log.idCard} &middot; FON: "{log.fonCode}" &middot; {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-4 py-2.5 border-t border-yellow-500/40 flex items-center justify-between text-[11px]">
          <button
            onClick={onResetAccumulator}
            className="text-slate-400 hover:text-white underline text-[10px]"
          >
            Reset Accumulated m³ & Revenue
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded shadow transition-colors"
          >
            FERMER / CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
