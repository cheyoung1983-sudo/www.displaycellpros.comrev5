"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  Camera, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  FileImage, 
  QrCode, 
  Barcode, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ScannedHardwareData {
  rawValue: string;
  type: 'imei' | 'serial' | 'ticket' | 'sku' | 'json' | 'generic';
  deviceModel?: string;
  manufacturer?: string;
  serialNumber?: string;
  imei?: string;
  ticketId?: string;
}

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: ScannedHardwareData) => void;
  targetField?: 'imei' | 'serial' | 'ticket' | 'all';
}

// Helper to parse hardware barcode/QR payload
export function parseScannedHardwarePayload(rawText: string): ScannedHardwareData {
  const text = rawText.trim();
  
  // 1. JSON QR Format
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      return {
        rawValue: text,
        type: 'json',
        imei: parsed.imei || parsed.IMEI,
        serialNumber: parsed.serial || parsed.serialNumber || parsed.sn || parsed.SN,
        ticketId: parsed.ticketId || parsed.ticket || parsed.ticketNumber || parsed.id,
        deviceModel: parsed.deviceModel || parsed.model,
        manufacturer: parsed.manufacturer || parsed.brand,
      };
    } catch {
      // fallback
    }
  }

  // 2. Ticket URL or query param
  if (text.includes('ticket=') || text.includes('/track/')) {
    let ticketId = text;
    if (text.includes('ticket=')) {
      const parts = text.split('ticket=');
      ticketId = parts[1]?.split('&')[0] || text;
    } else if (text.includes('/track/')) {
      const parts = text.split('/track/');
      ticketId = parts[1]?.split('?')[0] || text;
    }
    return {
      rawValue: text,
      type: 'ticket',
      ticketId: ticketId.trim(),
    };
  }

  // 3. DCP Ticket Code (e.g. DCP-8842, DCP-10492)
  if (/^DCP-[A-Z0-9]+$/i.test(text)) {
    return {
      rawValue: text,
      type: 'ticket',
      ticketId: text.toUpperCase(),
    };
  }

  // 4. 15-digit numeric IMEI standard (Code 128 / Code 39 or QR)
  const digitsOnly = text.replace(/[^0-9]/g, '');
  if (digitsOnly.length === 15) {
    return {
      rawValue: text,
      type: 'imei',
      imei: digitsOnly,
    };
  }

  // 5. Serial number format (e.g. Apple 10-12 alphanumeric, Samsung serials)
  if (/^[A-Z0-9]{8,14}$/i.test(text) && !text.includes(' ')) {
    return {
      rawValue: text,
      type: 'serial',
      serialNumber: text.toUpperCase(),
    };
  }

  return {
    rawValue: text,
    type: 'generic',
  };
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  targetField = 'all'
}: BarcodeScannerModalProps) {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<ScannedHardwareData | null>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'simulate'>('camera');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setScannedResult(null);
      setScannerError(null);
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      setScannerError(null);
      setIsScanning(true);

      try {
        // Supported optical formats: QR, Code 128, Code 39, EAN-13, UPC-A, Data Matrix
        const html5Qrcode = new Html5Qrcode('barcode-camera-viewport', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.DATA_MATRIX
          ],
          verbose: false
        });
        scannerRef.current = html5Qrcode;

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            // Adaptive rectangular aspect for barcodes and QR codes.
            // Clamped to html5-qrcode's 50px minimum in case the viewport
            // container hasn't finished laying out when start() measures it.
            const minDim = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.max(50, Math.floor(minDim * 0.85)),
              height: Math.max(50, Math.floor(minDim * 0.65))
            };
          },
          aspectRatio: 1.333334
        };

        await html5Qrcode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            const parsed = parseScannedHardwarePayload(decodedText);
            setScannedResult(parsed);

            // Subtle vibration feedback on mobile
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([80, 40, 80]);
            }

            setTimeout(() => {
              stopScanner();
              onScanSuccess(parsed);
              onClose();
            }, 750);
          },
          () => {
            // Frame non-decode pass (standard for video stream)
          }
        );
      } catch (err: any) {
        console.warn('Barcode/QR scanner init notice:', err);
        if (isMounted) {
          setIsScanning(false);
          if (err?.name === 'NotAllowedError' || String(err).includes('Permission')) {
            setScannerError('Camera permission was denied. Please allow camera access in your browser or use the image upload & sample barcode triggers below.');
          } else {
            setScannerError('Camera feed unavailable in current iframe container. You can upload an image or click sample hardware barcodes below for instant testing.');
          }
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((e) => console.log('Stop scanner info:', e));
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScannerError(null);
      const html5Qrcode = new Html5Qrcode('barcode-camera-viewport');
      const decodedText = await html5Qrcode.scanFile(file, true);
      const parsed = parseScannedHardwarePayload(decodedText);
      
      setScannedResult(parsed);
      setTimeout(() => {
        onScanSuccess(parsed);
        onClose();
      }, 600);
    } catch {
      setScannerError('Could not decode a 1D barcode or QR code from the uploaded image. Please ensure the label is in focus.');
    }
  };

  const handleSimulateScan = (sample: { text: string; label: string }) => {
    const parsed = parseScannedHardwarePayload(sample.text);
    setScannedResult(parsed);
    setTimeout(() => {
      onScanSuccess(parsed);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 md:p-8 space-y-6 overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-md shadow-slate-900/20">
              <Barcode className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-playfair font-black text-xl text-slate-900">
                  {targetField === 'imei' ? 'Scan Device IMEI / Serial' : 'Optical Barcode & QR Scanner'}
                </h3>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono text-[9px] font-bold rounded-md border border-blue-100 uppercase">
                  1D / 2D
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Spokane Laboratory Hardware Intake
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
            aria-label="Close Scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optical Camera Viewport */}
        <div className="relative bg-slate-950 rounded-3xl overflow-hidden min-h-[280px] flex items-center justify-center border-2 border-slate-800 shadow-inner">
          <div id="barcode-camera-viewport" className="absolute inset-0 [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_video]:rounded-2xl" />

          {/* Real-Time Laser Scanning Reticle */}
          {isScanning && !scannedResult && !scannerError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-36 border-2 border-blue-500/80 rounded-2xl relative shadow-[0_0_25px_rgba(59,130,246,0.35)]">
                {/* Corner guide markers */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 -mt-1 -ml-1 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 -mt-1 -mr-1 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 -mb-1 -ml-1 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 -mb-1 -mr-1 rounded-br-lg" />

                {/* Laser scan line animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.9)] absolute top-1/2 -translate-y-1/2 animate-pulse" />

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[10px] font-mono font-bold text-white/90 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                    Align Barcode or QR Code
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Success Overlay */}
          {scannedResult && (
            <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-400/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">Hardware Identifier Decoded!</h4>
                <p className="text-xs text-emerald-300 font-medium">Type: {scannedResult.type.toUpperCase()}</p>
              </div>
              <div className="px-4 py-2 bg-slate-900 text-emerald-300 font-mono font-bold rounded-xl border border-emerald-500/40 text-sm max-w-xs truncate">
                {scannedResult.imei || scannedResult.serialNumber || scannedResult.ticketId || scannedResult.rawValue}
              </div>
            </div>
          )}

          {/* Error / Fallback message */}
          {scannerError && (
            <div className="p-6 text-center space-y-3 max-w-sm z-10">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-300 leading-relaxed">
                {scannerError}
              </p>
            </div>
          )}
        </div>

        {/* Quick Simulation & File Upload Trigger */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>Bench Sample Barcodes (Quick Test)</span>
            </span>
            <label className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-100 transition-all">
              <FileImage className="w-3.5 h-3.5" />
              <span>Upload Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { text: '354892091823746', label: 'iPhone 15 IMEI (15-digit)', sub: 'Apple A2846' },
              { text: '990012894102941', label: 'Galaxy S24 IMEI', sub: 'Samsung SM-S921U' },
              { text: 'DCP-8842', label: 'Intake Ticket QR', sub: 'Spokane Bench Slip' },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSimulateScan(item)}
                className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-900 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-900 group-hover:text-blue-600 truncate">
                    {item.text}
                  </span>
                  <Barcode className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 shrink-0 ml-1" />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 block truncate mt-0.5">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Supports standard 1D Code 128, Code 39, UPC & 2D QR codes</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
