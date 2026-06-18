import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  PercentBadgeIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/currency';

export default function StatsCards({ stats }) {
  const cards = [
    {
      name: "Chiffre d'affaires",
      value: stats.chiffre_affaires,
      icon: CurrencyDollarIcon,
      color: 'text-cyan-700',
      bg: 'bg-cyan-50',
    },
    {
      name: 'Recette',
      value: stats.recettes,
      icon: ArrowTrendingUpIcon,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      name: 'Dépenses',
      value: stats.depenses,
      icon: ArrowTrendingDownIcon,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
    },
    {
      name: 'Résultat',
      value: stats.resultat,
      icon: DocumentChartBarIcon,
      color: Number(stats.resultat) >= 0 ? 'text-emerald-700' : 'text-rose-700',
      bg: Number(stats.resultat) >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
    },
    {
      name: 'Marge',
      value: stats.marge_percent,
      icon: PercentBadgeIcon,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      suffix: '%',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div key={card.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">{card.name}</p>
              <p className={`mt-2 text-2xl font-bold ${card.color}`}>
                {card.suffix
                  ? `${Number(card.value || 0).toFixed(1)}${card.suffix}`
                  : formatCurrency(Number(card.value || 0))}
              </p>
            </div>
            <div className={`rounded-md p-2 ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
