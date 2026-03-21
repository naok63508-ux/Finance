"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { CategoryBadge } from "./CategoryBadge";
import { toast } from "react-hot-toast";
import { Download, Search, Trash2 } from "lucide-react";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  date: string;
  notes: string | null;
  aiSuggested: boolean;
};

export function TransactionTable({ refreshTrigger }: { refreshTrigger: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterMonth) query.append('month', filterMonth.toString());
      if (filterYear) query.append('year', filterYear.toString());
      if (filterType) query.append('type', filterType);
      if (filterCategory) query.append('category', filterCategory);

      const res = await fetch(`/api/transactions?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterMonth, filterYear, filterType, filterCategory, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta transação destrói os dados pra sempre. Continuar?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deletada permanentemente");
        fetchTransactions();
      } else {
        toast.error("Processo falhou");
      }
    } catch (error) {
      toast.error("Erro interno ao excluir");
    }
  };

  const exportCSV = () => {
    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor", "Observações"];
    const csvContent = [
      headers.join(","),
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        `"${t.description}"`,
        t.category,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount.toString().replace('.', ','),
        `"${t.notes || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `extrato_${filterMonth}_${filterYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectClasses = "rounded-full bg-background border border-card-border px-4 py-2.5 text-[14px] font-medium outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 hover:bg-background/80 cursor-pointer appearance-none min-w-[120px]";

  return (
    <div className="bg-card rounded-[2rem] border border-card-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Filters and Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 pt-2">
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative">
              <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className={selectClasses}>
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Mês: {m.toString().padStart(2, '0')}</option>
                ))}
              </select>
           </div>
           <div className="relative">
              <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className={selectClasses}>
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>Ano: {y}</option>
                ))}
              </select>
           </div>
           <div className="w-px h-6 bg-card-border mx-2 hidden sm:block"></div>
           <div className="relative">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selectClasses}>
                <option value="">Status: Todos</option>
                <option value="income">Status: Receita</option>
                <option value="expense">Status: Despesa</option>
              </select>
           </div>
           <div className="relative flex-1 min-w-[140px]">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={`${selectClasses} w-full`}>
                <option value="">Ver todas as categorias</option>
                <option value="Alimentação">Alimentação</option>
                <option value="Transporte">Transporte</option>
                <option value="Lazer">Lazer</option>
                <option value="Salário">Salário</option>
                <option value="Outros">Outros</option>
              </select>
           </div>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 text-[14px] font-bold py-2.5 px-6 rounded-full transition-colors whitespace-nowrap self-start xl:self-auto"
        >
          <Download size={16} />
          Exportar Extrato
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-card-border text-[11px] uppercase tracking-widest text-foreground/40 font-bold">
              <th className="pb-4 pl-4">Data Efetiva</th>
              <th className="pb-4">Descrição e Detalhes</th>
              <th className="pb-4">Tag</th>
              <th className="pb-4 text-right">Líquido</th>
              <th className="pb-4 text-center pr-4">Gerenciar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-16 text-foreground/40 font-medium animate-pulse">Carregando seus dados...</td></tr>
            ) : transactions.length === 0 ? (
              <tr>
                 <td colSpan={5} className="text-center py-20 text-foreground/40">
                   <div className="flex flex-col items-center gap-2">
                     <Search size={32} className="opacity-20 mb-2"/>
                     <p className="font-semibold text-lg text-foreground/50">Fluxo Vazio</p>
                     <p className="text-sm">Nenhuma transação atende aos filtros atuais.</p>
                   </div>
                 </td>
              </tr>
            ) : transactions.map(t => (
              <tr key={t.id} className="hover:bg-background/40 transition-colors group">
                <td className="py-6 pl-4">
                   <span className="bg-background border border-card-border px-3 py-1.5 rounded-full text-xs font-bold text-foreground/70">{formatDate(t.date)}</span>
                </td>
                <td className="py-5 pr-4">
                  <p className="text-[15px] font-bold text-foreground group-hover:text-indigo-500 transition-colors">{t.description}</p>
                  {t.notes && <p className="text-[13px] text-foreground/50 mt-1 font-medium bg-background inline-block px-2 py-0.5 rounded-md border border-card-border/50">{t.notes}</p>}
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={t.category} />
                    {t.aiSuggested && <span title="Processado por IA" className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20 text-[10px]">✨</span>}
                  </div>
                </td>
                <td className="py-5 text-right">
                  <span className={`text-[16px] font-black tracking-tight ${t.type === 'income' ? 'text-pastel-green-fg dark:text-green-400' : 'text-foreground'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </td>
                <td className="py-5 text-center pr-4">
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-xl text-foreground/30 hover:text-pastel-red-fg hover:bg-pastel-red transition-all group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
