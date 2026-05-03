import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { ExpensesContent } from "@/components/dashboard/expenses-content"

export default async function ExpensesPage() {
  const supabase = await createClient()
  
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Expenses" 
        description="Track and manage your business expenses"
      />
      <ExpensesContent initialExpenses={expenses || []} />
    </div>
  )
}
