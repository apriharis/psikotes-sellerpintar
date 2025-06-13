"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Task {
  id: string
  title: string
  description?: string | null
  status: "TODO" | "IN_PROGRESS" | "DONE"
  assignee?: {
    id: string
    name?: string | null
    email: string
  } | null
}

interface TaskBoardProps {
  tasks: Task[]
  projectId: string
  onTaskUpdate: () => void
}

const statusColumns = [
  { key: "TODO" as const, title: "To Do", color: "bg-slate-100" },
  { key: "IN_PROGRESS" as const, title: "In Progress", color: "bg-blue-100" },
  { key: "DONE" as const, title: "Done", color: "bg-green-100" },
]

export function TaskBoard({ tasks, projectId, onTaskUpdate }: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const router = useRouter()

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: Task["status"]) => {
    e.preventDefault()

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    try {
      const response = await fetch(`/api/tasks/${draggedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        onTaskUpdate()
      }
    } catch (error) {
      console.error("Error updating task:", error)
    } finally {
      setDraggedTask(null)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onTaskUpdate()
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statusColumns.map((column) => (
        <div
          key={column.key}
          className="space-y-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.key)}
        >
          <div className={`p-4 rounded-lg ${column.color}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{column.title}</h3>
              <Badge variant="secondary">{getTasksByStatus(column.key).length}</Badge>
            </div>
          </div>

          <div className="space-y-3">
            {getTasksByStatus(column.key).map((task) => (
              <Card
                key={task.id}
                className="cursor-move hover:shadow-md transition-shadow"
                draggable
                onDragStart={() => handleDragStart(task)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive">
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                {(task.description || task.assignee) && (
                  <CardContent className="pt-0">
                    {task.description && <p className="text-xs text-muted-foreground mb-2">{task.description}</p>}
                    {task.assignee && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {task.assignee.name?.[0] || task.assignee.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {task.assignee.name || task.assignee.email}
                        </span>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
