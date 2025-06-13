import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Calendar } from "lucide-react"
import Link from "next/link"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    createdAt: string
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
    _count: {
      tasks: number
    }
  }
  currentUserId: string
}

export function ProjectCard({ project, currentUserId }: ProjectCardProps) {
  const isOwner = project.owner.id === currentUserId
  const totalMembers = project.memberships.length + 1 // +1 for owner

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              {project.description && <CardDescription className="mt-1">{project.description}</CardDescription>}
            </div>
            {isOwner && <Badge variant="secondary">Owner</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>
                  {totalMembers} member{totalMembers !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {project._count.tasks} task{project._count.tasks !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="flex -space-x-2">
              <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarFallback className="text-xs">{project.owner.email[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              {project.memberships.slice(0, 2).map((member) => (
                <Avatar key={member.user.id} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">{member.user.email[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
              {project.memberships.length > 2 && (
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">+{project.memberships.length - 2}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
