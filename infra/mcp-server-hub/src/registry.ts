export class MCPServerRegistry {
  private servers = new Map();

  registerServer(serverInfo) {
    console.log("Registering server: " + serverInfo.id);
    this.servers.set(serverInfo.id, serverInfo);
  }

  getAllServers() {
    return Array.from(this.servers.values());
  }
}
