"use client"

import { useTheme } from "next-themes"

import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { LightbulbIcon, LightbulbOffIcon, MoonIcon, SunIcon } from "lucide-react"

export const ThemeChoise = () => {
  const { setTheme, theme } = useTheme()
  return <Tabs className="w-full" onValueChange={setTheme} value={theme}>
  <TabsList className="flex w-full flex-row gap-2">
    <TabsTrigger className={theme === "light" ? "hidden": ""} value="light"><LightbulbIcon size={18}/></TabsTrigger>
    <TabsTrigger className={theme === "dark" ? "hidden": ""}  value="dark"><LightbulbOffIcon size={18}/></TabsTrigger>
  </TabsList>
</Tabs>

}
