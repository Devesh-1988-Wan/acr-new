import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ChangeRequestCard } from '@/components/ChangeRequestCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, LayoutGrid, List, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApprovalStatus, RiskRating } from '@/types/changeRequest';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const ChangeRequestList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'All'>('All');
  const [riskFilter, setRiskFilter] = useState<RiskRating | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCRs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('change_requests')
        .select(`
          *,
          change_request_approvers ( status )
        `)
        .order('created_at', { ascending: false });

      if (data) {
        // Transform for the card component if needed, or pass directly
        const formattedData = data.map(cr => ({
          ...cr,
          requestId: cr.request_id,
          riskRating: cr.risk_rating,
          scopeAndReason: cr.scope_and_reason,
          downTime: cr.down_time,
          createdAt: cr.created_at,
          // Map approvers for the count in the card
          approvers: cr.change_request_approvers
        }));
        setChangeRequests(formattedData);
      }
      setLoading(false);
    };
    fetchCRs();
  }, []);

  const filteredCRs = changeRequests.filter(cr => {
    const matchesSearch = 
      cr.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cr.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || cr.status === statusFilter;
    const matchesRisk = riskFilter === 'All' || cr.riskRating === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const statuses: (ApprovalStatus | 'All')[] = ['All', 'Draft', 'Pending', 'Approved', 'Rejected'];
  const risks: (RiskRating | 'All')[] = ['All', 'Critical', 'High', 'Medium', 'Low'];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Change Requests</h1>
            <p className="text-muted-foreground mt-1">
              {filteredCRs.length} change request{filteredCRs.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Link to="/change-requests/new">
            <Button variant="hero" size="lg"><Plus className="h-5 w-5" /> Create New CR</Button>
          </Link>
        </div>

        {/* Filters ... (same as before) */}
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : filteredCRs.length > 0 ? (
          <div className={cn('grid gap-4', viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {filteredCRs.map((cr, index) => (
              <div key={cr.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <ChangeRequestCard cr={cr} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No change requests found</h3>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChangeRequestList;