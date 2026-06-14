// Dynamic X/Twitter header (banner) for jamiewatters.work
// 1500x500, same brand system as the OG cards (/og). Renders at the edge.
//
// Query params:
//   photo - Optional. "0" to render text-only (no headshot). Default: headshot on.
//   line  - Optional. Override the primary line. Default brand tagline.
//
// Examples:
//   /x-header            -> banner with headshot on the right
//   /x-header?photo=0    -> text-only banner (use if the avatar already shows your face)

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Brand tokens (match /og and tailwind.config.ts)
const BRAND = {
  bg: '#0F172A',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#64748B',
  purple: '#7C3AED',
} as const;

const W = 1500;
const H = 500;

async function loadFonts() {
  const [interBold, interRegular, interSemiBold] = await Promise.all([
    fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf'
    ).then((res) => res.arrayBuffer()),
    fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf'
    ).then((res) => res.arrayBuffer()),
    fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf'
    ).then((res) => res.arrayBuffer()),
  ]);

  return [
    { name: 'Inter', data: interRegular, style: 'normal' as const, weight: 400 as const },
    { name: 'Inter', data: interSemiBold, style: 'normal' as const, weight: 600 as const },
    { name: 'Inter', data: interBold, style: 'normal' as const, weight: 700 as const },
  ];
}

async function loadHeadshot(baseUrl: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/images/jamie-profile.jpg`);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wantPhoto = searchParams.get('photo') !== '0';
  const line = searchParams.get('line')
    ? decodeURIComponent(searchParams.get('line')!)
    : 'Open code. Real numbers. The failures before the wins.';

  const origin = new URL(req.url).origin;
  const [fonts, headshotSrc] = await Promise.all([
    loadFonts(),
    wantPhoto ? loadHeadshot(origin) : Promise.resolve(null),
  ]);
  const hasHeadshot = headshotSrc !== null;

  const photoWidth = 430;
  const leftWidth = hasHeadshot ? W - photoWidth : W;

  const headshotColumn = hasHeadshot ? (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: `${photoWidth}px`,
        height: `${H}px`,
        overflow: 'hidden',
      }}
    >
      <img
        src={headshotSrc!}
        width={photoWidth}
        height={H}
        style={{
          objectFit: 'cover',
          objectPosition: 'center top',
          width: `${photoWidth}px`,
          height: `${H}px`,
        }}
      />
      {/* Left-edge gradient fade into the navy */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200px',
          height: `${H}px`,
          background: `linear-gradient(to right, ${BRAND.bg} 0%, ${BRAND.bg}ee 25%, ${BRAND.bg}88 55%, transparent 100%)`,
        }}
      />
    </div>
  ) : null;

  const content = (
    <div
      style={{
        display: 'flex',
        width: `${W}px`,
        height: `${H}px`,
        backgroundColor: BRAND.bg,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: `${leftWidth}px`,
          height: `${H}px`,
          // Keep clear of the circular avatar that X overlays at bottom-left.
          padding: '70px 60px 70px 90px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Name label */}
        <div
          style={{
            display: 'flex',
            fontSize: '26px',
            fontWeight: 700,
            fontFamily: 'Inter',
            color: BRAND.textTertiary,
            letterSpacing: '4px',
            lineHeight: 1,
          }}
        >
          JAMIE WATTERS
        </div>

        {/* Purple separator */}
        <div
          style={{
            display: 'flex',
            width: '80px',
            height: '5px',
            backgroundColor: BRAND.purple,
            marginTop: '26px',
            marginBottom: '26px',
            borderRadius: '2px',
          }}
        />

        {/* Primary line */}
        <div
          style={{
            display: 'flex',
            fontSize: '58px',
            fontWeight: 700,
            fontFamily: 'Inter',
            color: BRAND.textPrimary,
            lineHeight: 1.15,
            maxWidth: '820px',
          }}
        >
          {line}
        </div>

        {/* URL */}
        <div
          style={{
            display: 'flex',
            fontSize: '22px',
            fontWeight: 600,
            fontFamily: 'Inter',
            color: BRAND.textSecondary,
            marginTop: '26px',
          }}
        >
          jamiewatters.work
        </div>
      </div>

      {headshotColumn}

      {/* Subtle accent glow, top-right */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.purple}18 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
    </div>
  );

  return new ImageResponse(content, {
    width: W,
    height: H,
    fonts,
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
