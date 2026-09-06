import { Handler } from '@netlify/functions';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

        const secret = process.env.RAZORPAY_KEY_SECRET || '';
        if (!secret) {
            console.error('RAZORPAY_KEY_SECRET missing in server environment variables');
            return {
                statusCode: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'RAZORPAY_KEY_SECRET is not configured in Netlify environment variables' }),
            };
        }

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment signature verified! Update profile in Supabase
            const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
            const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

            if (supabaseUrl && supabaseServiceRole) {
                try {
                    const supabase = createClient(supabaseUrl, supabaseServiceRole);
                    const { error: dbError } = await supabase
                        .from('profiles')
                        .update({ has_paid: true })
                        .eq('id', userId);

                    if (dbError) {
                        console.error('Error updating Supabase profile:', dbError);
                    }
                } catch (dbErr) {
                    console.error('Supabase update failed:', dbErr);
                }
            } else {
                console.warn('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL not configured; skipping profile database update.');
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
