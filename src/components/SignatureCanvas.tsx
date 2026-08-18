"use client";

import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, CheckCircle, FileCheck, Shield, Download, Trash2, Lock, UserCheck } from 'lucide-react';
import { QuoteResponse } from '@/lib/types';

interface SignatureCanvasProps {
  customerName: string;
  deviceBrand: string;
  deviceModel: string;
  selectedTier: "budget" | "professional" | "authorized";
  onSelectTier?: (tier: "budget" | "professional" | "authorized") => void;
  quote: QuoteResponse;
  onSignatureConfirmed?: (data: {
    signatureDataUrl: string;
    customerName: string;
    tier: string;
    totalAmount: number;
    timestamp: string;
  }) => void;
  onToast?: (title: string, message: string, type?: "success" | "error" | "info" | "warning") => void;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  customerName,
  deviceBrand,
  deviceModel,
  selectedTier,
  onSelectTier,
  quote,
  onSignatureConfirmed,
  onToast,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signedDataUrl, setSignedDataUrl] = useState<string | null>(null);
  const [signedTimestamp, setSignedTimestamp] = useState<string | null>(null);
  const [signerName, setSignerName] = useState<string>(customerName || 'Customer');
  const [penColor, setPenColor] = useState<string>('#3b82f6'); // Electric Blue
  const [strokeWidth, setStrokeWidth] = useState<number>(2.5);

  const activeTierObj = quote.tiers[selectedTier];
  const grandTotal = activeTierObj?.grandTotal ?? 0;

  // Sync customer name prop
  useEffect(() => {
    if (customerName) {
      setSignerName(customerName);
    }
  }, [customerName]);

  // Canvas initialization and scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution for crisp drawing
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = strokeWidth;
  }, [penColor, strokeWidth]);

  // Update stroke properties when changed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = strokeWidth;
  }, [penColor, strokeWidth]);

  // Coordinates helper
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const dataUrl = canvas.toDataURL('image/png');
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    setSignedDataUrl(dataUrl);
    setSignedTimestamp(timestamp);

    const confirmationPayload = {
      signatureDataUrl: dataUrl,
      customerName: signerName || 'Customer',
      tier: selectedTier.toUpperCase(),
      totalAmount: grandTotal,
      timestamp,
    };

    if (onSignatureConfirmed) {
      onSignatureConfirmed(confirmationPayload);
    }

    if (onToast) {
      onToast(
        "Quote Digitally Signed",
        `Authorized $${grandTotal.toFixed(2)} (${selectedTier.toUpperCase()} tier) for ${deviceBrand} ${deviceModel}.`,
        "success"
      );
    }
  };

  const handleResetSignature = () => {
    setSignedDataUrl(null);
    setSignedTimestamp(null);
    setTimeout(() => {
      clearCanvas();
    }, 50);
  };

  const handleDownloadReceipt = () => {
    if (!signedDataUrl) return;

    const link = document.createElement('a');
    link.download = `Signed_Repair_Quote_${signerName.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = signedDataUrl;
    link.click();
  };

  return (
    <section className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 shadow-xl space-y-5 relative overflow-hidden">
      {/* Header Accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Customer Digital Drop-off & Quote Signature
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Capture legal customer sign-off and terms authorization upon device intake.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            ESIGN Compliant
          </span>
        </div>
      </div>

      {/* Quote Summary Banner */}
      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700/70 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Customer & Device Identification
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter Customer Name"
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-slate-400 text-xs font-normal">
                | {deviceBrand} {deviceModel}
              </span>
            </div>
          </div>

          {/* Tier Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Selected Tier:</span>
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              {(['budget', 'professional', 'authorized'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => onSelectTier?.(tier)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all capitalize ${
                    selectedTier === tier
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Parts Cost</span>
            <span className="text-slate-200 font-semibold">${activeTierObj?.partsCost.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Labor Cost</span>
            <span className="text-slate-200 font-semibold">${activeTierObj?.laborCost.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">WA Tax ({quote.taxInfo.rate * 100}%)</span>
            <span className="text-slate-200 font-semibold">${activeTierObj?.calculatedTax.toFixed(2)}</span>
          </div>
          <div className="bg-blue-950/50 border border-blue-800/60 p-1.5 rounded text-right">
            <span className="text-blue-400 block text-[10px] uppercase font-bold">Authorized Total</span>
            <span className="text-emerald-400 text-sm font-extrabold">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Signature Authorization Clause */}
      <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-750 text-xs text-slate-300 space-y-1 leading-relaxed">
        <p className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          Intake Authorization & Terms
        </p>
        <p className="text-[11px] text-slate-400">
          I, <strong className="text-slate-200">{signerName}</strong>, confirm that I am the owner or authorized agent of the <strong className="text-slate-200">{deviceBrand} {deviceModel}</strong>. I approve the <strong className="text-slate-200">{selectedTier.toUpperCase()}</strong> repair tier for <strong className="text-emerald-400">${grandTotal.toFixed(2)}</strong> and authorize Display & Cell Pros technicians to perform diagnostics and repairs.
        </p>
      </div>

      {/* Signature Canvas Area or Signed Result */}
      {signedDataUrl ? (
        <div className="bg-emerald-950/30 border border-emerald-700/60 rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle className="w-5 h-5" />
              Quote Digitally Signed & Authorized
            </div>
            <span className="text-xs text-slate-400 font-mono">{signedTimestamp}</span>
          </div>

          <div className="bg-white rounded-lg p-3 flex flex-col items-center justify-center border border-emerald-800/40 shadow-inner">
            <img src={signedDataUrl} alt="Customer Signature" className="max-h-36 object-contain" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-300 font-mono">
              Signed by: <strong className="text-white">{signerName}</strong> | Tier: <strong className="text-blue-400">{selectedTier.toUpperCase()}</strong> (${grandTotal.toFixed(2)})
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Signature
              </button>
              <button
                type="button"
                onClick={handleResetSignature}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-sign
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              Sign Below (Mouse or Touchscreen)
            </span>

            {/* Pen Options */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Color:</span>
                {[
                  { name: 'Blue', color: '#3b82f6' },
                  { name: 'Black', color: '#0f172a' },
                  { name: 'Emerald', color: '#10b981' },
                ].map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setPenColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-4 h-4 rounded-full border ${
                      penColor === c.color ? 'border-white scale-110 ring-2 ring-blue-400' : 'border-slate-600 opacity-80'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Width:</span>
                {[1.5, 2.5, 4].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setStrokeWidth(w)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      strokeWidth === w ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {w === 1.5 ? 'Fine' : w === 2.5 ? 'Med' : 'Thick'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive HTML5 Canvas Container */}
          <div className="relative bg-slate-950 border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl overflow-hidden transition-colors">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 cursor-crosshair touch-none bg-slate-950"
            />

            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-600 text-xs font-mono uppercase tracking-widest gap-2">
                <PenTool className="w-4 h-4 text-slate-600 animate-bounce" />
                Draw Customer Signature Here
              </div>
            )}

            {/* Baseline indicator */}
            <div className="absolute bottom-6 left-8 right-8 border-b border-slate-800/80 pointer-events-none flex justify-between items-center text-[10px] text-slate-700 font-mono">
              <span>X Signature Line</span>
              <span>Display & Cell Pros Intake</span>
            </div>
          </div>

          {/* Canvas Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={clearCanvas}
              disabled={!hasDrawn}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              Clear Pad
            </button>

            <button
              type="button"
              onClick={handleConfirmSignature}
              disabled={!hasDrawn}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
            >
              <FileCheck className="w-4 h-4" />
              Confirm & Save Signature
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default SignatureCanvas;
