export interface BandPlan {
  band: string;
  minFreq: number;
  maxFreq: number;
  defaultMode: string;
}

export const bandPlans: BandPlan[] = [
  { band: '160m', minFreq: 1.8, maxFreq: 2.0, defaultMode: 'CW' },
  { band: '80m', minFreq: 3.5, maxFreq: 4.0, defaultMode: 'SSB' },
  { band: '40m', minFreq: 7.0, maxFreq: 7.3, defaultMode: 'SSB' },
  { band: '20m', minFreq: 14.0, maxFreq: 14.35, defaultMode: 'SSB' },
  { band: '15m', minFreq: 21.0, maxFreq: 21.45, defaultMode: 'SSB' },
  { band: '10m', minFreq: 28.0, maxFreq: 29.7, defaultMode: 'SSB' },
  { band: '6m', minFreq: 50.0, maxFreq: 54.0, defaultMode: 'SSB' },
  { band: '2m', minFreq: 144.0, maxFreq: 148.0, defaultMode: 'FM' },
];