'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Camera, X, Loader2, Gift, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { claimQRReward, parseQRPayload, type QRReward } from '@/services/qr-service';
import { useGameStore } from '@/store/game-store';
import { addItems } from '@/services/write-service';
import type { RarityTier } from '@/services/unit-generator';
import { getRarityNumber } from '@/services/unit-generator';
import { Gem, Zap, Star } from 'lucide-react';

type ScanState = 'idle' | 'scanning' | 'processing' | 'success' | 'error' | 'already_claimed';

export function QRScannerView({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<ScanState>('idle');
  const [message, setMessage] = useState<string>('');
  const [reward, setReward] = useState<QRReward | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [claimedCodes, setClaimedCodes] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addGeneratedUnit, showSummonCelebration } = useGameStore();

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const processQRCode = useCallback(async (data: string) => {
    const code = parseQRPayload(data);
    if (!code) {
      setMessage('Invalid QR code format');
      setState('error');
      return;
    }

    if (claimedCodes.has(code)) {
      setMessage('Already scanned this session');
      setState('already_claimed');
      return;
    }

    setState('processing');
    setMessage('Claiming reward...');

    const result = await claimQRReward(code);

    if (!result.success) {
      setMessage(result.error || 'Failed to claim reward');
      setState('error');
      return;
    }

    setReward(result.reward ?? null);
    setClaimedCodes(prev => new Set([...prev, code]));
    setMessage(result.reward?.location ?? 'Reward claimed!');
    setState('success');

    if (result.reward) {
      await handleReward(result.reward);
    }
  }, [claimedCodes, addGeneratedUnit]);

  const handleReward = async (reward: QRReward) => {
    if (reward.type === 'item' && reward.reward.itemId) {
      await addItems([{ itemId: reward.reward.itemId, quantity: reward.reward.quantity ?? 1 }]);
    }
    if (reward.type === 'unit' && reward.reward.unitId) {
      const { generateUnit } = await import('@/services/unit-generator');
      const generated = generateUnit(undefined, reward.reward.unitId, '1');
      generated.name = `${reward.location.split(' ')[0]} Unit`;
      generated.title = 'QR Hunt Special';
      generated.rarity = 'rare' as RarityTier;
      
      addGeneratedUnit({
        instanceId: `qr_${Date.now()}`,
        unitId: generated.id,
        jobId: generated.jobId,
        level: reward.reward.level ?? 1,
        stats: generated.baseStats,
        rarity: getRarityNumber(generated.rarity),
        name: generated.name,
        title: generated.title,
        element: generated.element,
        skills: generated.skills,
      });
      
      showSummonCelebration(generated.name, getRarityNumber(generated.rarity));
    }
  };

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setState('scanning');
      setMessage('Point camera at a QR code');
    } catch (err) {
      setCameraError('Camera access denied. Use manual entry below.');
      setState('idle');
    }
  }, []);

  const startManualScan = useCallback(() => {
    if (!manualCode.trim()) return;
    processQRCode(manualCode.trim());
  }, [manualCode, processQRCode]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const resetState = () => {
    setState('idle');
    setReward(null);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 bg-[#1a0a05] border-b border-[#3a2820]">
        <h2 className="ui-heading text-[16px] text-white text-stroke-sm">QR Hunt Scanner</h2>
        <button onClick={onClose} className="p-2 text-[#6a5a4a] hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {state === 'scanning' && (
          <div className="mb-4 relative bg-black rounded-lg overflow-hidden aspect-square">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-[#89e09d] rounded-lg animate-pulse" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {state === 'idle' && !cameraError && (
          <div className="mb-4 flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-[#2a4a3a] flex items-center justify-center">
              <Camera size={48} className="text-[#89e09d]" />
            </div>
            <button
              onClick={startCamera}
              className="w-full py-3 bg-gradient-to-r from-[#2a5a3a] to-[#3a7a4a] rounded text-white font-bold"
            >
              Start Camera
            </button>
          </div>
        )}

        {cameraError && (
          <div className="mb-4 p-3 bg-[#3a2a1a] rounded border border-[#6a4a2a]">
            <div className="flex items-center gap-2 text-[#e8a878] text-[12px]">
              <AlertCircle size={16} />
              {cameraError}
            </div>
          </div>
        )}

        {(state === 'processing' || state === 'scanning') && (
          <div className="mb-4 p-3 bg-[#2a2a3a] rounded border border-[#4a4a6a]">
            <div className="flex items-center gap-2 text-[#a8a8e8] text-[12px]">
              <Loader2 size={16} className="animate-spin" />
              {message}
            </div>
          </div>
        )}

        {state === 'success' && reward && (
          <div className="mb-4 p-4 bg-[#2a3a2a] rounded-lg border border-[#4a8a4a] animate-levelUp">
            <div className="flex items-center gap-2 text-[#8ae88a] text-[14px] font-bold mb-2">
              <CheckCircle size={20} />
              Reward Claimed!
            </div>
            <div className="text-[#c9a872] text-[12px]">{reward.location}</div>
            <div className="mt-3 flex items-center gap-3 p-3 bg-[#1a2a1a] rounded-lg border border-[#3a4a3a]">
              <div className="w-12 h-12 rounded bg-[#3a4a3a] flex items-center justify-center animate-bounce-slow">
                {reward.type === 'currency' && <Gem size={24} className="text-[#00ffcc]" />}
                {reward.type === 'item' && <Gift size={24} className="text-[#ffd66e]" />}
                {reward.type === 'unit' && <Sparkles size={24} className="text-[#b388ff]" />}
              </div>
              <div>
                <div className="text-white text-[14px] font-bold capitalize">
                  {reward.type === 'currency' && (
                    <div className="flex flex-col gap-1">
                      {reward.reward.gems && (
                        <div className="flex items-center gap-1">
                          <Gem size={14} className="text-[#00ffcc]" />
                          <span>{reward.reward.gems} Gems</span>
                        </div>
                      )}
                      {reward.reward.zel && (
                        <div className="flex items-center gap-1">
                          <Zap size={14} className="text-[#ffd66e]" />
                          <span>{reward.reward.zel} Zel</span>
                        </div>
                      )}
                      {reward.reward.karma && (
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-[#b388ff]" />
                          <span>{reward.reward.karma} Karma</span>
                        </div>
                      )}
                    </div>
                  )}
                  {reward.type === 'item' && 'Item Received'}
                  {reward.type === 'unit' && 'New Unit Recruited!'}
                </div>
                <div className="text-[#8a7a6a] text-[11px]">{reward.message}</div>
              </div>
            </div>
            <button
              onClick={resetState}
              className="mt-3 w-full py-2 bg-[#3a5a3a] hover:bg-[#4a7a4a] rounded text-white text-[12px] font-bold"
            >
              Scan Another QR
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="mb-4 p-3 bg-[#3a1a1a] rounded border border-[#6a2a2a]">
            <div className="flex items-center gap-2 text-[#e8a8a8] text-[12px]">
              <AlertCircle size={16} />
              {message}
            </div>
            <button
              onClick={resetState}
              className="mt-2 w-full py-2 bg-[#3a2a2a] hover:bg-[#4a3a3a] rounded text-white text-[12px]"
            >
              Try Again
            </button>
          </div>
        )}

        {state === 'already_claimed' && (
          <div className="mb-4 p-3 bg-[#3a2a1a] rounded border border-[#6a5a2a]">
            <div className="flex items-center gap-2 text-[#e8d8a8] text-[12px]">
              <AlertCircle size={16} />
              This QR has already been claimed this year!
            </div>
            <button
              onClick={resetState}
              className="mt-2 w-full py-2 bg-[#3a3a2a] hover:bg-[#4a4a3a] rounded text-white text-[12px]"
            >
              Scan Another
            </button>
          </div>
        )}

        <div className="mt-4 border-t border-[#3a2820] pt-4">
          <label className="block text-[11px] text-[#8a7a6a] mb-2">Manual Code Entry</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Enter QR code manually"
              className="flex-1 bg-[#1a120a] border border-[#3a2820] rounded py-2 px-3 text-[14px] text-[#c9a872] placeholder-[#4a3a2a] focus:border-[#6a5040] focus:outline-none"
            />
            <button
              onClick={startManualScan}
              disabled={!manualCode.trim() || state === 'processing'}
              className="px-4 py-2 bg-[#4a6020] hover:bg-[#5a7030] rounded text-white text-[12px] font-bold disabled:opacity-50"
            >
              {state === 'processing' ? <Loader2 size={16} className="animate-spin" /> : 'Claim'}
            </button>
          </div>
        </div>

        <div className="mt-4 text-[10px] text-[#6a5a4a]">
          <p>Tip: Point your camera at QR codes placed in real-world locations to claim rewards!</p>
          <p className="mt-1">Each QR can be claimed once per year per account.</p>
        </div>
      </div>
    </div>
  );
}