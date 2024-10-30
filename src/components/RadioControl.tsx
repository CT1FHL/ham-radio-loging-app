import React, { useEffect, useState } from 'react';
import { Button, Group, Text, Select } from '@mantine/core';
import { useSerialPort } from '../hooks/useSerialPort';
import { SerialConfig, DEFAULT_SERIAL_CONFIG } from '../types/Radio';

interface RadioControlProps {
  onFrequencyChange: (freq: number) => void;
  onModeChange: (mode: string) => void;
}

const BAUD_RATES = ['4800', '9600', '19200', '38400'];

export function RadioControl({ onFrequencyChange, onModeChange }: RadioControlProps) {
  const { connected, connect, disconnect, sendCommand, readResponse } = useSerialPort();
  const [baudRate, setBaudRate] = useState('9600');
  const [error, setError] = useState<string>('');

  const handleConnect = async () => {
    try {
      setError('');
      const config: SerialConfig = {
        ...DEFAULT_SERIAL_CONFIG,
        baudRate: parseInt(baudRate, 10),
      };
      await connect(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  const pollRadioState = async () => {
    if (!connected) return;

    try {
      // Example commands - adjust these based on your radio's protocol
      await sendCommand('FREQ?');
      const freqResponse = await readResponse();
      const frequency = parseFloat(freqResponse);
      if (!isNaN(frequency)) {
        onFrequencyChange(frequency);
      }

      await sendCommand('MODE?');
      const modeResponse = await readResponse();
      onModeChange(modeResponse);
    } catch (err) {
      console.error('Error polling radio:', err);
    }
  };

  useEffect(() => {
    if (connected) {
      const interval = setInterval(pollRadioState, 1000);
      return () => clearInterval(interval);
    }
  }, [connected]);

  return (
    <div>
      <Group>
        <Select
          label="Baud Rate"
          data={BAUD_RATES}
          value={baudRate}
          onChange={(value) => setBaudRate(value || '9600')}
          disabled={connected}
        />
        <Button
          onClick={connected ? disconnect : handleConnect}
          color={connected ? 'red' : 'blue'}
          mt={24}
        >
          {connected ? 'Disconnect' : 'Connect to Radio'}
        </Button>
      </Group>
      {error && <Text color="red" size="sm" mt="xs">{error}</Text>}
      <Text size="sm" mt="xs">
        Status: {connected ? 'Connected' : 'Disconnected'}
      </Text>
    </div>
  );
}