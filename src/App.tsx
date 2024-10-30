import React from 'react';
import { MantineProvider, AppShell, Title, Container, Stack, Tabs } from '@mantine/core';
import { LogEntry } from './components/LogEntry';
import { LogTable } from './components/LogTable';
import { SSTVControl } from './components/SSTVControl';
import { CWControl } from './components/CWControl';

function App() {
  return (
    <MantineProvider>
      <AppShell>
        <Container size="xl">
          <Stack gap="md">
            <Title order={1}>Ham Radio Logger</Title>
            <Tabs defaultValue="log">
              <Tabs.List>
                <Tabs.Tab value="log">Contact Log</Tabs.Tab>
                <Tabs.Tab value="sstv">SSTV</Tabs.Tab>
                <Tabs.Tab value="cw">CW</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="log">
                <Stack gap="md" mt="md">
                  <LogEntry />
                  <LogTable />
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="sstv">
                <Stack gap="md" mt="md">
                  <SSTVControl />
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="cw">
                <Stack gap="md" mt="md">
                  <CWControl />
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Container>
      </AppShell>
    </MantineProvider>
  );
}