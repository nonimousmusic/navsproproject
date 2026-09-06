import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface PaymentButtonProps {
    amount: number; // in paise
    description?: string;
    onSuccess?: () => void;
    className?: string;
}

export function PaymentButton({ amount, description = "Premium Career Assessment", onSuccess, className }: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Helper to dynamically load external scripts securely
    const loadScript = (src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Helper to fetch with automatic fallback from /api/* to /.netlify/functions/*
    const fetchWithFallback = async (primaryEndpoint: string, options: RequestInit) => {
        let response = await fetch(primaryEndpoint, options);
        if (response.status === 404 && primaryEndpoint.startsWith('/api/')) {
            const fallbackEndpoint = primaryEndpoint.replace('/api/', '/.netlify/functions/');
            console.warn(`[Payment] Received 404 on ${primaryEndpoint}, retrying with ${fallbackEndpoint}`);
            response = await fetch(fallbackEndpoint, options);
        }
        return response;
    };

    const displayRazorpay = async () => {
        if (!user) {
            toast.error("Please log in to continue");
            return;
        }

        setLoading(true);

        try {
            // 1. Load Razorpay script
            const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!res) {
                toast.error('Razorpay SDK failed to load. Please check your internet connection.');
                return;
            }

            // 2. Call backend to create the Order
            const response = await fetchWithFallback('/api/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, currency: 'INR', userId: user.id }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                const errorMsg = errData?.details || errData?.error || `Failed to create order (Status ${response.status})`;
                throw new Error(errorMsg);
            }

            const data = await response.json();

            // 3. Configure Razorpay modal
            const options = {
                key: data.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SaXOTHjelhlY9S',
                amount: data.amount,
                currency: data.currency || 'INR',
                name: 'NAVSPRO',
                description: description,
                order_id: data.id, // The order_id returned from backend
                handler: async (paymentResponse: any) => {
                    try {
                        // 4. Send response to backend to verify payment signature
                        const verifyRes = await fetchWithFallback('/api/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                                userId: user.id,
                            }),
                        });

                        if (!verifyRes.ok) {
                            const errData = await verifyRes.json().catch(() => null);
                            throw new Error(errData?.details || errData?.error || "Payment verification failed");
                        }

                        toast.success("Payment Successful! Welcome to Premium.");
                        if (onSuccess) onSuccess();

                    } catch (err: any) {
                        console.error('[Payment Verification Error]:', err);
                        toast.error(err.message || "Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user?.user_metadata?.full_name || '',
                    email: user?.email || '',
                },
                theme: {
                    color: '#3399cc',
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on('payment.failed', function (resp: any) {
                toast.error(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
            });
            paymentObject.open();

        } catch (error: any) {
            console.error('[Payment Error]:', error);
            toast.error(error.message || "Could not initiate payment. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={displayRazorpay} disabled={loading} className={className} variant="hero">
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                </>
            ) : (
                'Upgrade to Premium (₹500)'
            )}
        </Button>
    );
}
