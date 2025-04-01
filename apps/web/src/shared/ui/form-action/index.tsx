'use client'
import { ReactElement, ReactNode, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card"
import { cn } from "@/shared/lib/utils"

type FormActionProps = {
  formSlot: ReactElement
  formControls: ReactElement,
  formProviderComponent?: (bodyContent: ReactNode) => ReactNode
  title: string | ReactElement,
  description: string
  className?: string
} & (
  {
    ctaSlot: ReactElement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  } | {
    ctaSlot?: undefined;
    open?: never;
    onOpenChange?: never;
  }
)

export const FormAction = ({
  ctaSlot,
  formSlot,
  formControls,
  title,
  description,
  className,
  open,
  onOpenChange,
  formProviderComponent = f => f
}: FormActionProps) => {

  if (!ctaSlot) {
    return <Card>
      {formProviderComponent(
        <>
          <CardHeader className="mt-4">
            <CardTitle className="text-xl">
              {title}
            </CardTitle>
            <CardDescription className="text-sm">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            {formSlot}
          </CardContent>
          <CardFooter className="mt-4">
            {formControls}
          </CardFooter>
        </>
      )}
    </Card>
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      {ctaSlot}
    </DialogTrigger>
    <DialogPortal>
      <DialogContent className={cn("md:max-w-xl", className)}>
        {formProviderComponent(<div className="flex flex-col gap-3 overflow-auto">
          <DialogHeader className="mt-4">
            <DialogTitle className="text-xl">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="w-full">
            {formSlot}
          </div>
          <DialogFooter className="mt-4">
            {formControls}
          </DialogFooter></div>
        )}
      </DialogContent>
    </DialogPortal>
  </Dialog>
}