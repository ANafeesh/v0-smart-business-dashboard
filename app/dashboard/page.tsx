import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get current month date range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  
  // Get previous month date range
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

  // Fetch current month sales
  const { data: currentSales } = await supabase
    .from("sales")
    .select("total_price")
    .gte("sale_date", startOfMonth)
    .lte("sale_date", endOfMonth)

  // Fetch last month sales
  const { data: lastMonthSales } = await supabase
    .from("sales")
    .select("total_price")
    .gte("sale_date", startOfLastMonth)
    .lte("sale_date", endOfLastMonth)

  // Fetch current month expenses
  const { data: currentExpenses } = await supabase
    .from("expenses")
    .select("amount")
    .gte("expense_date", startOfMonth)
    .lte("expense_date", endOfMonth)

  // Fetch last month expenses
  const { data: lastMonthExpenses } = await supabase
    .from("expenses")
    .select("amount")
    .gte("expense_date", startOfLastMonth)
    .lte("expense_date", endOfLastMonth)

  // Fetch low stock items
  const { data: inventory } = await supabase
    .from("inventory")
    .select("*")

  // Fetch products count
  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  // Fetch recent sales for chart
  const { data: recentSales } = await supabase
    .from("sales")
    .select("*")
    .order("sale_date", { ascending: false })
    .limit(10)

  // Fetch expense categories breakdown
  const { data: expensesByCategory } = await supabase
    .from("expenses")
    .select("category, amount")
    .gte("expense_date", startOfMonth)
    .lte("expense_date", endOfMonth)

  // Calculate totals
  const totalSales = currentSales?.reduce((sum, s) => sum + Number(s.total_price), 0) || 0
  const totalExpenses = currentExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const lastMonthTotalSales = lastMonthSales?.reduce((sum, s) => sum + Number(s.total_price), 0) || 0
  const lastMonthTotalExpenses = lastMonthExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

  const salesGrowth = lastMonthTotalSales > 0 
    ? Math.round(((totalSales - lastMonthTotalSales) / lastMonthTotalSales) * 100)
    : 0
  
  const expenseGrowth = lastMonthTotalExpenses > 0
    ? Math.round(((totalExpenses - lastMonthTotalExpenses) / lastMonthTotalExpenses) * 100)
    : 0

  const lowStockItems = inventory?.filter(item => Number(item.quantity) <= Number(item.min_stock_level)) || []

  // Group expenses by category
  const expenseCategories = expensesByCategory?.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount)
    return acc
  }, {} as Record<string, number>) || {}

  const expenseCategoryData = Object.entries(expenseCategories).map(([name, value]) => ({
    name,
    value,
  }))

  const stats = {
    totalSales,
    totalExpenses,
    netProfit: totalSales - totalExpenses,
    salesGrowth,
    expenseGrowth,
    lowStockCount: lowStockItems.length,
    productsCount: productsCount || 0,
    inventoryCount: inventory?.length || 0,
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Dashboard" 
        description="Overview of your business performance"
      />
      <DashboardContent 
        stats={stats}
        recentSales={recentSales || []}
        lowStockItems={lowStockItems}
        expenseCategoryData={expenseCategoryData}
      />
    </div>
  )
}
