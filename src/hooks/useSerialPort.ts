import { useState, useCallback } from 'react';
import { SerialConfig, DEFAULT_SERIAL_CONFIG } from '../types/Radio';

export function useSerialPort() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(async (config: SerialConfig = DEFAULT_SERIAL_CONFIG) => {
    if (!navigator.serial) {
      throw new Error('Web Serial API is not supported in this browser');
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open(config);
      setPort(port);
      setConnected(true);
      return port;
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (port) {
      try {
        await port.close();
        setPort(null);
        setConnected(false);
      } catch (error) {
        console.error('Failed to disconnect:', error);
        throw error;
      }
    }
  }, [port]);

  const sendCommand = useCallback(async (command: string) => {
    if (!port) {
      throw new Error('Port is not connected');
    }

    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();
    
    try {
      await writer.write(encoder.encode(command + '\r'));
    } finally {
      writer.releaseLock();
    }
  }, [port]);

  const readResponse = useCallback(async (): Promise<string> => {
    if (!port) {
      throw new Error('Port is not connected');
    }

    const reader = port.readable.getReader();
    const decoder = new TextDecoder();
    let response = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        response += decoder.decode(value);
        if (response.includes('\r')) break;
      }
      return response.trim();
    } finally {
      reader.releaseLock();
    }
  }, [port]);

  return {
    port,
    connected,
    connect,
    disconnect,
    sendCommand,
    readResponse,
  };
}