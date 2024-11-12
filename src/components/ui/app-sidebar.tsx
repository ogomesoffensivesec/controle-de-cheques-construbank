// src/components/ui/app-sidebar.jsx
import { Home, Settings, LogOut, BanknoteIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from 'react-router-dom';

// Itens do menu, sem a opção "Sair"
const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Estornos",
    url: "/estornos",
    icon: BanknoteIcon,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

const footerItems = [
  {
    title: "Sair",
    url: "/signoff",
    icon: LogOut,
    action: 'signoff',
  },
];

export function AppSidebar() {

  // Aplicar o tema ao carregar o componente


  return (
    <Sidebar>
      <SidebarContent className="flex flex-col justify-between h-full">
        {/* Conteúdo Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Aplicação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center p-2">
                      <item.icon size={20} />
                      <span className="ml-2">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Rodapé */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <SidebarMenu>
           
            <SidebarMenuItem>
          
            </SidebarMenuItem>
             {footerItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.url} className="flex items-center p-2">
                    <item.icon size={20} />
                    <span className="ml-2">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {/* Switch de Tema */}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
