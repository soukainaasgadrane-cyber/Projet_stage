import { NavLink } from 'react-router-dom';
import {
  BanknotesIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  TruckIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useSettings } from '../contexts/SettingsContext';

const navigation = [
  { nameKey: 'dashboard', href: '/', icon: ChartBarIcon },
  {
    nameKey: 'crm',
    icon: BuildingOfficeIcon,
    children: [
      { nameKey: 'accounts', href: '/crm/accounts' },
      { nameKey: 'contacts', href: '/crm/contacts' },
      { nameKey: 'reports', href: '/crm/rapports' },
    ],
  },
  {
    nameKey: 'sales',
    icon: ShoppingCartIcon,
    children: [
      { nameKey: 'quotes', href: '/ventes/devis' },
      { nameKey: 'proforma', href: '/ventes/proforma' },
      { nameKey: 'orders', href: '/ventes/commandes' },
      { nameKey: 'deliveryNotes', href: '/ventes/bons-livraison' },
      { nameKey: 'invoices', href: '/ventes/factures' },
      { nameKey: 'creditNotes', href: '/ventes/avoirs' },
      { nameKey: 'recurringInvoices', href: '/ventes/factures-recurrentes' },
      { nameKey: 'reports', href: '/ventes/rapports' },
    ],
  },
  {
    nameKey: 'purchases',
    icon: TruckIcon,
    children: [
      { nameKey: 'priceRequests', href: '/achats/demandes-prix' },
      { nameKey: 'purchaseOrders', href: '/achats/bons-commandes' },
      { nameKey: 'receptions', href: '/achats/bon-reception' },
      { nameKey: 'invoices', href: '/achats/factures' },
      { nameKey: 'creditNotes', href: '/achats/avoirs' },
      { nameKey: 'reports', href: '/achats/rapports' },
    ],
  },
  {
    nameKey: 'finance',
    icon: BanknotesIcon,
    children: [
      { nameKey: 'transactions', href: '/finance/transactions' },
      { nameKey: 'collection', href: '/finance/recouvrement' },
      { nameKey: 'reconciliation', href: '/finance/rapprochement' },
      { nameKey: 'bankStatements', href: '/finance/releves-bancaires' },
      { nameKey: 'chequeDeposits', href: '/finance/remises-cheques' },
      { nameKey: 'cheques', href: '/finance/cheques' },
      { nameKey: 'reports', href: '/finance/rapports' },
    ],
  },
  {
    nameKey: 'catalog',
    icon: CubeIcon,
    children: [
      { nameKey: 'articles', href: '/catalogue/articles' },
      { nameKey: 'reports', href: '/catalogue/rapports' },
    ],
  },
  {
    nameKey: 'collaborators',
    icon: UserGroupIcon,
    children: [
      { nameKey: 'users', href: '/collaborateurs/users' },
      { name: 'Grow', href: '/collaborateurs/grow' },
      { nameKey: 'history', href: '/collaborateurs/historique' },
    ],
  },
];

const linkBase = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition';
const childBase = 'block rounded-md px-3 py-2 text-sm transition';

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { t } = useSettings();
  const label = (item) => item.name || t[item.nameKey] || item.nameKey;

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl shadow-slate-950/40 transition-transform duration-200 rtl:left-auto rtl:right-0 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        }`}
      >
        <div className="border-b border-slate-800 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-500 text-sm font-bold text-slate-950">
              PI
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold leading-tight">InoxProline</p>
              <p className="truncate text-xs uppercase tracking-wide text-slate-400">ERP industriel</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-300 transition hover:bg-slate-900 lg:hidden"
              aria-label="Fermer le menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {navigation.map((section) => (
            <div key={section.nameKey || section.name}>
              {section.href ? (
                <NavLink
                  end
                  to={section.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? 'bg-cyan-500 text-slate-950' : 'text-slate-200 hover:bg-slate-900'}`
                  }
                >
                  <section.icon className="h-5 w-5" />
                  {label(section)}
                </NavLink>
              ) : (
                <>
                  <div className="mb-2 flex items-center gap-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <section.icon className="h-4 w-4" />
                    {label(section)}
                  </div>
                  <div className="space-y-1 pl-7 rtl:pl-0 rtl:pr-7">
                    {section.children.map((item) => (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `${childBase} ${
                            isActive
                              ? 'bg-slate-800 text-cyan-300'
                              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                          }`
                        }
                      >
                        {label(item)}
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-4 w-4" />
            Gestion commerciale
          </div>
          <div className="mt-2 flex items-center gap-2">
            <DocumentTextIcon className="h-4 w-4" />
            Finance, stock et documents
          </div>
        </div>
      </aside>
    </>
  );
}
