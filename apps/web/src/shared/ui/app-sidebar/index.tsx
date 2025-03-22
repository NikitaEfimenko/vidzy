"use client"
import {
  Cat,
  CoinsIcon,
  FilesIcon,
  PlusCircle,
  SparklesIcon,
  Speaker,
  SpeakerIcon,
  TextIcon,
  Users2Icon,
  Video,
  LayoutDashboard,
  VideoIcon,
  HandMetalIcon,
  LayoutDashboardIcon
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/shared/ui/app-sidebar/nav-main"
import { NavUser } from "@/shared/ui/app-sidebar/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar"
import Link from "next/link"
import { Badge } from "../badge"
// import { ThemeChoise } from "@/features/theme-switcher"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Visual builder (beta)",
      url: "/visual-renderer",
      icon: LayoutDashboardIcon,
      items: []
    },
    {
      title: "Manual builder (legacy)",
      url: "/renderer",
      icon: HandMetalIcon,
      items: []
    },
    {
      title: "Attachments and Tools",
      url: "/attachments",
      icon: FilesIcon,
      items: []
    },
    // {
    //   title: "Dashboard",
    //   url: "/dashboard",
    //   icon: LayoutDashboard,
    //   items: []
    // },
    // {
    //   title: "Documentation",
    //   url: "/docs/intro",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "/docs/intro",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "/docs/starter",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "/docs/changelog",
    //     },
    //   ],
    // },

  ],
  navServices: [
    {
      title: "Business Video",
      url: "/renderer",
      icon: Video,
    },
    {
      title: "Text to speach",
      url: "/voice/tts",
      icon: SpeakerIcon,
    },
    {
      title: "Music to minus",
      url: "/voice/sync",
      icon: TextIcon,
    },
    {
      title: "Generate Text from Voice",
      url: "/voice/stt",
      icon: Speaker,
    },
    {
      title: "Attachments",
      url: "/attachments",
      icon: FilesIcon,
    },
  ],
}


export function AppSidebar({ user, pro, ...props }: React.ComponentProps<typeof Sidebar> & { user: React.ReactNode, pro: React.ReactNode }) {

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href='#'>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <VideoIcon/>
                </div>
                <div className="grid flex-1 text-left text-sm gap-1 leading-tight">
                  <span className="truncate font-semibold">Vidzy</span>
                  <span className="truncate text-xs">
                    <Badge className="text-xs">
                      Admin
                    </Badge>
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {pro}
      <SidebarFooter>
        {/* <ThemeChoise/> */}
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
