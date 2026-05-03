"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  RefreshCw,
  Brain,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BusinessData {
  totalSales: number
  totalExpenses: number
  netProfit: number
  profitMargin: string
  lowStockCount: number
  lowStockItems: string[]
  topProducts: { name: string; quantity: number; revenue: number }[]
  expenseBreakdown: { category: string; amount: number }[]
  salesCount: number
  expensesCount: number
}

interface AIInsightsContentProps {
  businessData: BusinessData
}

interface Insight {
  id: string
  type: "success" | "warning" | "tip"
  title: string
  description: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export function AIInsightsContent({ businessData }: AIInsightsContentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [insights, setInsights] = useState<Insight[]>([])
  const [aiRecommendation, setAiRecommendation] = useState<string>("")

  const generateInsights = async () => {
    setIsLoading(true)
    setAiRecommendation("")
    
    try {
      const response = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessData }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate insights")
      }

      const data = await response.json()
      setAiRecommendation(data.recommendation)
      
      // Generate static insights based on data
      const newInsights: Insight[] = []
      
      if (businessData.netProfit > 0) {
        newInsights.push({
          id: "profit",
          type: "success",
          title: "Profitable Performance",
          description: `Your business is profitable with a ${businessData.profitMargin}% profit margin. Keep up the good work!`,
        })
      } else if (businessData.netProfit < 0) {
        newInsights.push({
          id: "loss",
          type: "warning",
          title: "Attention: Operating at Loss",
          description: `Your expenses exceed sales by ${formatCurrency(Math.abs(businessData.netProfit))}. Consider reviewing your expense categories.`,
        })
      }

      if (businessData.lowStockCount > 0) {
        newInsights.push({
          id: "stock",
          type: "warning",
          title: "Low Stock Alert",
          description: `${businessData.lowStockCount} items need restocking: ${businessData.lowStockItems.join(", ")}.`,
        })
      }

      if (businessData.topProducts.length > 0) {
        newInsights.push({
          id: "top-product",
          type: "tip",
          title: "Best Seller",
          description: `"${businessData.topProducts[0].name}" is your top performer with ${formatCurrency(businessData.topProducts[0].revenue)} in revenue.`,
        })
      }

      if (businessData.expenseBreakdown.length > 0) {
        const topExpense = businessData.expenseBreakdown[0]
        newInsights.push({
          id: "expense",
          type: "tip",
          title: "Biggest Expense Category",
          description: `${topExpense.category} accounts for ${formatCurrency(topExpense.amount)} of your expenses. Look for optimization opportunities.`,
        })
      }

      setInsights(newInsights)
    } catch (error) {
      console.error("Error generating insights:", error)
      setAiRecommendation("Unable to generate AI insights at this time. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle2
      case "warning":
        return AlertTriangle
      case "tip":
        return Lightbulb
      default:
        return Sparkles
    }
  }

  const getInsightStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-success/10 border-success/30 text-success"
      case "warning":
        return "bg-warning/10 border-warning/30 text-warning"
      case "tip":
        return "bg-primary/10 border-primary/30 text-primary"
      default:
        return "bg-muted border-border text-foreground"
    }
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
            <p className="text-xl font-bold text-success">{formatCurrency(businessData.totalSales)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Expenses</p>
            <p className="text-xl font-bold text-destructive">{formatCurrency(businessData.totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Net Profit</p>
            <p className={cn(
              "text-xl font-bold",
              businessData.netProfit >= 0 ? "text-success" : "text-destructive"
            )}>
              {formatCurrency(businessData.netProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Profit Margin</p>
            <p className={cn(
              "text-xl font-bold",
              Number(businessData.profitMargin) >= 0 ? "text-success" : "text-destructive"
            )}>
              {businessData.profitMargin}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Generate Insights Button */}
      <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Brain className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">AI Business Advisor</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations based on your business data
                </p>
              </div>
            </div>
            <Button 
              onClick={generateInsights} 
              disabled={isLoading}
              className="gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendation */}
      {aiRecommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap leading-relaxed">{aiRecommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Grid */}
      {insights.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.type)
            return (
              <Card 
                key={insight.id}
                className={cn(
                  "border-2",
                  getInsightStyles(insight.type).split(" ").slice(0, 2).join(" ")
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                      getInsightStyles(insight.type)
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!aiRecommendation && insights.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              Ready to Analyze Your Business
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Click &quot;Generate Insights&quot; above to get AI-powered recommendations 
              based on your sales, expenses, and inventory data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Business Data Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {businessData.topProducts.length > 0 ? (
              <div className="space-y-3">
                {businessData.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-5">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                    <span className="text-sm text-success font-medium">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No sales data available</p>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {businessData.expenseBreakdown.length > 0 ? (
              <div className="space-y-3">
                {businessData.expenseBreakdown.map((expense, index) => (
                  <div key={expense.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-5">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-foreground">{expense.category}</span>
                    </div>
                    <span className="text-sm text-destructive font-medium">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No expense data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
