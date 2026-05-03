"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download,
  BarChart3,
  PieChartIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ReportsContentProps {
  chartData: {
    month: string
    sales: number
    expenses: number
    profit: number
  }[]
  topProducts: {
    name: string
    quantity: number
    revenue: number
  }[]
  expenseBreakdown: {
    name: string
    value: number
  }[]
  totalSales: number
  totalExpenses: number
}

const COLORS = [
  "oklch(0.55 0.15 35)",
  "oklch(0.65 0.12 80)",
  "oklch(0.6 0.15 160)",
  "oklch(0.7 0.1 200)",
  "oklch(0.5 0.1 280)",
  "oklch(0.6 0.1 320)",
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function ReportsContent({
  chartData,
  topProducts,
  expenseBreakdown,
  totalSales,
  totalExpenses,
}: ReportsContentProps) {
  const netProfit = totalSales - totalExpenses
  const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : "0"

  const handleExportPDF = () => {
    // PDF export would be implemented here
    alert("PDF export feature coming soon!")
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSales)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <p className={cn(
                  "text-2xl font-bold",
                  netProfit >= 0 ? "text-success" : "text-destructive"
                )}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                netProfit >= 0 ? "bg-success/10" : "bg-destructive/10"
              )}>
                {netProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                <p className={cn(
                  "text-2xl font-bold",
                  Number(profitMargin) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {profitMargin}%
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Revenue vs Expenses (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.some(d => d.sales > 0 || d.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 60)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: "oklch(0.5 0.02 40)", fontSize: 12 }}
                  axisLine={{ stroke: "oklch(0.9 0.01 60)" }}
                />
                <YAxis 
                  tick={{ fill: "oklch(0.5 0.02 40)", fontSize: 12 }}
                  axisLine={{ stroke: "oklch(0.9 0.01 60)" }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.9 0.01 60)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="sales" 
                  name="Revenue"
                  fill="oklch(0.6 0.15 145)" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="expenses" 
                  name="Expenses"
                  fill="oklch(0.55 0.2 27)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              No data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profit Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Profit Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.some(d => d.profit !== 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.15 35)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.55 0.15 35)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 60)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: "oklch(0.5 0.02 40)", fontSize: 12 }}
                  axisLine={{ stroke: "oklch(0.9 0.01 60)" }}
                />
                <YAxis 
                  tick={{ fill: "oklch(0.5 0.02 40)", fontSize: 12 }}
                  axisLine={{ stroke: "oklch(0.9 0.01 60)" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Profit"]}
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.9 0.01 60)",
                    borderRadius: "8px",
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="oklch(0.55 0.15 35)" 
                  fill="url(#profitGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No profit data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((_, index) => (
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
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                    formatter={(value) => (
                      <span className="text-sm text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
