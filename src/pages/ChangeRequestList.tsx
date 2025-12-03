import { useState } from 'react';
import { Header } from '@/components/Header';
import { ChangeRequestCard } from '@/components/ChangeRequestCard';
import { StatusBadge, RiskBadge } from '@/components/StatusBadge';
import { mockChangeRequests } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApprovalStatus, RiskRating } from '@/types/changeRequest';
import { cn } from '@/lib/utils';

const ChangeRequestList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'All'>('All');
  const [riskFilter, setRiskFilter] = useState<RiskRating | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredCRs = mockChangeRequests.filter(cr => {
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Change Requests</h1>
            <p className="text-muted-foreground mt-1">
              {filteredCRs.length} change request{filteredCRs.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Link to="/change-requests/new">
            <Button variant="hero" size="lg">
              <Plus className="h-5 w-5" />
              Create New CR
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <div className="flex gap-1">
                {statuses.map(status => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Risk:</span>
              <div className="flex gap-1">
                {risks.map(risk => (
                  <Button
                    key={risk}
                    variant={riskFilter === risk ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRiskFilter(risk)}
                  >
                    {risk}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* CR List */}
        {filteredCRs.length > 0 ? (
          <div className={cn(
            'grid gap-4',
            viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {filteredCRs.map((cr, index) => (
              <div
                key={cr.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
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
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
              setRiskFilter('All');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChangeRequestList;
