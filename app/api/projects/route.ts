import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        ownerId: session.user.id,
      },
      include: {
        owner: { select: { id: true, email: true } },
        memberships: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Create project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
