/**
 * Conversation Memory and User Profile Management
 * Lightweight in-memory system for personalized AI interactions
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ConversationTurn {
  userMessage: string;
  aiResponse: string;
  timestamp: number;
}

export interface UserProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  preferredCareStyle: 'minimal' | 'detailed';
}

export interface UserSession {
  sessionId: string;
  conversationHistory: ConversationTurn[];
  profile: UserProfile;
  createdAt: number;
  lastActivity: number;
}

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

// Store user sessions by sessionId
const sessionStore = new Map<string, UserSession>();

// Configuration
const MAX_HISTORY_SIZE = 5; // Store last 5 conversation turns
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_SESSIONS = 100; // Limit total sessions in memory

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Create a new user session
 */
export function createSession(
  sessionId: string,
  profile?: Partial<UserProfile>
): UserSession {
  const session: UserSession = {
    sessionId,
    conversationHistory: [],
    profile: {
      experienceLevel: profile?.experienceLevel || 'intermediate',
      preferredCareStyle: profile?.preferredCareStyle || 'detailed',
    },
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  // Enforce session limit (FIFO eviction)
  if (sessionStore.size >= MAX_SESSIONS) {
    const oldestSessionId = sessionStore.keys().next().value;
    if (oldestSessionId) {
      sessionStore.delete(oldestSessionId);
      console.log(`[Memory] Evicted oldest session: ${oldestSessionId}`);
    }
  }

  sessionStore.set(sessionId, session);
  console.log(`[Memory] Created new session: ${sessionId}`);
  
  return session;
}

/**
 * Get or create a user session
 */
export function getSession(sessionId: string): UserSession {
  let session = sessionStore.get(sessionId);

  // Check if session exists and is not expired
  if (session) {
    const now = Date.now();
    if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
      // Session expired, create new one
      console.log(`[Memory] Session expired: ${sessionId}`);
      sessionStore.delete(sessionId);
      session = createSession(sessionId);
    } else {
      // Update last activity
      session.lastActivity = now;
    }
  } else {
    // Create new session
    session = createSession(sessionId);
  }

  return session;
}

/**
 * Update user profile
 */
export function updateProfile(
  sessionId: string,
  profile: Partial<UserProfile>
): void {
  const session = getSession(sessionId);
  session.profile = {
    ...session.profile,
    ...profile,
  };
  console.log(`[Memory] Updated profile for session: ${sessionId}`);
}

// ============================================================================
// CONVERSATION HISTORY
// ============================================================================

/**
 * Add a conversation turn to history
 */
export function addConversationTurn(
  sessionId: string,
  userMessage: string,
  aiResponse: string
): void {
  const session = getSession(sessionId);

  const turn: ConversationTurn = {
    userMessage,
    aiResponse,
    timestamp: Date.now(),
  };

  session.conversationHistory.push(turn);

  // Limit history size (keep last N turns)
  if (session.conversationHistory.length > MAX_HISTORY_SIZE) {
    session.conversationHistory.shift();
  }

  console.log(`[Memory] Added conversation turn for session: ${sessionId} (history size: ${session.conversationHistory.length})`);
}

/**
 * Get recent conversation history
 * @param limit - Number of recent turns to retrieve (default: 3)
 */
export function getConversationHistory(
  sessionId: string,
  limit: number = 3
): ConversationTurn[] {
  const session = getSession(sessionId);
  const history = session.conversationHistory;
  
  // Return last N turns
  return history.slice(-limit);
}

/**
 * Clear conversation history for a session
 */
export function clearHistory(sessionId: string): void {
  const session = sessionStore.get(sessionId);
  if (session) {
    session.conversationHistory = [];
    console.log(`[Memory] Cleared history for session: ${sessionId}`);
  }
}

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

/**
 * Build conversation context string from history
 * Limits to last 3 interactions to avoid large prompts
 */
export function buildConversationContext(sessionId: string): string {
  const history = getConversationHistory(sessionId, 3);
  
  if (history.length === 0) {
    return '';
  }

  let context = 'Recent conversation:\n';
  
  for (const turn of history) {
    // Truncate long messages to avoid context bloat
    const userMsg = turn.userMessage.length > 100
      ? turn.userMessage.substring(0, 100) + '...'
      : turn.userMessage;
    
    const aiMsg = turn.aiResponse.length > 150
      ? turn.aiResponse.substring(0, 150) + '...'
      : turn.aiResponse;
    
    context += `User: ${userMsg}\n`;
    context += `AI: ${aiMsg}\n\n`;
  }

  return context.trim();
}

/**
 * Build profile-aware system prompt addition
 */
export function buildProfileContext(sessionId: string): string {
  const session = getSession(sessionId);
  const { experienceLevel, preferredCareStyle } = session.profile;

  let context = '';

  // Adjust response style based on experience level
  if (experienceLevel === 'beginner') {
    context += 'User is a beginner. Use simple language, explain terms, and provide step-by-step guidance.\n';
  } else if (experienceLevel === 'expert') {
    context += 'User is an expert. Use technical terminology and provide detailed, advanced information.\n';
  } else {
    context += 'User has intermediate knowledge. Balance technical details with clear explanations.\n';
  }

  // Adjust detail level based on care style
  if (preferredCareStyle === 'minimal') {
    context += 'User prefers concise, essential information only.\n';
  } else {
    context += 'User prefers detailed, comprehensive explanations.\n';
  }

  return context;
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Clean up expired sessions periodically
 */
function cleanupExpiredSessions(): void {
  const now = Date.now();
  let cleanedCount = 0;

  // Convert to array to avoid iterator issues
  const entries = Array.from(sessionStore.entries());
  for (const [sessionId, session] of entries) {
    if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
      sessionStore.delete(sessionId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`[Memory] Cleaned up ${cleanedCount} expired sessions`);
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredSessions, 10 * 60 * 1000);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get memory statistics
 */
export function getMemoryStats(): {
  totalSessions: number;
  activeSessions: number;
  totalConversations: number;
} {
  const now = Date.now();
  let activeSessions = 0;
  let totalConversations = 0;

  // Convert to array to avoid iterator issues
  const sessions = Array.from(sessionStore.values());
  for (const session of sessions) {
    if (now - session.lastActivity <= SESSION_TIMEOUT_MS) {
      activeSessions++;
    }
    totalConversations += session.conversationHistory.length;
  }

  return {
    totalSessions: sessionStore.size,
    activeSessions,
    totalConversations,
  };
}

// TODO: Implement persistent database storage for memory
// TODO: Add embeddings-based semantic memory search
// TODO: Implement user behavior learning and pattern recognition
// TODO: Add memory compression for long-term storage
// TODO: Implement cross-session learning and insights

// Made with Bob
