import { useLocalStorage } from './useLocalStorage';

export type AnimationSpeedPreset = 'fast' | 'normal' | 'gentle' | 'off';

export interface SpeedConfig {
  id: AnimationSpeedPreset;
  label: string;
  shortLabel: string;
  duration: string; // e.g. '1.6s', '2.8s', '4.2s', '0s'
}

export const SPEED_PRESETS: SpeedConfig[] = [
  { id: 'fast', label: 'Dynamic Pulse', shortLabel: '1.6s Dynamic', duration: '1.6s' },
  { id: 'normal', label: 'Balanced Pulse', shortLabel: '2.8s Balanced', duration: '2.8s' },
  { id: 'gentle', label: 'Gentle Pulse', shortLabel: '4.2s Gentle', duration: '4.2s' },
  { id: 'off', label: 'Static (No Glow)', shortLabel: 'Off', duration: '0s' },
];

export const FOUNDER_ANIMATION_STORAGE_KEY = 'dcp_founder_glow_speed';

export const DEFAULT_SPEED_PRESET: AnimationSpeedPreset = 'normal';

export function useFounderAnimationSpeed() {
  const [speedPreset, setSpeedPreset, removeSpeedPreset] = useLocalStorage<AnimationSpeedPreset>(
    FOUNDER_ANIMATION_STORAGE_KEY,
    DEFAULT_SPEED_PRESET
  );

  const resetToDefault = () => {
    removeSpeedPreset();
  };

  const currentConfig = SPEED_PRESETS.find(p => p.id === speedPreset) || SPEED_PRESETS[1];
  const isOff = speedPreset === 'off';

  return {
    speedPreset,
    setSpeedPreset,
    resetToDefault,
    duration: currentConfig.duration,
    currentConfig,
    presets: SPEED_PRESETS,
    isOff
  };
}
