import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { ReportsContent } from "@/components/dashboard/reports-content"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export default async function ReportsPage() {
  const supabase = await createClient()
  const now = new Date()
  
  // Fetch last 6 months of data
  const sixMonthsAgo = subMonths(startOfMonth(now), 5)
  
  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .gte("sale_date", format(sixMonthsAgo, "yyyy-MM-dd"))
    .order("sale_date", { ascending: true })

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .gte("expense_date", format(sixMonthsAgo, "yyyy-MM-dd"))
    .order("expense_date", { ascending: true })

  // Group by month
  const monthlyData: Record<string, { sales: number; expenses: number; profit: number }> = {}
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i)
    const monthKey = format(monthDate, "MMM yyyy")
    monthlyData[monthKey] = { sales: 0, expenses: 0, profit: 0 }
  }

  sales?.forEach(sale => {
    const monthKey = format(new Date(sale.sale_date), "MMM yyyy")
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].sales += Number(sale.total_price)
    }
  })

  expenses?.forEach(expense => {
    const monthKey = format(new Date(expense.expense_date), "MMM yyyy")
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].expenses += Number(expense.amount)
    }
  })

  Object.keys(monthlyData).forEach(key => {
    monthlyData[key].profit = monthlyData[key].sales - monthlyData[key].expenses
  })

  const chartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    sales: data.sales,
    expenses: data.expenses,
    profit: data.profit,
  }))

  // Product sales breakdown
  const productSales: Record<string, { quantity: number; revenue: number }> = {}
  sales?.forEach(sale => {
    if (!productSales[sale.product_name]) {
      productSales[sale.product_name] = { quantity: 0, revenue: 0 }
    }
    productSales[sale.product_name].quantity += sale.quantity
    productSales[sale.product_name].revenue += Number(sale.total_price)
  })

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Expense breakdown
  const expenseCategories: Record<string, number> = {}
  expenses?.forEach(expense => {
    expenseCategories[expense.category] = (expenseCategories[expense.category] || 0) + Number(expense.amount)
  })

  const expenseBreakdown = Object.entries(expenseCategories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Calculate totals
  const totalSales = sales?.reduce((sum, s) => sum + Number(s.total_price), 0) || 0
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Reports" 
        description="Detailed analytics and business insights"
      />
      <ReportsContent 
        chartData={chartData}
        topProducts={topProducts}
        expenseBreakdown={expenseBreakdown}
        totalSales={totalSales}
        totalExpenses={totalExpenses}
      />
    </div>
  )
}
