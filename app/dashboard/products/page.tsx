import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProductsContent } from "@/components/dashboard/products-content"

export default async function ProductsPage() {
  const supabase = await createClient()
  
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true })

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Products" 
        description="Manage your product catalog"
      />
      <ProductsContent initialProducts={products || []} />
    </div>
  )
}
