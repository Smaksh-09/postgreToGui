import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Correct import
import { prisma } from "@/lib/prisma";

// GET: List all connections for the user
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = (await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      connections: {
        orderBy: { createdAt: 'desc' }, // Show most recently used first
        select: { id: true, name: true, provider: true, createdAt: true } // Don't send the encrypted string!
      }
    } as any
  })) as any;

  const connections = ((user?.connections || []) as any[]).map((conn) => ({
    id: conn.id,
    name: conn.name,
    provider: conn.provider,
    updatedAt: conn.createdAt,
  }));

  return NextResponse.json(connections);
}

// POST: "Activate" a connection (Make it the most recent one)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  // Find user to verify ownership
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Update the 'createdAt' timestamp to mark as most recent.
  // This effectively makes it the "Active" connection for our other routes
  // because they look for { orderBy: { createdAt: 'desc' }, take: 1 }
  await prisma.connection.update({
    where: { id: id, userId: user.id }, // Ensure ownership
    data: { createdAt: new Date() }
  });

  return NextResponse.json({ success: true });
}