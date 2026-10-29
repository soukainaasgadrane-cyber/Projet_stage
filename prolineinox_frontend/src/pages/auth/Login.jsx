import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import toast from 'react-hot-toast';
import {
  ArrowRightOnRectangleIcon,
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const fallbackLoginErrors = {
  fr: {
    network: 'Serveur indisponible. Verifiez que Laravel et MySQL sont demarres.',
    server: 'Erreur serveur. Verifiez la connexion a la base de donnees.',
  },
  ar: {
    network: 'الخادم غير متاح. تحقق من تشغيل Laravel و MySQL.',
    server: 'خطأ في الخادم. تحقق من الاتصال بقاعدة البيانات.',
  },
  en: {
    network: 'Server unavailable. Check that Laravel and MySQL are running.',
    server: 'Server error. Check the database connection.',
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { language, setLanguage, dir, t } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(getLoginErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLoginErrorMessage = (err) => {
    const status = err.response?.status;
    const apiMessage = err.response?.data?.message;
    const apiValidationMessage = err.response?.data?.errors?.email?.[0];
    const fallback = fallbackLoginErrors[language] ?? fallbackLoginErrors.fr;

    if (status === 401 || status === 422) {
      return apiValidationMessage || apiMessage || t.loginError;
    }

    if (!err.response) {
      return fallback.network;
    }

    return apiMessage || fallback.server;
  };

  const featureItems = [
    { icon: ShieldCheckIcon, label: 'Acces securise', value: 'Admin' },
    { icon: ChartBarSquareIcon, label: 'Pilotage', value: 'Temps reel' },
    { icon: BuildingOffice2Icon, label: 'Operations', value: 'Commercial' },
  ];

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#f4f7fb] text-slate-950"
      dir={dir}
    >
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_500px]">
        <section className="relative hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.92)_0%,rgba(15,23,42,0.96)_48%,rgba(17,24,39,1)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(0deg,rgba(45,212,191,0.16),transparent)]" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/15 bg-white shadow-xl shadow-cyan-950/30">
                <div className="text-center font-black leading-none text-slate-950">
                  <span className="block text-xl">PL</span>
                  <span className="block text-[11px] text-cyan-700">INOX</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Pro Line Inox
                </p>
                <p className="mt-1 text-sm text-slate-300">Administration ERP</p>
              </div>
            </div>

            <div className="mt-20 max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                <CheckCircleIcon className="h-4 w-4" />
                Back office professionnel
              </p>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.05] text-white">
                Tableau de bord pour gerer ventes, clients et equipe.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                Un espace centralise pour suivre les commerciaux, controler les documents et garder une vision claire sur l'activite.
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {featureItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-lg shadow-slate-950/20 backdrop-blur"
                >
                  <Icon className="h-6 w-6 text-cyan-200" />
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm lg:hidden">
                  <div className="text-center font-black leading-none text-slate-950">
                    <span className="block text-base">PL</span>
                    <span className="block text-[9px] text-cyan-700">INOX</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    Pro Line Inox
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">Connexion admin</h2>
                </div>
              </div>

              <label className="relative block">
                <span className="sr-only">Langue</span>
                <GlobeAltIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 rtl:left-auto rtl:right-3" />
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="h-10 rounded-md border border-slate-300 bg-white py-0 pl-9 pr-8 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 rtl:pl-8 rtl:pr-9"
                >
                  <option value="fr">FR</option>
                  <option value="ar">AR</option>
                  <option value="en">EN</option>
                </select>
              </label>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-medium text-slate-500">Espace securise</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Identifiez-vous pour acceder aux modules d'administration et de supervision.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">{t.email}</span>
                  <div className="relative">
                    <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-md border border-slate-300 bg-slate-50 pl-10 pr-3 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:bg-white focus:ring-4 focus:ring-cyan-100 rtl:pl-3 rtl:pr-10"
                      autoComplete="email"
                      placeholder="admin@inoxproline.com"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">{t.password}</span>
                  <div className="relative">
                    <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-md border border-slate-300 bg-slate-50 pl-10 pr-3 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:bg-white focus:ring-4 focus:ring-cyan-100 rtl:pl-3 rtl:pr-10"
                      autoComplete="current-password"
                      placeholder="Mot de passe"
                      required
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  {isSubmitting ? 'Connexion...' : t.login}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs font-medium text-slate-500">
              Acces reserve aux utilisateurs autorises de Pro Line Inox.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
