import styles from './BattleNarrativeTurn.module.css';

export interface BattleNarrativeTurnProps {
  actor: string;
  narrative: string | string[];
  type: string;
  playerSide: 'left' | 'right';
  icon: string; // Path to image asset
}

/**
 * @description Displays a single, clean narrative turn for the user-facing battle log.
 */
export function BattleNarrativeTurn({ actor, narrative, type, playerSide, icon }: BattleNarrativeTurnProps) {
  const displayText = Array.isArray(narrative) ? narrative.join(' ') : narrative;

  const getActorStyle = (charName: string): string => {
    if (playerSide === 'left') return styles.p1Actor;
    if (playerSide === 'right') return styles.p2Actor;

    // System and Narrator styles
    switch (charName.toLowerCase()) {
      case 'narrator':
      case 'system':
      case 'environment':
        return styles.system;
      default:
        return styles.default;
    }
  };

  // Don't render if narrative is empty or just whitespace
  if (!displayText || !displayText.trim()) {
    return null;
  }

  return (
    <div className={
      `${styles.container} ` +
      (playerSide === 'left' ? styles.p1 + ' ' : '') +
      (playerSide === 'right' ? styles.p2 + ' ' : '') +
      (playerSide === 'left' ? styles.leftAlign + ' ' : playerSide === 'right' ? styles.rightAlign + ' ' : '') +
      (playerSide !== 'left' && playerSide !== 'right' ? styles.system + ' ' + styles.centerAlign + ' ' : '') +
      (type ? styles[type.toLowerCase()] : '')
    }>
      <div className={`${styles.actor} ${getActorStyle(actor)} ${styles.largeActor}`}>
        <img src={icon} alt={`${actor} icon`} className={styles.iconImgLarge} />
        <span className={styles.actorNameLarge}>{actor}:</span>
      </div>
      <p className={styles.narrativeText}>{displayText}</p>
    </div>
  );
} 