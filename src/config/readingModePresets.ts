import type { PresetModeId, ModeSettings } from '../types/readingModes';

export const PRESET_MODES: Record<PresetModeId, {
  label: string;
  icon: string;
  description: string;
  settings: ModeSettings;
}> = {
  speed: {
    label: 'Speed',
    icon: '⚡',
    description: 'Pure velocity. No pauses, no distractions.',
    settings: {
      windowSize: 1,
      orpEnabled: false,
      focalLine: false,
      peripheralFade: false,
      punctuationPause: false,
      longWordCompensation: false,
      chunkMode: 'fixed',
    },
  },
  focus: {
    label: 'Focus',
    icon: '🎯',
    description: 'Lock your eye. One word, one anchor.',
    settings: {
      windowSize: 1,
      orpEnabled: true,
      focalLine: true,
      peripheralFade: false,
      punctuationPause: true,
      longWordCompensation: true,
      chunkMode: 'fixed',
    },
  },
  read: {
    label: 'Read',
    icon: '📖',
    description: 'Natural reading with context and rhythm.',
    settings: {
      windowSize: 1,
      orpEnabled: false,
      focalLine: false,
      peripheralFade: true,
      punctuationPause: true,
      longWordCompensation: true,
      chunkMode: 'intelligent',
    },
  },
};
