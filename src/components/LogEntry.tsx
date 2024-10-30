import React, { useState } from 'react';
import { TextInput, NumberInput, Select, Button, Grid, Stack } from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { useLogStore } from '../store/useLogStore';
import { FrequencyInput } from './FrequencyInput';
import { RadioControl } from './RadioControl';

const modes = ['SSB', 'CW', 'FM', 'FT8', 'FT4', 'RTTY', 'PSK31'];

export function LogEntry() {
  const addLog = useLogStore((state) => state.addLog);
  const [frequency, setFrequency] = useState<number>(14.200);
  const [band, setBand] = useState<string>('20m');
  const [mode, setMode] = useState<string>('SSB');
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addLog({
      date: new Date(formData.get('date') as string),
      time: formData.get('time') as string,
      callsign: (formData.get('callsign') as string).toUpperCase(),
      frequency,
      mode,
      rstSent: formData.get('rstSent') as string,
      rstReceived: formData.get('rstReceived') as string,
      notes: formData.get('notes') as string,
      band,
      power: Number(formData.get('power')),
    });
    
    e.currentTarget.reset();
  };

  return (
    <Stack>
      <RadioControl
        onFrequencyChange={setFrequency}
        onModeChange={setMode}
      />
      <form onSubmit={handleSubmit}>
        <Grid>
          <Grid.Col span={6}>
            <DateInput
              required
              label="Date"
              name="date"
              defaultValue={new Date()}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TimeInput
              required
              label="Time"
              name="time"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              required
              label="Callsign"
              name="callsign"
              placeholder="Enter callsign"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <FrequencyInput
              onFrequencyChange={setFrequency}
              onBandChange={setBand}
              onModeChange={setMode}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              required
              label="Mode"
              name="mode"
              data={modes}
              value={mode}
              onChange={(value) => setMode(value as string)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              required
              label="RST Sent"
              name="rstSent"
              placeholder="599"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              required
              label="RST Received"
              name="rstReceived"
              placeholder="599"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              required
              label="Power (W)"
              name="power"
              placeholder="100"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Notes"
              name="notes"
              placeholder="Additional information"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Button type="submit" fullWidth>
              Log Contact
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Stack>
  );
}