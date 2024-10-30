export interface QSO {
  id: string;
  date: Date;
  time: string;
  callsign: string;
  frequency: number;
  mode: string;
  rstSent: string;
  rstReceived: string;
  notes: string;
  band: string;
  power: number;
}