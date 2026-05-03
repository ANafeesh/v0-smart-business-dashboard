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
import { Plus, Package, Filter, AlertTriangle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { InventoryItem } from "@/lib/types"
import { INVENTORY_CATEGORIES } from "@/lib/types"
import { cn } from "@/lib/utils"

interface InventoryContentProps {
  initialInventory: InventoryItem[]
}

export function InventoryContent({ initialInventory }: InventoryContentProps) {
  const router = useRouter()
  const [inventory, setInventory] = useState(initialInventory)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<InventoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState("")

  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    quantity: 0,
    unit: "pcs",
    min_stock_level: 10,
  })

  const resetForm = () => {
    setFormData({
      item_name: "",
      category: "",
      quantity: 0,
      unit: "pcs",
      min_stock_level: 10,
    })
    setEditingItem(null)
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

    const itemData = {
      user_id: user.id,
      item_name: formData.item_name,
      category: formData.category || null,
      quantity: formData.quantity,
      unit: formData.unit,
      min_stock_level: formData.min_stock_level,
    }

    if (editingItem) {
      const { error } = await supabase
        .from("inventory")
        .update(itemData)
        .eq("id", editingItem.id)

      if (!error) {
        setInventory(inventory.map(i => 
          i.id === editingItem.id 
            ? { ...i, ...itemData }
            : i
        ))
      }
    } else {
      const { data, error } = await supabase
        .from("inventory")
        .insert(itemData)
        .select()
        .single()

      if (!error && data) {
        setInventory([...inventory, data].sort((a, b) => a.item_name.localeCompare(b.item_name)))
      }
    }

    setIsLoading(false)
    setIsDialogOpen(false)
    resetForm()
    router.refresh()
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      item_name: item.item_name,
      category: item.category || "",
      quantity: Number(item.quantity),
      unit: item.unit,
      min_stock_level: Number(item.min_stock_level),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (item: InventoryItem) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("id", item.id)

    if (!error) {
      setInventory(inventory.filter(i => i.id !== item.id))
    }
    setDeleteConfirm(null)
    router.refresh()
  }

  const filteredInventory = inventory.filter(item =>
    item.item_name.toLowerCase().includes(filter.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(filter.toLowerCase()))
  )

  const lowStockItems = inventory.filter(item => 
    Number(item.quantity) <= Number(item.min_stock_level)
  )

  const columns = [
    {
      key: "item_name",
      header: "Item",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            Number(item.quantity) <= Number(item.min_stock_level)
              ? "bg-warning/10"
              : "bg-primary/10"
          )}>
            <Package className={cn(
              "h-4 w-4",
              Number(item.quantity) <= Number(item.min_stock_level)
                ? "text-warning"
                : "text-primary"
            )} />
          </div>
          <span className="font-medium">{item.item_name}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item: InventoryItem) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
          {item.category || "Uncategorized"}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Stock",
      render: (item: InventoryItem) => {
        const isLow = Number(item.quantity) <= Number(item.min_stock_level)
        return (
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-semibold",
              isLow ? "text-warning" : "text-foreground"
            )}>
              {item.quantity} {item.unit}
            </span>
            {isLow && (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
          </div>
        )
      },
    },
    {
      key: "min_stock_level",
      header: "Min Level",
      render: (item: InventoryItem) => (
        <span className="text-muted-foreground">
          {item.min_stock_level} {item.unit}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: InventoryItem) => {
        const isLow = Number(item.quantity) <= Number(item.min_stock_level)
        return (
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium w-fit",
            isLow 
              ? "bg-warning/10 text-warning" 
              : "bg-success/10 text-success"
          )}>
            {isLow ? (
              <>
                <AlertTriangle className="h-3 w-3" />
                Low Stock
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3" />
                In Stock
              </>
            )}
          </div>
        )
      },
    },
  ]

  const UNIT_OPTIONS = ["pcs", "kg", "g", "L", "ml", "bags", "boxes", "bottles"]

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-3xl font-bold text-foreground">{inventory.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                <p className="text-3xl font-bold text-foreground">{inventory.length - lowStockItems.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-3xl font-bold text-foreground">{lowStockItems.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              Restock Needed
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <span 
                  key={item.id}
                  className="px-3 py-1.5 rounded-full text-sm bg-background border border-warning/30 text-foreground"
                >
                  {item.item_name} ({item.quantity} {item.unit})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter inventory..."
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
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item_name">Item Name</Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, item_name: e.target.value }))}
                  placeholder="e.g., Arabica Coffee Beans"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVENTORY_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.min_stock_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_stock_level: parseFloat(e.target.value) || 0 }))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You&apos;ll be alerted when stock falls below this level
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredInventory}
            columns={columns}
            onEdit={handleEdit}
            onDelete={(item) => setDeleteConfirm(item)}
            emptyMessage="No inventory items yet. Add your first item to get started."
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteConfirm?.item_name}&quot;? This action cannot be undone.
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
