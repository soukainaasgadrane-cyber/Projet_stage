import { Link } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [openCRM, setOpenCRM] = useState(false);

  return (
    <div className="w-64 h-screen bg-[#0B1220] text-white p-5">

      <h1 className="text-xl font-bold mb-8">Inox Pro <Line></Line></h1>

      <nav className="space-y-4">

        <Link to="/" className="block hover:text-blue-400">
          Tableau de bord
        </Link>

        {/* CRM MENU */}
        <div>
          <button
            onClick={() => setOpenCRM(!openCRM)}
            className="w-full text-left hover:text-blue-400"
          >
            CRM
          </button>

          {openCRM && (
            <div className="ml-4 mt-2 space-y-2 bg-[#111827] p-3 rounded">
              <Link to="/comptes">Comptes</Link>
              <Link to="/contacts">Contacts</Link>
              <Link to="/rapports">Rapports</Link>
            </div>
          )}
        </div>

        <p className="opacity-70">Ventes</p>
        <p className="opacity-70">Achats</p>
        <p className="opacity-70">Finance</p>
        <p className="opacity-70">Catalogue</p>

      </nav>
    </div>
  );
}