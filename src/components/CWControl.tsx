import React, { useRef, useState } from 'react';
import { Button, Group, Stack, Text, NumberInput, TextInput } from '@mantine/core';
import { IconPlayerPlay, IconPlayerStop, IconMicrophone } from '@tabler/icons-react';
import { CWProcessor, playAudioBuffer } from '../utils/cw';
import { CWConfig, DEFAULT_CW_CONFIG } from '../types/CW';

export function CWControl() {
  const [text, setText] = useState('');
  const [wpm, setWpm] = useState(DEFAULT_CW_CONFIG.wpm);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedText, setDecodedText] = useState('');
  const [error, setError] = useState('');
  const cw = useRef(new CWProcessor());

  const handleTransmit = async () => {
    if (!text) return;

    try {
      const config: CWConfig = {
        ...DEFAULT_CW_CONFIG,
        wpm,
      };
      cw.current = new CWProcessor(config);
      const audioBuffer = await cw.current.encodeText(text);
      await playAudioBuffer(audioBuffer);
      setError('');
    } catch (err) {
      setError('Failed to transmit CW');
      console.error(err);
    }
  };

  const toggleDecoding = async () => {
    try {
      if (isDecoding) {
        cw.current.stopDecoding();
        setIsDecoding(false);
      } else {
        await cw.current.startDecoding();
        setIsDecoding(true);
        // Start pitch detection loop
        const detectLoop = async () => {
          if (!isDecoding) return;
          const pitch = await cw.current.detectPitch();
          // Implement morse code detection logic based on pitch
          requestAnimationFrame(detectLoop);
        };
        detectLoop();
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
        <NumberInput
          label="Speed (WPM)"
          value={wpm}
          onChange={(value) => setWpm(Number(value))}
          min={5}
          max={50}
          step={1}
        />
      </Group>

      <TextInput
        label="Text to Send"
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        placeholder="Enter text to transmit"
      />

      <Group>
        <Button
          leftSection={<IconPlayerPlay size={16} />}
          onClick={handleTransmit}
          disabled={!text}
        >
          Send CW
        </Button>
        <Button
          leftSection={isDecoding ? <IconPlayerStop size={16} /> : <IconMicrophone size={16} />}
          onClick={toggleDecoding}
          color={isDecoding ? 'red' : 'blue'}
        >
          {isDecoding ? 'Stop Decoding' : 'Start Decoding'}
        </Button>
      </Group>

      {error && <Text color="red" size="sm">{error}</Text>}

      {isDecoding && (
        <Stack>
          <Text size="sm" weight={500}>Decoded Text:</Text>
          <Text>{decodedText}</Text>
        </Stack>
      )}
    </Stack>
  );
}