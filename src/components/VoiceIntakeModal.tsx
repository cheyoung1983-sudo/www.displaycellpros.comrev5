import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Volume2, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Copy, 
  Download, 
  ArrowRight, 
  RefreshCw, 
  FileText, 
  Cpu, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast.tsx';

export interface VoiceIntakeTicket {
  ticketNumber: string;
  intakeSource: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  deviceManufacturer: string;
  deviceModel: string;
  issueTranscript: string;
  suspectedFault: string;
  serviceTier: string;
  serviceTierLabel: string;
  estimatedPriceRange: string;
  confidenceScore: number;
  symptoms: string[];
  triageSummary: string;
  recommendedAction: string;
  status: string;
  benchLocation: string;
}

interface VoiceIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToIntakeForm?: (ticket: VoiceIntakeTicket) => void;
}

export const VoiceIntakeModal: React.FC<VoiceIntakeModalProps> = ({
  isOpen,
  onClose,
  onApplyToIntakeForm,
}) => {
  const { showToast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [ticket, setTicket] = useState<VoiceIntakeTicket | null>(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  // Clean up timers & media stream on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  const startRecording = async () => {
    try {
      setTicket(null);
      setLiveTranscript('');
      setAudioBlob(null);
      setRecordingDuration(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup AudioContext for real-time waveform visualizer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((acc, v) => acc + v, 0);
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 255) * 100 * 2)));
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch (audioCtxErr) {
        console.warn('AudioContext visualization initialization note:', audioCtxErr);
      }

      // Initialize speech recognition if available in browser for immediate live preview
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let current = '';
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript + ' ';
            }
            setLiveTranscript(current.trim());
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('SpeechRecognition fallback note:', recErr);
        }
      }

      // Setup MediaRecorder
      const options = { mimeType: 'audio/webm;codecs=opus' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        processVoiceToTicket(blob);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      showToast('Microphone active. Speak your device issue clearly...', 'info');
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      showToast('Microphone access denied or not available.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopRecordingCleanup();
    }
  };

  const processVoiceToTicket = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string)?.split(',')[1];
        
        const response = await fetch('/api/elevenlabs/voice-intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: blob.type,
            transcript: liveTranscript || undefined,
            customerName: 'Che Young',
            customerEmail: 'cheyoung1983@gmail.com',
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Server failed to process voice intake');
        }

        const data = await response.json();
        if (data.success && data.ticket) {
          setTicket(data.ticket);
          showToast(`Intake Ticket ${data.ticket.ticketNumber} created via ElevenLabs!`, 'success');
        } else {
          throw new Error(data.error || 'Invalid ticket generated');
        }
        setIsProcessing(false);
      };
    } catch (err: any) {
      console.error('Error converting voice to ticket:', err);
      showToast(err.message || 'Failed to process voice intake', 'error');
      setIsProcessing(false);
    }
  };

  const handlePlayElevenLabsVoice = async () => {
    if (!ticket) return;
    setIsGeneratingTTS(true);
    try {
      const summaryToRead = `Spokane Repair Lab intake registered. Ticket number ${ticket.ticketNumber}. Device is an ${ticket.deviceManufacturer} ${ticket.deviceModel}. Suspected issue: ${ticket.suspectedFault}. Recommended service level: ${ticket.serviceTierLabel}. Estimated cost range: ${ticket.estimatedPriceRange}.`;
      
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: summaryToRead,
          voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George
          modelId: 'eleven_v3',
        }),
      });

      if (!response.ok) {
        throw new Error('TTS generation failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      setIsPlayingTTS(true);
      audio.onended = () => setIsPlayingTTS(false);
      audio.onerror = () => setIsPlayingTTS(false);
      await audio.play();
    } catch (err: any) {
      showToast('ElevenLabs TTS audio preview unavailable', 'info');
      setIsPlayingTTS(false);
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const handleCopyTicket = () => {
    if (!ticket) return;
    const text = `
=== D&CP SPOKANE LAB - VOICE INTAKE TICKET ===
Ticket ID: ${ticket.ticketNumber}
Created: ${new Date(ticket.createdAt).toLocaleString()}
Device: ${ticket.deviceManufacturer} ${ticket.deviceModel}
Service Tier: ${ticket.serviceTierLabel}
Estimated Price: ${ticket.estimatedPriceRange}
Suspected Fault: ${ticket.suspectedFault}
Spoken Issue: "${ticket.issueTranscript}"
Triage Notes: ${ticket.triageSummary}
Recommended Action: ${ticket.recommendedAction}
==============================================
    `.trim();

    navigator.clipboard.writeText(text);
    showToast('Intake ticket copied to clipboard!', 'success');
  };

  const handleDownloadJSON = () => {
    if (!ticket) return;
    const blob = new Blob([JSON.stringify(ticket, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticket.ticketNumber}_intake_ticket.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded ticket JSON file', 'success');
  };

  const handleApplyForm = () => {
    if (!ticket) return;
    if (onApplyToIntakeForm) {
      onApplyToIntakeForm(ticket);
    }
    onClose();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto space-y-6"
      >
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-600/10 blur-[100px] pointer-events-none rounded-full" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center shadow-inner">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-playfair font-black text-white">ElevenLabs Voice Intake</h3>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-mono text-[10px] font-black rounded-md border border-rose-500/30 uppercase">
                  Live STT + Triage
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Speak your hardware issue to generate an instant, structured repair ticket
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isRecording) stopRecording();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recording / Processing / Result States */}
        {!ticket ? (
          <div className="space-y-6">
            {/* Audio Recording Control Deck */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5">
              {isRecording ? (
                <>
                  <div className="relative">
                    {/* Pulsing ring indicator */}
                    <div 
                      className="absolute inset-0 rounded-full bg-rose-500/30 blur-md transition-all duration-100"
                      style={{ transform: `scale(${1 + (audioLevel / 100) * 0.5})` }}
                    />
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="relative w-20 h-20 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-rose-900/50 transition-all hover:scale-105 active:scale-95 group"
                    >
                      <Square className="w-7 h-7 fill-current group-hover:scale-90 transition-transform" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                      <span className="font-mono text-sm font-black text-rose-400 tracking-wider">
                        RECORDING {formatTimer(recordingDuration)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Tap the square button when you're finished speaking
                    </p>
                  </div>

                  {/* Visualizer Waveform Bar Simulation */}
                  <div className="flex items-center justify-center gap-1 h-8 w-full max-w-xs">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.max(4, Math.sin(i + recordingDuration * 3) * (audioLevel * 0.3) + (audioLevel * 0.2))}px`,
                          opacity: 0.4 + (audioLevel / 100) * 0.6,
                        }}
                      />
                    ))}
                  </div>

                  {/* Real-time transcribed preview */}
                  {liveTranscript && (
                    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-left text-xs font-mono text-slate-300 max-h-24 overflow-y-auto">
                      <span className="text-rose-400 font-bold mr-1.5">[Live Speech]:</span>
                      {liveTranscript}
                    </div>
                  )}
                </>
              ) : isProcessing ? (
                <div className="py-8 space-y-4">
                  <div className="w-16 h-16 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto animate-spin">
                    <Loader2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">Converting Voice via ElevenLabs...</h4>
                    <p className="text-xs text-slate-400">
                      Transcribing audio and isolating motherboard faults
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-20 h-20 bg-gradient-to-tr from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-rose-900/30 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  </button>

                  <div className="space-y-1.5 max-w-md">
                    <h4 className="font-bold text-sm text-white">Tap to Speak Your Device Issue</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      "e.g., My iPhone 15 Pro Max got water inside the speaker port and now boot loops with a hot spot on the logic board."
                    </p>
                  </div>

                  {/* Quick sample prompt pill */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="text-[11px] text-slate-500 font-mono">Sample issues:</span>
                    {[
                      'Dropped MacBook, black screen but chime sounds',
                      'Galaxy S24 Ultra won\'t charge over USB-C',
                      'iPad Pro VDD_MAIN short after water spill'
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={async () => {
                          setLiveTranscript(sample);
                          setIsProcessing(true);
                          try {
                            const res = await fetch('/api/elevenlabs/voice-intake', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                transcript: sample,
                                customerName: 'Che Young',
                                customerEmail: 'cheyoung1983@gmail.com'
                              })
                            });
                            const data = await res.json();
                            if (data.success) {
                              setTicket(data.ticket);
                              showToast('Sample voice intake ticket generated!', 'success');
                            }
                          } catch (err: any) {
                            showToast(err.message || 'Processing error', 'error');
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        className="text-[10px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-all"
                      >
                        "{sample.slice(0, 32)}..."
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Converted Intake Ticket Display */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Ticket Badge & ID Bar */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-white">{ticket.ticketNumber}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold rounded-md border border-emerald-500/30 uppercase">
                      Converted from Voice
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {ticket.deviceManufacturer} • {ticket.deviceModel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePlayElevenLabsVoice}
                  disabled={isGeneratingTTS || isPlayingTTS}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 transition-all"
                >
                  {isGeneratingTTS ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isPlayingTTS ? (
                    <Volume2 className="w-3.5 h-3.5 animate-bounce text-amber-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isPlayingTTS ? 'Playing Audio...' : 'Audio Summary'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyTicket}
                  className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all"
                  title="Copy Ticket Text"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all"
                  title="Download JSON Ticket"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Structured Ticket Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spoken Issue Transcript */}
              <div className="md:col-span-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono font-semibold uppercase">
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span>Spoken Issue Transcript</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                  "{ticket.issueTranscript}"
                </p>
              </div>

              {/* Suspected Fault & Triage Summary */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono font-semibold uppercase">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>Suspected Fault Component</span>
                </div>
                <p className="text-xs font-bold text-blue-300">
                  {ticket.suspectedFault}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {ticket.triageSummary}
                </p>
              </div>

              {/* Service Tier & Estimated Quote */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono font-semibold uppercase">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Service Tier & Bench Estimate</span>
                </div>
                <p className="text-xs font-bold text-emerald-300">
                  {ticket.serviceTierLabel}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Estimated Cost:</span>
                  <span className="font-mono font-bold text-white text-xs">{ticket.estimatedPriceRange}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Confidence Rating:</span>
                  <span className="font-mono text-emerald-400 font-bold">{ticket.confidenceScore}%</span>
                </div>
              </div>
            </div>

            {/* Recommended Action / Staging */}
            <div className="bg-blue-950/30 border border-blue-800/40 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs text-slate-300">
                <span className="font-bold text-blue-300">Recommended Next Step: </span>
                <span>{ticket.recommendedAction}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTicket(null);
                  startRecording();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Record Issue</span>
              </button>

              <button
                type="button"
                onClick={handleApplyForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-900/30 transition-all hover:scale-105 active:scale-95"
              >
                <span>Apply to Full Intake Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VoiceIntakeModal;
