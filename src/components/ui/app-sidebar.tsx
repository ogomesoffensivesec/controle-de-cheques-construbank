// src/components/ui/app-sidebar.jsx
import { useState, useEffect } from 'react';
import { Home, Settings, LogOut, BanknoteIcon, RotateCw, UsersIcon } from "lucide-react";
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
import { Switch } from './switch';
import { Label } from './label';
import { useAuth } from '@/contexts/auth-context';

// Itens do menu, sem a opção "Sair"
const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Cheques",
    url: '/cheques',
    icon: BanknoteIcon
  },
];

const adminMenuItems = [
 
  {
    title: "Remessas",
    url: '/remessas',
    icon: RotateCw
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: UsersIcon
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
]

const footerItems = [
  {
    title: "Sair",
    url: "/signoff",
    icon: LogOut,
    action: 'signoff',
  },
];

export function AppSidebar() {
  const { currentUser }: any = useAuth()
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme : 'light';
  });

  // Aplicar o tema ao elemento root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col justify-between h-full">
        {/* Conteúdo Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Aplicação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {
                menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className="flex items-center p-2">
                        <item.icon size={20} />
                        <span className="ml-2">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              }
              {
                currentUser && !currentUser.isClient && adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className="flex items-center p-2">
                        <item.icon size={20} />
                        <span className="ml-2">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              }

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Rodapé */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <SidebarMenu className='space-y-4'>
            {/* Switch de Tema */}
            <SidebarMenuItem>
              <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" checked={theme === 'dark'}
                  onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
                <Label htmlFor="airplane-mode">Tema {theme === 'dark' ? 'Escuro' : 'Claro'}</Label>
              </div>

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
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
