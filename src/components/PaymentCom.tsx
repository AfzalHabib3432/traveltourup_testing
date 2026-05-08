// @ts-nocheck - Phase 1: Complex component; full typing in Phase 3
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Wallet, Lock, CheckCircle, Shield, ArrowLeft, Plane, Building2, Car } from "lucide-react";
import { Input } from "@/components/ui/Input";

const BOOKING_STORAGE_KEY = 'booking-details';

const DEFAULT_BOOKING_DETAILS = {
    type: 'Unknown',
    title: 'Booking Details Unavailable',
    price: 'Rs0',
    options: []
};

const PaymentCom = () => {
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(DEFAULT_BOOKING_DETAILS);

    // Retrieve booking details from sessionStorage (client-only, avoids SSR "location is not defined")
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const stored = sessionStorage.getItem(BOOKING_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setBookingDetails({ ...DEFAULT_BOOKING_DETAILS, ...parsed });
            }
        } catch {
            // Fallback to defaults on parse error
        }
    }, []);

    const handlePayment = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);

            // Redirect to home or bookings page after success
            setTimeout(() => {
                router.push('/');
            }, 3000);
        }, 2000);
    };

    const getIcon = () => {
        switch (bookingDetails.type) {
            case 'Flight': return <Plane className="text-primary text-xl" />;
            case 'Hotel': return <Building2 className="text-primary text-xl" />;
            case 'Car': return <Car className="text-primary text-xl" />;
            default: return <CheckCircle className="text-primary text-xl" />;
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8 md:py-16   text-center">
                <div className="bg-card rounded-3xl shadow-xl p-10 md:p-16 border border-border flex flex-col items-center">
                    <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="text-success text-5xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Payment Successful!</h2>
                    <p className="text-muted-foreground text-lg mb-8 max-w-md">
                        Your {bookingDetails.type.toLowerCase()} booking for <strong>{bookingDetails.title}</strong> has been confirmed.
                        We've sent the details to your email.
                    </p>
                    <div className="text-sm text-muted-foreground">Redirecting to home page...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4">
         

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Left Column: Payment Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card/60 rounded-2xl shadow-sm border border-border p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Payment Method</h2>

                        {/* Payment Method Selector */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <label className={`flex-1 flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'card'
                                    ? 'border-ring bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/30 text-muted-foreground'
                                }`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={() => setPaymentMethod('card')}
                                    className="hidden"
                                />
                                <CreditCard className="mr-3 text-xl" />
                                <span className="font-bold">Credit/Debit Card</span>
                            </label>

                            <label className={`flex-1 flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'paypal'
                                    ? 'border-ring bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/30 text-muted-foreground'
                                }`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="paypal"
                                    checked={paymentMethod === 'paypal'}
                                    onChange={() => setPaymentMethod('paypal')}
                                    className="hidden"
                                />
                                <Wallet className="mr-3 text-xl" />
                                <span className="font-bold">PayPal</span>
                            </label>
                        </div>

                        {/* Form */}
                        <form onSubmit={handlePayment}>
                            {paymentMethod === 'card' ? (
                                <div className="space-y-5">
                                    <Input
                                        label="Cardholder Name"
                                        name="cardholderName"
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                    />

                                    <Input
                                        label="Card Number"
                                        name="cardNumber"
                                        type="text"
                                        required
                                        placeholder="0000 0000 0000 0000"
                                        maxLength={19}
                                        icon={<CreditCard className="h-4 w-4" />}
                                        className="tracking-widest font-mono"
                                    />

                                    <div className="grid grid-cols-2 gap-5">
                                        <Input
                                            label="Expiry Date"
                                            name="cardExpiry"
                                            type="text"
                                            required
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className="text-center"
                                        />
                                        <Input
                                            label="CVV"
                                            name="cardCvv"
                                            type="password"
                                            required
                                            placeholder="•••"
                                            maxLength={4}
                                            className="text-center tracking-widest"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-6">You will be redirected to PayPal to complete your secure purchase.</p>
                                </div>
                            )}

                            <hr className="my-8 border-border" />

                            <div className="flex items-start mb-8 bg-primary/10 p-4 rounded-xl text-sm text-foreground">
                                <Lock className="text-primary mt-0.5 mr-3 shrink-0" />
                                <p>
                                    Payments are secure and encrypted. Your card details are never stored on our servers.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`w-full py-4 rounded-xl font-bold text-lg text-primary-foreground transition-all shadow-lg ${isProcessing
                                        ? 'bg-primary/70 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-primary to-primary-700 hover:from-primary-600 hover:to-primary-800 hover:shadow-xl hover:-translate-y-0.5'
                                    }`}
                            >
                                {isProcessing ? 'Processing Securely...' : `Pay ${bookingDetails.price}`}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden sticky top-24">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center gap-3">
                            {getIcon()}
                            <h3 className="font-bold text-foreground text-lg">Order Summary</h3>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{bookingDetails.type} BOOKING</p>
                                <h4 className="font-bold text-foreground text-xl">{bookingDetails.title}</h4>
                                {bookingDetails.subtitle && (
                                    <p className="text-sm text-muted-foreground mt-1">{bookingDetails.subtitle}</p>
                                )}
                            </div>

                            <div className="space-y-4 mb-6">
                                {bookingDetails.options && bookingDetails.options.map((opt, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{opt.label}</span>
                                        <span className="font-medium text-foreground">{opt.value}</span>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-border border-dashed my-4" />

                            <div className="flex justify-between items-end mb-2">
                                <span className="text-muted-foreground font-medium">Total Amount</span>
                                <span className="text-3xl font-bold text-primary">{bookingDetails.price}</span>
                            </div>
                            <p className="text-xs text-right text-muted-foreground">Includes all taxes and fees</p>

                        </div>

                        <div className="bg-muted px-6 py-4 text-xs text-muted-foreground flex items-center justify-center gap-2">
                            <Shield className="text-muted-foreground" />
                            <span>100% Secure Checkout Guarantee</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PaymentCom;
