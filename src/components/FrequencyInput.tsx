import React from 'react';
import { NumberInput, Select } from '@mantine/core';
import { bandPlans } from '../constants/bandPlan';

interface FrequencyInputProps {
  onFrequencyChange: (freq: number) => void;
  onBandChange: (band: string) => void;
  onModeChange: (mode: string) => void;
}

export function FrequencyInput({ onFrequencyChange, onBandChange, onModeChange }: FrequencyInputProps) {
  const handleBandChange = (band: string) => {
    const selectedBand = bandPlans.find(b => b.band === band);
    if (selectedBand) {
      onBandChange(band);
      onFrequencyChange(selectedBand.minFreq);
      onModeChange(selectedBand.defaultMode);
    }
  };

  const handleFrequencyChange = (freq: number) => {
    onFrequencyChange(freq);
    const selectedBand = bandPlans.find(b => freq >= b.minFreq && freq <= b.maxFreq);
    if (selectedBand) {
      onBandChange(selectedBand.band);
    }
  };

  return (
    <>
      <NumberInput
        required
        label="Frequency (MHz)"
        name="frequency"
        placeholder="14.200"
        precision={3}
        min={1.8}
        max={148.0}
        step={0.001}
        onChange={(value) => handleFrequencyChange(Number(value))}
      />
      <Select
        required
        label="Band"
        name="band"
        data={bandPlans.map(b => b.band)}
        onChange={(value) => handleBandChange(value as string)}
      />
    </>
  );
}