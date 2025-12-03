import { Approver } from '@/types/changeRequest';
import { StatusBadge } from '@/components/StatusBadge';
import { Check, Clock, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalTimelineProps {
  approvers: Approver[];
  className?: string;
}

export const ApprovalTimeline = ({ approvers, className }: ApprovalTimelineProps) => {
  const getStatusIcon = (status: Approver['status']) => {
    switch (status) {
      case 'Approved':
        return <Check className="h-4 w-4 text-status-approved" />;
      case 'Rejected':
        return <X className="h-4 w-4 text-status-rejected" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-status-pending" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-foreground">Approval Progress</h3>
      <div className="relative">
        {approvers.map((approver, index) => (
          <div key={approver.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Timeline line */}
            {index < approvers.length - 1 && (
              <div className="absolute left-5 top-10 h-full w-px bg-border" />
            )}
            
            {/* Status indicator */}
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
                approver.status === 'Approved' && 'border-status-approved bg-status-approved/10',
                approver.status === 'Rejected' && 'border-status-rejected bg-status-rejected/10',
                approver.status === 'Pending' && 'border-status-pending bg-status-pending/10',
                approver.status === 'Draft' && 'border-muted bg-muted'
              )}
            >
              {getStatusIcon(approver.status)}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-medium text-foreground">{approver.name}</span>
                <StatusBadge status={approver.status} />
              </div>
              <p className="text-sm text-muted-foreground">{approver.role}</p>
              <p className="text-sm text-muted-foreground">{approver.email}</p>
              {approver.approvedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  {approver.status === 'Approved' ? 'Approved' : 'Responded'} on {formatDate(approver.approvedAt)}
                </p>
              )}
              {approver.comments && (
                <p className="text-sm text-foreground mt-2 p-3 bg-muted rounded-lg">
                  "{approver.comments}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
