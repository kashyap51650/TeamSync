// src/app/api/events/route.ts
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sseManager } from "@/lib/sse";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get user's organization
  const membership = await prisma.teamMember.findFirst({
    where: { userId: user.sub },
    orderBy: { joinedAt: "desc" },
  });

  if (!membership) {
    return new Response("No organization found", { status: 404 });
  }

  const clientId = uuidv4();

  const stream = new ReadableStream<string>({
    start(controller) {
      // Register client
      sseManager.addClient({
        id: clientId,
        organizationId: membership.organizationId,
        userId: user.sub,
        controller,
      });

      // Send initial connection event
      const msg = `event: connected\ndata: ${JSON.stringify({
        clientId,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(msg);

      // Heartbeat every 30s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`: heartbeat\n\n`);
        } catch {
          clearInterval(heartbeat);
        }
      }, 30_000);

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        sseManager.removeClient(clientId);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
