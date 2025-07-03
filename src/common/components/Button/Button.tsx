import styles from './Button.module.css';

/**
 * @description Props for the common Button component.
 */
export type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

/**
 * @description A reusable button component for consistent styling and behavior.
 * @param {ButtonProps} props The props for the component.
 * @returns {JSX.Element} A button element.
 */
export function Button({ children, onClick, disabled = false }: ButtonProps) {
  return (
    <button className={styles.button} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
} 