// Common structure for pages under /profile-settings/*
import { Separator } from "@/components/ui/separator" // ShadCN

export default function PageName() {
  return (
    <div className="space-y-6 p-6 md:p-10 pb-16 block"> {/* Added padding */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Page Title</h2>
        <p className="text-muted-foreground">
          Page subtitle or brief description of what the user can do here.
        </p>
      </div>
      <Separator className="my-6" />
      {/* Page-specific content will go here */}
    </div>
  )
}