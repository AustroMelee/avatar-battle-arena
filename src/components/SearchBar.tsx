import * as styles from './SearchBar.css';
import React from 'react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  return (
    <form
      className={styles.searchBar}
      onSubmit={e => { e.preventDefault(); onSubmit(); }}
    >
      <input
        className={styles.input}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search the Avatar world…"
        type="text"
      />
      <button className={styles.button} type="submit">
        Search
      </button>
    </form>
  );
}
