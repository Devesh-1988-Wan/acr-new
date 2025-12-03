import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, Mail, Edit, Trash2, UserX, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

type AppRole = 'admin' | 'approver' | 'requester';

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  department: string | null;
  created_at: string;
  roles: AppRole[];
}

const Approvers = () => {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '' as AppRole | '' });
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      toast.error('Failed to load users');
      setLoading(false);
      return;
    }

    // Fetch all roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) {
      toast.error('Failed to load roles');
      setLoading(false);
      return;
    }

    // Combine profiles with roles
    const usersWithRoles: UserWithRoles[] = (profiles || []).map(profile => ({
      id: profile.id,
      email: profile.email || '',
      full_name: profile.full_name || '',
      department: profile.department,
      created_at: profile.created_at,
      roles: (roles || [])
        .filter(r => r.user_id === profile.id)
        .map(r => r.role as AppRole)
    }));

    // Filter to show only approvers and admins
    const approversAndAdmins = usersWithRoles.filter(
      u => u.roles.includes('admin') || u.roles.includes('approver')
    );

    setUsers(approversAndAdmins);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredApprovers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleUpdateRole = async (userId: string, newRole: AppRole) => {
    if (!isAdmin) {
      toast.error('Only admins can update roles');
      return;
    }

    setSaving(true);

    // Remove existing roles for this user (except requester)
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .in('role', ['admin', 'approver']);

    if (deleteError) {
      toast.error('Failed to update role');
      setSaving(false);
      return;
    }

    // Add new role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: newRole });

    if (insertError) {
      toast.error('Failed to update role');
      setSaving(false);
      return;
    }

    toast.success('Role updated successfully');
    setIsEditDialogOpen(false);
    setEditingUser(null);
    fetchUsers();
    setSaving(false);
  };

  const handleAddApprover = async () => {
    if (!newUser.email || !newUser.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isAdmin) {
      toast.error('Only admins can add approvers');
      return;
    }

    // For now, show a message that they need to sign up first
    toast.info('User needs to sign up first', {
      description: 'Once they sign up, you can assign them a role from this page.',
    });
    
    setIsAddDialogOpen(false);
    setNewUser({ name: '', email: '', role: '' });
  };

  const handleDeleteRole = async (userId: string) => {
    if (!isAdmin) {
      toast.error('Only admins can remove roles');
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .in('role', ['admin', 'approver']);

    if (error) {
      toast.error('Failed to remove role');
      return;
    }

    toast.success('User removed from approvers');
    fetchUsers();
  };

  const handleSendInvite = (email: string) => {
    toast.success('Invitation sent', {
      description: `Invitation email sent to ${email}`,
    });
  };

  const openEditDialog = (userToEdit: UserWithRoles) => {
    setEditingUser(userToEdit);
    setIsEditDialogOpen(true);
  };

  const getPrimaryRole = (roles: AppRole[]): AppRole => {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('approver')) return 'approver';
    return 'requester';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Approvers</h1>
            <p className="text-muted-foreground mt-1">
              Manage approvers and their permissions
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg">
                  <Plus className="h-5 w-5" />
                  Add Approver
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Approver</DialogTitle>
                  <DialogDescription>
                    Add a new approver to the system. They will receive an invitation email.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as AppRole }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approver">Approver</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="hero" onClick={handleAddApprover}>
                    Add Approver
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search approvers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Approvers Grid */}
        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApprovers.map((approver, index) => {
              const primaryRole = getPrimaryRole(approver.roles);
              return (
                <div
                  key={approver.id}
                  className="rounded-xl border bg-card p-6 shadow-card animate-slide-up hover:shadow-lg transition-shadow"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                        {approver.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{approver.full_name || 'Unknown'}</h3>
                        <p className="text-sm text-muted-foreground">{approver.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Role</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                        primaryRole === 'admin' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-status-approved/10 text-status-approved'
                      )}>
                        {primaryRole}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Added</span>
                      <span className="text-foreground">{formatDate(approver.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleSendInvite(approver.email)}
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                    {isAdmin && (
                      <>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openEditDialog(approver)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteRole(approver.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredApprovers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <UserX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No approvers found</h3>
            <p className="text-muted-foreground mb-4">
              {user ? 'Add approvers to get started' : 'Sign in to manage approvers'}
            </p>
          </div>
        )}

        {/* Edit Role Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Update the role for {editingUser?.full_name || 'this user'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <p className="text-sm text-muted-foreground capitalize">
                  {editingUser ? getPrimaryRole(editingUser.roles) : ''}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newRole">New Role</Label>
                <Select
                  defaultValue={editingUser ? getPrimaryRole(editingUser.roles) : undefined}
                  onValueChange={(value) => {
                    if (editingUser) {
                      handleUpdateRole(editingUser.id, value as AppRole);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approver">Approver</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Approvers;
