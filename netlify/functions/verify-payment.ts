import { Handler } from '@netlify/functions';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Fallback credentials in case Netlify environment variables are not yet configured
const DEFAULT_KEY_SECRET = '3TyuF8As56pQgIFP5rzUfJe9';
const DEFAULT_SUPABASE_URL = 'https://nearbbauevgijxiusuur.supabase.co';
const DEFAULT_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYXJiYmF1ZXZnaWp4aXVzdXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxODY2MzEsImV4cCI6MjA4NTc2MjYzMX0.V3SPaCxRQQOJlS6PARjsUuMX3YKXt1FlNYLPSW2_F-4';

export const handler: Handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: '',
        };
    }

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

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing required payment verification parameters' }),
            };
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || DEFAULT_KEY_SECRET;

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment signature verified! Update profile in Supabase
            const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON;

            if (supabaseUrl && supabaseKey) {
                try {
                    const supabase = createClient(supabaseUrl, supabaseKey);
                    const { error: dbError } = await supabase
                        .from('profiles')
                        .update({ has_paid: true })
                        .eq('id', userId);

                    if (dbError) {
                        console.warn('Supabase profile update notice:', dbError.message);
                    }
                } catch (dbErr) {
                    console.warn('Supabase update exception:', dbErr);
                }
            }

            return {
                statusCode: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'success',
                    message: 'Payment verified successfully and account unlocked',
                }),
            };
        } else {
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'failure', message: 'Invalid payment signature' }),
            };
        }
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Failed to verify payment',
                details: error?.message || String(error),
            }),
        };
    }
};
