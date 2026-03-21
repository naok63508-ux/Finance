import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

interface GoalProgressBarProps {
  category: string;
  spent: number;
  limit: number;
}

export function GoalProgressBar({ category, spent, limit }: GoalProgressBarProps) {
  const percentage = Math.min((spent / limit) * 100, 100);
  
  let colorClass = "bg-green-500";
  if (percentage >= 90) colorClass = "bg-red-500";
  else if (percentage >= 70) colorClass = "bg-yellow-500";

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1 text-sm font-medium">
        <span className="text-gray-700 dark:text-gray-300">{category}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
        <div 
          className={cn("h-2.5 rounded-full transition-all duration-500", colorClass)} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {percentage > 80 && (
        <p className="text-xs text-red-500 mt-1 font-medium">
          Atenção: Você atingiu {percentage.toFixed(0)}% da meta!
        </p>
      )}
    </div>
  );
}
