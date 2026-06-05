import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";

import Persons from "./pages/Persons";
import MissingPerson from "./pages/MissingPerson";
import FoundPerson from "./pages/FoundPerson";

import Items from "./pages/Items";
import LostItem from "./pages/LostItem";
import FoundItem from "./pages/FoundItem";

import Statistics from "./pages/Statistics";
import Contact from "./pages/Contact";
import MyReports from "./pages/MyReports";

import SignUp from "./pages/SignUp";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";

import Faqs from "./pages/Faqs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

import ForgotPassword from "./pages/ForgotPassword";

import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

import AdminPanel from "./pages/AdminPanel";
import MatchAlertDetails from "./pages/MatchAlertDetails";

export default function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/persons" element={<Persons />} />
          <Route path="/items" element={<Items />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/faqs" element={<Faqs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/match-alert/:matchId" element={<MatchAlertDetails />} />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report-missing-person"
            element={
              <ProtectedRoute>
                <MissingPerson />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report-found-person"
            element={
              <ProtectedRoute>
                <FoundPerson />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report-lost-item"
            element={
              <ProtectedRoute>
                <LostItem />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report-found-item"
            element={
              <ProtectedRoute>
                <FoundItem />
              </ProtectedRoute>
            }
          />
        </Routes>

            


      </BrowserRouter>
    </AuthProvider>
  );
}