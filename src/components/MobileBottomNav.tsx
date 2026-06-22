import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Play, Search, TrendingUp, User } from "lucide-react";

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Reels", to: "/reels", icon: Play },
  { label: "Search", to: "/search", icon: Search },
  { label: "Trending", to: "/trending", icon: TrendingUp },
  { label: "Profile", to: "/profile", icon: User },
];

export function MobileBottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(124,58,237,0.2)] bg-[#071120]/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.to || (item.to === "/" && currentPath === "/");

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center px-3 py-1.5 text-xs transition-colors ${isActive ? "text-[#a855f7]" : "text-[#94a3b8] hover:text-white"}`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
