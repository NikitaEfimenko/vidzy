
"use client"

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { Separator } from "@/shared/ui/separator";
import { PlusSquareIcon, WorkflowIcon } from "lucide-react";



export default function Page() {
  return <section className="flex flex-col gap-2">
    <ScrollArea className="h-full w-full whitespace-nowrap overflow-auto rounded-md">
      <div className="flex w-h-full space-x-3 overflow-auto">
        <Card className="bg-accent p-3 w-full flex flex-col item-center justify-center">
          <CardContent className="flex flex-col items-center p-0">
            <Button><PlusSquareIcon />Add Workflow</Button>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-3"/>
      <div className="px-3 space-y-3">
        <Card className="w-full h-32 bg-accent ">
        </Card>
        <Card className="w-full h-32 bg-accent ">
        </Card>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  </section>
}