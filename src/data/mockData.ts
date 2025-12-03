import { ChangeRequest, User, Approver } from '@/types/changeRequest';

export const mockApprovers: Approver[] = [
  {
    id: '1',
    name: 'Pravin G',
    email: 'pravin.g@company.com',
    role: 'Technical Lead',
    status: 'Approved',
    approvedAt: '2025-12-01T10:30:00Z',
    comments: 'Looks good. Approved.',
  },
  {
    id: '2',
    name: 'Aniket H',
    email: 'aniket.h@company.com',
    role: 'Project Manager',
    status: 'Pending',
  },
];

export const mockChangeRequests: ChangeRequest[] = [
  {
    id: '1',
    requestId: 'CR003',
    description: 'Domain Migration from amla.io to znodecorp.com',
    urlAndEnv: 'https://admin-klrt-npr.amla.io/',
    scopeAndReason: 'To migrate the domain from amla.io domain to znodecorp.com',
    impactAnalysis: `1) Expected user-visible downtime of up to 45 minutes within the approved maintenance window.
2) During downtime, the NP admin portal will be unavailable; any users attempting to access the old URL may receive HTTP errors or redirects.
3) Users must start using the new znodecorp.com URLs after the change; bookmarks and integrations pointing to amla.io may need to be updated.`,
    riskRating: 'Critical',
    riskFactor: `1) Hardcoded URLs or integrations still pointing to the old amla.io domain.
2) Cached DNS entries / bookmarks for the old domain.
3) SSL certificate misconfiguration on the new domain.`,
    riskMitigationWithRollbackPlan: `1) Pre-migration scan of application configs and known integrations for references to amla.io.
2) Validate SSL certificate and DNS for znodecorp.com in non-prod before cutover.
Rollback:
If critical issues are detected during the window, revert DNS to the previous amla.io endpoint and re-enable the old site.
Notify stakeholders and schedule a follow-up migration after fixes are applied.`,
    downTime: '45 Mins',
    plannedMaintenanceWindow: '08-Dec-2025 (03:00 PM to 04:00 PM IST and 03:30 AM – 04:30 AM CST)',
    typeOfRequest: 'Mandatory',
    preChecks: 'Sanity test, Validate SSL certificate',
    postChecks: "Proper sanity on new URL's and new domain, DNS pointing of new URL's",
    approvers: mockApprovers,
    status: 'Pending',
    createdBy: 'John Doe',
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2025-12-01T10:30:00Z',
  },
  {
    id: '2',
    requestId: 'CR002',
    description: 'Database Schema Update for User Authentication Module',
    urlAndEnv: 'https://api-prod.company.com/',
    scopeAndReason: 'Add new columns for multi-factor authentication support',
    impactAnalysis: 'Minimal impact - backward compatible changes only',
    riskRating: 'Medium',
    riskFactor: 'Potential query performance impact during migration',
    riskMitigationWithRollbackPlan: 'Backup database before migration. Rollback script prepared.',
    downTime: '15 Mins',
    plannedMaintenanceWindow: '10-Dec-2025 (02:00 AM to 02:15 AM IST)',
    typeOfRequest: 'Optional',
    preChecks: 'Database backup verification',
    postChecks: 'API health check, Authentication flow validation',
    approvers: [
      { id: '3', name: 'Sarah M', email: 'sarah.m@company.com', role: 'DBA Lead', status: 'Approved', approvedAt: '2025-11-28T14:00:00Z' },
    ],
    status: 'Approved',
    createdBy: 'Mike S',
    createdAt: '2025-11-25T11:00:00Z',
    updatedAt: '2025-11-28T14:00:00Z',
  },
  {
    id: '3',
    requestId: 'CR001',
    description: 'Emergency Security Patch Deployment',
    urlAndEnv: 'https://app.company.com/',
    scopeAndReason: 'Critical security vulnerability fix',
    impactAnalysis: 'Brief service interruption during deployment',
    riskRating: 'High',
    riskFactor: 'Potential compatibility issues with existing integrations',
    riskMitigationWithRollbackPlan: 'Blue-green deployment with instant rollback capability',
    downTime: '5 Mins',
    plannedMaintenanceWindow: '05-Dec-2025 (12:00 AM to 12:05 AM IST)',
    typeOfRequest: 'Emergency',
    preChecks: 'Security scan, Penetration test',
    postChecks: 'Security validation, Smoke tests',
    approvers: [
      { id: '1', name: 'Pravin G', email: 'pravin.g@company.com', role: 'Technical Lead', status: 'Approved', approvedAt: '2025-12-02T08:00:00Z' },
      { id: '2', name: 'Aniket H', email: 'aniket.h@company.com', role: 'Project Manager', status: 'Approved', approvedAt: '2025-12-02T08:30:00Z' },
    ],
    status: 'Approved',
    createdBy: 'Security Team',
    createdAt: '2025-12-02T07:00:00Z',
    updatedAt: '2025-12-02T08:30:00Z',
  },
];

export const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@company.com', role: 'Requester', createdAt: '2025-01-15T10:00:00Z' },
  { id: '2', name: 'Pravin G', email: 'pravin.g@company.com', role: 'Approver', createdAt: '2025-01-10T09:00:00Z' },
  { id: '3', name: 'Aniket H', email: 'aniket.h@company.com', role: 'Approver', createdAt: '2025-01-10T09:00:00Z' },
  { id: '4', name: 'Admin User', email: 'admin@company.com', role: 'Admin', createdAt: '2025-01-01T08:00:00Z' },
];
