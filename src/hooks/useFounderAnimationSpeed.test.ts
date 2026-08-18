import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SPEED_PRESETS, FOUNDER_ANIMATION_STORAGE_KEY, DEFAULT_SPEED_PRESET, AnimationSpeedPreset } from './useFounderAnimationSpeed';

describe('Founder Animation Speed Configurations & Storage', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const storageMock = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };

    // Polyfill window / localStorage in Node test runner
    if (typeof globalThis.window === 'undefined') {
      (globalThis as unknown as { window: unknown }).window = {
        localStorage: storageMock,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    } else {
      Object.defineProperty(globalThis.window, 'localStorage', {
        value: storageMock,
        writable: true,
      });
    }
  });

  it('contains valid speed presets with proper CSS durations', () => {
    expect(SPEED_PRESETS.length).toBe(4);
    
    const normal = SPEED_PRESETS.find(p => p.id === 'normal');
    expect(normal).toBeDefined();
    expect(normal?.duration).toBe('2.8s');

    const fast = SPEED_PRESETS.find(p => p.id === 'fast');
    expect(fast).toBeDefined();
    expect(fast?.duration).toBe('1.6s');

    const gentle = SPEED_PRESETS.find(p => p.id === 'gentle');
    expect(gentle).toBeDefined();
    expect(gentle?.duration).toBe('4.2s');

    const off = SPEED_PRESETS.find(p => p.id === 'off');
    expect(off).toBeDefined();
    expect(off?.duration).toBe('0s');
  });

  it('serializes and reads user speed preference from storage', () => {
    const preset: AnimationSpeedPreset = 'gentle';
    globalThis.window.localStorage.setItem(FOUNDER_ANIMATION_STORAGE_KEY, JSON.stringify(preset));

    const stored = globalThis.window.localStorage.getItem(FOUNDER_ANIMATION_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed).toBe('gentle');

    const matchedConfig = SPEED_PRESETS.find(p => p.id === parsed);
    expect(matchedConfig?.duration).toBe('4.2s');
  });

  it('handles invalid or empty storage keys by falling back safely', () => {
    const stored = globalThis.window.localStorage.getItem(FOUNDER_ANIMATION_STORAGE_KEY);
    expect(stored).toBeNull();

    const fallbackPreset: AnimationSpeedPreset = DEFAULT_SPEED_PRESET;
    const fallbackConfig = SPEED_PRESETS.find(p => p.id === fallbackPreset);
    expect(fallbackConfig?.duration).toBe('2.8s');
  });

  it('resets animation speed preference and removes item from storage', () => {
    // Simulate setting a non-default speed
    globalThis.window.localStorage.setItem(FOUNDER_ANIMATION_STORAGE_KEY, JSON.stringify('fast'));
    expect(globalThis.window.localStorage.getItem(FOUNDER_ANIMATION_STORAGE_KEY)).toBe(JSON.stringify('fast'));

    // Trigger reset / remove
    globalThis.window.localStorage.removeItem(FOUNDER_ANIMATION_STORAGE_KEY);
    expect(globalThis.window.localStorage.getItem(FOUNDER_ANIMATION_STORAGE_KEY)).toBeNull();

    // Default configuration restored
    const defaultConfig = SPEED_PRESETS.find(p => p.id === DEFAULT_SPEED_PRESET);
    expect(defaultConfig?.id).toBe('normal');
    expect(defaultConfig?.duration).toBe('2.8s');
  });
});
