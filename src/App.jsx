import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import AuthGate from './features/auth/AuthGate.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import HomePage from './pages/HomePage.jsx';
import ExperienceDetailPage from './pages/ExperienceDetailPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/esperienze/:id" element={<ExperienceDetailPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </AuthGate>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
