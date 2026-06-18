import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BellIcon, UserCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import GlobalSearch from '../components/common/GlobalSearch';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    // Appel API pour compter les notifications (optionnel)
  }, []);

  return (
    <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <div className="w-96">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative">
          <BellIcon className="w-6 h-6 text-gray-600" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <UserCircleIcon className="w-8 h-8 text-gray-600" />
          <span className="text-sm font-medium">{user?.first_name} {user?.last_name}</span>
          <button onClick={logout} className="text-sm text-red-600 ml-2">Déconnexion</button>
        </div>
      </div>
    </header>
  );
}