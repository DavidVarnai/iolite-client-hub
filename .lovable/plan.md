

## Remove Recent Clients from Sidebar

Remove the entire "Recent Clients" sidebar section (lines 114–141). The sidebar will only show the "Active Client" context block when viewing a specific client, and users will use the `/clients` page to switch clients.

### File changed
**`src/components/AppSidebar.tsx`** — Delete lines 114–141 (the `{!collapsed && ( <SidebarGroup> ... Recent Clients ... </SidebarGroup> )}` block). No other changes needed.

