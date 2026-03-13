import { NavLink } from '@/components/NavLink';
import ioliteLogo from '@/assets/iolite-logo.webp';
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
            <div className="flex items-center gap-2.5">
              <img src={ioliteLogo} alt="Iolite Ventures" className="w-7 h-7 object-contain" />
              <div>
                <h1 className="text-sm font-semibold tracking-tight text-sidebar-foreground">Agency OS</h1>
                <p className="text-[10px] text-sidebar-foreground/60">by Iolite Ventures</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex items-center justify-center">
              <img src={ioliteLogo} alt="Iolite Ventures" className="w-7 h-7 object-contain" />
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
                {clients.map(client => (
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
