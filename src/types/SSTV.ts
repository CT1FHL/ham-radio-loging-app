export type SSTVMode = 'Martin M1' | 'Martin M2' | 'Scottie S1' | 'Scottie S2' | 'Robot 36' | 'Robot 72';

export interface SSTVConfig {
  mode: SSTVMode;
  sampleRate: number;
  frequency: number;
}

export const DEFAULT_SSTV_CONFIG: SSTVConfig = {
  mode: 'Martin M1',
  sampleRate: 44100,
  frequency: 1500
};