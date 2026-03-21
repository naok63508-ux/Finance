"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { BalanceLineChart } from "@/components/charts/BalanceLineChart";
import { CategoryDonutChart } from "@/components/charts/CategoryDonutChart";
import { IncomeExpenseBarChart } from "@/components/charts/IncomeExpenseBarChart";
import { PieChart } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState({ balance: 0, income: 0, expense: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [charts, setCharts] = useState({ line: [], donut: [], bar: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          let income = 0;
          let expense = 0;
          const monthData = data.filter((t: any) => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          });
          monthData.forEach((t: any) => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
          });

          setMetrics({ balance: income - expense, income, expense });
          setRecent(data.slice(0, 5));

          const donutMap: Record<string, number> = {};
          monthData.filter((t:any) => t.type === 'expense').forEach((t:any) => {
            donutMap[t.category] = (donutMap[t.category] || 0) + t.amount;
          });
          const donut = Object.keys(donutMap).map(k => ({ name: k, value: donutMap[k] }));

          const last6Months = Array.from({length: 6}, (_, i) => {
             const d = new Date(currentYear, currentMonth - 5 + i, 1);
             return { month: d.toLocaleString('pt-BR', { weekday: 'short' }), mIdx: d.getMonth(), y: d.getFullYear() };
          });
          
          let accBalance = 0;
          const barLineData = last6Months.map(m => {
            const mTrans = data.filter((t:any) => {
              const td = new Date(t.date);
              return td.getMonth() === m.mIdx && td.getFullYear() === m.y;
            });
            let mInc = 0; let mExp = 0;
            mTrans.forEach((t:any) => {
              if (t.type === 'income') mInc += t.amount;
              else mExp += t.amount;
            });
            let r = Math.random() * 4000;
            return { month: m.month, income: mInc + r, expense: mExp + r, balance: accBalance };
          });

          // @ts-ignore
          setCharts({ line: barLineData, donut, bar: barLineData });
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Left Column (Main Metrics & Flow) */}
      <div className="xl:col-span-2 space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            title="Balance" 
            value={metrics.balance.toLocaleString('pt-BR', {minimumFractionDigits: 0})} 
            type="balance"
            trend={{ value: 17, isPositive: true }}
          />
          <MetricCard 
            title="Sales" 
            value={metrics.income.toLocaleString('pt-BR', {minimumFractionDigits: 0})} 
            type="sales"
            trend={{ value: 23, isPositive: true }}
          />
          <MetricCard 
            title="Upgrade" 
            value="" 
            type="upgrade"
          />
        </div>

        {/* User in The Last Week Bar Chart */}
        <div className="mt-10">
          <div className="flex justify-between items-end mb-6">
             <div>
                <h3 className="text-[17px] font-semibold text-[#1a1a1a] dark:text-white">User in The Last Week</h3>
                <h2 className="text-[32px] font-bold text-[#1a1a1a] dark:text-white mt-1">+ 3,2%</h2>
             </div>
             <p className="text-sm font-medium text-foreground/40 mb-2">See statistics for all time</p>
          </div>
          <div className="h-[280px] w-full mt-8">
             <IncomeExpenseBarChart data={charts.bar} />
          </div>
        </div>

        {/* Last Orders List */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[17px] font-semibold text-[#1a1a1a] dark:text-white">Last Orders</h3>
             <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-foreground/40 border border-card-border px-3 py-1.5 rounded-full">Data Updates Every 3 Hours</span>
                <span className="text-sm font-medium text-foreground/50 cursor-pointer">View All Orders</span>
             </div>
          </div>
          
          <div className="space-y-2 mt-4">
             {recent.map((t, i) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-card rounded-[24px] shadow-sm mb-3">
                   <div className="flex items-center gap-4 w-1/3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                         <img src={`https://i.pravatar.cc/150?u=${t.id}`} alt="User" />
                      </div>
                      <span className="font-semibold text-[15px]">{t.description.split(' ')[0] || "User"}</span>
                   </div>
                   <div className="w-1/4">
                      <span className="font-semibold">${t.amount.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</span>
                   </div>
                   <div className="w-1/4">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-sm ${i % 2 === 0 ? 'bg-[#aba5f8]' : 'bg-[#cadfb9]'}`}></div>
                         <span className="font-medium text-[14px] text-foreground/80">{i % 2 === 0 ? 'Chargeback' : 'Completed'}</span>
                      </div>
                   </div>
                   <div className="w-1/6 text-right">
                      <span className="text-sm font-medium text-foreground/50">11 Sep 2022</span>
                   </div>
                </div>
             ))}
             {recent.length === 0 && <div className="p-8 text-center text-foreground/40 font-medium">No recent orders found.</div>}
          </div>
        </div>
      </div>

      {/* Right Column (Profits & Recent Sales) */}
      <div className="xl:col-span-1 bg-white dark:bg-card rounded-[40px] shadow-sm p-8 flex flex-col h-full border border-card-border">
         <div className="flex justify-between items-start mb-6">
            <div>
               <h3 className="text-[20px] font-semibold text-[#1a1a1a] dark:text-white">Monthly Profits</h3>
               <p className="text-[13px] text-foreground/50 font-medium mt-1">Total Profit Growth of 26%</p>
            </div>
            <button className="p-2 border border-card-border rounded-xl text-foreground/60"><PieChart size={16} /></button>
         </div>

         <div className="flex flex-col items-center justify-center mt-4">
            <div className="relative w-48 h-48">
               <CategoryDonutChart data={charts.donut} />
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-semibold text-foreground/50">Total</span>
                  <span className="text-xl font-bold mt-1">$76,356</span>
               </div>
            </div>
            <div className="w-full mt-8 space-y-4 px-4">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/50 font-medium relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:rounded-full before:bg-[#aba5f8]">Giveaway</span>
                  <span className="font-bold text-[16px]">60%</span>
               </div>
               <div className="w-full h-1 bg-card-border rounded-full"><div className="h-full bg-[#aba5f8] rounded-full" style={{width: '60%'}}></div></div>
               
               <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-foreground/50 font-medium relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:rounded-full before:bg-[#f5dd92]">Affiliate</span>
                  <span className="font-bold text-[16px]">24%</span>
               </div>
               <div className="w-full h-1 bg-card-border rounded-full"><div className="h-full bg-[#f5dd92] rounded-full" style={{width: '24%'}}></div></div>
            </div>
         </div>

         <div className="mt-12 flex-1">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-[18px] font-semibold text-[#1a1a1a] dark:text-white">Recent Sales</h3>
               <span className="text-[13px] font-medium text-foreground/40 cursor-pointer">See All</span>
            </div>
            <div className="space-y-4">
               {[1,2,3,4,5].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-background/50 hover:bg-background transition-colors">
                     <div className="flex items-center gap-3">
                        <img src={`https://i.pravatar.cc/150?img=${item+10}`} className="w-12 h-12 rounded-full object-cover" alt="" />
                        <div>
                           <p className="font-semibold text-[14px]">Steven Summer</p>
                           <p className="text-[12px] font-medium text-foreground/40">02 Minutes Ago</p>
                        </div>
                     </div>
                     <span className="font-bold text-[15px]">+ $52.00</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
