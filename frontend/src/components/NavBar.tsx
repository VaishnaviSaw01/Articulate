import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">
          Articulate
        </Link>
        {user && (
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-slate-900">
              Problems
            </Link>
            <Link to="/history" className="hover:text-slate-900">
              History
            </Link>
            <Link to="/rubric" className="hover:text-slate-900">
              Scoring Rubric
            </Link>
            <span className="text-slate-400">{user.email}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
            >
              Log out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
