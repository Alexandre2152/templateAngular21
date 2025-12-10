import {Permission} from './permission.model';

export interface Role {
  id?: number;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}
