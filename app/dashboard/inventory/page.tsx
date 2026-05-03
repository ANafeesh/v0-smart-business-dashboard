import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { InventoryContent } from "@/components/dashboard/inventory-content"

export default async function InventoryPage() {
  const supabase = await createClient()
  
  const { data: inventory } = await supabase
    .from("inventory")
    .select("*")
    .order("item_name", { ascending: true })

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Inventory" 
        description="Manage your stock and supplies"
      />
      <InventoryContent initialInventory={inventory || []} />
    </div>
  )
}
