import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { StatusBadge, RiskBadge } from '@/components/StatusBadge';
import { ApprovalTimeline } from '@/components/ApprovalTimeline';
import { CRDetailSection } from '@/components/CRDetailSection';
import { mockChangeRequests } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Mail, Printer, ExternalLink, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const ChangeRequestDetail = () => {
  const { id } = useParams();
  const cr = mockChangeRequests.find(c => c.id === id);

  if (!cr) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-2">Change Request Not Found</h1>
            <p className="text-muted-foreground mb-4">The requested CR could not be found.</p>
            <Link to="/change-requests">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendEmail = () => {
    toast.success('Email sent to approvers successfully!', {
      description: `Notification sent to ${cr.approvers.length} approver(s)`,
    });
  };

  const handleApprove = () => {
    toast.success('Change Request Approved!', {
      description: `${cr.requestId} has been approved.`,
    });
  };

  const handleReject = () => {
    toast.error('Change Request Rejected', {
      description: `${cr.requestId} has been rejected.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Back Button */}
        <Link
          to="/change-requests"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Change Requests
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{cr.requestId}</h1>
              <StatusBadge status={cr.status} />
              <RiskBadge risk={cr.riskRating} />
            </div>
            <p className="text-lg text-muted-foreground">{cr.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Created by {cr.createdBy} on {formatDate(cr.createdAt)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleSendEmail}>
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Link to={`/change-requests/${cr.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            {cr.status === 'Pending' && (
              <>
                <Button variant="success" size="sm" onClick={handleApprove}>
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button variant="destructive" size="sm" onClick={handleReject}>
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* CR Details Card */}
            <div className="rounded-xl border bg-card p-6 shadow-card animate-fade-in">
              <h2 className="text-xl font-semibold text-foreground mb-4">Request Details</h2>
              <dl className="divide-y divide-border">
                <CRDetailSection label="Change Request ID" value={cr.requestId} />
                <CRDetailSection label="Description" value={cr.description} />
                <CRDetailSection 
                  label="URL and Environment" 
                  value={cr.urlAndEnv}
                />
                <CRDetailSection label="Scope and Reason" value={cr.scopeAndReason} isMultiline />
                <CRDetailSection label="Impact Analysis" value={cr.impactAnalysis} isMultiline />
                <CRDetailSection label="Risk Rating" value={cr.riskRating} />
                <CRDetailSection label="Risk Factor" value={cr.riskFactor} isMultiline />
                <CRDetailSection 
                  label="Risk Mitigation with Rollback Plan" 
                  value={cr.riskMitigationWithRollbackPlan} 
                  isMultiline 
                />
                <CRDetailSection label="Down Time" value={cr.downTime} />
                <CRDetailSection label="Planned Maintenance Window" value={cr.plannedMaintenanceWindow} />
                <CRDetailSection label="Type of Request" value={cr.typeOfRequest} />
                <CRDetailSection label="Pre-Checks" value={cr.preChecks} />
                <CRDetailSection label="Post-Checks" value={cr.postChecks} />
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Approval Timeline */}
            <div className="rounded-xl border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: '100ms' }}>
              <ApprovalTimeline approvers={cr.approvers} />
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleSendEmail}>
                  <Mail className="h-4 w-4" />
                  Send Reminder to Approvers
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={cr.urlAndEnv} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open Environment URL
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangeRequestDetail;
