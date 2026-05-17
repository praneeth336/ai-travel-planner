import { Wallet, Utensils, Bus, Star, Home } from 'lucide-react';
import { CostBreakdown } from '../types';

interface BudgetBreakdownProps {
  budget?: CostBreakdown;
  targetBudget?: number;
  currency?: string;
  days?: number;
  guests?: number;
  destination?: string;
  origin?: string;
}

const isInternational = (dest: string, orig: string = ''): boolean => {
  const destLower = dest.toLowerCase();
  
  if (destLower.includes('india')) return false;
  
  const indianKeywords = [
    'goa', 'kerala', 'manali', 'shimla', 'mumbai', 'delhi', 'bangalore', 'jaipur', 
    'udaipur', 'ladakh', 'hampi', 'pondicherry', 'agra', 'varanasi', 'darjeeling',
    'gangtok', 'sikkim', 'ooty', 'kodaikanal', 'munnar', 'alleppey', 'kochi', 'coorg',
    'mysore', 'pune', 'hyderabad', 'chennai', 'kolkata', 'rishikesh', 'amritsar'
  ];
  
  const isIndian = indianKeywords.some(keyword => destLower.includes(keyword));
  if (isIndian) return false;
  
  return true;
};

export function BudgetBreakdown({
  budget,
  targetBudget = 0,
  currency = 'INR',
  days = 1,
  guests = 1,
  destination = '',
  origin = ''
}: BudgetBreakdownProps) {
  const sumCat = (items: any) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((acc, item) => acc + (Number(item?.cost) || 0), 0);
  };

  if (!budget) return (
    <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
      <p className="text-gray-400">Loading budget details...</p>
    </div>
  );

  const isIntl = destination ? isInternational(destination, origin) : false;

  // Convert and format helpers
  const formatAmount = (amt: number) => {
    if (isIntl && currency === 'INR') {
      const usdAmount = Math.round(amt / 83.5);
      return `$${usdAmount.toLocaleString('en-US')}`;
    }
    const symbol = currency === 'INR' ? '₹' : currency;
    return `${symbol} ${amt.toLocaleString()}`;
  };

  const formatAmountWithOriginal = (amt: number) => {
    if (isIntl && currency === 'INR') {
      const usdAmount = Math.round(amt / 83.5);
      return (
        <div className="flex flex-col items-end">
          <span className="text-3xl font-black text-slate-900">${usdAmount.toLocaleString('en-US')}</span>
          <span className="text-[10px] font-bold text-slate-400 mt-1">Approx. ₹{amt.toLocaleString('en-IN')}</span>
        </div>
      );
    } 
    const symbol = currency === 'INR' ? '₹' : currency;
    return <span className="text-3xl font-black text-slate-900">{symbol} {amt.toLocaleString()}</span>;
  };

  const categories = [
    { name: 'Accommodation', icon: <Home className="text-blue-500" />, amount: sumCat(budget.accommodation) },
    { name: 'Food & Dining', icon: <Utensils className="text-orange-500" />, amount: sumCat(budget.food) },
    { name: 'Transportation', icon: <Bus className="text-cyan-500" />, amount: sumCat(budget.transport) },
    { name: 'Activities', icon: <Star className="text-purple-500" />, amount: sumCat(budget.activities) },
    { name: 'Other', icon: <Wallet className="text-slate-500" />, amount: sumCat(budget.other) },
  ];

  const total = categories.reduce((acc, cat) => acc + cat.amount, 0);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto my-12">
      <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Budget Breakdown {isIntl && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md ml-2">International</span>}
          </h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Estimated costs for your trip</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Estimate</div>
          {formatAmountWithOriginal(total)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
              {cat.icon}
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.name}</div>
              <div className="text-lg font-bold text-slate-900">{formatAmount(cat.amount)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-sm text-blue-800 font-medium">
          Target Budget: <span className="font-bold">{formatAmount(targetBudget)}</span>
        </div>
        <div className={`text-sm font-bold ${targetBudget >= total ? 'text-emerald-600' : 'text-rose-600'}`}>
          {targetBudget >= total 
            ? `Under Budget by ${formatAmount(targetBudget - total)}`
            : `Over Budget by ${formatAmount(total - targetBudget)}`
          }
        </div>
      </div>

      <div className="mt-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        * Estimates based on {guests} traveler{guests > 1 ? 's' : ''} for {days} days
      </div>
    </div>
  );
}
