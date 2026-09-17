import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { NavBar } from "./components/NavBar";
import { Login } from "./pages/Login";
import { ProblemList } from "./pages/ProblemList";
import { Workspace } from "./pages/Workspace";
import { Results } from "./pages/Results";
import { History } from "./pages/History";
import { Rubric } from "./pages/Rubric";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <NavBar />
      <main className="min-h-0 flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProblemList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems/:slug"
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:id"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rubric"
            element={
              <ProtectedRoute>
                <Rubric />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
