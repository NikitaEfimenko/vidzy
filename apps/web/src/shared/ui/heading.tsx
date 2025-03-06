"use client"
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const headingVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

interface HeadingProps {
  subtitle?: string,
  children?: React.ReactNode
}

const Heading = React.forwardRef<
  HTMLDivElement,
  HeadingProps &
  VariantProps<typeof headingVariants>
>(({ ...props }, ref) => (
  <div ref={ref} className="mt-16 md:mt-0">
    <h2 className="text-4xl lg:text-5xl font-bold lg:tracking-tight">
      {props.children}
    </h2>
    {props.subtitle && <p className="text-lg mt-4 text-slate-600">
      {props.subtitle}
    </p>}
  </div>
))
Heading.displayName = "heading"

const WorkspaceHeadling = React.forwardRef<
  HTMLDivElement,
  HeadingProps &
  VariantProps<typeof headingVariants>
>(({ ...props }, ref) => (
  <div ref={ref} className="space-y-1">
    <h2 className="text-2xl font-semibold tracking-tight">
      {props.children}
    </h2>
    {props.subtitle && <p className="text-sm text-muted-foreground">
      {props.subtitle}
    </p>}
  </div>
))
Heading.displayName = "WorkspaceHeadling"

export { Heading, WorkspaceHeadling }
export type { HeadingProps }