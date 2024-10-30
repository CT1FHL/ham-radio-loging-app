import React from 'react';
import { Table, ActionIcon, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useLogStore } from '../store/useLogStore';

export function LogTable() {
  const logs = useLogStore((state) => state.logs);
  const deleteLog = useLogStore((state) => state.deleteLog);

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Time</Table.Th>
          <Table.Th>Callsign</Table.Th>
          <Table.Th>Frequency</Table.Th>
          <Table.Th>Mode</Table.Th>
          <Table.Th>Band</Table.Th>
          <Table.Th>RST Sent</Table.Th>
          <Table.Th>RST Rcvd</Table.Th>
          <Table.Th>Power</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {logs.map((log) => (
          <Table.Tr key={log.id}>
            <Table.Td>{log.date.toLocaleDateString()}</Table.Td>
            <Table.Td>{log.time}</Table.Td>
            <Table.Td>{log.callsign}</Table.Td>
            <Table.Td>
              <Text>{log.frequency.toFixed(3)} MHz</Text>
            </Table.Td>
            <Table.Td>{log.mode}</Table.Td>
            <Table.Td>{log.band}</Table.Td>
            <Table.Td>{log.rstSent}</Table.Td>
            <Table.Td>{log.rstReceived}</Table.Td>
            <Table.Td>{log.power}W</Table.Td>
            <Table.Td>
              <ActionIcon
                color="red"
                onClick={() => deleteLog(log.id)}
                variant="subtle"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}