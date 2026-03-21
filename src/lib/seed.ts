import prisma from "./prisma";

export async function seedUserData(userId: string) {
  const date = new Date();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  const transactions = [];
  
  for (let i = 0; i < 3; i++) {
    const month = currentMonth - i;
    const year = month < 0 ? currentYear - 1 : currentYear;
    const m = month < 0 ? 12 + month : month;

    // Income
    transactions.push({
      userId, amount: 5000, type: "income", category: "Salário", description: "Salário Mensal",
      date: new Date(year, m, 5), aiSuggested: false
    });

    // Expenses
    transactions.push({
      userId, amount: 1500, type: "expense", category: "Moradia", description: "Aluguel",
      date: new Date(year, m, 10), aiSuggested: false
    });
    transactions.push({
      userId, amount: 800, type: "expense", category: "Alimentação", description: "Mercado e padaria",
      date: new Date(year, m, 15), aiSuggested: false
    });
    transactions.push({
      userId, amount: 200, type: "expense", category: "Lazer", description: "Cinema e Pipoca",
      date: new Date(year, m, 20), aiSuggested: false
    });
    transactions.push({
      userId, amount: 350, type: "expense", category: "Transporte", description: "Transporte App",
      date: new Date(year, m, 22), aiSuggested: false
    });
    transactions.push({
      userId, amount: 100, type: "expense", category: "Assinaturas", description: "Streaming",
      date: new Date(year, m, 12), aiSuggested: false
    });
  }

  await prisma.transaction.createMany({ data: transactions });

  // Create goals for the current month
  const actualMonth = currentMonth + 1; // 1-12
  const goals = [
    { userId, category: "Alimentação", limitAmount: 1000, month: actualMonth, year: currentYear },
    { userId, category: "Lazer", limitAmount: 300, month: actualMonth, year: currentYear },
    { userId, category: "Transporte", limitAmount: 400, month: actualMonth, year: currentYear },
  ];
  await prisma.goal.createMany({ data: goals });
}
