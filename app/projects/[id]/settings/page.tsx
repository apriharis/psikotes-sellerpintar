"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { InviteMemberDialog } from "@/components/invite-member-dialog"
import { ArrowLeft, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

interface Project {
  id: string
  name: string
  description?: string | null
  owner: {
    id: string
    name?: string | null
    email: string
  }
  members: Array<{
    user: {
      id: string
      name?: string | null
      email: string
    }
  }>
}

export default function ProjectSettingsPage({ params }: { params: { id: string } }) {
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

  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  const exportProjectData = () => {
    if (!project) return

    const exportData = {
      project: {
        name: project.name,
        description: project.description,
        owner: project.owner,
        members: project.members,
        exportedAt: new Date().toISOString(),
      },
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${project.name.replace(/\s+/g, "_")}_export.json`
    link.click()
    URL.revokeObjectURL(url)
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

  if (!isOwner) {
    router.push(`/projects/${params.id}`)
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href={`/projects/${project.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Project
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>
                <p className="text-gray-600">{project.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Team Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage who has access to this project</CardDescription>
                </div>
                <InviteMemberDialog projectId={project.id} onMemberInvited={fetchProject} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Owner */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{project.owner.name?.[0] || project.owner.email[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{project.owner.name || project.owner.email}</p>
                      <p className="text-sm text-muted-foreground">{project.owner.email}</p>
                    </div>
                  </div>
                  <Badge>Owner</Badge>
                </div>

                {/* Members */}
                {project.members.map((member) => (
                  <div key={member.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{member.user.name?.[0] || member.user.email[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.name || member.user.email}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Member</Badge>
                  </div>
                ))}

                {project.members.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No team members yet. Invite someone to collaborate!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Export Data */}
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download your project data as JSON</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportProjectData} variant="outline">
                Export Project Data
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the project "{project.name}" and remove
                      all associated tasks and data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProject}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Project
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
