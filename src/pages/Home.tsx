import * as styles from './Home.css';

const pageLinks = [
  { label: 'Search', href: '/search' },
  { label: 'Characters', href: '/characters' },
  { label: 'Bending Arts', href: '/bending' },
  { label: 'Locations', href: '/locations' },
  { label: 'Fauna', href: '/fauna' },
  { label: 'Food', href: '/food' },
  { label: 'Spirit World', href: '/spirit-world' },
];

export default function Home() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Austros ATLA World Encyclopedia</h1>
      <p className={styles.subtitle}>
        Welcome! Explore the world of Avatar through characters, bending arts, locations, fauna, and more.
      </p>
      <div className={styles.linkGrid}>
        {pageLinks.map((item) => (
          <a key={item.href} href={item.href} className={styles.pageLink}>
            {item.label}
          </a>
        ))}
      </div>
    </main>
  );
}
