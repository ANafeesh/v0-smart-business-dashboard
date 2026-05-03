"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTable } from "./data-table"
import { Plus, Receipt, Filter } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import type { Expense } from "@/lib/types"
import { EXPENSE_CATEGORIES } from "@/lib/types"

interface ExpensesContentProps {
  initialExpenses: Expense[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export function ExpensesContent({ initialExpenses }: ExpensesContentProps) {
  const router = useRouter()
  const [expenses, setExpenses] = useState(initialExpenses)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Expense | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState("")

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: 0,
    expense_date: new Date().toISOString().split("T")[0],
  })

  const resetForm = () => {
    setFormData({
      category: "",
      description: "",
      amount: 0,
      expense_date: new Date().toISOString().split("T")[0],
    })
    setEditingExpense(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    const expenseData = {
      user_id: user.id,
      category: formData.category,
      description: formData.description || null,
      amount: formData.amount,
      expense_date: formData.expense_date,
    }

    if (editingExpense) {
      const { error } = await supabase
        .from("expenses")
        .update(expenseData)
        .eq("id", editingExpense.id)

      if (!error) {
        setExpenses(expenses.map(e => 
          e.id === editingExpense.id 
            ? { ...e, ...expenseData }
            : e
        ))
      }
    } else {
      const { data, error } = await supabase
        .from("expenses")
        .insert(expenseData)
        .select()
        .single()

      if (!error && data) {
        setExpenses([data, ...expenses])
      }
    }

    setIsLoading(false)
    setIsDialogOpen(false)
    resetForm()
    router.refresh()
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      category: expense.category,
      description: expense.description || "",
      amount: Number(expense.amount),
      expense_date: expense.expense_date,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (expense: Expense) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expense.id)

    if (!error) {
      setExpenses(expenses.filter(e => e.id !== expense.id))
    }
    setDeleteConfirm(null)
    router.refresh()
  }

  const filteredExpenses = expenses.filter(expense =>
    expense.category.toLowerCase().includes(filter.toLowerCase()) ||
    (expense.description && expense.description.toLowerCase().includes(filter.toLowerCase()))
  )

  const columns = [
    {
      key: "category",
      header: "Category",
      render: (expense: Expense) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Receipt className="h-4 w-4 text-destructive" />
          </div>
          <span className="font-medium">{expense.category}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (expense: Expense) => (
        <span className="text-muted-foreground">
          {expense.description || "-"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (expense: Expense) => (
        <span className="font-semibold text-destructive">
          -{formatCurrency(Number(expense.amount))}
        </span>
      ),
    },
    {
      key: "expense_date",
      header: "Date",
      render: (expense: Expense) => format(new Date(expense.expense_date), "MMM d, yyyy"),
    },
  ]

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

  // Group expenses by category for summary
  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount)
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(totalExpenses)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-destructive/20 flex items-center justify-center">
              <Receipt className="h-8 w-8 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Summary */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {Object.entries(expensesByCategory).slice(0, 4).map(([category, amount]) => (
            <Card key={category}>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground truncate">{category}</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(amount)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter expenses..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add details about this expense..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense_date">Date</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : editingExpense ? "Update Expense" : "Add Expense"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredExpenses}
            columns={columns}
            onEdit={handleEdit}
            onDelete={(expense) => setDeleteConfirm(expense)}
            emptyMessage="No expenses recorded yet. Add your first expense to get started."
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
