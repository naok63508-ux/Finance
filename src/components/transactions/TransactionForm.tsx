"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Sparkles, Plus } from "lucide-react";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().min(3, "Descrição muito curta"),
  category: z.string().min(1, "Categoria é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof formSchema>;

export function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const description = form.watch("description");

  useEffect(() => {
    if (!description || description.length < 4) return;
    
    const timeoutId = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const response = await fetch("/api/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.category && form.getValues("category") === "") {
            form.setValue("category", data.category);
            setAiSuggested(true);
            toast.success("Categoria sugerida pela IA!", { icon: "✨" });
          }
        }
      } catch (error) {
        console.error("Falha ao categorizar", error);
      } finally {
        setIsSuggesting(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timeoutId);
  }, [description, form]);

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      const numericAmount = parseFloat(
        data.amount.replace(/[^0-9,-]+/g, "").replace(",", ".")
      );

      if (isNaN(numericAmount)) {
        toast.error("Valor inválido");
        return;
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          amount: numericAmount,
          aiSuggested,
        }),
      });

      if (!response.ok) throw new Error("Erro ao salvar");

      toast.success("Transação adicionada com sucesso!");
      form.reset();
      setAiSuggested(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Falha ao adicionar transação.");
    }
  };

  const inputClasses = "w-full rounded-2xl bg-background border border-card-border px-5 py-3.5 text-[15px] font-medium outline-none transition-all placeholder:text-foreground/40 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 hover:bg-background/80";
  const labelClasses = "block text-[13px] font-bold text-foreground/60 uppercase tracking-widest mb-2 pl-1";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 rounded-[2rem] border border-card-border shadow-sm hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Tipo</label>
          <div className="relative">
            <select {...form.register("type")} className={`${inputClasses} appearance-none cursor-pointer`}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
          {form.formState.errors.type && <p className="text-red-500 text-xs mt-2 pl-1 font-medium">{form.formState.errors.type.message}</p>}
        </div>

        <div>
           <label className={labelClasses}>Valor Declarado</label>
           <input 
             type="text" 
             placeholder="R$ 0,00"
             {...form.register("amount")} 
             className={inputClasses}
             onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                value = (Number(value) / 100).toFixed(2) + "";
                value = value.replace(".", ",");
                value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
                form.setValue("amount", value);
             }}
           />
           {form.formState.errors.amount && <p className="text-red-500 text-xs mt-2 pl-1 font-medium">{form.formState.errors.amount.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Descrição Resumida</label>
          <input 
            type="text" 
            placeholder="Ex: Computador novo, Almoço de negócios..."
            {...form.register("description")} 
            className={inputClasses}
          />
          {form.formState.errors.description && <p className="text-red-500 text-xs mt-2 pl-1 font-medium">{form.formState.errors.description.message}</p>}
        </div>

        <div>
          <label className={`${labelClasses} flex items-center justify-between`}>
            Categoria
            {isSuggesting && <span className="text-[10px] text-indigo-500 flex items-center gap-1 animate-pulse capitalize tracking-widest"><Sparkles size={12}/> Analisando...</span>}
          </label>
          <div className="relative">
            <select 
              {...form.register("category")} 
              className={`${inputClasses} appearance-none cursor-pointer`}
            >
              <option value="">Selecione uma opção</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Transporte">Transporte</option>
              <option value="Moradia">Moradia</option>
              <option value="Saúde">Saúde</option>
              <option value="Lazer">Lazer</option>
              <option value="Educação">Educação</option>
              <option value="Vestuário">Vestuário</option>
              <option value="Assinaturas">Assinaturas</option>
              <option value="Salário">Salário</option>
              <option value="Investimentos">Investimentos</option>
              <option value="Outros">Outros</option>
            </select>
            {aiSuggested && <span className="absolute right-10 top-3.5 flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full ring-1 ring-indigo-500/20"><Sparkles size={10}/> IA</span>}
          </div>
          {form.formState.errors.category && <p className="text-red-500 text-xs mt-2 pl-1 font-medium">{form.formState.errors.category.message}</p>}
        </div>

        <div>
          <label className={labelClasses}>Data Efetiva</label>
          <input 
            type="date" 
            {...form.register("date")} 
            className={inputClasses}
          />
          {form.formState.errors.date && <p className="text-red-500 text-xs mt-2 pl-1 font-medium">{form.formState.errors.date.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Observações Opcionais</label>
          <input 
            type="text" 
            placeholder="Anotações para uso pessoal"
            {...form.register("notes")} 
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          className="flex items-center gap-2 bg-foreground hover:bg-foreground/90 text-background font-bold py-3.5 px-8 rounded-2xl disabled:opacity-50 transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          {form.formState.isSubmitting ? (
             <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div> Salvando</span>
          ) : (
             <span className="flex items-center gap-2"><Plus size={18}/> Salvar Transação</span>
          )}
        </button>
      </div>
    </form>
  );
}
