import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Truck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  User,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Info,
  PackageCheck,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { EmptyState } from '../components/common/EmptyState';
import { AccountModal } from '../components/common/AccountModal';
import {
  ShippingAddress,
  CheckoutFormErrors,
  INDIAN_STATES
} from '../types/checkout';

const INITIAL_FORM: ShippingAddress = {
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pinCode: ''
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalCount, subtotal } = useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState<ShippingAddress>(INITIAL_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof ShippingAddress, boolean>>>({});
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [allocationVerified, setAllocationVerified] = useState(false);

  // Auto-populate customer info from authenticated user session
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  // Validation function for Indian shipping & contact details
  const validateField = useCallback((field: keyof ShippingAddress, value: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Recipient full name is required.';
        if (value.trim().length < 2) return 'Full name must contain at least 2 characters.';
        return undefined;

      case 'email':
        if (!value.trim()) return 'Contact email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Enter a valid email address (e.g. client@void.atelier).';
        }
        return undefined;

      case 'phone': {
        const cleanPhone = value.replace(/[\s\-()]/g, '');
        if (!cleanPhone) return 'Contact telephone number is required.';
        // Accepts 10 digits starting with 6-9, optionally prefixed with +91 or 0
        if (!/^(?:\+?91|0)?[6-9]\d{9}$/.test(cleanPhone)) {
          return 'Enter a valid 10-digit Indian mobile number (e.g. 98765 43210).';
        }
        return undefined;
      }

      case 'addressLine1':
        if (!value.trim()) return 'Street address or premises identifier is required.';
        if (value.trim().length < 5) return 'Address must contain at least 5 characters.';
        return undefined;

      case 'city':
        if (!value.trim()) return 'Destination city is required.';
        if (value.trim().length < 2) return 'City must contain at least 2 characters.';
        return undefined;

      case 'state':
        if (!value.trim()) return 'Select an Indian state or union territory.';
        return undefined;

      case 'pinCode': {
        const cleanPin = value.trim();
        if (!cleanPin) return 'Six-digit Indian PIN code is required.';
        if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
          return 'Enter a valid 6-digit Indian PIN code (e.g. 110001).';
        }
        return undefined;
      }

      case 'addressLine2':
      default:
        return undefined;
    }
  }, []);

  // Validate entire form
  const validateAll = useCallback((): boolean => {
    const newErrors: CheckoutFormErrors = {};
    let isValid = true;

    (Object.keys(form) as Array<keyof ShippingAddress>).forEach((field) => {
      const error = validateField(field, form[field] || '');
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [form, validateField]);

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof ShippingAddress) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field] || '');
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Partial<Record<keyof ShippingAddress, boolean>> = {};
    (Object.keys(form) as Array<keyof ShippingAddress>).forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    if (!isAuthenticated) {
      addToast('AUTHENTICATION REQUIRED // Sign in or create an identity to allocate dispatch.', 'error', 'ACCESS LOCKED');
      setAccountModalOpen(true);
      return;
    }

    const isValid = validateAll();
    if (!isValid) {
      addToast('Please resolve the highlighted shipping fields before proceeding.', 'error', 'INVALID DISPATCH');
      return;
    }

    // Stage 7A Verification Success: Details recorded without simulating fake payment
    setAllocationVerified(true);
    addToast('DISPATCH SPECIFICATIONS VERIFIED // Ready for Stage 7B order allocation.', 'success', 'STAGE 7A COMPLETE');
  };

  // Estimated shipping valuation (complimentary domestic dispatch across India)
  const shippingValuation = 0;
  const estimatedTotal = subtotal + shippingValuation;

  // Render empty state if bag contains zero items
  if (items.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex-1 flex flex-col justify-center">
        <Breadcrumbs
          items={[
            { label: 'ARCHIVE SHOP', href: '/shop' },
            { label: 'CHECKOUT' }
          ]}
          className="mb-8"
        />
        <EmptyState
          title="ARCHIVE BAG IS EMPTY"
          description="Your bag currently contains zero allocated silhouettes. Explore the catalogue to select garments before initiating dispatch."
          actionText="EXPLORE ARCHIVE CATALOGUE"
          actionTo="/shop"
          icon={<ShoppingBag className="w-6 h-6 stroke-1" />}
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
            { label: 'BAG', href: '#' },
            { label: 'CHECKOUT & DISPATCH' }
          ]}
          className="mb-6 md:mb-8"
        />

        {/* Page Header */}
        <div className="border-b border-[#111111] pb-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#777777] block mb-1">
                TRANSMISSION PROTOCOL // STAGE 07A
              </span>
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl uppercase tracking-tight text-[#111111]">
                CHECKOUT & SHIPPING ALLOCATION
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#777777]">
              <Lock className="w-3.5 h-3.5 text-[#111111]" />
              <span>TLS 1.3 ENCRYPTED COURIER ROUTING</span>
            </div>
          </div>
        </div>

        {/* Mobile Order Summary Accordion Drawer */}
        <div className="lg:hidden mb-8 border border-[#111111] bg-white">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen((prev) => !prev)}
            className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-mono uppercase bg-[#111111] text-[#F4F2ED]"
            aria-expanded={mobileSummaryOpen}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>ORDER SUMMARY [{totalCount} ITEMS]</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">
                <PriceDisplay price={estimatedTotal} size="sm" className="text-[#F4F2ED]" />
              </span>
              {mobileSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {mobileSummaryOpen && (
            <div className="p-4 space-y-4 border-t border-[#111111] divide-y divide-[#111111]/10">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3 text-xs font-mono">
                  <div className="w-14 h-18 bg-[#EAE8E3] border border-[#111111]/20 overflow-hidden shrink-0">
                    <img
                      src={item.product.images[0] || ''}
                      alt={item.product.name}
                      className="w-full h-full object-cover grayscale contrast-125"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-xs uppercase truncate text-[#111111]">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-[#777777] mt-0.5">
                      SIZE: {item.size} • COLOR: {item.color}
                    </p>
                    <p className="text-[10px] text-[#777777]">QTY: {item.quantity}</p>
                    <div className="mt-1">
                      <PriceDisplay price={item.product.price * item.quantity} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Form & Client Identity (Col 7) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Identity Status Banner */}
            <div className="border border-[#111111] p-5 md:p-6 bg-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#111111]/15 pb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#111111]" />
                  <h2 className="font-heading font-bold text-sm tracking-wider uppercase text-[#111111]">
                    [ 01 // CLIENT IDENTITY ]
                  </h2>
                </div>
                {isAuthenticated ? (
                  <span className="text-[10px] font-mono tracking-widest px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    VERIFIED SESSION
                  </span>
                ) : (
                  <span className="text-[10px] font-mono tracking-widest px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                    AUTHENTICATION REQUIRED
                  </span>
                )}
              </div>

              {isAuthenticated && user ? (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex flex-col sm:flex-row sm:justify-between text-[#111111]">
                    <span className="text-[#777777] uppercase">ENROLLED CLIENT:</span>
                    <span className="font-bold uppercase">{user.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-[#111111]">
                    <span className="text-[#777777] uppercase">SESSION FREQUENCY:</span>
                    <span className="lowercase font-bold">{user.email}</span>
                  </div>
                  <p className="text-[10px] text-[#777777] pt-2 border-t border-[#111111]/10 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Archive allocation linked to verified VOID credentials.</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-mono text-[#777777] leading-relaxed">
                    VOID safeguards drop integrity by tying garment dispatch to authenticated client identities. Your guest bag will be seamlessly merged into your account.
                  </p>
                  <Button
                    type="button"
                    variant="solid"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setAccountModalOpen(true)}
                  >
                    SIGN IN / INITIALIZE VOID ACCOUNT
                  </Button>
                </div>
              )}
            </div>

            {/* Shipping & Delivery Address Form */}
            <form onSubmit={handleSubmit} noValidate className="border border-[#111111] p-5 md:p-8 bg-white space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#111111]/15 pb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#111111]" />
                  <h2 className="font-heading font-bold text-sm tracking-wider uppercase text-[#111111]">
                    [ 02 // DOMESTIC DISPATCH SPECIFICATION ]
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[#777777] uppercase">INDIA ONLY</span>
              </div>

              {/* Form Fields Grid */}
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1.5"
                  >
                    RECIPIENT FULL NAME *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="e.g. AARAV SHARMA"
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    className={`w-full px-3.5 py-2.5 bg-white border text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none transition-colors ${
                      errors.fullName && touched.fullName
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-[#111111] focus:ring-1 focus:ring-[#111111]'
                    }`}
                  />
                  {errors.fullName && touched.fullName && (
                    <p id="fullName-error" className="text-[11px] font-mono text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1.5"
                    >
                      DISPATCH NOTIFICATION EMAIL *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="client@void.atelier"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={`w-full px-3.5 py-2.5 bg-white border text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none transition-colors ${
                        errors.email && touched.email
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#111111] focus:ring-1 focus:ring-[#111111]'
                      }`}
                    />
                    {errors.email && touched.email && (
                      <p id="email-error" className="text-[11px] font-mono text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1.5"
                    >
                      INDIAN TELEPHONE (+91) *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      placeholder="98765 43210"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      className={`w-full px-3.5 py-2.5 bg-white border text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none transition-colors ${
                        errors.phone && touched.phone
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#111111] focus:ring-1 focus:ring-[#111111]'
                      }`}
                    />
                    {errors.phone && touched.phone && (
                      <p id="phone-error" className="text-[11px] font-mono text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Address Line 1 */}
                <div>
                  <label
                    htmlFor="addressLine1"
                    className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1.5"
                  >
                    STREET ADDRESS / BUILDING / PREMISES *
                  </label>
                  <input
                    id="addressLine1"
                    type="text"
                    required
                    value={form.addressLine1}
                    onChange={(e) => handleChange('addressLine1', e.target.value)}
                    onBlur={() => handleBlur('addressLine1')}
                    placeholder="e.g. 42 RESIDENCY ROAD, BLOCK C"
                    aria-invalid={!!errors.addressLine1}
                    aria-describedby={errors.addressLine1 ? 'addressLine1-error' : undefined}
                    className={`w-full px-3.5 py-2.5 bg-white border text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none transition-colors ${
                      errors.addressLine1 && touched.addressLine1
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-[#111111] focus:ring-1 focus:ring-[#111111]'
                    }`}
                  />
                  {errors.addressLine1 && touched.addressLine1 && (
                    <p id="addressLine1-error" className="text-[11px] font-mono text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.addressLine1}</span>
                    </p>
                  )}
                </div>

                {/* Address Line 2 (Optional) */}
                <div>
                  <label
                    htmlFor="addressLine2"
                    className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1.5"
                  >
                    APARTMENT / SUITE / LANDMARK (OPTIONAL)
                  </label>
                  <input
                    id="addressLine2"
                    type="text"
                    value={form.addressLine2 || ''}
                    onChange={(e) => handleChange('addressLine2', e.target.value)}
                    placeholder="e.g. FLAT 402, NEAR INDIRANAGAR METRO"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#111111] text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                  />
                </div>

                {/* City, State, PIN Code Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1.5"
                    >
                      CITY *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      onBlur={() => handleBlur('city')}
                      placeholder="BENGALURU"
                      aria-invalid={!!errors.city}
                      aria-describedby={errors.city ? 'city-error' : undefined}
                      className={`w-full px-3.5 py-2.5 bg-white border text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none transition-colors ${
                        errors.city && touched.city
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#111111] focus:ring-1 focus:ring-[#111111]'
                      }`}
                    />
                    {errors.city && touched.city && (
                      <p id="city-error" className="text-[11px] font-mono text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.city}</span>
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1.5"
                    >
                      STATE / UT *
                    </label>
                    <select
                      id="state"
                      required
                      value={form.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      onBlur={() => handleBlur('state')}
                      aria-invalid={!!errors.state}
                      aria-describedby={errors.state ? 'state-error' : undefined}
                      className={`w-full px-3 py-2.5 bg-white border text-xs font-mono text-[#111111] focus:outline-none transition-colors ${
                        errors.state && touched.state
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#111111] focus:ring-1 focus:ring-[#111111]'
                      }`}
                    >
                      <option value="">SELECT STATE</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.state && touched.state && (
                      <p id="state-error" className="text-[11px] font-mono text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.state}</span>
                      </p>
                    )}
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label
                      htmlFor="pinCode"
                      className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-1.5"
                    >
                      PIN CODE *
                    </label>
                    <input
                      id="pinCode"
                      type="text"
                      required
                      maxLength={6}
                      value={form.pinCode}
                      onChange={(e) => handleChange('pinCode', e.target.value)}
                      onBlur={() => handleBlur('pinCode')}
                      placeholder="560001"
                      aria-invalid={!!errors.pinCode}
                      aria-describedby={errors.pinCode ? 'pinCode-error' : undefined}
                      className={`w-full px-3.5 py-2.5 bg-white border text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none transition-colors ${
                        errors.pinCode && touched.pinCode
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#111111] focus:ring-1 focus:ring-[#111111]'
                      }`}
                    />
                    {errors.pinCode && touched.pinCode && (
                      <p id="pinCode-error" className="text-[11px] font-mono text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.pinCode}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Protocol Advisory */}
              <div className="p-4 bg-[#F4F2ED] border border-[#111111]/15 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 font-bold text-[#111111]">
                  <Truck className="w-3.5 h-3.5 text-[#111111]" />
                  <span className="uppercase tracking-wider">SECURE COURIER DISPATCH PROTOCOL</span>
                </div>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  Complimentary insured transit across India via express freight. Garments are sealed in humidity-controlled, tamper-evident archival film with tamper-proof signature receipt upon delivery.
                </p>
              </div>

              {/* Continuation Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="solid"
                  size="lg"
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  VERIFY SHIPPING ALLOCATION // CONTINUE
                </Button>
                <p className="text-[10px] font-mono text-center text-[#777777] uppercase tracking-wider mt-3">
                  STAGE 7A FOUNDATION • NO CHARGES APPLIED UNTIL PAYMENT VERIFICATION
                </p>
              </div>
            </form>

            {/* Stage 7A Allocation Verified Confirmation Notice */}
            {allocationVerified && (
              <div className="border-2 border-[#111111] p-6 bg-white space-y-4 animate-fade-in shadow-lg">
                <div className="flex items-start gap-3">
                  <PackageCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading font-extrabold text-base uppercase tracking-tight text-[#111111]">
                      SHIPPING ALLOCATION SPECIFICATION COMPLETE
                    </h3>
                    <p className="text-xs font-mono text-[#777777] mt-1">
                      Recipient details for <strong className="text-[#111111]">{form.fullName}</strong> at <strong className="text-[#111111]">{form.city}, {form.state} - {form.pinCode}</strong> have been validated.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#F4F2ED] border border-[#111111]/20 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#777777]">
                    <span>RECIPIENT:</span>
                    <span className="font-bold text-[#111111] uppercase">{form.fullName}</span>
                  </div>
                  <div className="flex justify-between text-[#777777]">
                    <span>CONTACT TELEPHONE:</span>
                    <span className="font-bold text-[#111111]">{form.phone}</span>
                  </div>
                  <div className="flex justify-between text-[#777777]">
                    <span>COURIER ROUTE:</span>
                    <span className="font-bold text-[#111111] uppercase">{form.city}, {form.state} [{form.pinCode}]</span>
                  </div>
                  <div className="flex justify-between text-[#777777]">
                    <span>GARMENTS ALLOCATED:</span>
                    <span className="font-bold text-[#111111]">{totalCount} PIECES</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#777777] space-y-1">
                  <p>
                    <strong>NEXT STAGE QUEUED:</strong> Stage 7B will introduce backend order generation, cryptographic idempotency keys, and live payment processing (Cards, UPI, NetBanking).
                  </p>
                  <p className="text-emerald-800 font-medium">
                    ✓ Garment allocations in your bag remain reserved and intact.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto font-mono"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    onClick={() => setAllocationVerified(false)}
                  >
                    MODIFY DISPATCH DETAILS
                  </Button>
                  <Button
                    type="button"
                    variant="solid"
                    size="sm"
                    to="/shop"
                    className="w-full sm:w-auto font-mono"
                  >
                    CONTINUE BROWSING ARCHIVE
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary & Live Valuation (Col 5) */}
          <div className="lg:col-span-5 hidden lg:block sticky top-24">
            <div className="border border-[#111111] bg-white divide-y divide-[#111111] shadow-sm">
              {/* Header */}
              <div className="p-5 flex items-center justify-between bg-[#111111] text-[#F4F2ED]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <h3 className="font-heading font-bold text-xs tracking-widest uppercase">
                    ARCHIVE BAG [{totalCount} PIECES]
                  </h3>
                </div>
                <Link
                  to="/shop"
                  className="text-[10px] font-mono uppercase underline hover:text-[#D1D3D2] transition-colors"
                >
                  CATALOGUE
                </Link>
              </div>

              {/* Items List */}
              <div className="p-5 max-h-[380px] overflow-y-auto divide-y divide-[#111111]/10 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                    <div className="w-16 h-20 bg-[#EAE8E3] border border-[#111111]/30 overflow-hidden shrink-0">
                      <img
                        src={item.product.images[0] || ''}
                        alt={item.product.name}
                        className="w-full h-full object-cover grayscale contrast-125"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-heading font-bold text-xs uppercase text-[#111111] leading-tight">
                            {item.product.name}
                          </h4>
                        </div>
                        <p className="text-[10px] font-mono text-[#777777] uppercase tracking-wider mt-0.5">
                          SKU: {item.product.sku || item.product.id}
                        </p>
                        <p className="text-[10px] font-mono text-[#777777] mt-0.5">
                          SIZE: {item.size} • COLOR: {item.color}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono pt-2">
                        <span className="text-[#777777]">QTY: {item.quantity}</span>
                        <PriceDisplay price={item.product.price * item.quantity} size="sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Valuation & Breakdown */}
              <div className="p-5 space-y-3 bg-[#F4F2ED] text-xs font-mono">
                <div className="flex justify-between text-[#777777]">
                  <span>SUBTOTAL ALLOCATION:</span>
                  <PriceDisplay price={subtotal} size="sm" />
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>INSURED COURIER TRANSIT:</span>
                  <span className="text-emerald-700 font-bold uppercase">[ COMPLIMENTARY ]</span>
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>APPLICABLE GST (INCLUDED):</span>
                  <span className="text-[#111111] font-bold">18% REVERSE INCLUSIVE</span>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-[#111111] text-sm">
                  <span className="font-heading font-bold uppercase text-[#111111]">
                    ESTIMATED VALUATION:
                  </span>
                  <PriceDisplay price={estimatedTotal} size="lg" className="font-bold text-[#111111]" />
                </div>
              </div>

              {/* Trust Badges & Guarantees */}
              <div className="p-5 space-y-2 text-[10px] font-mono text-[#777777] bg-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                  <span>100% AUTHENTIC ARCHIVE RUNS • ZERO RESTOCKS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                  <span>ENCRYPTED HTTPO_NLY COOKIE SESSION PROTOCOL</span>
                </div>
                <p className="text-[9px] text-[#999999] pt-2 border-t border-[#111111]/10 leading-relaxed">
                  * Note: Subtotals and items are verified directly against the MongoDB product database at order transmission. Client-side price modifications are rejected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Account Modal for Seamless Checkout Authentication */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />
    </div>
  );
};
