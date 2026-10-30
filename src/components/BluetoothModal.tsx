import React, { useState } from 'react';
import {
  X,
  Bluetooth,
  Radio,
  Send,
  Terminal,
  RefreshCw,
  BatteryCharging,
  Wifi,
  Play,
  Square,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { BluetoothDeviceStatus } from '../types/scada';

interface BluetoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: BluetoothDeviceStatus;
  onConnectReal: () => void;
  onToggleSimulated: () => void;
  onSendCommand: (cmd: string) => void;
}

export const BluetoothModal: React.FC<BluetoothModalProps> = ({
  isOpen,
  onClose,
  status,
  onConnectReal,
  onToggleSimulated,
  onSendCommand,
}) => {
  const [inputCmd, setInputCmd] = useState('');
  const [logs, setLogs] = useState<Array<{ time: string; type: 'tx' | 'rx'; text: string }>>([
    { time: '11:14:02', type: 'rx', text: '+INIT: HC-05 SERIAL BLUETOOTH READY 98:D3:31' },
    { time: '11:14:03', type: 'rx', text: '+PAIRING: READY FOR SPP TRANSPARENT BRIDGE 9600 BAUD' },
  ]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputCmd.trim()) return;
    const cmd = inputCmd.trim().toUpperCase();
    const now = new Date().toTimeString().slice(0, 8);

    setLogs((prev) => [...prev, { time: now, type: 'tx', text: `> ${cmd}` }]);
    onSendCommand(cmd);

    // AT command simulated responses
    setTimeout(() => {
      let resp = 'OK';
      if (cmd === 'AT') resp = 'OK';
      else if (cmd === 'AT+VERSION') resp = '+VERSION:HC-05-V2.0-20261012';
      else if (cmd === 'AT+ADDR') resp = '+ADDR:98:D3:31:FB:7E:21';
      else if (cmd === 'AT+NAME') resp = '+NAME:NGABO_V17_6D_K56';
      else if (cmd === 'AT+STATE') resp = status.connected ? '+STATE:CONNECTED' : '+STATE:INITIALIZING';
      else if (cmd === 'AT+BAUD') resp = '+BAUD:9600,0,0 (8-N-1)';
      else if (cmd === 'START') resp = '+ACK: PLC_I00_LATCH_Q00_ENERGIZED';
      else if (cmd === 'STOP') resp = '+ACK: PLC_I01_STOP_Q00_RESET';
      else if (cmd === 'FWD') resp = '+ACK: MOTOR_FWD_1.0M_ROAD_ACTIVE';
      else if (cmd === 'REV') resp = '+ACK: MOTOR_REV_DRY_PORT_ACTIVE';
      else resp = `+ECHO: ${cmd} (PROCESSED)`;

      setLogs((prev) => [...prev, { time: new Date().toTimeString().slice(0, 8), type: 'rx', text: resp }]);
    }, 120);

    setInputCmd('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-slate-950 border-2 border-yellow-500/80 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col font-mono text-xs text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 border-b border-yellow-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bluetooth className="w-5 h-5 text-yellow-400" />
            <div>
              <h2 className="font-bold text-sm text-yellow-400">
                BLUETOOTH HC-05 (98:D3:31:FB:7E) SPP TERMINAL
              </h2>
              <p className="text-[10px] text-slate-400">
                Wireless Gamepad & Telemetry Link · Baud: 9600 8-N-1 · SPP Transparent Bridge
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

        {/* Device Status Bar */}
        <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-1.5 font-bold ${
                status.connected ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {status.connected ? 'LINK CONNECTED' : 'DISCONNECTED'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">MAC: {status.deviceMac}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-400">
              <Wifi className="w-3.5 h-3.5" />
              {status.rssi} dBm
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <BatteryCharging className="w-3.5 h-3.5" />
              {status.batteryPct}% (3.7V LiPo)
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onConnectReal}
              className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded flex items-center justify-center gap-1.5 shadow"
            >
              <Bluetooth className="w-4 h-4" />
              <span>SCAN HARDWARE (WEB BLUETOOTH)</span>
            </button>

            <button
              onClick={onToggleSimulated}
              className={`py-2 px-3 rounded font-bold border transition-colors ${
                status.connected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
              }`}
            >
              <span>{status.connected ? 'DISCONNECT LINK' : 'SIMULATE HC-05 PAIRING'}</span>
            </button>
          </div>

          {/* Quick Joystick D-Pad */}
          <div className="bg-slate-900/60 p-3 rounded border border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400 font-bold block w-full">
              WIRELESS TELEMETRY JOYSTICK COMMANDS:
            </span>

            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => onSendCommand('START')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px]"
              >
                START
              </button>
              <button
                onClick={() => onSendCommand('STOP')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-[10px]"
              >
                STOP
              </button>
              <button
                onClick={() => onSendCommand('FWD')}
                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-[10px]"
              >
                FWD
              </button>
              <button
                onClick={() => onSendCommand('REV')}
                className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded font-bold text-[10px]"
              >
                REV
              </button>
              <button
                onClick={() => onSendCommand('UP')}
                className="px-2.5 py-1 bg-yellow-600 hover:bg-yellow-500 text-slate-950 rounded font-bold text-[10px]"
              >
                UP
              </button>
              <button
                onClick={() => onSendCommand('DOWN')}
                className="px-2.5 py-1 bg-yellow-600 hover:bg-yellow-500 text-slate-950 rounded font-bold text-[10px]"
              >
                DOWN
              </button>
              <button
                onClick={() => onSendCommand('ESTOP')}
                className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded font-bold text-[10px]"
              >
                E-STOP
              </button>
            </div>
          </div>

          {/* Console Log Terminal */}
          <div className="flex-1 bg-slate-950 rounded border border-slate-800 p-2.5 overflow-y-auto font-mono text-[11px] space-y-1">
            <div className="text-slate-500 border-b border-slate-800 pb-1 flex items-center justify-between text-[10px]">
              <span>TX/RX SERIAL LOG BUFFER</span>
              <button
                onClick={() => setLogs([])}
                className="text-slate-400 hover:text-white"
              >
                CLEAR
              </button>
            </div>

            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${
                  log.type === 'tx' ? 'text-cyan-300' : 'text-emerald-400'
                }`}
              >
                <span className="text-slate-600">[{log.time}]</span>
                <span className="font-bold">{log.type.toUpperCase()}:</span>
                <span>{log.text}</span>
              </div>
            ))}
          </div>

          {/* Input box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCmd}
              onChange={(e) => setInputCmd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Enter AT command (e.g. AT+VERSION, AT+BAUD, START, FWD)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200 outline-none focus:border-yellow-400 font-mono text-xs"
            />
            <button
              onClick={handleSend}
              className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded shadow flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
