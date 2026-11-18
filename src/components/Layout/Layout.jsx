import Header from '../Header/Header.jsx';
import styles from './Layout.module.css';

function Layout({ children }) {
  return (
    <div className={styles.shell} data-testid="app-shell">
      <Header />
      <main className={styles.main} data-testid="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
