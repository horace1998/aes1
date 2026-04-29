import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import PageTransition from '@/components/PageTransition';
import { NavActionProvider } from '@/lib/NavActionContext';
import RootChrome from '@/components/RootChrome';

import Dashboard from '@/pages/Dashboard';
import Onboarding from '@/pages/Onboarding';
import Goals from '@/pages/Goals';
import Profile from '@/pages/Profile';
import MilestoneGallery from '@/pages/MilestoneGallery';
import Feed from '@/pages/Feed';
import Tasks from '@/pages/Tasks';
import Missions from '@/pages/Missions';
import AdminModeration from '@/pages/AdminModeration';
import PublicProfile from '@/pages/PublicProfile';
import SupportCircle from '@/pages/SupportCircle';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
        <Route path="/goals" element={<PageTransition><Goals /></PageTransition>} />
        
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><MilestoneGallery /></PageTransition>} />
        <Route path="/feed" element={<PageTransition><Feed /></PageTransition>} />
        <Route path="/tasks" element={<PageTransition><Tasks /></PageTransition>} />
        <Route path="/missions" element={<PageTransition><Missions /></PageTransition>} />
        <Route path="/admin/moderation" element={<PageTransition><AdminModeration /></PageTransition>} />
        <Route path="/u/:email" element={<PageTransition><PublicProfile /></PageTransition>} />
        <Route path="/circle/:id" element={<PageTransition><SupportCircle /></PageTransition>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="editorial-eyebrow mb-3">Est. MMXXVI</p>
          <h1 className="font-display text-5xl tracking-wide text-foreground mb-1" style={{ fontWeight: 700 }}>SYNKIFY</h1>
          <p className="editorial-italic text-sm text-muted-foreground mb-6">A Diary of Devotion</p>
          <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto"></div>
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
    <>
      <div className="aurora-bg" aria-hidden="true" />
      <AnimatedRoutes />
      <RootChrome />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <NavActionProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </NavActionProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App