import { cn } from '@/lib/utils';
import { ApprovalStatus, RiskRating } from '@/types/changeRequest';

interface StatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusStyles: Record<ApprovalStatus, string> = {
    Draft: 'bg-muted text-muted-foreground',
    Pending: 'bg-status-pending/15 text-status-pending border border-status-pending/30',
    Approved: 'bg-status-approved/15 text-status-approved border border-status-approved/30',
    Rejected: 'bg-status-rejected/15 text-status-rejected border border-status-rejected/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
};

interface RiskBadgeProps {
  risk: RiskRating;
  className?: string;
}

export const RiskBadge = ({ risk, className }: RiskBadgeProps) => {
  const riskStyles: Record<RiskRating, string> = {
    Critical: 'bg-status-critical/15 text-status-critical border border-status-critical/30',
    High: 'bg-status-high/15 text-status-high border border-status-high/30',
    Medium: 'bg-status-medium/15 text-status-medium border border-status-medium/30',
    Low: 'bg-status-low/15 text-status-low border border-status-low/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        riskStyles[risk],
        className
      )}
    >
      {risk}
    </span>
  );
};
