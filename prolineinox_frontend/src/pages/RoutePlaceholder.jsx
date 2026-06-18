import { Link, useLocation } from 'react-router-dom';

export default function RoutePlaceholder({ title = 'Page' }) {
  const location = useLocation();

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Route vérifiée</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">
        La route <span className="font-mono">{location.pathname}</span> existe. Le formulaire détaillé sera branché sur ce module.
      </p>
      <Link to="/" className="mt-4 inline-block rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">
        Retour tableau de bord
      </Link>
    </div>
  );
}
