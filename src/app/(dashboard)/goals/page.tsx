"use client";

import { useState, useEffect } from "react";
import { GoalProgressBar } from "@/components/ui/GoalProgressBar";
import { toast } from "react-hot-toast";

const CATEGORIES = [
  "Alimentação", "Transporte", "Moradia", 
  "Saúde", "Lazer", "Educação", 
  "Vestuário", "Assinaturas", "Outros"
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formLimit, setFormLimit] = useState("");

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  const loadData = async () => {
    setLoading(true);
    try {
      const goalsRes = await fetch(`/api/goals?month=${month}&year=${year}`);
      if (goalsRes.ok) {
         const goalsData = await goalsRes.json();
         setGoals(goalsData);
      }

      const transRes = await fetch(`/api/transactions?month=${month}&year=${year}&type=expense`);
      if (transRes.ok) {
        const transData = await transRes.json();
        const expMap: Record<string, number> = {};
        transData.forEach((t: any) => {
          expMap[t.category] = (expMap[t.category] || 0) + t.amount;
        });
        setExpenses(expMap);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLimit) return;

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: formCategory, limitAmount: formLimit, month, year })
      });
      if (res.ok) {
        toast.success("Meta definida com sucesso!");
        setFormLimit("");
        loadData();
      } else {
        toast.error("Erro ao definir meta");
      }
    } catch (e) {
      toast.error("Erro interno");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Metas Mensais</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Definir Nova Meta</h2>
          <form onSubmit={handleSetGoal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Categoria</label>
              <select 
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 dark:bg-gray-800 dark:text-white"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium mb-1 dark:text-gray-300">Limite Mensal (R$)</label>
               <input 
                 type="number" step="0.01" value={formLimit} onChange={e => setFormLimit(e.target.value)}
                 className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 dark:bg-gray-800 dark:text-white"
                 required
               />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors">
              Salvar Meta
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Progresso {month.toString().padStart(2, '0')}/{year}</h2>
          {loading ? (
            <p className="text-gray-500 animate-pulse">Carregando metas...</p>
          ) : goals.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Nenhuma meta definida para o mês atual. Defina uma meta ao lado.</p>
          ) : (
            <div className="space-y-2">
              {goals.map(g => (
                <GoalProgressBar 
                  key={g.id} 
                  category={g.category} 
                  limit={g.limitAmount} 
                  spent={expenses[g.category] || 0} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
