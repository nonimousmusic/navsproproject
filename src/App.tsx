import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Goals from "./pages/Goals";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Roadmap from "./pages/Roadmap";
import InviteAccept from "./pages/InviteAccept";

import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const App = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=invite")) {
      if (window.location.pathname !== "/invite") {
        window.location.href = "/invite" + hash;
      }
    } else if (hash && hash.includes("type=recovery")) {
      if (window.location.pathname !== "/reset-password") {
        window.location.href = "/reset-password" + hash;
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/invite" element={<InviteAccept />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/report" element={<Report />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/goals" element={<Navigate to="/dashboard" replace />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route path="/admin" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
