import Link from 'next/link';
import styles from './style.module.scss';

export default function SideBar() {
    return (
        <aside className={styles.sidebar}>
            <h2>Dashboard</h2>
            <nav>
                <Link href="/">Home</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/concessionaria">Concessionaria</Link>
            </nav>
        </aside>
    );
}