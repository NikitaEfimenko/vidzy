'use client'

import { Button } from "@/shared/ui/button";
import { RefreshCwIcon } from "lucide-react";
import { ReactElement, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

type NodeLayoutProps = {
  children?: ReactElement,
  titleSlot?: ReactElement,
  descriptionSlot?: ReactElement,
  handlersSlot?: ReactElement,
  className?: string
}

export const NodeLayout = ({
  children,
  titleSlot,
  descriptionSlot,
  handlersSlot,
  className
}: NodeLayoutProps) => {
  const [renderKey, setRenderKey] = useState(0);

  const handleForceRerender = () => {
    setRenderKey(prevKey => prevKey + 1);
  };

  return (

    <Card className={cn("bg-accent relative border max-w-[400px] px-0", className)}
    onPointerDown={(e) => e.stopPropagation()}
    onDragStart={(e) => e.preventDefault()}
    >
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <Button className="rounded-full" size="icon" variant="default" onClick={handleForceRerender}>
          <RefreshCwIcon size={16} />
        </Button>
      </div>
      <>
        {handlersSlot}
      </>
      <CardHeader>
        <CardTitle>
          {titleSlot}
        </CardTitle>
        <CardDescription>
          {descriptionSlot}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto nopan nodrag nowheel" style={{pointerEvents: 'all'}}
        key={renderKey}>
        {children}
      </CardContent>
    </Card>
  );

}