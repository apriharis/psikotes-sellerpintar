import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProjectCard } from "@/components/project-card"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { SignOutButton } from "@/components/sign-out-button"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: session.user.id }, { memberships: { some: { userId: session.user.id } } }],
    },
    include: {
      owner: { select: { id: true, email: true } },
      memberships: {
        include: {
          user: { select: { id: true, email: true } },
        },
      },
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <CreateProjectDialog />
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Projects</h2>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You don't have any projects yet.</p>
              <CreateProjectDialog />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} currentUserId={session.user.id} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
