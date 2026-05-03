import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { AIInsightsContent } from "@/components/dashboard/ai-insights-content"
import { startOfMonth, subMonths, format } from "date-fns"

export default async function AIInsightsPage() {
  const supabase = await createClient()
  const now = new Date()
  const threeMonthsAgo = subMonths(startOfMonth(now), 2)
  
  // Fetch recent sales
  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .gte("sale_date", format(threeMonthsAgo, "yyyy-MM-dd"))
    .order("sale_date", { ascending: false })

  // Fetch recent expenses
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .gte("expense_date", format(threeMonthsAgo, "yyyy-MM-dd"))
    .order("expense_date", { ascending: false })

  // Fetch inventory
  const { data: inventory } = await supabase
    .from("inventory")
    .select("*")

  // Calculate summary stats
  const totalSales = sales?.reduce((sum, s) => sum + Number(s.total_price), 0) || 0
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const lowStockItems = inventory?.filter(item => 
    Number(item.quantity) <= Number(item.min_stock_level)
  ) || []

  // Product performance
  const productSales: Record<string, { quantity: number; revenue: number }> = {}
  sales?.forEach(sale => {
    if (!productSales[sale.product_name]) {
      productSales[sale.product_name] = { quantity: 0, revenue: 0 }
    }
    productSales[sale.product_name].quantity += sale.quantity
    productSales[sale.product_name].revenue += Number(sale.total_price)
  })

  // Expense categories
  const expenseCategories: Record<string, number> = {}
  expenses?.forEach(expense => {
    expenseCategories[expense.category] = (expenseCategories[expense.category] || 0) + Number(expense.amount)
  })

  const businessData = {
    totalSales,
    totalExpenses,
    netProfit: totalSales - totalExpenses,
    profitMargin: totalSales > 0 ? ((totalSales - totalExpenses) / totalSales * 100).toFixed(1) : "0",
    lowStockCount: lowStockItems.length,
    lowStockItems: lowStockItems.map(i => i.item_name).slice(0, 5),
    topProducts: Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data })),
    expenseBreakdown: Object.entries(expenseCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount })),
    salesCount: sales?.length || 0,
    expensesCount: expenses?.length || 0,
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="AI Insights" 
        description="Get smart recommendations powered by AI"
      />
      <AIInsightsContent businessData={businessData} />
    </div>
  )
}
