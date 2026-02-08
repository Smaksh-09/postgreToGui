import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Find Active Connection
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { connections: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    const connection = user?.connections[0];
    if (!connection) {
      return NextResponse.json({ error: "No connection active" }, { status: 404 });
    }

    // 2. Fetch Logs for THIS connection
    const logs = await prisma.queryLog.findMany({
      where: { connectionId: connection.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 queries
    });

    return NextResponse.json(logs);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}