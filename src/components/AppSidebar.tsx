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
import { isAdminUser } from '@/types/admin';
import { currentUser } from '@/data/seed';

const navItems = [
  { title: 'Dashboard', url: '/' },
  { title: 'Clients', url: '/clients' },
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
        <div className="px-4 py-5 border-b border-sidebar-border flex items-center justify-center">
          <img src={ioliteLogo} alt="Iolite Ventures" className={collapsed ? "h-7 object-contain" : "h-10 object-contain"} />
        </div>

        {/* Main navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-highlight font-medium">
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
                      className="text-sm px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-highlight font-medium"
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
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-highlight font-medium">
              Active Client
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-sidebar-highlight/20 flex items-center justify-center text-xs font-semibold text-sidebar-highlight">
                    {activeClient.logoInitials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground leading-tight">{activeClient.name}</p>
                    <p className="text-[11px] text-sidebar-foreground/60 capitalize">{activeClient.stage}</p>
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin — only visible to admin users */}
        {isAdminUser(currentUser.role) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-highlight font-medium">
              System
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className="text-sm px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-highlight font-medium"
                    >
                      {!collapsed && <span>Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>
    </Sidebar>
  );
}
