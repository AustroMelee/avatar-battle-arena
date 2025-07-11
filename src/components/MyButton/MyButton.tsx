import React from 'react';
import * as styles from './MyButton.css';

type MyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function MyButton({ children, ...props }: MyButtonProps) {
  return (
    <button className={styles.button} {...props}>
      {children}
    </button>
  );
}
