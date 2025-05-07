"use client"

import { Bell, Bug, Check, Clock, DownloadIcon, ExternalLinkIcon, Loader2, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { usePolling } from "@/shared/hooks/use-polling"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Progress } from "@/shared/ui/progress"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { DialogDescription } from "@radix-ui/react-dialog"
import Link from "next/link"
import { CancelTaskCTA } from "./cancel-task-cta"

export type TaskStatus = "pending" | "in-progress" | "completed" | "failed"

export interface Task {
  id: string
  status: TaskStatus
  title?: string
  description?: string
  updatedAt?: string
  queueName: string
  progress?: number
  failedReason?: string
  returnvalue?: unknown
}

export const configureUrl = (userId: string) =>
  `${process.env.NEXT_PUBLIC_RENDERER_HOST}/tasks?userId=${userId}`

const fetchUserTasks = async (url: string): Promise<Task[]> => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) throw new Error("Ошибка при запросе к API")
  return response.json()
}

const mapBullStateToStatus = (state: string): TaskStatus => {
  switch (state) {
    case "waiting":
    case "delayed":
      return "pending"
    case "active":
      return "in-progress"
    case "completed":
      return "completed"
    case "failed":
      return "failed"
    default:
      return "pending"
  }
}

type TaskManagerWidgetProps = {
  userId: string
}

export const TaskManagerWidget = ({ userId }: TaskManagerWidgetProps) => {
  const [open, setOpen] = useState(false)
  const url = configureUrl(userId)

  const { data: rawTasks, isLoading } = usePolling<any[]>(url, fetchUserTasks, 5000)

  const tasks: Task[] = useMemo(() => (rawTasks ?? []).map((job) => ({
    id: job.id,
    status: mapBullStateToStatus(job.state),
    title: job.name ?? "Unnamed Task",
    description: job.failedReason ?? job.queueName,
    updatedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : new Date().toISOString(),
    queueName: job.queueName,
    progress: job.progress ?? 0,
    failedReason: job.failedReason,
    returnvalue: job?.returnvalue
  })), [JSON.stringify(rawTasks)])

  const prevTasksRef = useRef<Task[] | null>(null)

  useEffect(() => {
    if (!tasks) return
    const prevTasks = prevTasksRef.current
    if (!prevTasks) {
      prevTasksRef.current = tasks
      return
    }

    tasks.forEach((task) => {
      const prev = prevTasks.find((t) => t.id === task.id)
      if (!prev || prev.status !== task.status) {
        const opts = { description: task.description, id: task.id }
        if (task.status === "completed") toast.success(task.title, opts)
        else if (task.status === "failed") toast.error(task.title, opts)
        else if (task.status === "in-progress") toast.loading(task.title, opts)
      }
    })

    prevTasksRef.current = tasks
  }, [tasks])

  const activeTasks = tasks.filter((t) => t.status === "pending" || t.status === "in-progress").length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {activeTasks > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex justify-center items-center">
              {activeTasks}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-medium">User tasks</h3>
          <p className="text-sm text-muted-foreground">
            {activeTasks > 0 ? `You have ${activeTasks} active tasks` : "No active tasks"}
          </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {tasks.length > 0 ? (
              <div className="grid gap-1 p-1">
                {tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">Tasks not found</div>
            )}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}

function TaskItem({ task }: { task: Task }) {
  return (
    <div className="flex flex-col gap-3 rounded-md p-3 hover:bg-muted relative">
      {task.status === "in-progress" && <Progress className="w-full" value={task.progress ?? 1} />}
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <StatusIcon status={task.status} />
        </div>
        <div className="grid gap-1 text-left">
          <div className="font-medium truncate">{task.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">{task.description}</div>
          {task.updatedAt && <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(task.updatedAt).toLocaleString()}
          </div>}
        </div>
        {task.status === "completed" && (task.returnvalue as any)?.url && <Link target="_blank" href={(task.returnvalue as any)?.url}>
          <Button variant="ghost" className="absolute top-2 right-2" size="icon">
            <ExternalLinkIcon />
          </Button></Link>}
        {task.status === "failed" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="absolute top-2 right-2" size="icon">
                <Bug className="h-4 w-4 text-red-500" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Failed reason</DialogTitle>
              </DialogHeader>
              <DialogDescription className="overflow-auto max-h-[400px]">
                {task.failedReason && <pre className="max-h-[400px] overflow-auto line-clamp-3 text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                  {task.failedReason}
                </pre>}
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )}
        {(["pending"] as Array<typeof task.status>).includes(task.status) &&
          <div className="absolute bottom-2 right-2">
            <CancelTaskCTA taskId={task.id} /></div>}
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: TaskStatus }) {
  switch (status) {
    case "pending":
      return <Clock className="h-5 w-5 text-muted-foreground" />
    case "in-progress":
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    case "completed":
      return <Check className="h-5 w-5 text-green-500" />
    case "failed":
      return <X className="h-5 w-5 text-red-500" />
    default:
      return null
  }
}
