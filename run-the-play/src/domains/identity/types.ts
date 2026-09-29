export type UserRole = 'OWNER' | 'ADMIN' | 'ANALYST' | 'CREATOR' | 'COACH' | 'VIEWER';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMembership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface UserContext {
  userId: string;
  activeWorkspaceId: string;
  role: UserRole;
}
