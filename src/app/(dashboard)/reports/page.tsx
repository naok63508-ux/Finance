"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/formatters";

export default function ReportsPage() {
  const [report, setReport] = useState<any[]>([]);
  const [previousReport, setPreviousReport] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Current month
        const res = await fetch(`/api/transactions?month=${month}&year=${year}&type=expense`);
        const data = await res.json();
        
        let total = 0;
        const map: Record<string, number> = {};
        data.forEach((t:any) => {
          map[t.category] = (map[t.category] || 0) + t.amount;
          total += t.amount;
        });

        const arr = Object.keys(map).map(k => ({
          category: k,
          amount: map[k],
          percent: total > 0 ? (map[k] / total) * 100 : 0
        })).sort((a,b) => b.amount - a.amount);

        setReport(arr);

        // Previous month
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth === 0) {
          prevMonth = 12;
          prevYear -= 1;
        }

        const pRes = await fetch(`/api/transactions?month=${prevMonth}&year=${prevYear}&type=expense`);
        const pData = await pRes.json();
        const pMap: Record<string, number> = {};
        pData.forEach((t:any) => {
          pMap[t.category] = (pMap[t.category] || 0) + t.amount;
        });
        setPreviousReport(pMap);
        
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatório Mensal</h1>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Resumo de Despesas por Categoria ({month.toString().padStart(2,'0')}/{year})</h2>
        {loading ? <p className="text-gray-500 animate-pulse">Carregando relatório...</p> : report.length === 0 ? <p className="text-gray-500">Sem despesas registradas neste mês.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                  <th className="pb-3 font-medium">Categoria</th>
                  <th className="pb-3 font-medium text-right">Valor Atual</th>
                  <th className="pb-3 font-medium text-right">% do Total</th>
                  <th className="pb-3 font-medium text-right">Mês Anterior</th>
                  <th className="pb-3 font-medium text-right">Variação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {report.map(r => {
                  const prevAmount = previousReport[r.category] || 0;
                  const diff = r.amount - prevAmount;
                  let diffPercent = 0;
                  if (prevAmount > 0) {
                    diffPercent = (diff / prevAmount) * 100;
                  } else if (r.amount > 0) {
                    diffPercent = 100;
                  }

                  const isMore = diff > 0;
                  const isEqual = diff === 0;

                  return (
                    <tr key={r.category} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100">
                      <td className="py-4 font-medium">{r.category}</td>
                      <td className="py-4 text-right font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(r.amount)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: `${r.percent}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-500 w-8">{r.percent.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                        {prevAmount > 0 ? formatCurrency(prevAmount) : '-'}
                      </td>
                      <td className="py-4 text-right text-sm font-medium">
                        {isEqual ? (
                          <span className="text-gray-500">-</span>
                        ) : isMore ? (
                          <span className="text-red-500">↑ {Math.abs(diffPercent).toFixed(1)}%</span>
                        ) : (
                          <span className="text-green-500">↓ {Math.abs(diffPercent).toFixed(1)}%</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
