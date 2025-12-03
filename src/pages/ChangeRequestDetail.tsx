import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { StatusBadge, RiskBadge } from '@/components/StatusBadge';
import { ApprovalTimeline } from '@/components/ApprovalTimeline';
import { CRDetailSection } from '@/components/CRDetailSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Mail, Printer, ExternalLink, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const ChangeRequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [cr, setCr] = useState<any>(null);
  const [approvers, setApprovers] = useState<any[]>([]);
  const [creatorName, setCreatorName] = useState('Unknown');
  const [loading, setLoading] = useState(true);

  // Fetch CR Data
  const fetchCR = async () => {
    if (!id) return;
    setLoading(true);

    // 1. Fetch CR details
    const { data: crData, error } = await supabase
      .from('change_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !crData) {
      setLoading(false);
      return;
    }

    setCr(crData);

    // 2. Fetch Creator Name
    if (crData.created_by) {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', crData.created_by).single();
      if (profile) setCreatorName(profile.full_name);
    }

    // 3. Fetch Approvers + Profile Info
    const { data: approverData } = await supabase
      .from('change_request_approvers')
      .select('*, profiles:user_id(full_name, email)')
      .eq('change_request_id', id);

    if (approverData) {
      const formattedApprovers = approverData.map(a => ({
        id: a.user_id,
        name: a.profiles?.full_name || 'Unknown',
        email: a.profiles?.email || '',
        role: 'Approver',
        status: a.status,
        approvedAt: a.approved_at,
        comments: a.comments
      }));
      setApprovers(formattedApprovers);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCR();
  }, [id]);

  const handleUpdateStatus = async (newStatus: 'Approved' | 'Rejected') => {
    if (!user || !id) return;

    // Update status in change_request_approvers
    const { error } = await supabase
      .from('change_request_approvers')
      .update({ 
        status: newStatus, 
        approved_at: new Date().toISOString() 
      })
      .eq('change_request_id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error(`Failed to ${newStatus.toLowerCase()}`);
      return;
    }

    // Check if all approved to update main CR status?
    // For simplicity, we just toast. Real logic might check "if all approved -> update CR to Approved"
    toast.success(`Change Request ${newStatus}!`);
    fetchCR(); // Refresh UI
  };

  const handleSendEmail = () => {
    // Simulation of email sending
    const emails = approvers.map(a => a.email).join(', ');
    console.log(`Sending email to: ${emails}`);
    toast.success('Email sent to approvers successfully!', {
      description: `Notification sent to ${approvers.length} approver(s)`,
    });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!cr) return <div className="text-center py-20">Change Request not found</div>;

  const isCurrentUserApprover = approvers.some(a => a.id === user?.id && a.status === 'Pending');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Link to="/change-requests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Change Requests
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{cr.request_id}</h1>
              <StatusBadge status={cr.status} />
              <RiskBadge risk={cr.risk_rating} />
            </div>
            <p className="text-lg text-muted-foreground">{cr.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Created by {creatorName} on {new Date(cr.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleSendEmail}>
              <Mail className="h-4 w-4" /> Send Email
            </Button>
            <Link to={`/change-requests/${cr.id}/edit`}>
              <Button variant="outline" size="sm"><Edit className="h-4 w-4" /> Edit</Button>
            </Link>
            {isCurrentUserApprover && (
              <>
                <Button variant="success" size="sm" onClick={() => handleUpdateStatus('Approved')}>
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus('Rejected')}>
                  <X className="h-4 w-4" /> Reject
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">Request Details</h2>
              <dl className="divide-y divide-border">
                <CRDetailSection label="Description" value={cr.description} />
                <CRDetailSection label="URL and Environment" value={cr.url_and_env} />
                <CRDetailSection label="Scope and Reason" value={cr.scope_and_reason} isMultiline />
                <CRDetailSection label="Impact Analysis" value={cr.impact_analysis} isMultiline />
                <CRDetailSection label="Risk Rating" value={cr.risk_rating} />
                <CRDetailSection label="Risk Mitigation" value={cr.risk_mitigation} isMultiline />
                <CRDetailSection label="Down Time" value={cr.down_time} />
                <CRDetailSection label="Maintenance Window" value={cr.planned_maintenance_window} />
              </dl>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <ApprovalTimeline approvers={approvers} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangeRequestDetail;