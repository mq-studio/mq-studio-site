import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class WSLCommandHelper {
  async executeCommand(command) {
    try {
      console.log("Executing WSL command: " + command);
      
      // Escape double quotes
      const escapedCommand = command.replace(/"/g, "\"");
      
      // Execute command
      const result = await execAsync();
      
      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async validateWSLAccess() {
    const result = await this.executeCommand("echo WSL_ACCESS_CONFIRMED");
    return {
      available: result.success && result.stdout.trim() === "WSL_ACCESS_CONFIRMED",
      message: result.success ? "WSL is accessible" : "WSL access failed"
    };
  }
}
