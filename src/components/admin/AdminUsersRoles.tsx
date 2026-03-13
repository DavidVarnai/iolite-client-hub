import { Shield, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { seedUsers, roleDefinitions } from '@/data/adminSeed';

const roleBadgeClass: Record<string, string> = {
  master_admin: 'bg-primary/10 text-primary border-primary/20',
  project_manager: 'bg-secondary/10 text-secondary border-secondary/20',
  team_member: 'bg-accent/20 text-accent-foreground border-accent/30',
  client_user: 'bg-muted text-muted-foreground',
};

export default function AdminUsersRoles() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Users & Roles</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Agency-wide user management and permission levels.
        </p>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> Users
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seedUsers.map(user => {
                const roleDef = roleDefinitions.find(r => r.role === user.role);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleBadgeClass[user.role] || ''}>
                        {roleDef?.label || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role definitions */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4" /> Role Definitions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleDefinitions.map(role => (
            <Card key={role.role}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{role.label}</CardTitle>
                <CardDescription className="text-xs">{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map(p => (
                    <Badge key={p} variant="secondary" className="text-[10px]">
                      {p.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
