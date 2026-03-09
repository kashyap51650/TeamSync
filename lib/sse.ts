// src/lib/sse.ts
// Server-Sent Events broadcast system
// Each org has its own set of connected clients

type SSEClient = {
  id: string;
  organizationId: string;
  userId: string;
  controller: ReadableStreamDefaultController<string>;
};

class SSEManager {
  private clients = new Map<string, SSEClient>();

  addClient(client: SSEClient) {
    this.clients.set(client.id, client);
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  broadcast(organizationId: string, event: string, data: unknown) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    this.clients.forEach((client) => {
      if (client.organizationId === organizationId) {
        try {
          client.controller.enqueue(message);
        } catch {
          this.clients.delete(client.id);
        }
      }
    });
  }

  broadcastToUser(userId: string, event: string, data: unknown) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    this.clients.forEach((client) => {
      if (client.userId === userId) {
        try {
          client.controller.enqueue(message);
        } catch {
          this.clients.delete(client.id);
        }
      }
    });
  }

  getClientCount(organizationId: string): number {
    let count = 0;
    this.clients.forEach((client) => {
      if (client.organizationId === organizationId) count++;
    });
    return count;
  }
}

// Singleton instance
export const sseManager = new SSEManager();
