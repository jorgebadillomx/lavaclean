import type { Branch } from '../entities/Branch';

export interface IBranchRepository {
  findAll(): Promise<Branch[]>;
  findById(id: string): Promise<Branch | null>;
  save(branch: Branch): Promise<void>;
}
