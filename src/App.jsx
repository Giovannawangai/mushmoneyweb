import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/lib/theme';
import Layout from '@/components/Layout';
import BookLayout from '@/components/book/BookLayout';
import TabStack from '@/components/TabStack';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const AddExpense = lazy(() => import('@/pages/AddExpense'));
const AddIncome = lazy(() => import('@/pages/AddIncome'));
const History = lazy(() => import('@/pages/History'));
const Import = lazy(() => import('@/pages/Import'));
const Categories = lazy(() => import('@/pages/Categories'));
const Settings = lazy(() => import('@/pages/Settings'));
const Pay = lazy(() => import('@/pages/Pay'));
const Savings = lazy(() => import('@/pages/Savings'));
const Section = lazy(() => import('@/pages/Section'));
const BookHome = lazy(() => import('@/pages/book/BookHome'));
const ClientCard = lazy(() => import('@/pages/book/ClientCard'));
const AddVisit = lazy(() => import('@/pages/book/AddVisit'));
const OwnerDashboard = lazy(() => import('@/pages/book/OwnerDashboard'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const DeleteAccount = lazy(() => import('@/pages/DeleteAccount'));

const RouteFallback = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<TabStack />}>
              <Route index element={<Dashboard />} />
              <Route path="add" element={<AddExpense />} />
              <Route path="add-income" element={<AddIncome />} />
              <Route path="import" element={<Import />} />
              <Route path="settings" element={<Settings />} />
              <Route path="section" element={<Section />} />
              <Route path="delete-account" element={<DeleteAccount />} />
            </Route>
            <Route path="/history" element={<TabStack />}>
              <Route index element={<History />} />
            </Route>
            <Route path="/categories" element={<TabStack />}>
              <Route index element={<Categories />} />
            </Route>
            <Route path="/pay" element={<TabStack />}>
              <Route index element={<Pay />} />
            </Route>
            <Route path="/savings" element={<TabStack />}>
              <Route index element={<Savings />} />
            </Route>
          </Route>
          <Route path="/book" element={<BookLayout />}>
            <Route element={<TabStack />}>
              <Route index element={<BookHome />} />
              <Route path="client/:id" element={<ClientCard />} />
              <Route path="add-visit" element={<AddVisit />} />
            </Route>
            <Route path="dashboard" element={<TabStack />}>
              <Route index element={<OwnerDashboard />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App