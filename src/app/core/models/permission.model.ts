import {PermissionAction} from './user.model';

export interface Permission {
  id?: number;
  name: string;
  module: string;
  actions: PermissionAction[];
}
