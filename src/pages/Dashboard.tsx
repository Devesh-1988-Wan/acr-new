import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { ChangeRequestCard } from '@/components/ChangeRequestCard';
import { mockChangeRequests } from '@/data/mockData';
import { FileText, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const totalCRs = mockChangeRequests.length;
  const pendingCRs = mockChangeRequests.filter(cr => cr.status === 'Pending').length;
  const approvedCRs = mockChangeRequests.filter(cr => cr.status === 'Approved').length;
  const criticalCRs = mockChangeRequests.filter(cr => cr.riskRating === 'Critical').length;

  const recentCRs = [...mockChangeRequests]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage your change requests
            </p>
          </div>
          <Link to="/change-requests/new">
            <Button variant="hero" size="lg">
              <Plus className="h-5 w-5" />
              Create New CR
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Change Requests"
            value={totalCRs}
            icon={FileText}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Pending Approval"
            value={pendingCRs}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Approved"
            value={approvedCRs}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Critical Risk"
            value={criticalCRs}
            icon={AlertTriangle}
            variant="danger"
          />
        </div>

        {/* Recent Change Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Change Requests</h2>
            <Link to="/change-requests">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-4">
            {recentCRs.map((cr, index) => (
              <div
                key={cr.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ChangeRequestCard cr={cr} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
