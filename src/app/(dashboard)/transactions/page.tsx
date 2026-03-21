"use client";

import { useState } from "react";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionTable } from "@/components/transactions/TransactionTable";

export default function TransactionsPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transações</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Nova Transação</h2>
          <TransactionForm onSuccess={() => setRefresh(r => r + 1)} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Histórico e Filtros</h2>
          <TransactionTable refreshTrigger={refresh} />
        </div>
      </div>
    </div>
  );
}
