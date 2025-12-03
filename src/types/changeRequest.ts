export type RiskRating = 'Critical' | 'High' | 'Medium' | 'Low';

export type RequestType = 'Mandatory' | 'Optional' | 'Emergency';

export type ApprovalStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export interface Approver {
  id: string;
  name: string;
  email: string;
  role: string;
  status: ApprovalStatus;
  approvedAt?: string;
  comments?: string;
}

export interface ChangeRequest {
  id: string;
  requestId: string;
  description: string;
  urlAndEnv: string;
  scopeAndReason: string;
  impactAnalysis: string;
  riskRating: RiskRating;
  riskFactor: string;
  riskMitigationWithRollbackPlan: string;
  downTime: string;
  plannedMaintenanceWindow: string;
  typeOfRequest: RequestType;
  preChecks: string;
  postChecks: string;
  approvers: Approver[];
  status: ApprovalStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Approver' | 'Requester';
  createdAt: string;
}
