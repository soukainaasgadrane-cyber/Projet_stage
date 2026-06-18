import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import PageTools from '../components/common/PageTools';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { language, setLanguage, dir, t } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 text-slate-900" dir={dir}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 shrink-0 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm shadow-slate-200/60 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase text-cyan-700">ERP InoxProline</p>
              <h1 className="truncate text-lg font-semibold text-slate-950 md:text-xl">{t.dashboard}</h1>
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <span className="hidden sm:inline">{t.language}</span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-800 shadow-sm"
                >
                  <option value="fr">Français</option>
                  <option value="ar">Arabe</option>
                  <option value="en">English</option>
                </select>
              </label>

              <div className="hidden text-right sm:block">
                <p className="max-w-40 truncate text-sm font-semibold text-slate-800">{user?.name || t.user}</p>
                <p className="max-w-48 truncate text-xs text-slate-500">{user?.email || t.activeSession}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {t.logout}
              </button>
            </div>
          </div>

        </header>

        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-6">
          <PageTools>
            <Outlet />
          </PageTools>
        </main>
      </div>
    </div>
  );
}
