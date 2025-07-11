import * as styles from './Navbar.css';

const navItems = [
  { label: 'Search', href: '/search' },
  { label: 'Characters', href: '/characters' },
  { label: 'Bending', href: '/bending' },
  { label: 'Locations', href: '/locations' },
  { label: 'Fauna', href: '/fauna' },
  { label: 'Food', href: '/food' },
  { label: 'Spirit World', href: '/spirit-world' },
];

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <span className={styles.logo}>Austros ATLA World Encyclopedia</span>
      {navItems.map((item) => (
        <a key={item.href} href={item.href} className={styles.navLink}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
