import React from 'react';
import * as styles from './SearchBar.css';

type SearchBarProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function SearchBar(props: SearchBarProps) {
  return <input className={styles.searchBar} {...props} />;
}
