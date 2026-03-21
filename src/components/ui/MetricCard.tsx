import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  type?: "balance" | "sales" | "upgrade";
  className?: string;
  children?: ReactNode;
}

const typeStyles = {
  balance: "bg-z-green text-z-green-dark border-none",
  sales: "bg-z-yellow text-z-yellow-dark border-none",
  upgrade: "bg-z-purple text-white border-none",
};

export function MetricCard({ title, value, trend, type = "balance", className, children }: MetricCardProps) {
  
  if (type === "upgrade") {
     return (
       <div className={cn("rounded-3xl p-6 sm:p-7 flex flex-col justify-between h-44 shadow-lg shadow-z-purple/30", typeStyles.upgrade, className)}>
         <div className="mb-2">
            <h3 className="text-[20px] font-semibold text-center mt-2">Upgrade</h3>
            <p className="text-[13px] text-white/80 text-center mt-3 font-medium px-4 leading-snug">Get more information and opportunities</p>
         </div>
         <div className="flex justify-center mt-3 text-sm">
            <button className="bg-[#8b82f6] text-white py-2 px-6 rounded-full font-medium hover:bg-[#7a71f0] transition-colors shadow-sm">Go Pro</button>
         </div>
       </div>
     );
  }

  return (
    <div className={cn("rounded-3xl p-6 sm:p-7 flex flex-col justify-between h-44 shadow-sm", typeStyles[type], className)}>
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2 text-[15px] font-semibold">
           <span className="opacity-80">$</span> {title}
         </div>
        
        {trend && (
          <div className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/30 text-current shadow-sm border border-white/10">
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="mt-1">
        <h3 className="text-[32px] font-bold tracking-tight">$ {value}</h3>
      </div>
      
      {/* Decorative little line chart bottom */}
      <div className="mt-auto h-8 opacity-60">
         <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           {type === 'balance' 
             ? <path d="M0 15 Q 10 5, 20 15 T 40 10 T 60 15 T 80 5 T 100 10" />
             : <path d="M0 10 Q 15 20, 30 10 T 60 5 T 80 15 T 100 5" />
           }
         </svg>
      </div>
    </div>
  );
}
