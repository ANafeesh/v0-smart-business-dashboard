import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { SettingsContent } from "@/components/dashboard/settings-content"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Settings" 
        description="Manage your account and preferences"
      />
      <SettingsContent user={user} />
    </div>
  )
}
