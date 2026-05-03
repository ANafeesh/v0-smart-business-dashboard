import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { businessData } = await req.json()

    const prompt = `You are a business advisor for a cafe/small business owner. Based on the following data, provide 2-3 actionable recommendations to improve their business. Be specific, practical, and encouraging.

Business Data (Last 3 Months):
- Total Revenue: $${businessData.totalSales.toFixed(2)}
- Total Expenses: $${businessData.totalExpenses.toFixed(2)}
- Net Profit: $${businessData.netProfit.toFixed(2)}
- Profit Margin: ${businessData.profitMargin}%
- Number of Sales Transactions: ${businessData.salesCount}
- Number of Expense Entries: ${businessData.expensesCount}
- Items Low on Stock: ${businessData.lowStockCount} (${businessData.lowStockItems.join(", ") || "None"})
- Top Products: ${businessData.topProducts.map((p: { name: string; revenue: number }) => `${p.name} ($${p.revenue.toFixed(2)})`).join(", ") || "No data"}
- Top Expense Categories: ${businessData.expenseBreakdown.map((e: { category: string; amount: number }) => `${e.category} ($${e.amount.toFixed(2)})`).join(", ") || "No data"}

Please provide personalized recommendations based on this specific data. Focus on:
1. Revenue optimization
2. Cost reduction opportunities
3. Inventory management
4. Any concerning patterns or positive trends

Keep your response concise (under 300 words) and actionable.`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      maxOutputTokens: 500,
    })

    return Response.json({ recommendation: result.text })
  } catch (error) {
    console.error("AI insights error:", error)
    return Response.json(
      { 
        recommendation: "Unable to generate AI insights at this time. Please ensure you have some business data recorded (sales, expenses, or inventory) and try again." 
      },
      { status: 200 }
    )
  }
}
