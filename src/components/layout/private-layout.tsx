// src/components/layout/private-layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';

const PrivateLayout: React.FC = () => {
  return (
    <SidebarProvider className="grid grid-cols-[16rem_1fr]">
      <AppSidebar />
      <main >
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default PrivateLayout;
