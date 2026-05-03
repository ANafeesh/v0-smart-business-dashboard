export interface Product {
  id: string
  user_id: string
  name: string
  category: string | null
  unit_price: number
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  user_id: string
  item_name: string
  category: string | null
  quantity: number
  unit: string
  min_stock_level: number
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  user_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  sale_date: string
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  category: string
  description: string | null
  amount: number
  expense_date: string
  created_at: string
}

export interface DashboardStats {
  totalSales: number
  totalExpenses: number
  netProfit: number
  salesGrowth: number
  expenseGrowth: number
  lowStockItems: number
  totalProducts: number
  totalInventoryItems: number
}

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Supplies',
  'Salaries',
  'Marketing',
  'Equipment',
  'Maintenance',
  'Other'
] as const

export const PRODUCT_CATEGORIES = [
  'Beverages',
  'Food',
  'Snacks',
  'Pastries',
  'Merchandise',
  'Other'
] as const

export const INVENTORY_CATEGORIES = [
  'Coffee Beans',
  'Milk & Dairy',
  'Syrups & Flavors',
  'Pastry Ingredients',
  'Packaging',
  'Cleaning Supplies',
  'Other'
] as const
