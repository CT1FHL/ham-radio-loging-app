export class SSTVProcessor {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private mediaStream: MediaStream | null = null;
  
  constructor() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
  }

  async startReceiving(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);
    } catch (error) {
      throw new Error('Failed to access audio input: ' + error);
    }
  }

  stopReceiving(): void {
    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.mediaStream = null;
  }

  async encodeImage(imageFile: File): Promise<AudioBuffer> {
    const img = await createImageBitmap(imageFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = 320;
    canvas.height = 256;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return this.generateSSTVAudio(imageData);
  }

  private async generateSSTVAudio(imageData: ImageData): Promise<AudioBuffer> {
    const duration = 114; // Martin M1 mode duration in seconds
    const sampleRate = 44100;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // VIS code for Martin M1
    const visCode = 0x2C;
    let sample = 0;

    // Leader tone (300ms of 1900 Hz)
    for (let i = 0; i < 0.3 * sampleRate; i++) {
      data[sample++] = Math.sin(2 * Math.PI * 1900 * i / sampleRate);
    }

    // VIS start bit
    for (let i = 0; i < 0.03 * sampleRate; i++) {
      data[sample++] = Math.sin(2 * Math.PI * 1200 * i / sampleRate);
    }

    // VIS code bits
    for (let bit = 0; bit < 8; bit++) {
      const freq = (visCode & (1 << bit)) ? 1100 : 1300;
      for (let i = 0; i < 0.03 * sampleRate; i++) {
        data[sample++] = Math.sin(2 * Math.PI * freq * i / sampleRate);
      }
    }

    // VIS stop bit
    for (let i = 0; i < 0.03 * sampleRate; i++) {
      data[sample++] = Math.sin(2 * Math.PI * 1200 * i / sampleRate);
    }

    // Image data
    const { width, height, data: pixels } = imageData;
    for (let y = 0; y < height; y++) {
      // Sync pulse (1200 Hz)
      for (let i = 0; i < 0.004 * sampleRate; i++) {
        data[sample++] = Math.sin(2 * Math.PI * 1200 * i / sampleRate);
      }

      // Scan line
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
        const freq = 1500 + (brightness / 255) * 800;

        for (let i = 0; i < 0.000532 * sampleRate; i++) {
          data[sample++] = Math.sin(2 * Math.PI * freq * i / sampleRate);
        }
      }
    }

    return buffer;
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