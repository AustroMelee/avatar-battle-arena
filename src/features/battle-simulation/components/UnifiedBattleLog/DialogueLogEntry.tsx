interface DialogueLogEntryProps {
  actor: string;
  text: string;
  align: 'left' | 'right' | 'center';
  color?: string;
  turn?: number;
}

export default function DialogueLogEntry({ actor, text, align, color, turn }: DialogueLogEntryProps) {
  return (
    <div
      style={{
        textAlign: align,
        margin: '0.5em 0',
        padding: '1em',
        borderRadius: 8,
        background: color || (align === 'left' ? '#1e293b' : '#7f1d1d'),
        color: '#fff',
        maxWidth: 500,
        marginLeft: align === 'left' ? 0 : 'auto',
        marginRight: align === 'right' ? 0 : 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>{actor}</div>
        {typeof turn === 'number' && (
          <div style={{ fontSize: 14, color: '#cbd5e1', fontWeight: 600, marginLeft: 12 }}>T{turn}</div>
        )}
      </div>
      <div style={{ fontSize: 16 }}>{text}</div>
    </div>
  );
} 