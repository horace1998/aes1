import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Dashboard from '@/pages/Dashboard';
import Onboarding from '@/pages/Onboarding';
import Goals from '@/pages/Goals';
import Profile from '@/pages/Profile';
import MilestoneGallery from '@/pages/MilestoneGallery';
import Feed from '@/pages/Feed';
import Tasks from '@/pages/Tasks';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #ede9f7 0%, #ddf2f0 40%, #f5e8f7 70%, #e8f0fb 100%)' }}>
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SYNKIFY</h1>
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/gallery" element={<MilestoneGallery />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App