"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  ShoppingCart
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import type { Sale, InventoryItem } from "@/lib/types"
import { format } from "date-fns"

interface DashboardContentProps {
  stats: {
    totalSales: number
    totalExpenses: number
    netProfit: number
    salesGrowth: number
    expenseGrowth: number
    lowStockCount: number
    productsCount: number
    inventoryCount: number
  }
  recentSales: Sale[]
  lowStockItems: InventoryItem[]
  expenseCategoryData: { name: string; value: number }[]
}

const COLORS = [
  "oklch(0.55 0.15 35)",
  "oklch(0.65 0.12 80)",
  "oklch(0.6 0.15 160)",
  "oklch(0.7 0.1 200)",
  "oklch(0.5 0.1 280)",
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export function DashboardContent({
  stats,
  recentSales,
  lowStockItems,
  expenseCategoryData,
}: DashboardContentProps) {
  // Group sales by date for chart
  const salesByDate = recentSales.reduce((acc, sale) => {
    const date = format(new Date(sale.sale_date), "MMM d")
    acc[date] = (acc[date] || 0) + Number(sale.total_price)
    return acc
  }, {} as Record<string, number>)

  const salesChartData = Object.entries(salesByDate)
    .map(([date, total]) => ({ date, total }))
    .reverse()

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sales"
          value={formatCurrency(stats.totalSales)}
          icon={DollarSign}
          trend={stats.salesGrowth}
          trendLabel="vs last month"
          variant="success"
        />
        <StatsCard
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          icon={CreditCard}
          trend={stats.expenseGrowth}
          trendLabel="vs last month"
          variant="destructive"
        />
        <StatsCard
          title="Net Profit"
          value={formatCurrency(stats.netProfit)}
          icon={TrendingUp}
          variant={stats.netProfit >= 0 ? "success" : "destructive"}
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon={stats.lowStockCount > 0 ? AlertTriangle : Package}
          variant={stats.lowStockCount > 0 ? "warning" : "default"}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 60)" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "oklch(0.5 0.02 40)", fontSize: 12 }}
                    axisLine={{ stroke: "oklch(0.9 0.01 60)" }}
                  />
                  <YAxis 
                    tick={{ fill: "oklch(0.5 0.02 40)", fontSize: 12 }}
                    axisLine={{ stroke: "oklch(0.9 0.01 60)" }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Sales"]}
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.9 0.01 60)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="oklch(0.55 0.15 35)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {expenseCategoryData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.9 0.01 60)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expense data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {lowStockItems.slice(0, 6).map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.item_name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-destructive">
                      {item.quantity} {item.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Min: {item.min_stock_level}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.slice(0, 5).map((sale) => (
                <div 
                  key={sale.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{sale.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(sale.sale_date), "MMM d, yyyy")} - Qty: {sale.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-success">
                    +{formatCurrency(Number(sale.total_price))}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No recent transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
