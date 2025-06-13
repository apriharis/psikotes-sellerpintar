import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user is project owner
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 })
    }

    // Find user to invite
    const userToInvite = await prisma.user.findUnique({
      where: { email },
    })

    if (!userToInvite) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: userToInvite.id,
          projectId: params.id,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 })
    }

    // Add member
    const member = await prisma.projectMember.create({
      data: {
        userId: userToInvite.id,
        projectId: params.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ member })
  } catch (error) {
    console.error("Add member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
