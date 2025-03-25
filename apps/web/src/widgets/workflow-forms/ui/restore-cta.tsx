'use client'
import { Button } from "@/shared/ui/button";
import React from "react";
import { MdRestore } from "react-icons/md";

export const RestoreWorkflowCTA = React.memo(({
  formOnly = false
}: {
  formOnly?: boolean
}) => {

  // const [inputProps, setInputProps] = useState<any>(null)
  // const [result, setResult] = useState<any>({})
  // const input = useDeferredValue(inputProps)

  return <Button variant="ghost" size="icon"><MdRestore /></Button>
})
