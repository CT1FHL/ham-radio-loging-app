import { CWConfig, DEFAULT_CW_CONFIG, MORSE_CODE } from '../types/CW';

export class CWProcessor {
  private audioContext: AudioContext;
  private config: CWConfig;
  private analyser: AnalyserNode;
  private mediaStream: MediaStream | null = null;

  constructor(config: CWConfig = DEFAULT_CW_CONFIG) {
    this.audioContext = new AudioContext();
    this.config = config;
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
  }

  private getDitLength(): number {
    return 60 / (50 * this.config.wpm);
  }

  async startDecoding(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);
    } catch (error) {
      throw new Error('Failed to access audio input: ' + error);
    }
  }

  stopDecoding(): void {
    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.mediaStream = null;
  }

  async encodeText(text: string): Promise<AudioBuffer> {
    const ditLength = this.getDitLength();
    const dahLength = ditLength * 3;
    const elementSpace = ditLength;
    const charSpace = ditLength * 3;
    const wordSpace = ditLength * 7;

    const morseText = text.toUpperCase()
      .split('')
      .map(char => MORSE_CODE[char] || '')
      .join(' ');

    let totalLength = 0;
    morseText.split('').forEach(char => {
      switch (char) {
        case '.': totalLength += ditLength + elementSpace; break;
        case '-': totalLength += dahLength + elementSpace; break;
        case ' ': totalLength += charSpace; break;
      }
    });

    const buffer = this.audioContext.createBuffer(
      1,
      totalLength * this.config.sampleRate,
      this.config.sampleRate
    );
    const data = buffer.getChannelData(0);

    let currentTime = 0;
    morseText.split('').forEach(char => {
      const samples = currentTime * this.config.sampleRate;
      
      switch (char) {
        case '.':
          this.generateTone(data, samples, ditLength);
          currentTime += ditLength + elementSpace;
          break;
        case '-':
          this.generateTone(data, samples, dahLength);
          currentTime += dahLength + elementSpace;
          break;
        case ' ':
          currentTime += charSpace;
          break;
      }
    });

    return buffer;
  }

  private generateTone(data: Float32Array, startSample: number, duration: number): void {
    const samples = duration * this.config.sampleRate;
    const frequency = this.config.frequency;
    
    for (let i = 0; i < samples; i++) {
      data[startSample + i] = Math.sin(2 * Math.PI * frequency * i / this.config.sampleRate);
    }
  }

  async detectPitch(): Promise<number> {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    this.analyser.getFloatFrequencyData(dataArray);
    
    let maxValue = -Infinity;
    let maxIndex = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }
    
    return maxIndex * this.config.sampleRate / (2 * bufferLength);
  }
}

export const playAudioBuffer = async (buffer: AudioBuffer): Promise<void> => {
  const audioContext = new AudioContext();
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
  return new Promise((resolve) => {
    source.onended = () => {
      audioContext.close();
      resolve();
    };
  });
};