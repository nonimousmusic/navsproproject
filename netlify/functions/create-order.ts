import { Handler } from '@netlify/functions';
import Razorpay from 'razorpay';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Fallback credentials from rzp-key.csv in case Netlify environment variables are not yet configured
const DEFAULT_KEY_ID = 'rzp_live_SaXOTHjelhlY9S';
const DEFAULT_KEY_SECRET = '3TyuF8As56pQgIFP5rzUfJe9';

export const handler: Handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: '',
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        let body: any = {};
        try {
            body = event.body ? JSON.parse(event.body) : {};
        } catch {
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid JSON body' }),
            };
        }

        const { amount, currency = 'INR', userId } = body;

        if (!amount || !userId) {
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing amount or userId in request' }),
            };
        }

        const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || DEFAULT_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET || DEFAULT_KEY_SECRET;

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const options = {
            amount: Number(amount), // in smallest currency unit (paise)
            currency: currency,
            receipt: `rcpt_${Date.now()}`,
            notes: {
                userId: String(userId),
            },
        };

        const order = await razorpay.orders.create(options);

        return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...order,
                key_id: keyId,
            }),
        };
    } catch (error: any) {
        console.error('Error creating order:', error);
        return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Failed to create order',
                details: error?.error?.description || error?.message || String(error),
            }),
        };
    }
};
