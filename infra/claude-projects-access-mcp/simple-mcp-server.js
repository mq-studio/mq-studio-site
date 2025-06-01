// Simple MCP Server implementation without SDK dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

/**
 * Simple MCP Server for Claude Projects Access
 */
class ClaudeProjectsServer {
  constructor() {
    this.port = 3001;
    this.projectsBasePath = this.getClaudeProjectsPath();
    
    // Create HTTP server
    this.server = http.createServer(this.handleRequest.bind(this));
    
    // Start server
    this.server.listen(this.port, '127.0.0.1', () => {
      console.log(`Claude Projects Access MCP Server started on port ${this.port}`);
      console.log(`Using Claude projects path: ${this.projectsBasePath}`);
    });
  }
  
  /**
   * Handle incoming HTTP requests
   */
  async handleRequest(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // Only handle POST requests
    if (req.method !== 'POST') {
      res.writeHead(405);
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }
    
    // Get request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        // Parse body
        const data = JSON.parse(body);
        const toolName = req.url.split('/').pop();
        
        // Handle tool calls
        let result;
        
        if (toolName === 'list_claude_projects') {
          result = await this.handleListProjects(data.parameters || {});
        } else if (toolName === 'get_claude_project') {
          result = await this.handleGetProject(data.parameters || {});
        } else if (toolName === 'list_project_chats') {
          result = await this.handleListProjectChats(data.parameters || {});
        } else if (toolName === 'get_chat') {
          result = await this.handleGetChat(data.parameters || {});
        } else if (toolName === 'search_projects') {
          result = await this.handleSearchProjects(data.parameters || {});
        } else {
          throw new Error(`Unknown tool: ${toolName}`);
        }
        
        // Send response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error('Error handling request:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: {
            message: error.message
          }
        }));
      }
    });
  }
  
  /**
   * Determine the Claude Projects path based on the operating system
   */
  getClaudeProjectsPath() {
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows
      return path.join(process.env.APPDATA || '', 'Claude', 'projects');
    } else if (platform === 'darwin') {
      // macOS
      return path.join(process.env.HOME || '', 'Library', 'Application Support', 'Claude', 'projects');
    } else {
      // Linux and WSL
      return path.join(process.env.HOME || '', '.claude');
    }
  }
  
  /**
   * Handle list_claude_projects tool call
   */
  async handleListProjects(parameters) {
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
          message: `Failed to list projects: ${error.message}`
        }
      };
    }
  }
  
  /**
   * Handle get_claude_project tool call
   */
  async handleGetProject(parameters) {
    try {
      const projectId = parameters.project_id;
      
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
          message: `Failed to get project: ${error.message}`
        }
      };
    }
  }
  
  /**
   * Handle list_project_chats tool call
   */
  async handleListProjectChats(parameters) {
    try {
      const projectId = parameters.project_id;
      
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
          message: `Failed to list project chats: ${error.message}`
        }
      };
    }
  }
  
  /**
   * Handle get_chat tool call
   */
  async handleGetChat(parameters) {
    try {
      const projectId = parameters.project_id;
      const chatId = parameters.chat_id;
      
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
          message: `Failed to get chat: ${error.message}`
        }
      };
    }
  }
  
  /**
   * Handle search_projects tool call
   */
  async handleSearchProjects(parameters) {
    try {
      const query = (parameters.query || '').toLowerCase();
      
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
        matchingProjects: [],
        matchingChats: [],
        matchingMessages: []
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
          message: `Failed to search projects: ${error.message}`
        }
      };
    }
  }
  
  /**
   * Get all Claude Projects
   */
  async getAllProjects() {
    try {
      // Check if projects directory exists
      try {
        await stat(this.projectsBasePath);
      } catch (error) {
        console.warn(`Claude Projects directory not found at ${this.projectsBasePath}`);
        return [];
      }
      
      // Special handling for WSL - check if we have an "archive" directory which contains projects
      const claudeFiles = await readdir(this.projectsBasePath);
      
      if (claudeFiles.includes('archive')) {
        return this.getProjectsFromWSLArchive();
      }
      
      // If "archive" directory doesn't exist, attempt standard Claude Desktop structure
      return this.getProjectsFromStandardStructure();
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  }
  
  /**
   * Get projects from WSL archive structure
   */
  async getProjectsFromWSLArchive() {
    try {
      const archivePath = path.join(this.projectsBasePath, 'archive');
      const projects = [];
      
      // Get all entries in the archive directory
      const entries = await readdir(archivePath);
      
      for (const entry of entries) {
        const entryPath = path.join(archivePath, entry);
        
        // Check if it's a directory
        const stats = await stat(entryPath);
        if (!stats.isDirectory()) {
          continue;
        }
        
        // Create a basic project structure
        const project = {
          id: entry,
          name: entry, // Use the directory name as the project name
          created: stats.birthtime.toISOString(),
          lastAccessed: stats.mtime.toISOString(),
          chats: []
        };
        
        // Try to read conversations directory if it exists
        try {
          const conversationsPath = path.join(entryPath, 'conversations');
          const conversations = await readdir(conversationsPath);
          
          for (const conversation of conversations) {
            const conversationPath = path.join(conversationsPath, conversation);
            
            // Check if it's a file with .json extension
            const convStats = await stat(conversationPath);
            if (!convStats.isFile() || !conversation.endsWith('.json')) {
              continue;
            }
            
            try {
              // Read and parse the conversation file
              const conversationContent = await readFile(conversationPath, 'utf-8');
              const conversationData = JSON.parse(conversationContent);
              
              // Create a chat object from the conversation data
              const chat = {
                id: conversation.replace('.json', ''),
                title: conversationData.title || `Conversation ${conversation}`,
                created: conversationData.created || convStats.birthtime.toISOString(),
                lastAccessed: convStats.mtime.toISOString(),
                messages: this.extractMessagesFromConversation(conversationData)
              };
              
              project.chats.push(chat);
            } catch (error) {
              console.warn(`Error processing conversation ${conversation}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Error reading conversations directory for project ${entry}:`, error);
        }
        
        projects.push(project);
      }
      
      return projects;
    } catch (error) {
      console.error('Error getting projects from WSL archive:', error);
      return [];
    }
  }
  
  /**
   * Extract messages from a conversation object
   */
  extractMessagesFromConversation(conversation) {
    const messages = [];
    
    // Check if we have a messages array
    if (Array.isArray(conversation.messages)) {
      for (const msg of conversation.messages) {
        messages.push({
          id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: msg.role === 'assistant' ? 'assistant' : 'human',
          content: msg.content || '',
          created: msg.created || new Date().toISOString()
        });
      }
    } else if (Array.isArray(conversation.conversation)) {
      // Alternative structure
      for (const msg of conversation.conversation) {
        messages.push({
          id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: msg.role === 'assistant' ? 'assistant' : 'human',
          content: msg.content || '',
          created: msg.created || new Date().toISOString()
        });
      }
    }
    
    return messages;
  }
  
  /**
   * Get projects from standard Claude Desktop structure
   */
  async getProjectsFromStandardStructure() {
    try {
      // Get all project directories
      const projectDirs = await readdir(this.projectsBasePath);
      
      // Process each project directory
      const projects = [];
      
      for (const projectDir of projectDirs) {
        const projectPath = path.join(this.projectsBasePath, projectDir);
        
        // Skip if not a directory
        const stats = await stat(projectPath);
        if (!stats.isDirectory()) {
          continue;
        }
        
        try {
          // Read project metadata
          const metadataPath = path.join(projectPath, 'metadata.json');
          const metadataContent = await readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent);
          
          // Create project object
          const project = {
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
            const chatDirs = await readdir(chatsPath);
            
            // Process each chat directory
            for (const chatDir of chatDirs) {
              const chatPath = path.join(chatsPath, chatDir);
              
              // Skip if not a directory
              const chatStats = await stat(chatPath);
              if (!chatStats.isDirectory()) {
                continue;
              }
              
              try {
                // Read chat metadata
                const chatMetadataPath = path.join(chatPath, 'metadata.json');
                const chatMetadataContent = await readFile(chatMetadataPath, 'utf-8');
                const chatMetadata = JSON.parse(chatMetadataContent);
                
                // Read chat messages
                const messagesPath = path.join(chatPath, 'messages.json');
                const messagesContent = await readFile(messagesPath, 'utf-8');
                const messages = JSON.parse(messagesContent);
                
                // Create chat object
                const chat = {
                  id: chatDir,
                  title: chatMetadata.title || 'Unnamed Chat',
                  created: chatMetadata.created || new Date().toISOString(),
                  lastAccessed: chatMetadata.lastAccessed,
                  messages: messages.map((msg) => ({
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
      console.error('Error getting projects from standard structure:', error);
      return [];
    }
  }
  
  /**
   * Get a specific Claude Project by ID
   */
  async getProject(projectId) {
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
new ClaudeProjectsServer();

console.log('Claude Projects Access MCP Server started');
