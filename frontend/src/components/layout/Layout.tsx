import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from './AnnouncementBar';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { CartDrawer } from './CartDrawer';
import { WishlistDrawer } from './WishlistDrawer';
import { ToastContainer } from '../common/Toast';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2ED] text-[#111111]">
      {/* Top Drop Alert Bar */}
      <AnnouncementBar />

      {/* Main Navigation Header */}
      <SiteHeader />

      {/* Page Body Viewport */}
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      {/* Persistent Global Modals and Drawers */}
      <CartDrawer />
      <WishlistDrawer />
      <ToastContainer />

      {/* Editorial Footer */}
      <SiteFooter />
    </div>
  );
};
