import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ApproverUser {
  id: string;
  full_name: string;
  email: string;
}

const CreateChangeRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableApprovers, setAvailableApprovers] = useState<ApproverUser[]>([]);
  const [selectedApprovers, setSelectedApprovers] = useState<ApproverUser[]>([]);
  
  const [formData, setFormData] = useState({
    description: '',
    urlAndEnv: '',
    scopeAndReason: '',
    impactAnalysis: '',
    riskRating: '',
    riskFactor: '',
    riskMitigationWithRollbackPlan: '',
    downTime: '',
    plannedMaintenanceWindow: '',
    typeOfRequest: '',
    preChecks: '',
    postChecks: '',
  });

  // Fetch real approvers from Supabase
  useEffect(() => {
    const fetchApprovers = async () => {
      // Get users who have the 'approver' role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'approver');

      if (roleData && roleData.length > 0) {
        const userIds = roleData.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        if (profiles) {
          // Map to correct type if necessary
          setAvailableApprovers(profiles as ApproverUser[]);
        }
      }
    };
    fetchApprovers();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addApprover = (userId: string) => {
    const user = availableApprovers.find(u => u.id === userId);
    if (user && !selectedApprovers.find(a => a.id === userId)) {
      setSelectedApprovers(prev => [...prev, user]);
    }
  };

  const removeApprover = (userId: string) => {
    setSelectedApprovers(prev => prev.filter(a => a.id !== userId));
  };

  const handleSubmit = async (saveAsDraft: boolean) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // 1. Generate a simple Request ID (e.g., CR-Timestamp)
      const requestId = `CR-${Date.now().toString().slice(-6)}`;

      // 2. Insert the Change Request
      const { data: crData, error: crError } = await supabase
        .from('change_requests')
        .insert({
          request_id: requestId,
          description: formData.description,
          url_and_env: formData.urlAndEnv,
          scope_and_reason: formData.scopeAndReason,
          impact_analysis: formData.impactAnalysis,
          risk_rating: formData.riskRating,
          risk_factor: formData.riskFactor,
          risk_mitigation: formData.riskMitigationWithRollbackPlan,
          down_time: formData.downTime,
          planned_maintenance_window: formData.plannedMaintenanceWindow,
          type_of_request: formData.typeOfRequest,
          pre_checks: formData.preChecks,
          post_checks: formData.postChecks,
          status: saveAsDraft ? 'Draft' : 'Pending',
          created_by: user.id
        })
        .select()
        .single();

      if (crError) throw crError;

      // 3. Insert Approvers
      if (selectedApprovers.length > 0) {
        const approverInserts = selectedApprovers.map(approver => ({
          change_request_id: crData.id,
          user_id: approver.id,
          status: 'Pending'
        }));

        const { error: approverError } = await supabase
          .from('change_request_approvers')
          .insert(approverInserts);

        if (approverError) throw approverError;
      }

      toast.success(saveAsDraft ? 'Saved as draft' : 'Submitted successfully');
      navigate('/change-requests');

    } catch (error: any) {
      toast.error('Error creating request', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <Link to="/change-requests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Change Requests
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Change Request</h1>
          <p className="text-muted-foreground mt-1">Fill in the details below to create a new change request</p>
        </div>

        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
          {/* Basic Information */}
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urlAndEnv">URL and Environment *</Label>
                <Input id="urlAndEnv" value={formData.urlAndEnv} onChange={(e) => handleInputChange('urlAndEnv', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scopeAndReason">Scope and Reason *</Label>
                <Textarea id="scopeAndReason" value={formData.scopeAndReason} onChange={(e) => handleInputChange('scopeAndReason', e.target.value)} rows={3} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="impactAnalysis">Impact Analysis *</Label>
                <Textarea id="impactAnalysis" value={formData.impactAnalysis} onChange={(e) => handleInputChange('impactAnalysis', e.target.value)} rows={4} required />
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Risk Assessment</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="riskRating">Risk Rating *</Label>
                <Select value={formData.riskRating} onValueChange={(value) => handleInputChange('riskRating', value)}>
                  <SelectTrigger><SelectValue placeholder="Select risk rating" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeOfRequest">Type of Request *</Label>
                <Select value={formData.typeOfRequest} onValueChange={(value) => handleInputChange('typeOfRequest', value)}>
                  <SelectTrigger><SelectValue placeholder="Select request type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mandatory">Mandatory</SelectItem>
                    <SelectItem value="Optional">Optional</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskFactor">Risk Factor *</Label>
              <Textarea id="riskFactor" value={formData.riskFactor} onChange={(e) => handleInputChange('riskFactor', e.target.value)} rows={3} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskMitigation">Risk Mitigation with Rollback Plan *</Label>
              <Textarea id="riskMitigation" value={formData.riskMitigationWithRollbackPlan} onChange={(e) => handleInputChange('riskMitigationWithRollbackPlan', e.target.value)} rows={5} required />
            </div>
          </div>

          {/* Schedule & Validation */}
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Schedule & Validation</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="downTime">Down Time *</Label>
                <Input id="downTime" value={formData.downTime} onChange={(e) => handleInputChange('downTime', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenanceWindow">Planned Maintenance Window *</Label>
                <Input id="maintenanceWindow" value={formData.plannedMaintenanceWindow} onChange={(e) => handleInputChange('plannedMaintenanceWindow', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preChecks">Pre-Checks *</Label>
                <Textarea id="preChecks" value={formData.preChecks} onChange={(e) => handleInputChange('preChecks', e.target.value)} rows={3} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postChecks">Post-Checks *</Label>
                <Textarea id="postChecks" value={formData.postChecks} onChange={(e) => handleInputChange('postChecks', e.target.value)} rows={3} required />
              </div>
            </div>
          </div>

          {/* Approvers */}
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Approvers</h2>
            <div className="space-y-4">
              <Select onValueChange={addApprover}>
                <SelectTrigger><SelectValue placeholder="Select an approver to add" /></SelectTrigger>
                <SelectContent>
                  {availableApprovers.map(user => (
                    <SelectItem key={user.id} value={user.id} disabled={selectedApprovers.some(a => a.id === user.id)}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedApprovers.length > 0 ? (
                <div className="space-y-2">
                  {selectedApprovers.map(approver => (
                    <div key={approver.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{approver.full_name}</p>
                        <p className="text-sm text-muted-foreground">{approver.email}</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeApprover(approver.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No approvers selected.</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" /> Save as Draft
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting || selectedApprovers.length === 0}>
              <Send className="h-4 w-4 mr-2" /> Submit for Approval
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateChangeRequest;