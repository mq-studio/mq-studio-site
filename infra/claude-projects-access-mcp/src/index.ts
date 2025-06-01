import { 
  MCPServer, 
  Tool, 
  ToolCall,
  ToolCallResult,
  StreamConnection
} from '@modelcontextprotocol/sdk';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

// Type definitions
interface ClaudeProject {
  id: string;
  name: string;
  description?: string;
  created: string;
  lastAccessed?: string;
  chats: ClaudeChat[];
}

interface ClaudeChat {
  id: string;
  title: string;
  created: string;
  lastAccessed?: string;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  role: 'human' | 'assistant';
  content: string;
  created: string;
}

class ClaudeProjectsServer {
  private server: MCPServer;
  private projectsBasePath: string;
  
  constructor() {
    this.server = new MCPServer({
      name: 'claude-projects-access',
      description: 'MCP server for accessing Claude Projects and chats'
    });
    
    // Set the base path for Claude Projects based on the OS
    this.projectsBasePath = this.getClaudeProjectsPath();
    
    // Register tools
    this.registerTools();
    
    // Start the server
    this.server.listen(3001, '127.0.0.1');
    console.log('Claude Projects Access MCP Server started on port 3001');
  }
  
  /**
   * Determine the Claude Projects path based on the operating system
   */
  private getClaudeProjectsPath(): string {
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows
      return path.join(process.env.APPDATA || '', 'Claude', 'projects');
    } else if (platform === 'darwin') {
      // macOS
      return path.join(process.env.HOME || '', 'Library', 'Application Support', 'Claude', 'projects');
    } else {
      // Linux and others
      return path.join(process.env.HOME || '', '.claude');
    }
  }
  
  /**
   * Register all tools for the MCP server
   */
  private registerTools(): void {
    // 1. List Projects Tool
    this.server.registerTool(new Tool({
      name: 'list_claude_projects',
      description: 'List all Claude Projects',
      parameters: {},
      handler: this.handleListProjects.bind(this)
    }));
    
    // 2. Get Project Tool
    this.server.registerTool(new Tool({
      name: 'get_claude_project',
      description: 'Get details about a specific Claude Project',
      parameters: {
        project_id: {
          type: 'string',
          description: 'The ID of the project to retrieve'
        }
      },
      handler: this.handleGetProject.bind(this)
    }));
    
    // 3. List Project Chats Tool
    this.server.registerTool(new Tool({
      name: 'list_project_chats',
      description: 'List all chats in a Claude Project',
      parameters: {
        project_id: {
          type: 'string',
          description: 'The ID of the project containing the chats'
        }
      },
      handler: this.handleListProjectChats.bind(this)
    }));
    
    // 4. Get Chat Tool
    this.server.registerTool(new Tool({
      name: 'get_chat',
      description: 'Get the content of a specific chat',
      parameters: {
        project_id: {
          type: 'string',
          description: 'The ID of the project containing the chat'
        },
        chat_id: {
          type: 'string',
          description: 'The ID of the chat to retrieve'
        }
      },
      handler: this.handleGetChat.bind(this)
    }));
    
    // 5. Search Projects Tool
    this.server.registerTool(new Tool({
      name: 'search_projects',
      description: 'Search across all Claude Projects and chats',
      parameters: {
        query: {
          type: 'string',
          description: 'The search query'
        }
      },
      handler: this.handleSearchProjects.bind(this)
    }));
  }
  
  /**
   * Handle the list_claude_projects tool call
   */
  private async handleListProjects(toolCall: ToolCall, connection: StreamConnection): Promise<ToolCallResult> {
    try {
      const projects = await this.getAllProjects();
      
      return {
        success: true,
        result: {
          projects: projects.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            created: project.created,
            lastAccessed: project.lastAccessed,
            chatCount: project.chats.length
          }))
        }
      };
    } catch (error) {
      console.error('Error listing projects:', error);
      return {
        success: false,
        error: {
          message: `Failed to list projects: ${error instanceof Error ? error.message : String(error)}`
        }
      };
    }
  }
  
  /**
   * Handle the get_claude_project tool call
   */
  private async handleGetProject(toolCall: ToolCall, connection: StreamConnection): Promise<ToolCallResult> {
    try {
      const projectId = toolCall.parameters.project_id as string;
      
      // Validate project ID
      if (!projectId) {
        return {
          success: false,
          error: {
            message: 'Project ID is required'
          }
        };
      }
      
      // Get project
      const project = await this.getProject(projectId);
      
      if (!project) {
        return {
          success: false,
          error: {
            message: `Project with ID ${projectId} not found`
          }
        };
      }
      
      return {
        success: true,
        result: {
          id: project.id,
          name: project.name,
          description: project.description,
          created: project.created,
          lastAccessed: project.lastAccessed,
          chatCount: project.chats.length,
          chats: project.chats.map(chat => ({
            id: chat.id,
            title: chat.title,
            created: chat.created,
            lastAccessed: chat.lastAccessed,
            messageCount: chat.messages.length
          }))
        }
      };
    } catch (error) {
      console.error('Error getting project:', error);
      return {
        success: false,
        error: {
          message: `Failed to get project: ${error instanceof Error ? error.message : String(error)}`
        }
      };
    }
  }
  
  /**
   * Handle the list_project_chats tool call
   */
  private async handleListProjectChats(toolCall: ToolCall, connection: StreamConnection): Promise<ToolCallResult> {
    try {
      const projectId = toolCall.parameters.project_id as string;
      
      // Validate project ID
      if (!projectId) {
        return {
          success: false,
          error: {
            message: 'Project ID is required'
          }
        };
      }
      
      // Get project
      const project = await this.getProject(projectId);
      
      if (!project) {
        return {
          success: false,
          error: {
            message: `Project with ID ${projectId} not found`
          }
        };
      }
      
      return {
        success: true,
        result: {
          projectId: project.id,
          projectName: project.name,
          chats: project.chats.map(chat => ({
            id: chat.id,
            title: chat.title,
            created: chat.created,
            lastAccessed: chat.lastAccessed,
            messageCount: chat.messages.length
          }))
        }
      };
    } catch (error) {
      console.error('Error listing project chats:', error);
      return {
        success: false,
        error: {
          message: `Failed to list project chats: ${error instanceof Error ? error.message : String(error)}`
        }
      };
    }
  }
  
  /**
   * Handle the get_chat tool call
   */
  private async handleGetChat(toolCall: ToolCall, connection: StreamConnection): Promise<ToolCallResult> {
    try {
      const projectId = toolCall.parameters.project_id as string;
      const chatId = toolCall.parameters.chat_id as string;
      
      // Validate parameters
      if (!projectId) {
        return {
          success: false,
          error: {
            message: 'Project ID is required'
          }
        };
      }
      
      if (!chatId) {
        return {
          success: false,
          error: {
            message: 'Chat ID is required'
          }
        };
      }
      
      // Get project
      const project = await this.getProject(projectId);
      
      if (!project) {
        return {
          success: false,
          error: {
            message: `Project with ID ${projectId} not found`
          }
        };
      }
      
      // Get chat
      const chat = project.chats.find(c => c.id === chatId);
      
      if (!chat) {
        return {
          success: false,
          error: {
            message: `Chat with ID ${chatId} not found in project ${projectId}`
          }
        };
      }
      
      return {
        success: true,
        result: {
          projectId: project.id,
          projectName: project.name,
          chat: {
            id: chat.id,
            title: chat.title,
            created: chat.created,
            lastAccessed: chat.lastAccessed,
            messages: chat.messages
          }
        }
      };
    } catch (error) {
      console.error('Error getting chat:', error);
      return {
        success: false,
        error: {
          message: `Failed to get chat: ${error instanceof Error ? error.message : String(error)}`
        }
      };
    }
  }
  
  /**
   * Handle the search_projects tool call
   */
  private async handleSearchProjects(toolCall: ToolCall, connection: StreamConnection): Promise<ToolCallResult> {
    try {
      const query = (toolCall.parameters.query as string).toLowerCase();
      
      // Validate query
      if (!query) {
        return {
          success: false,
          error: {
            message: 'Search query is required'
          }
        };
      }
      
      // Get all projects
      const projects = await this.getAllProjects();
      
      // Search results
      const results = {
        matchingProjects: [] as any[],
        matchingChats: [] as any[],
        matchingMessages: [] as any[]
      };
      
      // Search through projects
      for (const project of projects) {
        // Check if project matches
        if (
          project.name.toLowerCase().includes(query) ||
          (project.description && project.description.toLowerCase().includes(query))
        ) {
          results.matchingProjects.push({
            id: project.id,
            name: project.name,
            description: project.description,
            created: project.created,
            lastAccessed: project.lastAccessed
          });
        }
        
        // Search through chats
        for (const chat of project.chats) {
          // Check if chat title matches
          if (chat.title.toLowerCase().includes(query)) {
            results.matchingChats.push({
              id: chat.id,
              title: chat.title,
              created: chat.created,
              lastAccessed: chat.lastAccessed,
              projectId: project.id,
              projectName: project.name
            });
          }
          
          // Search through messages
          for (const message of chat.messages) {
            if (message.content.toLowerCase().includes(query)) {
              // Add a snippet of the message content around the match
              const contentLower = message.content.toLowerCase();
              const index = contentLower.indexOf(query);
              const start = Math.max(0, index - 50);
              const end = Math.min(message.content.length, index + query.length + 50);
              const snippet = message.content.substring(start, end);
              
              results.matchingMessages.push({
                id: message.id,
                role: message.role,
                snippet: snippet,
                created: message.created,
                chatId: chat.id,
                chatTitle: chat.title,
                projectId: project.id,
                projectName: project.name
              });
            }
          }
        }
      }
      
      return {
        success: true,
        result: {
          query,
          totalMatchingProjects: results.matchingProjects.length,
          totalMatchingChats: results.matchingChats.length,
          totalMatchingMessages: results.matchingMessages.length,
          ...results
        }
      };
    } catch (error) {
      console.error('Error searching projects:', error);
      return {
        success: false,
        error: {
          message: `Failed to search projects: ${error instanceof Error ? error.message : String(error)}`
        }
      };
    }
  }
  
  /**
   * Get all Claude Projects
   */
  private async getAllProjects(): Promise<ClaudeProject[]> {
    try {
      // Check if projects directory exists
      try {
        await fs.access(this.projectsBasePath);
      } catch (error) {
        console.warn(`Claude Projects directory not found at ${this.projectsBasePath}`);
        return [];
      }
      
      // Get all project directories
      const projectDirs = await fs.readdir(this.projectsBasePath);
      
      // Process each project directory
      const projects: ClaudeProject[] = [];
      
      for (const projectDir of projectDirs) {
        const projectPath = path.join(this.projectsBasePath, projectDir);
        
        // Skip if not a directory
        const stats = await fs.stat(projectPath);
        if (!stats.isDirectory()) {
          continue;
        }
        
        try {
          // Read project metadata
          const metadataPath = path.join(projectPath, 'metadata.json');
          const metadataContent = await fs.readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent);
          
          // Create project object
          const project: ClaudeProject = {
            id: projectDir,
            name: metadata.name || 'Unnamed Project',
            description: metadata.description,
            created: metadata.created || new Date().toISOString(),
            lastAccessed: metadata.lastAccessed,
            chats: []
          };
          
          // Get all chats in the project
          const chatsPath = path.join(projectPath, 'chats');
          try {
            const chatDirs = await fs.readdir(chatsPath);
            
            // Process each chat directory
            for (const chatDir of chatDirs) {
              const chatPath = path.join(chatsPath, chatDir);
              
              // Skip if not a directory
              const chatStats = await fs.stat(chatPath);
              if (!chatStats.isDirectory()) {
                continue;
              }
              
              try {
                // Read chat metadata
                const chatMetadataPath = path.join(chatPath, 'metadata.json');
                const chatMetadataContent = await fs.readFile(chatMetadataPath, 'utf-8');
                const chatMetadata = JSON.parse(chatMetadataContent);
                
                // Read chat messages
                const messagesPath = path.join(chatPath, 'messages.json');
                const messagesContent = await fs.readFile(messagesPath, 'utf-8');
                const messages = JSON.parse(messagesContent);
                
                // Create chat object
                const chat: ClaudeChat = {
                  id: chatDir,
                  title: chatMetadata.title || 'Unnamed Chat',
                  created: chatMetadata.created || new Date().toISOString(),
                  lastAccessed: chatMetadata.lastAccessed,
                  messages: messages.map((msg: any) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    created: msg.created || new Date().toISOString()
                  }))
                };
                
                project.chats.push(chat);
              } catch (error) {
                console.warn(`Error processing chat ${chatDir}:`, error);
                // Continue with next chat
              }
            }
          } catch (error) {
            console.warn(`Error reading chats directory for project ${projectDir}:`, error);
            // Continue with next project
          }
          
          projects.push(project);
        } catch (error) {
          console.warn(`Error processing project ${projectDir}:`, error);
          // Continue with next project
        }
      }
      
      return projects;
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific Claude Project by ID
   */
  private async getProject(projectId: string): Promise<ClaudeProject | null> {
    try {
      const projects = await this.getAllProjects();
      return projects.find(p => p.id === projectId) || null;
    } catch (error) {
      console.error(`Error getting project ${projectId}:`, error);
      throw error;
    }
  }
}

// Start the server
const server = new ClaudeProjectsServer();
