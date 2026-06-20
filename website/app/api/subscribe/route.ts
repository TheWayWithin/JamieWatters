import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const BUTTONDOWN_API = 'https://api.buttondown.com/v1/subscribers';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP (public endpoint)
    const identifier = getClientIdentifier(req);
    const rate = checkRateLimit(identifier, 'newsletter');
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfter ?? 600) } }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid email' },
        { status: 400 }
      );
    }

    const apiKey = process.env.BUTTONDOWN_API_KEY;
    if (!apiKey) {
      // Defensive: the form is normally hidden until the key is configured.
      return NextResponse.json({ error: 'Signup is not available yet.' }, { status: 503 });
    }

    // Note: `type` is intentionally omitted so Buttondown's account-level
    // double opt-in setting governs confirmation.
    const res = await fetch(BUTTONDOWN_API, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: parsed.data.email,
        tags: ['jamiewatters.work'],
      }),
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    }

    // Already subscribed → treat as success (idempotent, no info leak).
    const detail = await res.json().catch(() => null);
    const code = detail?.code ?? '';
    if (res.status === 400 && String(code).includes('already')) {
      return NextResponse.json({ success: true });
    }

    console.error('Buttondown subscribe failed', res.status, detail);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 502 }
    );
  } catch (error) {
    console.error('Subscribe route error', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
