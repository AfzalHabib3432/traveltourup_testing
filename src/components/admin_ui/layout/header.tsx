"use client"

import { memo, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ExternalLink, LogOut, User as UserIcon } from "lucide-react"
import { ThemeSelector } from "@/components/ThemeSelector"
import { defaultLocale } from "@/i18n/routing"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin_ui/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/admin_ui/ui/avatar"
import { signOutAction } from "@/lib/auth/actions"
import { useAuth } from "@/components/providers/AuthProvider"
import {
  type MeProfile,
  displayNameForUserMenu,
  initialsFromDisplayName,
  oauthPictureFromMetadata,
} from "@/lib/auth/user-menu-helpers"

export const Header = memo(function Header() {
  const { user } = useAuth()
  const [meProfile, setMeProfile] = useState<MeProfile | null>(null)

  useEffect(() => {
    setMeProfile(null)

    if (!user) return

    let cancelled = false
    void (async () => {
      const res = await fetch("/api/v1/users/me")
      if (!res.ok || cancelled) return
      const json = (await res.json()) as { data?: MeProfile }
      const d = json.data
      if (!d || cancelled) return
      const updated = typeof d.updated_at === "string" ? d.updated_at : ""
      setMeProfile({
        first_name: d.first_name,
        last_name: d.last_name,
        avatar_path: d.avatar_path ?? null,
        updated_at: updated,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const displayName = useMemo(() => displayNameForUserMenu(user, meProfile), [user, meProfile])
  const email = user?.email ?? ""
  const meta = user?.user_metadata as Record<string, unknown> | undefined
  const avatarSrc = useMemo(() => {
    if (meProfile?.avatar_path && meProfile.updated_at) {
      return `/api/v1/users/me/avatar?v=${encodeURIComponent(meProfile.updated_at)}`
    }
    return oauthPictureFromMetadata(meta)
  }, [meProfile, meta])
  const initials = useMemo(() => initialsFromDisplayName(displayName), [displayName])

  return (
    <header className="flex h-16 items-center justify-between lg:justify-end border-b border-border bg-muted backdrop-blur-sm px-4 lg:px-6 shrink-0 sticky top-0 z-30">
      {/* Mobile spacing for menu button */}
      <div className="w-10 lg:hidden" />

      {/* Right side */}
      <div className="flex items-center justify-end gap-2 lg:gap-3">
        <ThemeSelector variant="compact" className="shrink-0" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              {avatarSrc ? (
                <AvatarImage src={avatarSrc} alt="" referrerPolicy="no-referrer" className="object-cover" />
              ) : null}
              <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{email || "—"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${defaultLocale}/profile`} className="flex cursor-pointer items-center">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${defaultLocale}`} className="flex cursor-pointer items-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View Site</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => { await signOutAction() }}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
})