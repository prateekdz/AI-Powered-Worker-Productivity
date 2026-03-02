import { Outlet, Link, useLocation } from "react-router-dom";
import { Factory, Users, Activity, Settings } from "lucide-react";

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Factory },
    { path: "/workers", label: "Workers", icon: Users },
    { path: "/workstations", label: "Workstations", icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col" data-testid="sidebar">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Factory className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>FactoryPulse</h1>
              <p className="text-xs text-slate-400">AI Monitoring</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4" data-testid="navigation">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors duration-200 ${
                      isActive
                        ? "bg-orange-500 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            <p>System Online</p>
            <p className="text-emerald-400 font-medium">All cameras active</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
