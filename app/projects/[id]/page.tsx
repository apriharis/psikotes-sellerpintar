"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TaskBoard } from "@/components/task-board"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { InviteMemberDialog } from "@/components/invite-member-dialog"
import { ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"
import { TaskAnalytics } from "@/components/task-analytics"

interface Project {
  id: string
  name: string
  owner: {
    id: string
    email: string
  }
  memberships: Array<{
    user: {
      id: string
      email: string
    }
  }>
  tasks: Array<{
    id: string
    title: string
    description?: string | null
    status: string
    assignee?: {
      id: string
      email: string
    } | null
  }>
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchProject()
    }
  }, [session, params.id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center">Project not found</div>
  }

  const isOwner = project.owner.id === session?.user?.id
  const totalMembers = project.memberships.length + 1

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  {isOwner && <Badge variant="secondary">Owner</Badge>}
                </div>
                {project.description && <p className="text-gray-600">{project.description}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>
                  {totalMembers} member{totalMembers !== 1 ? "s" : ""}
                </span>
                <div className="flex -space-x-2">
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      {project.owner.name?.[0] || project.owner.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {project.memberships.slice(0, 3).map((member) => (
                    <Avatar key={member.user.id} className="h-6 w-6 border-2 border-background">
                      <AvatarFallback className="text-xs">
                        {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.memberships.length > 3 && (
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarFallback className="text-xs">+{project.memberships.length - 3}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
              <CreateTaskDialog
                projectId={project.id}
                memberships={project.memberships}
                owner={project.owner}
                onTaskCreated={fetchProject}
              />
              {isOwner && <InviteMemberDialog projectId={project.id} onMemberInvited={fetchProject} />}
              <Link href={`/projects/${project.id}/settings`}>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <TaskBoard tasks={project.tasks} projectId={project.id} onTaskUpdate={fetchProject} />
          </div>
          <div>
            <TaskAnalytics tasks={project.tasks} />
          </div>
        </div>
      </main>
    </div>
  )
}
