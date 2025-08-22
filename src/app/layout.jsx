import { Inter } from 'next/font/google';
import SideBar from './components/SideBar';
import styles from './layout.module.scss';
import './globals.scss';

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Dashboard CMS',
  description: 'Gerenciador de conteúdo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={inter.variable}>
        <div className={styles.container}>
          <SideBar />
          <main className={styles.content}>{children}</main>
        </div>
      </body>
    </html>
  );
}
