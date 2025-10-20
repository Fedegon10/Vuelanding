import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css"; // <--- ✅ AÑADE ESTA LÍNEA AQUÍ
import { AnimatePresence, motion } from "framer-motion";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

import ResetPasswordPage from "./pages/ResetPasswordPage"; // ✅ NUEVA IMPORTACIÓN
import {
  DestinationsProvider,
  useDestinations,
} from "./context/DestinationsContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";

// Layout Components
import Sidebar from "./components/layout/Sidebar";
import BottomNav from "./components/layout/BottomNav";
import "./components/layout/Layout.css";

// Page Components
import HomePage from "./pages/HomePage";
import DestinationsPage from "./pages/DestinationsPage";
import CalendarPage from "./pages/CalendarPage";
import FilesHubPage from "./pages/FilesHubPage";
import MapPage from "./pages/MapPage";
import NotesPage from "./pages/NotesPage";
import NoteDetailPage from "./pages/NoteDetailPage";
import ExpensesPage from "./pages/ExpensesPage";
import ExpenseDetailPage from "./pages/ExpenseDetailPage";
import ItinerariesPage from "./pages/ItinerariesPage";
import ItineraryDetailPage from "./pages/ItineraryDetailPage";
import AuthPage from "./pages/AuthPage";
import MenuPage from "./pages/MenuPage";
import ReservationsPage from "./pages/ReservationsPage";
import ReservesDetailPage from "./pages/ReservesDetailPage";
import CurrencyConverterPage from "./pages/CurrencyConverterPage";
import TimelinePage from "./pages/TimelinePage";
import ProfilePage from "./pages/ProfilePage";

// Loader y Splash
import Loader from "./components/common/Loader";
import SplashScreen from "./components/common/SplashScreen";

// =======================
// ANIMACIONES DE PÁGINA
// =======================
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.15,
};

const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useDestinations();
  if (loading) return <Loader message="Verificando sesión..." />;
  return currentUser ? children : <Navigate to="/auth" />;
};

// =======================
// CONTENIDO PRINCIPAL
// =======================
function AppContent() {
  const location = useLocation();
  const { currentUser, loading } = useDestinations();
  const { theme } = useTheme();

  const getInitialSidebarState = () =>
    localStorage.getItem("sidebarCollapsed") === "true";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    getInitialSidebarState
  );

  const isAuthPage =
    location.pathname === "/auth" || location.pathname === "/reset-password"; // ✅ incluye nueva página
  const showNavigation = !isAuthPage && currentUser;

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Ajuste de altura total
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.innerHeight}px`
      );
    };
    window.addEventListener("resize", setAppHeight);
    setAppHeight();
    return () => window.removeEventListener("resize", setAppHeight);
  }, []);

  // Meta color de navegador
  useEffect(() => {
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute(
        "content",
        theme === "dark" ? "#0f111b" : "#ffffff"
      );
    }
  }, [theme]);

  if (loading && !currentUser) {
    return <Loader message="Cargando Vuelanding..." />;
  }

  return (
    <>
      <div
        className={`app-container ${!showNavigation ? "sidebar-hidden" : ""} ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {showNavigation && (
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* ==================== AUTH ==================== */}
              <Route
                path="/auth"
                element={
                  <AnimatedPage>
                    {currentUser ? <Navigate to="/" /> : <AuthPage />}
                  </AnimatedPage>
                }
              />
              {/* ✅ NUEVA RUTA PARA RECUPERAR CONTRASEÑA */}
              <Route
                path="/reset-password"
                element={
                  <AnimatedPage>
                    <ResetPasswordPage />
                  </AnimatedPage>
                }
              />

              {/* ==================== RUTAS PRIVADAS ==================== */}
              <Route
                path="/"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <HomePage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/destinos"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <DestinationsPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/itinerarios"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <ItinerariesPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/itinerarios/:destinationId"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <ItineraryDetailPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/notas"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <NotesPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/notas/:destinationId"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <NoteDetailPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/calendario"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <CalendarPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/archivos"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <FilesHubPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/gastos"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <ExpensesPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/gastos/:destinationId"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <ExpenseDetailPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/mapa"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <MapPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/menu"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <MenuPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/reservas"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <ReservationsPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/reservas/:destinationId"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <ReservesDetailPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/conversor"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <CurrencyConverterPage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/timeline"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <TimelinePage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route
                path="/perfil"
                element={
                  <AnimatedPage>
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  </AnimatedPage>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
      {showNavigation && <BottomNav />}
    </>
  );
}

// =======================
// APP PRINCIPAL
// =======================
function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider>
      {/* Relleno superior notch iOS PWA */}
      <div className="safe-top-fill" />
      <UserProvider>
        <DestinationsProvider>
          <BrowserRouter>
            <ToastContainer position="top-right" autoClose={4000} />
            {showSplash ? (
              <SplashScreen onFinish={() => setShowSplash(false)} />
            ) : (
              <AppContent />
            )}
          </BrowserRouter>
        </DestinationsProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
