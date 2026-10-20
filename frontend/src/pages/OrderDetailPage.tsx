import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  Package,
  Calendar,
  Lock,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { Order } from '../types/order';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { ErrorState } from '../components/common/ErrorState';
import { AccountModal } from '../components/common/AccountModal';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const isNewOrder = Boolean(location.state?.isNewOrder);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (authLoading) return;

    if (!isAuthenticated) {
      setIsLoading(false);
      setError('Authentication required to view order specifications.');
      return;
    }

    if (!id) {
      setIsLoading(false);
      setError('Order identifier is missing.');
      return;
    }

    setIsLoading(true);
    setError(null);

    orderService
      .getOrderById(id)
      .then((data) => {
        if (isMounted) {
          setOrder(data);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.message || 'Order not found in the VOID archive.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated, authLoading]);

  // Loading skeleton
  if (isLoading || authLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
        <div className="h-4 bg-[#E5E0D8] w-48 rounded" />
        <div className="h-10 bg-[#E5E0D8] w-80 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-[#E5E0D8] rounded" />
          <div className="lg:col-span-4 h-64 bg-[#E5E0D8] rounded" />
        </div>
      </div>
    );
  }

  // Error / Unauthorized / Not Found State
  if (error || !order) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center">
        <Breadcrumbs
          items={[
            { label: 'ARCHIVE SHOP', href: '/shop' },
            { label: 'ORDERS', href: '/account/orders' },
            { label: 'SPECIFICATION' }
          ]}
          className="mb-8"
        />

        {!isAuthenticated ? (
          <div className="border border-[#111111] p-8 max-w-lg mx-auto text-center bg-white space-y-4">
            <Lock className="w-8 h-8 text-[#111111] mx-auto" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-[#111111]">
              AUTHENTICATION REQUIRED
            </h3>
            <p className="text-xs font-mono text-[#777777]">
              Please verify your client identity to access secure dispatch records.
            </p>
            <Button
              variant="solid"
              size="sm"
              onClick={() => setAccountModalOpen(true)}
              className="font-mono"
            >
              SIGN IN / INITIALIZE VOID ACCOUNT
            </Button>
          </div>
        ) : (
          <ErrorState
            title="ORDER SPECIFICATION NOT FOUND"
            message={error || 'The requested order number was not found in your client archive.'}
            onRetry={() => navigate('/account/orders')}
          />
        )}

        <AccountModal
          isOpen={accountModalOpen}
          onClose={() => setAccountModalOpen(false)}
        />
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="w-full min-h-screen bg-[#F4F2ED] text-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'ARCHIVE SHOP', href: '/shop' },
            { label: 'ORDERS', href: '/account/orders' },
            { label: order.orderNumber }
          ]}
          className="mb-6 md:mb-8"
        />

        {/* New Order Confirmed Banner (shown when navigated straight from checkout) */}
        {isNewOrder && (
          <div className="mb-8 border border-emerald-500/40 bg-emerald-500/5 p-6 border-l-4 border-l-emerald-600 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 className="font-heading font-extrabold text-base uppercase tracking-tight text-[#111111]">
                  TRANSMISSION SUCCESSFUL // ORDER RECORDED
                </h2>
                <p className="text-xs font-mono text-[#777777] leading-relaxed">
                  Your garments have been securely allocated in the VOID backend archive under order{' '}
                  <strong className="text-[#111111]">{order.orderNumber}</strong>. Dispatch notification has been queued for{' '}
                  <strong className="text-[#111111]">{order.customer.email}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="border-b border-[#111111] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#777777]">
                DISPATCH SPECIFICATION //
              </span>
              <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                {order.orderStatus.toUpperCase()}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl uppercase tracking-tight text-[#111111]">
              ORDER {order.orderNumber}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#777777]">
            <Calendar className="w-3.5 h-3.5 text-[#111111]" />
            <span>RECORDED: {formattedDate}</span>
          </div>
        </div>

        {/* Payment Status Notice (Explicitly Pending/Unpaid) */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-900">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>PAYMENT STATUS: {order.paymentStatus.toUpperCase()} [ UNPAID ALLOCATION ]</span>
          </div>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            * STAGE 7C NOTICE: No payment has been processed and zero customer funds have been deducted. Payment gateway integration will be introduced in subsequent stages. Your garment allocation is securely registered in MongoDB.
          </p>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Items & Shipping (Col 7) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Allocated Silhouettes Card */}
            <div className="border border-[#111111] bg-white divide-y divide-[#111111] shadow-sm">
              <div className="p-4 md:p-5 flex items-center justify-between bg-[#111111] text-[#F4F2ED]">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <h2 className="font-heading font-bold text-xs tracking-widest uppercase">
                    PURCHASED SILHOUETTES [{order.items.reduce((sum, i) => sum + i.quantity, 0)} UNITS]
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[#D1D3D2] uppercase">
                  IMMUTABLE SNAPSHOT
                </span>
              </div>

              <div className="divide-y divide-[#111111]/10">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-4 md:p-5 flex gap-4 text-xs font-mono">
                    <div className="w-16 h-20 bg-[#EAE8E3] border border-[#111111]/20 overflow-hidden shrink-0">
                      <img
                        src={item.image || ''}
                        alt={item.name}
                        className="w-full h-full object-cover grayscale contrast-125"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-heading font-bold text-sm uppercase text-[#111111] truncate">
                          {item.name}
                        </h3>
                        {item.sku && (
                          <p className="text-[10px] text-[#777777] uppercase mt-0.5">
                            SKU: {item.sku}
                          </p>
                        )}
                        <p className="text-[10px] text-[#777777] mt-0.5">
                          SIZE: {item.size} • COLOR: {item.color}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#111111]/5">
                        <span className="text-[#777777]">
                          QTY: {item.quantity} × <PriceDisplay price={item.unitPrice} size="sm" />
                        </span>
                        <PriceDisplay price={item.lineTotal} size="sm" className="font-bold text-[#111111]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Recipient Details Card */}
            <div className="border border-[#111111] p-5 md:p-6 bg-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#111111]/15 pb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#111111]" />
                  <h3 className="font-heading font-bold text-xs tracking-widest uppercase text-[#111111]">
                    [ DISPATCH ROUTING & COURIER SPECIFICATION ]
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#777777] uppercase">DOMESTIC EXPRESS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#777777] uppercase block mb-1">RECIPIENT NAME:</span>
                  <span className="font-bold text-[#111111] uppercase">
                    {order.shippingAddress.fullName || order.customer.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] uppercase block mb-1">CONTACT NOTIFICATION:</span>
                  <span className="text-[#111111] block lowercase">{order.customer.email}</span>
                  <span className="text-[#111111] block">{order.customer.phone}</span>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-[#111111]/10">
                  <span className="text-[10px] text-[#777777] uppercase block mb-1">DELIVERY ADDRESS:</span>
                  <p className="text-[#111111] uppercase leading-relaxed font-bold">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}
                    <br />
                    INDIA
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#F4F2ED] border border-[#111111]/15 text-[11px] font-mono text-[#777777] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Insured domestic transit with tamper-evident archival packaging and signature delivery.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Valuation & Actions (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#111111] bg-white divide-y divide-[#111111] shadow-sm">
              <div className="p-4 md:p-5 bg-[#111111] text-[#F4F2ED]">
                <h3 className="font-heading font-bold text-xs tracking-widest uppercase">
                  VALUATION BREAKDOWN
                </h3>
              </div>

              <div className="p-5 space-y-3 text-xs font-mono bg-[#F4F2ED]">
                <div className="flex justify-between text-[#777777]">
                  <span>SUBTOTAL:</span>
                  <PriceDisplay price={order.subtotal} size="sm" />
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>INSURED COURIER DISPATCH:</span>
                  <span className="text-emerald-700 font-bold uppercase">[ COMPLIMENTARY ]</span>
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>APPLICABLE GST:</span>
                  <span className="text-[#111111]">18% REVERSE INCLUSIVE</span>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-[#111111] text-sm">
                  <span className="font-heading font-bold uppercase text-[#111111]">
                    TOTAL VALUATION:
                  </span>
                  <PriceDisplay price={order.total} size="lg" className="font-bold text-[#111111]" />
                </div>
              </div>

              <div className="p-5 space-y-3 bg-white">
                <Button
                  variant="solid"
                  size="md"
                  to="/shop"
                  className="w-full font-mono"
                  leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                >
                  CONTINUE BROWSING ARCHIVE
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  to="/account/orders"
                  className="w-full font-mono"
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  VIEW ALL ORDERS
                </Button>
              </div>
            </div>

            <div className="border border-[#111111] p-4 bg-white space-y-2 text-[10px] font-mono text-[#777777]">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#111111]" />
                <span>CRYPTOGRAPHICALLY ENCRYPTED ORDER RECORD</span>
              </div>
              <p className="text-[9px] text-[#999999] pt-1 border-t border-[#111111]/10">
                Purchase-time garment prices and specifications are permanently snapshotted in MongoDB and remain unaffected by catalogue modifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
