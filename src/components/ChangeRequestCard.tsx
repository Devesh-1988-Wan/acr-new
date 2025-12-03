import { Link } from 'react-router-dom';
import { ChangeRequest } from '@/types/changeRequest';
import { StatusBadge, RiskBadge } from '@/components/StatusBadge';
import { Clock, Calendar, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChangeRequestCardProps {
  cr: ChangeRequest;
  className?: string;
}

export const ChangeRequestCard = ({ cr, className }: ChangeRequestCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const approvedCount = cr.approvers.filter(a => a.status === 'Approved').length;

  return (
    <Link
      to={`/change-requests/${cr.id}`}
      className={cn(
        'group block rounded-xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-lg hover:border-primary/30',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-semibold text-primary">{cr.requestId}</span>
            <StatusBadge status={cr.status} />
            <RiskBadge risk={cr.riskRating} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {cr.description}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {cr.scopeAndReason}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{cr.downTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(cr.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{approvedCount}/{cr.approvers.length} Approved</span>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Link>
  );
};
