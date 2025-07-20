import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "../components/Navbar";
import LandingPage from "../components/LandingPage";
import ProfilePage from "../components/ProfilePage";
import HRadminPage from "../components/HRadminPage";
import InputForm from "../components/InputForm";
import EditEmployee from "../components/EditEmployee";
import SignupForm from "../components/SignupForm";
import LoginForm from "../components/LoginForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import ResetPasswordForm from "../components/ResetPasswordForm";
import VerifyOTPForm from "../components/VerifyOTPForm";
import DocManager from "../components/Doc/DocManager";
import AnalyticsDashboard from "../components/Analytics/AnalyticsDashboard";
import ChatPage from "../components/chat/ChatPage";
import CallPage from "../components/chat/CallPage";
import OnboardingPage from "../components/onboarding/OnboardingPage";
import AdminVerificationPage from "../components/onboarding/AdminVerificationPage";
import InviteSignupForm from "../components/InviteSignupForm";
import SuperAdminDashboard from "../components/SuperAdminDashboard";
import PremiumPayment from "../components/PremiumPayment";
import ZoomMeeting from "../components/ZoomMeeting";
import NotFound from "../components/NotFound";
import NearbyPeople from "../components/Nearby/Nearby";
import CompanyAdminPanel from "../components/CompanyAdminPanel";
import ProtectedRoute from "../components/ProtectedRoute";

// Pages
import AttendancePage from "./pages/AttendancePage";
import AdminAttendancePage from "./pages/AdminAttendancePage";

// Store
import useAuthStore from "./store/authStore";
// import Footer from "../components/Footer";

const App = () => {
  const { checkAuth, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/invite-signup" element={<InviteSignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/login/success" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/verify-otp" element={<VerifyOTPForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/hradmin" element={<HRadminPage />} />
        <Route
          path="/premium-payment"
          element={<PremiumPayment onSuccess={() => window.location.reload()} />}
        />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nearby"
          element={
            <ProtectedRoute>
              <NearbyPeople
                userId={user?.id}
                latitude={user?.employeeInfo?.latitude}
                longitude={user?.employeeInfo?.longitude}
                companyId={user?.companyId}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute requirePremium={true}>
              <DocManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <InputForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meeting"
          element={
            <ProtectedRoute requirePremium={true}>
              <ZoomMeeting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/call/:id"
          element={
            <ProtectedRoute>
              <CallPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminVerificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <CompanyAdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>

    </BrowserRouter>
  );
};

export default App;
