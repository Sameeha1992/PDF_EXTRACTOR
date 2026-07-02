import { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Loader from "./components/Loader";
import { useAppDispatch } from "./store/hooks";
import { setCredentials, clearCredentials } from "./store/auth/authSlice";
import apiClient from "./api/client";
import { jwtDecode } from "jwt-decode";

const Register = lazy(() => import("./pages/auth/Register"));
const Login = lazy(() => import("./pages/auth/Login"));
const Home = lazy(() => import("./pages/pdf/Home"));

function App() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt silent refresh to get access token from HttpOnly cookie
        const response = await apiClient.post("/users/refresh");
        const newAccessToken = response.data.data.accessToken;

        // Decode the access token to populate user state
        const decoded: any = jwtDecode(newAccessToken);
        dispatch(
          setCredentials({
            user: {
              id: decoded.id,
              name: decoded.name || decoded.email.split("@")[0],
              email: decoded.email,
            },
            accessToken: newAccessToken,
          }),
        );
      } catch (err) {
        // No valid session/cookie, reset client credentials
        dispatch(clearCredentials());
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
