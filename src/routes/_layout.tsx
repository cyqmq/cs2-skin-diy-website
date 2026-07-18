import { Outlet, Link, useLocation } from "react-router";

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <header className="h-14 border-b border-white/10 flex items-center px-6 gap-6 shrink-0">
        <Link to="/" className="font-bold text-lg tracking-wide">
          CS2 Skin DIY
        </Link>
        <nav className="flex gap-4 text-sm text-white/60">
          <Link
            to="/painter"
            className={pathname === "/painter" || pathname === "/"
              ? "text-white"
              : "hover:text-white/80"
            }
          >
            Skin Painter
          </Link>
        </nav>
      </header>
      <main className="flex-1 overflow-hidden min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
