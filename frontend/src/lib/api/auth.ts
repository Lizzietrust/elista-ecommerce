// /lib/api/auth.ts

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expires: Date;
}

// Mock user database (in real app, this would be your database)
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    role: "user",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    role: "user",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
];

// Simulate a database
const sessions: Map<string, Session> = new Map();

/**
 * Authenticate user with email and password
 */
export async function authenticate(
  email: string,
  password: string,
): Promise<{ user: User; session: Session } | null> {
  // In a real app, you would:
  // 1. Validate password against hashed password in database
  // 2. Create a JWT token or session
  // 3. Set cookies or return token

  const user = mockUsers.find((u) => u.email === email);

  if (!user) {
    return null;
  }

  // Mock password validation (in real app, use bcrypt)
  if (password !== "password123") {
    return null;
  }

  const session: Session = {
    user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  sessions.set(user.id, session);

  return { user, session };
}

/**
 * Get current session
 */
export async function getSession(token?: string): Promise<Session | null> {
  // In a real app, you would:
  // 1. Validate JWT token
  // 2. Check if session exists in database/redis
  // 3. Return session data

  if (!token) {
    // Return mock session for development
    return {
      user: mockUsers[0],
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  // Find session by token (simplified)
  const session = Array.from(sessions.values()).find(
    (s) => s.user.id === token, // Using token as user ID for simplicity
  );

  return session || null;
}

/**
 * Logout user
 */
export async function logout(sessionId: string): Promise<void> {
  sessions.delete(sessionId);
}

/**
 * Register new user
 */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  // In a real app, you would:
  // 1. Hash the password
  // 2. Create user in database
  // 3. Send verification email
  // 4. Create session

  const existingUser = mockUsers.find((u) => u.email === email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const newUser: User = {
    id: (mockUsers.length + 1).toString(),
    name,
    email,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockUsers.push(newUser);

  return newUser;
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  return mockUsers.find((u) => u.id === id) || null;
}

/**
 * Update user profile
 */
export async function updateUser(
  id: string,
  updates: Partial<Omit<User, "id" | "role" | "createdAt">>,
): Promise<User> {
  const userIndex = mockUsers.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...updates,
    updatedAt: new Date(),
  };

  return mockUsers[userIndex];
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  // In real app, verify current password hash and update with new hash
  return true;
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<boolean> {
  // In real app, generate reset token and send email
  return true;
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<boolean> {
  // In real app, validate token and update password
  return true;
}
