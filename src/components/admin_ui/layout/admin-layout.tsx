"use client"

import type React from "react"
import { memo, useMemo } from "react"
import { Sidebar } from "@/components/admin_ui/layout/sidebar"
import { Header } from "@/components/admin_ui/layout/header"
import { usePathname } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout = memo(function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  // Memoize route calculations to prevent recalculation on every render
  const isCommunicationsRoute = useMemo(() =>
    pathname?.startsWith("/communications") || pathname?.startsWith("/client-portal"),
    [pathname]
  )

  // Memoize resource and action calculation to prevent recalculation on every render
  const { resource, action } = useMemo(() => {
    const segments = (pathname || '').split('/').filter(Boolean)

    if (segments.length === 0) {
      return { resource: 'dashboard', action: 'read' }
    }

    const resource = segments[0] || 'dashboard'
    let action = 'read'

    // Check for action segments in order of specificity
    if (segments.includes('add')) {
      action = 'create'
    } else if (segments.includes('edit')) {
      action = 'update'
    } else if (segments.includes('permissions')) {
      // For role permissions page
      action = 'assign'
    } else if (segments.length > 1 && segments[1] && !['add', 'edit', 'permissions'].includes(segments[1])) {
      // Viewing specific item by ID (e.g., /users/123)
      action = 'read'
    }

    return { resource, action }
  }, [pathname])


  return (
    <div className="flex h-svh min-h-0 overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="relative min-h-0 flex-1 overflow-y-auto p-4 pt-16 lg:p-6 lg:pt-6 dropdown-scrollbar">
          <div className="mx-auto">{children}</div>
        </main>
        <footer className="shrink-0 border-t border-border bg-muted p-4">
          <div className="text-center text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} TravelTourUp
          </div>
        </footer>
      </div>
    </div>
  )
})