import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AdminLayout from './components/templates/AdminLayout.jsx';
import Sidebar from './components/organisms/Sidebar.jsx';
import HeaderBar from './components/organisms/HeaderBar.jsx';
import LoginPage from './components/pages/LoginPage.jsx';
import DashboardPage from './components/pages/DashboardPage.jsx';
import StagingQueuePage from './components/pages/StagingQueuePage.jsx';
import ArticleDetailPage from './components/pages/ArticleDetailPage.jsx';

function MainApp() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [healthData, setHealthData] = useState(null);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#94a3b8',
          fontSize: '14px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Initializing SFi Admin Operations...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Determine active tab & article ID from URL pathname for Sidebar & HeaderBar
  const pathname = location.pathname;
  const detailMatch = pathname.match(/^\/(?:queue|articles)\/(\d+)/);
  const activeArticleId = detailMatch ? detailMatch[1] : null;

  let currentTab = 'dashboard';
  let pageTitle = 'Dashboard Overview';
  let breadcrumb = 'Overview';

  if (activeArticleId) {
    currentTab = 'detail';
    pageTitle = `Article #${activeArticleId} Review`;
    breadcrumb = 'Staging Queue';
  } else if (pathname.startsWith('/queue') || pathname.startsWith('/staging')) {
    currentTab = 'staging';
    pageTitle = 'Staging Queue';
    breadcrumb = 'Queue';
  }

  const handleSelectTab = (tab) => {
    if (tab === 'dashboard') {
      navigate('/dashboard');
    } else if (tab === 'staging' || tab === 'queue') {
      navigate('/queue');
    }
  };

  return (
    <AdminLayout
      sidebar={
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          healthData={healthData}
        />
      }
      header={<HeaderBar pageTitle={pageTitle} breadcrumb={breadcrumb} />}
    >
      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              onNavigate={handleSelectTab}
              onUpdateHealth={setHealthData}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <DashboardPage
              onNavigate={handleSelectTab}
              onUpdateHealth={setHealthData}
            />
          }
        />
        <Route
          path="/queue"
          element={
            <StagingQueuePage
              onSelectArticle={(id) => navigate(`/queue/${id}`)}
            />
          }
        />
        <Route
          path="/staging"
          element={
            <StagingQueuePage
              onSelectArticle={(id) => navigate(`/queue/${id}`)}
            />
          }
        />
        <Route
          path="/queue/:id"
          element={
            <ArticleDetailPage
              onBack={() => navigate('/queue')}
            />
          }
        />
        <Route
          path="/articles/:id"
          element={
            <ArticleDetailPage
              onBack={() => navigate('/queue')}
            />
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
