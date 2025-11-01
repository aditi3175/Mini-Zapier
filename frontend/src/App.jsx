import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./index.css";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateWorkflow from "./pages/CreateWorkflow.jsx";
import Workflows from "./pages/Workflows.jsx";
import WorkflowDetail from "./pages/WorkflowDetail.jsx";
import Settings from "./pages/Settings.jsx";

function Protected({ children }) {
  const location = useLocation();
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<Protected><Layout /></Protected>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/workflows/:id" element={<WorkflowDetail />} />
              <Route path="/create" element={<CreateWorkflow />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}


