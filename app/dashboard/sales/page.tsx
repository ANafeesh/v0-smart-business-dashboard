import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { SalesContent } from "@/components/dashboard/sales-content"

export default async function SalesPage() {
  const supabase = await createClient()
  
  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .order("sale_date", { ascending: false })

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true })

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Sales" 
        description="Track and manage your sales transactions"
      />
      <SalesContent 
        initialSales={sales || []} 
        products={products || []}
      />
    </div>
  )
}
