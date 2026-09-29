import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { api } from "./services/api";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import QuestionBanksPage from "./pages/QuestionBanksPage";
import InternshipPage from "./pages/InternshipPage";
import FriendsPage from "./pages/FriendsPage";

import ConfessionsPage from "./components/ConfessionsPage";
import MaterialsPage from "./components/MaterialsPage";

function App() {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuthentication() {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
          const result = await api.get("/profile");

          setUser(result.data?.user ?? null);
      } catch (error) {
        console.error("Gagal memeriksa sesi:", error);

        localStorage.removeItem("auth_token");
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuthentication();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="loading-page">
        Memeriksa sesi login...
      </div>
    );
  }

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
  }

  function handleRegister(registeredUser) {
    setUser(registeredUser);
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            LOGIN
        ========================= */}

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage
                onLogin={handleLogin}
                onBack={() => window.location.href = "/"}
              />
            )
          }
        />

        {/* =========================
            REGISTER
        ========================= */}

        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RegisterPage
                onRegister={handleRegister}
                onBack={() => window.location.href = "/"}
                onGoToLogin={() => window.location.href = "/login"}
              />
            )
          }
        />

        {/* =========================
            HALAMAN YANG HARUS LOGIN
        ========================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout user={user} />}>

            <Route
              path="/dashboard"
              element={<DashboardPage user={user} />}
            />

            <Route
              path="/confession"
              element={<ConfessionsPage user={user} />}
            />

            <Route
              path="/materials"
              element={<MaterialsPage user={user} />}
            />
            
            <Route
              path="/question-banks"
              element={<QuestionBanksPage user={user} />
              }
            />

            <Route
              path="/internship"
              element={
                <InternshipPage user={user} />
              }
            />

            <Route
              path="/friends"
              element={
                <FriendsPage user={user} />
              }
            />

            <Route
              path="/profile"
              element={
                <ProfilePage
                  onProfileUpdated={setUser}
                />
              }
            />

          </Route>
        </Route>

        {/* =========================
            DEFAULT
        ========================= */}

        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* =========================
            URL TIDAK DITEMUKAN
        ========================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;