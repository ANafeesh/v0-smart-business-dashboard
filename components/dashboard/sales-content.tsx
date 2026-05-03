"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, ShoppingCart, Filter } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import type { Sale, Product } from "@/lib/types"

interface SalesContentProps {
  initialSales: Sale[]
  products: Product[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export function SalesContent({ initialSales, products }: SalesContentProps) {
  const router = useRouter()
  const [sales, setSales] = useState(initialSales)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Sale | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState("")

  const [formData, setFormData] = useState({
    product_name: "",
    quantity: 1,
    unit_price: 0,
    sale_date: new Date().toISOString().split("T")[0],
  })

  const resetForm = () => {
    setFormData({
      product_name: "",
      quantity: 1,
      unit_price: 0,
      sale_date: new Date().toISOString().split("T")[0],
    })
    setEditingSale(null)
  }

  const handleProductSelect = (productName: string) => {
    const product = products.find(p => p.name === productName)
    setFormData(prev => ({
      ...prev,
      product_name: productName,
      unit_price: product ? Number(product.unit_price) : prev.unit_price,
    }))
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

    const saleData = {
      user_id: user.id,
      product_name: formData.product_name,
      quantity: formData.quantity,
      unit_price: formData.unit_price,
      total_price: formData.quantity * formData.unit_price,
      sale_date: formData.sale_date,
    }

    if (editingSale) {
      const { error } = await supabase
        .from("sales")
        .update(saleData)
        .eq("id", editingSale.id)

      if (!error) {
        setSales(sales.map(s => 
          s.id === editingSale.id 
            ? { ...s, ...saleData }
            : s
        ))
      }
    } else {
      const { data, error } = await supabase
        .from("sales")
        .insert(saleData)
        .select()
        .single()

      if (!error && data) {
        setSales([data, ...sales])
      }
    }

    setIsLoading(false)
    setIsDialogOpen(false)
    resetForm()
    router.refresh()
  }

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale)
    setFormData({
      product_name: sale.product_name,
      quantity: sale.quantity,
      unit_price: Number(sale.unit_price),
      sale_date: sale.sale_date,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (sale: Sale) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("sales")
      .delete()
      .eq("id", sale.id)

    if (!error) {
      setSales(sales.filter(s => s.id !== sale.id))
    }
    setDeleteConfirm(null)
    router.refresh()
  }

  const filteredSales = sales.filter(sale =>
    sale.product_name.toLowerCase().includes(filter.toLowerCase())
  )

  const columns = [
    {
      key: "product_name",
      header: "Product",
      render: (sale: Sale) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{sale.product_name}</span>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Qty",
    },
    {
      key: "unit_price",
      header: "Unit Price",
      render: (sale: Sale) => formatCurrency(Number(sale.unit_price)),
    },
    {
      key: "total_price",
      header: "Total",
      render: (sale: Sale) => (
        <span className="font-semibold text-success">
          {formatCurrency(Number(sale.total_price))}
        </span>
      ),
    },
    {
      key: "sale_date",
      header: "Date",
      render: (sale: Sale) => format(new Date(sale.sale_date), "MMM d, yyyy"),
    },
  ]

  const totalSales = filteredSales.reduce((sum, sale) => sum + Number(sale.total_price), 0)

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(totalSales)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredSales.length} transaction{filteredSales.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by product..."
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
              Add Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSale ? "Edit Sale" : "Add New Sale"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                {products.length > 0 ? (
                  <Select
                    value={formData.product_name}
                    onValueChange={handleProductSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name} - {formatCurrency(Number(product.unit_price))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="product"
                    value={formData.product_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Unit Price ($)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_date">Date</Label>
                <Input
                  id="sale_date"
                  type="date"
                  value={formData.sale_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, sale_date: e.target.value }))}
                  required
                />
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(formData.quantity * formData.unit_price)}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : editingSale ? "Update Sale" : "Add Sale"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredSales}
            columns={columns}
            onEdit={handleEdit}
            onDelete={(sale) => setDeleteConfirm(sale)}
            emptyMessage="No sales recorded yet. Add your first sale to get started."
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sale? This action cannot be undone.
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
