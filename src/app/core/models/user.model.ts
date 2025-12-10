import {Role} from './role.model';

export interface User {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  active?: boolean;
  roles?: Role[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PermissionAction {
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  allowed: boolean;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}
