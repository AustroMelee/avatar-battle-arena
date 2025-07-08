import React from 'react';
import styles from './TechnicalLogEntry.module.css';

interface TechnicalLogEntryProps {
  text: string;
  align?: 'center';
  title?: string;
  turn?: number;
}

export default function TechnicalLogEntry({ text, align = 'center', title = 'System', turn }: TechnicalLogEntryProps) {
  return (
    <div
      style={{
        textAlign: align,
        margin: '0.5em 0',
        padding: '1em',
        borderRadius: 8,
        background: '#22223b',
        color: '#fff',
        maxWidth: 500,
        marginLeft: 'auto',
        marginRight: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>{title}</div>
        {typeof turn === 'number' && (
          <div style={{ fontSize: 14, color: '#cbd5e1', fontWeight: 600, marginLeft: 12 }}>T{turn}</div>
        )}
      </div>
      <div style={{ fontSize: 16 }}>{text}</div>
    </div>
  );
} 