"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import {
  CheckCircle2,
  Lock,
  Truck,
  CreditCard,
  Banknote,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import confetti from "canvas-confetti";

interface CheckoutWizardProps {
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
}

export function CheckoutWizard({ user }: CheckoutWizardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { items, clearCart, getSubtotal, getDiscount, getShippingFee, getTotal, appliedCoupon } = useCartStore();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "+1 (555) 349-8120");

  const [street, setStreet] = useState("450 Lexington Ave, Suite 1400");
  const [city, setCity] = useState("New York");
  const [state, setState] = useState("NY");
  const [postalCode, setPostalCode] = useState("10017");
  const [country, setCountry] = useState("United States");

  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "priority">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "ONLINE_PAYMENT">("ONLINE_PAYMENT");

  // Card mock state
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("892");

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const baseShipping = getShippingFee(150, 15);
  const shippingFee = deliveryMethod === "priority" ? baseShipping + 20 : baseShipping;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * 0.08;
  const total = taxable + shippingFee + tax;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Your bag is empty</h2>
        <p className="text-xs text-zinc-500 mt-2">Add shoes to your bag before checking out.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block px-6 py-3 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const orderPayload = {
        userId: user?.id || null,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: { street, city, state, postalCode, country },
        deliveryMethod,
        paymentMethod,
        paymentStatus: paymentMethod === "ONLINE_PAYMENT" ? "PAID" : "PENDING",
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        couponCode: appliedCoupon?.code || null,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          productImage: i.image,
          size: i.size,
          color: i.color || "Standard",
          price: i.salePrice && i.salePrice > 0 ? i.salePrice : i.price,
          quantity: i.quantity,
          total: (i.salePrice && i.salePrice > 0 ? i.salePrice : i.price) * i.quantity,
        })),
      };

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok) {
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        clearCart();
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${data.order.orderNumber}`,
          type: "success",
        });
        router.push(`/order-success/${data.order.id}`);
      } else {
        toast({
          title: "Checkout Error",
          description: data.error || "Failed to process order.",
          type: "error",
        });
      }
    } catch (err) {
      toast({
        title: "Network Error",
        description: "Please verify your connection and try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "Contact" },
    { num: 2, title: "Shipping" },
    { num: 3, title: "Delivery" },
    { num: 4, title: "Payment" },
    { num: 5, title: "Review" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Step Indicators */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 overflow-x-auto py-2">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  step === s.num
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 ring-4 ring-zinc-200 dark:ring-zinc-800"
                    : step > s.num
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  step >= s.num ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                }`}
              >
                {s.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 w-6 sm:w-12 rounded-full transition-colors ${
                  step > idx + 1 ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Form & Order Summary Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Area */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
          {/* STEP 1: Contact Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Customer Contact</h3>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alexander Hayes"
                  className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email Address (For tracking updates)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@veloce.com"
                  className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!name || !email) {
                    toast({ title: "Please fill all contact fields", type: "error" });
                    return;
                  }
                  setStep(2);
                }}
                className="w-full py-3.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to Shipping Address</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Shipping Address */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Shipping Address</h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="450 Lexington Ave, Suite 1400"
                  className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    State / Province
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="NY"
                    className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Postal / ZIP Code
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10017"
                    className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!street || !city || !postalCode) {
                    toast({ title: "Please fill all address fields", type: "error" });
                    return;
                  }
                  setStep(3);
                }}
                className="w-full py-3.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to Delivery Method</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Delivery Method */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Select Delivery Method</h3>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setDeliveryMethod("standard")}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    deliveryMethod === "standard"
                      ? "border-zinc-950 dark:border-white bg-zinc-50 dark:bg-zinc-800/60 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "standard"}
                    onChange={() => setDeliveryMethod("standard")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        Global Express Courier (3 - 5 Business Days)
                      </p>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                        {baseShipping === 0 ? "FREE" : formatPrice(baseShipping)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Fully tracked door-to-door delivery with signature confirmation.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setDeliveryMethod("priority")}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    deliveryMethod === "priority"
                      ? "border-zinc-950 dark:border-white bg-zinc-50 dark:bg-zinc-800/60 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "priority"}
                    onChange={() => setDeliveryMethod("priority")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        Priority Overnight Air Express (1 - 2 Business Days)
                      </p>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                        {formatPrice(baseShipping + 20)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Next morning dispatch via dedicated cargo flight.
                    </p>
                  </div>
                </label>
              </div>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full py-3.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to Payment Method</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 4: Payment Method */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Payment Option</h3>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("ONLINE_PAYMENT")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === "ONLINE_PAYMENT"
                      ? "border-zinc-950 dark:border-white bg-zinc-50 dark:bg-zinc-800/60 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-brand-500 mb-3" />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">Online Credit / Debit Card</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Instant simulated 256-bit SSL gateway</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === "CASH_ON_DELIVERY"
                      ? "border-zinc-950 dark:border-white bg-zinc-50 dark:bg-zinc-800/60 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <Banknote className="w-6 h-6 text-emerald-500 mb-3" />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">Cash on Delivery</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Pay upon package arrival</p>
                  </div>
                </button>
              </div>

              {paymentMethod === "ONLINE_PAYMENT" && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-500" /> Test Card Simulation Mode
                    </span>
                    <span className="font-mono text-[10px]">VISA / MASTERCARD</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full py-3.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
              >
                <span>Review Order</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 5: Final Review & Confirmation */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Review & Confirm</h3>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Recipient</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{name} ({email})</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Shipping Destination</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {street}, {city}, {state} {postalCode}, {country}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Payment & Delivery</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {paymentMethod === "ONLINE_PAYMENT" ? "Credit Card (Simulated)" : "Cash on Delivery"} •{" "}
                    {deliveryMethod === "priority" ? "Priority Overnight Air" : "Global Express"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-xl shadow-brand-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {submitting ? "Placing Your Order..." : `Authorize & Place Order • ${formatPrice(total)}`}
              </button>
            </div>
          )}
        </div>

        {/* Right Order Summary Area */}
        <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Order Summary</h4>
            <span className="text-xs text-zinc-500 font-medium">{items.length} items</span>
          </div>

          {/* Items Preview */}
          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            {items.map((i) => (
              <div key={i.id} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 p-1 shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                  <Image src={i.image} alt={i.name} fill sizes="48px" className="object-contain" />
                  <span className="absolute -top-1 -right-1 bg-zinc-950 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {i.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{i.name}</p>
                  <p className="text-[11px] text-zinc-500">EU {i.size} {i.color ? `• ${i.color}` : ""}</p>
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                  {formatPrice((i.salePrice || i.price) * i.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-600 dark:text-brand-400 font-semibold">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span className="font-mono">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">{formatPrice(tax)}</span>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-zinc-950 dark:text-white">Total Amount</span>
              <span className="text-lg font-black text-zinc-950 dark:text-white font-mono">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Buyer Protection Guarantee & 30-Day Effortless Returns.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
