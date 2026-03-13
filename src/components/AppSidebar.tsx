import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { getClients } from '@/data/seed';

const navItems = [
  { title: 'Dashboard', url: '/' },
  { title: 'Clients', url: '/clients' },
  { title: 'Templates', url: '/templates' },
  { title: 'Internal Library', url: '/library' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const clients = getClients();
  const activeClient = clients.find(c =>
    location.pathname.startsWith(`/clients/${c.id}`)
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Brand */}
        <div className="px-4 py-5 border-b border-sidebar-border">
          {!collapsed && (
            <div>
              <h1 className="text-base font-semibold tracking-tight text-foreground">Iolite</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Ventures</p>
            </div>
          )}
          {collapsed && (
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-primary">I</span>
            </div>
          )}
        </div>

        {/* Main navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="text-sm px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Active client context */}
        {activeClient && !collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Active Client
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {activeClient.logoInitials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">{activeClient.name}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{activeClient.stage}</p>
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Recent clients */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Recent Clients
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {seedClients.map(client => (
                  <SidebarMenuItem key={client.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/clients/${client.id}`}
                        className="text-sm px-3 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors flex items-center gap-2"
                        activeClassName="bg-sidebar-accent text-primary font-medium"
                      >
                        <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary flex-shrink-0">
                          {client.logoInitials}
                        </span>
                        <span className="truncate">{client.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
