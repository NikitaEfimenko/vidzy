'use client'
import { ReactElement, ReactNode, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"

type FormActionProps = {
  ctaSlot: ReactElement,
  formSlot: ReactElement
  formControls: ReactElement,
  formProviderComponent?: (bodyContent: ReactNode) => ReactNode
  title: string,
  description: string
}
export const FormAction = ({
  ctaSlot,
  formSlot,
  formControls,
  title,
  description,
  formProviderComponent = f => f
}: FormActionProps) => {
  return <Dialog>
    <DialogTrigger asChild>
      {ctaSlot}
    </DialogTrigger>
    <DialogContent className="md:max-w-xl">
      {formProviderComponent(<div className="flex flex-col gap-3 overflow-auto">
        <DialogHeader className="mt-4">
          <DialogTitle className="text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-lg">
            {description}
          </DialogDescription>
        </DialogHeader>
          {formSlot}
        <DialogFooter className="mt-4">
          {formControls}
        </DialogFooter></div>
      )}
    </DialogContent>
  </Dialog>
}