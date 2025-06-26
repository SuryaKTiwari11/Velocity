import React, { useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InputForm from "../components/InputForm";
import EditEmployee from "../components/EditEmployee";
import SignupForm from "../components/SignupForm";
import LoginForm from "../components/LoginForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import ResetPasswordForm from "../components/ResetPasswordForm";
import VerifyOTPForm from "../components/VerifyOTPForm";
import DocManager from "../components/Doc/DocManager";
import useAuthStore from "./store/authStore";
import ProfilePage from "../components/ProfilePage";
import LandingPage from "../components/LandingPage";
import HRadminPage from "../components/HRadminPage";
import Navbar from "../components/Navbar";
import NotFound from "../components/NotFound";
import ProtectedRoute from "../components/ProtectedRoute";
import PremiumPayment from "../components/PremiumPayment";

const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Navbar />      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/hradmin" element={<HRadminPage />} />

        <Route path="/documents" element={
          <ProtectedRoute requirePremium={true}>
            <DocManager />
          </ProtectedRoute>
        } />
        <Route path="/add" element={<InputForm />} />
        <Route path="/edit/:id" element={<EditEmployee />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/login/success" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/verify-otp" element={<VerifyOTPForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/premium-payment" element={<PremiumPayment onSuccess={() => window.location.reload()} />} />
        <Route path ="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
