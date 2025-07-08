interface NarrativeLogEntryProps {
  text: string;
  align?: 'left' | 'center' | 'right';
  actor?: string;
  turn?: number;
  color?: string;
}

export default function NarrativeLogEntry({ text, align = "center", actor, turn, color }: NarrativeLogEntryProps) {
  return (
    <div
      style={{
        textAlign: align,
        margin: '0.5em 0',
        padding: '1em',
        borderRadius: 8,
        background: color || '#334155',
        color: '#fff',
        maxWidth: 500,
        marginLeft: align === 'left' ? 0 : 'auto',
        marginRight: align === 'right' ? 0 : 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {actor && <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>{actor}</div>}
        {typeof turn === 'number' && (
          <div style={{ fontSize: 14, color: '#cbd5e1', fontWeight: 600, marginLeft: 12 }}>T{turn}</div>
        )}
      </div>
      <div style={{ fontSize: 16, fontStyle: 'italic', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{text}</div>
    </div>
  );
} 