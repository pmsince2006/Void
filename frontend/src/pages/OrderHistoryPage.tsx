import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  ArrowRight,
  ShoppingBag,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { Order, OrderPagination } from '../types/order';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { AccountModal } from '../components/common/AccountModal';

export const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<OrderPagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  const fetchOrders = (page: number) => {
    setIsLoading(true);
    setError(null);

    orderService
      .getOrders(page, 10)
      .then((data) => {
        setOrders(data.orders);
        setPagination(data.pagination);
        setIsLoading(false);
      })
      .catch((err: any) => {
        setError(err?.message || 'Failed to retrieve order history from archive.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      fetchOrders(currentPage);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, currentPage]);

  // Unauthenticated View
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center">
        <Breadcrumbs
          items={[
            { label: 'ARCHIVE SHOP', href: '/shop' },
            { label: 'CLIENT ACCOUNT', href: '#' },
            { label: 'ORDER HISTORY' }
          ]}
          className="mb-8"
        />

        <div className="border border-[#111111] p-8 md:p-12 max-w-lg mx-auto text-center bg-white space-y-4 shadow-sm">
          <div className="w-12 h-12 border border-[#111111] flex items-center justify-center mx-auto text-[#111111]">
            <Lock className="w-6 h-6 stroke-1" />
          </div>
          <h2 className="font-heading font-extrabold text-xl uppercase tracking-tight text-[#111111]">
            AUTHENTICATION REQUIRED
          </h2>
          <p className="text-xs font-mono text-[#777777] leading-relaxed">
            Order archives and dispatch records are cryptographically scoped to authenticated client identities.
          </p>
          <div className="pt-2">
            <Button
              variant="solid"
              size="md"
              onClick={() => setAccountModalOpen(true)}
              className="w-full sm:w-auto font-mono"
            >
              SIGN IN / INITIALIZE VOID ACCOUNT
            </Button>
          </div>
        </div>

        <AccountModal
          isOpen={accountModalOpen}
          onClose={() => setAccountModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F4F2ED] text-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'ARCHIVE SHOP', href: '/shop' },
            { label: 'CLIENT ACCOUNT', href: '#' },
            { label: 'DISPATCH ARCHIVE' }
          ]}
          className="mb-6 md:mb-8"
        />

        {/* Page Header */}
        <div className="border-b border-[#111111] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#777777] block mb-1">
              HISTORICAL DISPATCH PROTOCOL //
            </span>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl uppercase tracking-tight text-[#111111]">
              DISPATCH ARCHIVE & ORDER HISTORY
            </h1>
          </div>
          {pagination && (
            <div className="text-xs font-mono text-[#777777]">
              <span>ALLOCATIONS RECORDED: </span>
              <strong className="text-[#111111] font-bold">[{pagination.totalOrders}]</strong>
            </div>
          )}
        </div>

        {/* Content Body */}
        {isLoading ? (
          /* Loading Skeleton */
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-[#111111]/20 bg-white p-6 space-y-4">
                <div className="h-4 bg-[#E5E0D8] w-48 rounded" />
                <div className="h-6 bg-[#E5E0D8] w-72 rounded" />
                <div className="h-12 bg-[#E5E0D8] w-full rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <ErrorState
            title="FAILED TO RETRIEVE ORDERS"
            message={error}
            onRetry={() => fetchOrders(currentPage)}
          />
        ) : orders.length === 0 ? (
          /* Empty State */
          <EmptyState
            title="NO ORDERS RECORDED IN ARCHIVE"
            description="You have not initiated any garment dispatches yet. Explore our latest drop catalogue to allocate pieces."
            actionText="EXPLORE ARCHIVE CATALOGUE"
            actionTo="/shop"
            icon={<Package className="w-6 h-6 stroke-1" />}
          />
        ) : (
          /* Order History Cards */
          <div className="space-y-6">
            <div className="space-y-4">
              {orders.map((order) => {
                const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <article
                    key={order._id}
                    className="border border-[#111111] bg-white shadow-sm hover:border-[#111111] transition-all"
                  >
                    {/* Top Bar */}
                    <div className="p-4 md:px-6 md:py-3.5 bg-[#111111] text-[#F4F2ED] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-extrabold text-sm tracking-wider">
                          {order.orderNumber}
                        </span>
                        <span className="text-[#777777] hidden sm:inline">•</span>
                        <span className="text-[#D1D3D2]">{orderDate}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {order.orderStatus.toUpperCase()}
                        </span>
                        <span className="text-[10px] uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300">
                          PAYMENT: {order.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      {/* Thumbnails & Items Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Up to 3 Thumbnails */}
                        <div className="flex -space-x-3 overflow-hidden shrink-0">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="w-14 h-16 bg-[#EAE8E3] border-2 border-white overflow-hidden shadow-sm shrink-0"
                            >
                              <img
                                src={item.image || ''}
                                alt={item.name}
                                className="w-full h-full object-cover grayscale contrast-125"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Order Description Summary */}
                        <div className="min-w-0 text-xs font-mono">
                          <p className="font-bold text-[#111111] truncate uppercase">
                            {order.items.map((i) => i.name).join(' • ')}
                          </p>
                          <p className="text-[11px] text-[#777777] mt-0.5">
                            {totalUnits} {totalUnits === 1 ? 'PIECE' : 'PIECES'} ALLOCATED
                          </p>
                          <p className="text-[10px] text-[#777777] mt-0.5 truncate uppercase">
                            DESTINATION: {order.shippingAddress.city}, {order.shippingAddress.state}
                          </p>
                        </div>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#111111]/10 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-[#777777] uppercase block">
                            VALUATION:
                          </span>
                          <PriceDisplay price={order.total} size="lg" className="font-bold" />
                        </div>

                        <Button
                          variant="solid"
                          size="sm"
                          to={`/account/orders/${order.orderNumber}`}
                          className="font-mono text-[11px]"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          VIEW SPECIFICATION
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pt-6 border-t border-[#111111] flex items-center justify-between text-xs font-mono">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  className="font-mono"
                >
                  PREVIOUS
                </Button>

                <span className="text-[#777777]">
                  PAGE <strong className="text-[#111111]">{currentPage}</strong> OF{' '}
                  <strong className="text-[#111111]">{pagination.totalPages}</strong>
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  className="font-mono"
                >
                  NEXT
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />
    </div>
  );
};
