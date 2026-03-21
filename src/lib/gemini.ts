import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function categorizeTransaction(description: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY não está definida. Retornando 'Outros'.");
    return "Outros";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(
      `Você é um assistente de finanças pessoais. Categorize a transação abaixo em
       EXATAMENTE UMA das categorias: Alimentação, Transporte, Moradia, Saúde,
       Lazer, Educação, Vestuário, Assinaturas, Salário, Investimentos, Outros.
       Transação: "${description}". Responda APENAS com o nome da categoria.`
    );
    return result.response.text().trim();
  } catch (error) {
    console.error("Erro ao chamar o Gemini:", error);
    return "Outros"; // Fallback seguro
  }
}
