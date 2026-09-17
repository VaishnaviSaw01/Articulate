import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-14 shrink-0 border-b border-black/10 bg-[#1a1a1a]">
      <div className="flex h-full items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2 text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-comm-600 text-sm font-bold">
            A
          </span>
          <span className="text-base font-bold tracking-tight">Articulate</span>
        </Link>
        {user && (
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-white">
              Problems
            </Link>
            <Link to="/history" className="hover:text-white">
              History
            </Link>
            <Link to="/rubric" className="hover:text-white">
              Scoring Rubric
            </Link>
            <span className="hidden text-slate-500 sm:inline">{user.email}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-200 hover:border-slate-400 hover:text-white"
            >
              Log out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
