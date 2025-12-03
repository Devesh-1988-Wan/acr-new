import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Send, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { RiskRating, RequestType } from '@/types/changeRequest';
import { mockUsers } from '@/data/mockData';

interface ApproverSelection {
  id: string;
  name: string;
  email: string;
}

const CreateChangeRequest = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedApprovers, setSelectedApprovers] = useState<ApproverSelection[]>([]);
  
  const [formData, setFormData] = useState({
    description: '',
    urlAndEnv: '',
    scopeAndReason: '',
    impactAnalysis: '',
    riskRating: '' as RiskRating | '',
    riskFactor: '',
    riskMitigationWithRollbackPlan: '',
    downTime: '',
    plannedMaintenanceWindow: '',
    typeOfRequest: '' as RequestType | '',
    preChecks: '',
    postChecks: '',
  });

  const availableApprovers = mockUsers.filter(u => u.role === 'Approver');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addApprover = (userId: string) => {
    const user = availableApprovers.find(u => u.id === userId);
    if (user && !selectedApprovers.find(a => a.id === userId)) {
      setSelectedApprovers(prev => [...prev, { id: user.id, name: user.name, email: user.email }]);
    }
  };

  const removeApprover = (userId: string) => {
    setSelectedApprovers(prev => prev.filter(a => a.id !== userId));
  };

  const handleSubmit = async (saveAsDraft: boolean) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (saveAsDraft) {
      toast.success('Change Request saved as draft', {
        description: 'You can continue editing later.',
      });
    } else {
      toast.success('Change Request submitted for approval', {
        description: `Notification sent to ${selectedApprovers.length} approver(s)`,
      });
    }
    
    setIsSubmitting(false);
    navigate('/change-requests');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-4xl">
        {/* Back Button */}
        <Link
          to="/change-requests"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Change Requests
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Change Request</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details below to create a new change request
          </p>
        </div>

        {/* Form */}
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
          {/* Basic Information */}
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="e.g., Domain Migration from amla.io to znodecorp.com"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urlAndEnv">URL and Environment *</Label>
                <Input
                  id="urlAndEnv"
                  placeholder="e.g., https://admin-klrt-npr.amla.io/"
                  value={formData.urlAndEnv}
                  onChange={(e) => handleInputChange('urlAndEnv', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scopeAndReason">Scope and Reason *</Label>
                <Textarea
                  id="scopeAndReason"
                  placeholder="Describe the scope and reason for this change..."
                  value={formData.scopeAndReason}
                  onChange={(e) => handleInputChange('scopeAndReason', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impactAnalysis">Impact Analysis *</Label>
                <Textarea
                  id="impactAnalysis"
                  placeholder="Describe the expected impact of this change..."
                  value={formData.impactAnalysis}
                  onChange={(e) => handleInputChange('impactAnalysis', e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-semibold text-foreground">Risk Assessment</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="riskRating">Risk Rating *</Label>
                <Select 
                  value={formData.riskRating}
                  onValueChange={(value) => handleInputChange('riskRating', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk rating" />
                  </SelectTrigger>
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
                <Select
                  value={formData.typeOfRequest}
                  onValueChange={(value) => handleInputChange('typeOfRequest', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
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
              <Textarea
                id="riskFactor"
                placeholder="List the risk factors..."
                value={formData.riskFactor}
                onChange={(e) => handleInputChange('riskFactor', e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskMitigation">Risk Mitigation with Rollback Plan *</Label>
              <Textarea
                id="riskMitigation"
                placeholder="Describe mitigation strategies and rollback plan..."
                value={formData.riskMitigationWithRollbackPlan}
                onChange={(e) => handleInputChange('riskMitigationWithRollbackPlan', e.target.value)}
                rows={5}
                required
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-semibold text-foreground">Schedule</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="downTime">Down Time *</Label>
                <Input
                  id="downTime"
                  placeholder="e.g., 45 Mins"
                  value={formData.downTime}
                  onChange={(e) => handleInputChange('downTime', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceWindow">Planned Maintenance Window *</Label>
                <Input
                  id="maintenanceWindow"
                  placeholder="e.g., 08-Dec-2025 (03:00 PM to 04:00 PM IST)"
                  value={formData.plannedMaintenanceWindow}
                  onChange={(e) => handleInputChange('plannedMaintenanceWindow', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Validation */}
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="text-xl font-semibold text-foreground">Validation Checks</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preChecks">Pre-Checks *</Label>
                <Textarea
                  id="preChecks"
                  placeholder="List pre-deployment checks..."
                  value={formData.preChecks}
                  onChange={(e) => handleInputChange('preChecks', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postChecks">Post-Checks *</Label>
                <Textarea
                  id="postChecks"
                  placeholder="List post-deployment checks..."
                  value={formData.postChecks}
                  onChange={(e) => handleInputChange('postChecks', e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {/* Approvers */}
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <h2 className="text-xl font-semibold text-foreground">Approvers</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select onValueChange={addApprover}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select an approver to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableApprovers.map(user => (
                      <SelectItem 
                        key={user.id} 
                        value={user.id}
                        disabled={selectedApprovers.some(a => a.id === user.id)}
                      >
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedApprovers.length > 0 ? (
                <div className="space-y-2">
                  {selectedApprovers.map(approver => (
                    <div
                      key={approver.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{approver.name}</p>
                        <p className="text-sm text-muted-foreground">{approver.email}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeApprover(approver.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No approvers selected. Add at least one approver.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              type="submit"
              variant="hero"
              disabled={isSubmitting || selectedApprovers.length === 0}
            >
              <Send className="h-4 w-4" />
              Submit for Approval
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateChangeRequest;
