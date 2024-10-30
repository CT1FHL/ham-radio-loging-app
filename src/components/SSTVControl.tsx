import React, { useRef, useState } from 'react';
import { Button, Group, Stack, Text, Select, Image } from '@mantine/core';
import { IconPhoto, IconMicrophone, IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import { SSTVProcessor, playAudioBuffer } from '../utils/sstv';
import { SSTVMode } from '../types/SSTV';

const SSTV_MODES: SSTVMode[] = [
  'Martin M1',
  'Martin M2',
  'Scottie S1',
  'Scottie S2',
  'Robot 36',
  'Robot 72'
];

export function SSTVControl() {
  const [mode, setMode] = useState<SSTVMode>('Martin M1');
  const [isReceiving, setIsReceiving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sstv = useRef(new SSTVProcessor());

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setSelectedImage(URL.createObjectURL(file));
        setError('');
      } catch (err) {
        setError('Failed to load image');
        console.error(err);
      }
    }
  };

  const handleTransmit = async () => {
    if (!selectedImage) return;

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const audioBuffer = await sstv.current.encodeImage(new File([blob], 'image.jpg'));
      await playAudioBuffer(audioBuffer);
    } catch (err) {
      setError('Failed to transmit image');
      console.error(err);
    }
  };

  const toggleReceiving = async () => {
    try {
      if (isReceiving) {
        sstv.current.stopReceiving();
        setIsReceiving(false);
      } else {
        await sstv.current.startReceiving();
        setIsReceiving(true);
      }
      setError('');
    } catch (err) {
      setError('Failed to access audio input');
      console.error(err);
    }
  };

  return (
    <Stack spacing="md">
      <Group>
        <Select
          label="SSTV Mode"
          data={SSTV_MODES}
          value={mode}
          onChange={(value) => setMode(value as SSTVMode)}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImageSelect}
        />
      </Group>

      <Group>
        <Button
          leftSection={<IconPhoto size={16} />}
          onClick={() => fileInputRef.current?.click()}
        >
          Select Image
        </Button>
        <Button
          leftSection={<IconPlayerPlay size={16} />}
          onClick={handleTransmit}
          disabled={!selectedImage}
        >
          Transmit
        </Button>
        <Button
          leftSection={isReceiving ? <IconPlayerStop size={16} /> : <IconMicrophone size={16} />}
          onClick={toggleReceiving}
          color={isReceiving ? 'red' : 'blue'}
        >
          {isReceiving ? 'Stop Receiving' : 'Start Receiving'}
        </Button>
      </Group>

      {error && <Text color="red" size="sm">{error}</Text>}

      {selectedImage && (
        <Image
          src={selectedImage}
          alt="Selected for SSTV"
          width={320}
          height={256}
          fit="contain"
        />
      )}
    </Stack>
  );
}