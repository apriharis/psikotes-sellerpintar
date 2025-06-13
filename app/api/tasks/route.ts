import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, projectId, assigneeId } = await request.json()

    if (!title || !projectId) {
      return NextResponse.json({ error: "Title and project ID are required" }, { status: 400 })
    }

    // Check if user has access to the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }],
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assigneeId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
