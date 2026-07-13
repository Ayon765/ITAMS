import { 
  Branch, Supplier, Product, Employee, Adjustment, Purchase, Delivery, UserAccount 
} from '../types';
import { 
  Building2, Users, AlertCircle, ShoppingCart, Truck, Wallet, FileText 
} from 'lucide-react';

interface DashboardViewProps {
  branches: Branch[];
  suppliers: Supplier[];
  products: Product[];
  employees: Employee[];
  adjustments: Adjustment[];
  purchases: Purchase[];
  deliveries: Delivery[];
  users: UserAccount[];
}

export default function DashboardView({
  branches,
  suppliers,
  products,
  employees,
  adjustments,
  purchases,
  deliveries,
  users,
}: DashboardViewProps) {
  // Calculators
  const totalBranches = branches.length;
  const totalSuppliers = suppliers.length;
  const totalUsers = users 
    ? users.filter(u => !u.isTerminated).length 
    : employees.filter(e => e.status === 'Active').length; // Fallback to employees if undefined
  const totalAdjustments = adjustments.length;

  const totalPurchaseAmt = purchases
    .filter(p => p.status === 'Approved')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const totalDeliveryAmt = deliveries
    .filter(d => d.status === 'Approved')
    .reduce((sum, d) => {
      const prod = products.find(p => p.id === d.productId);
      const price = prod ? prod.unitPrice : 1200;
      return sum + (d.quantity * price);
    }, 0);

  const totalBalanceAmt = totalPurchaseAmt - totalDeliveryAmt;

  const stats = [
    { 
      label: 'Branches', 
      value: totalBranches.toLocaleString('bn-BD'), 
      icon: Building2, 
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    },
    { 
      label: 'Suppliers', 
      value: totalSuppliers.toLocaleString('bn-BD'), 
      icon: FileText, 
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      label: 'Users', 
      value: totalUsers.toLocaleString('bn-BD'), 
      icon: Users, 
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    { 
      label: 'Adjustments', 
      value: totalAdjustments.toLocaleString('bn-BD'), 
      icon: AlertCircle, 
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10'
    },
    { 
      label: 'Purchases', 
      value: `৳${totalPurchaseAmt.toLocaleString('bn-BD')}`, 
      subValue: `${purchases.filter(p => p.status === 'Approved').length} Approved Orders`, 
      icon: ShoppingCart, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    { 
      label: 'Deliveries', 
      value: `${deliveries.filter(d => d.status === 'Approved').length.toLocaleString('bn-BD')}`, 
      subValue: `৳${totalDeliveryAmt.toLocaleString('bn-BD')}`, 
      icon: Truck, 
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10'
    },
    { 
      label: 'Balance', 
      value: `৳${totalBalanceAmt.toLocaleString('bn-BD')}`, 
      icon: Wallet, 
      color: 'text-fuchsia-400',
      bgColor: 'bg-fuchsia-500/10'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1 group"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-0.5 min-w-0">
                <p className="text-[9px] uppercase tracking-widest font-black text-gray-400 dark:text-slate-400 truncate">{stat.label}</p>
                <div className="text-xl font-black tracking-tight text-black dark:text-white truncate">{stat.value}</div>
                {stat.subValue && (
                  <p className="text-[10px] text-zinc-500 dark:text-slate-300 font-semibold mt-0.5">{stat.subValue}</p>
                )}
              </div>
              <div className={`p-2 rounded-xl group-hover:scale-110 transition-all duration-300 shrink-0 ${stat.bgColor} ${stat.color} shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_20px_currentColor]`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick guide / operational overview */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-base font-semibold text-black dark:text-white mb-2">Operational System Notice</h3>
        <p className="text-xs text-black dark:text-slate-200 leading-relaxed max-w-3xl">
          Welcome to the IT Asset Management workspace. Track and manage hardware lifecycles, requisitions, purchases, transfers, and system cash books. Use the left navigation panel to switch modules.
        </p>
      </div>
    </div>
  );
}
