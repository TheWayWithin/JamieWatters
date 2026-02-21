// Dynamic OG Image Generation for jamiewatters.work
// Uses next/og (Satori + Resvg) to render branded social cards at the edge.
//
// Query params:
//   title    - Optional. Page/post title (triggers "post" layout when present).
//   subtitle - Optional. Overrides the default subtitle line.
//   type     - Optional. "default" | "post" | "project". Explicit layout variant.
//
// Examples:
//   /api/og                                            -> homepage card
//   /api/og?title=How+I+Built+My+First+SaaS            -> blog post card
//   /api/og?type=project&title=ISOTracker               -> project card

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Brand tokens (from tailwind.config.ts)
const BRAND = {
  bg: '#0F172A',
  surface: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#64748B',
  purple: '#7C3AED',
  blue: '#2563EB',
  amber: '#F59E0B',
} as const;

// Fetch Inter font weights from Google Fonts CDN
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

// Fetch headshot from public URL, convert to base64 for Satori
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

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + '\u2026';
}

function resolveType(
  typeParam: string | null,
  title: string | null
): 'default' | 'post' | 'project' {
  if (typeParam === 'post' || typeParam === 'project') return typeParam;
  if (typeParam === 'default') return 'default';
  if (title) return 'post';
  return 'default';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const rawTitle = searchParams.get('title');
  const rawSubtitle = searchParams.get('subtitle');
  const rawType = searchParams.get('type');

  const title = rawTitle ? truncate(decodeURIComponent(rawTitle), 80) : null;
  const subtitle = rawSubtitle ? truncate(decodeURIComponent(rawSubtitle), 120) : null;
  const type = resolveType(rawType, title);

  const origin = new URL(req.url).origin;

  const [fonts, headshotSrc] = await Promise.all([
    loadFonts(),
    loadHeadshot(origin),
  ]);

  const hasHeadshot = headshotSrc !== null;

  // Headshot column (right side) with gradient fade into background
  const headshotColumn = hasHeadshot
    ? (
        <div
          style={{
            display: 'flex',
            position: 'relative',
            width: '460px',
            height: '630px',
            overflow: 'hidden',
          }}
        >
          <img
            src={headshotSrc!}
            width={460}
            height={630}
            style={{
              objectFit: 'cover',
              objectPosition: 'center top',
              width: '460px',
              height: '630px',
            }}
          />
          {/* Left-edge gradient fade */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '180px',
              height: '630px',
              background: `linear-gradient(to right, ${BRAND.bg} 0%, ${BRAND.bg}ee 20%, ${BRAND.bg}88 50%, transparent 100%)`,
            }}
          />
          {/* Bottom gradient for depth */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '460px',
              height: '120px',
              background: `linear-gradient(to top, ${BRAND.bg} 0%, transparent 100%)`,
            }}
          />
        </div>
      )
    : null;

  const rightWidth = hasHeadshot ? 460 : 0;
  const leftWidth = 1200 - rightWidth;

  let content: React.ReactElement;

  if (type === 'default') {
    // ===== HOMEPAGE / DEFAULT VARIANT =====
    const mainSubtitle = subtitle || 'Side Gig to Financial Freedom';
    content = (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
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
            height: '630px',
            padding: '60px 50px 60px 64px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Name */}
          <div
            style={{
              display: 'flex',
              fontSize: '52px',
              fontWeight: 700,
              fontFamily: 'Inter',
              color: BRAND.textPrimary,
              letterSpacing: '3px',
              lineHeight: 1.1,
            }}
          >
            JAMIE WATTERS
          </div>

          {/* Purple separator */}
          <div
            style={{
              display: 'flex',
              width: '80px',
              height: '4px',
              backgroundColor: BRAND.purple,
              marginTop: '24px',
              marginBottom: '24px',
              borderRadius: '2px',
            }}
          />

          {/* Main subtitle */}
          <div
            style={{
              display: 'flex',
              fontSize: '30px',
              fontWeight: 600,
              fontFamily: 'Inter',
              color: BRAND.textPrimary,
              lineHeight: 1.3,
              marginBottom: '16px',
            }}
          >
            {mainSubtitle}
          </div>

          {/* Tagline */}
          <div
            style={{
              display: 'flex',
              fontSize: '17px',
              fontWeight: 400,
              fontFamily: 'Inter',
              color: BRAND.textSecondary,
              lineHeight: 1.5,
              maxWidth: '520px',
            }}
          >
            Real Metrics. Real Failures. Practitioner-First Tools for Solopreneurs.
          </div>

          {/* Built in Public badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '28px',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22C55E',
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Inter',
                color: BRAND.textTertiary,
                letterSpacing: '1px',
              }}
            >
              BUILT IN PUBLIC
            </div>
          </div>

          {/* URL */}
          <div
            style={{
              display: 'flex',
              fontSize: '15px',
              fontWeight: 400,
              fontFamily: 'Inter',
              color: BRAND.textTertiary,
              marginTop: '24px',
            }}
          >
            jamiewatters.work
          </div>
        </div>

        {headshotColumn}

        {/* Subtle accent glow */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND.purple}15 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />
      </div>
    );
  } else if (type === 'post') {
    // ===== BLOG POST VARIANT =====
    const postTitle = title || 'Untitled Post';
    content = (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
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
            height: '630px',
            padding: '56px 50px 56px 64px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Name — smaller for post variant */}
          <div
            style={{
              display: 'flex',
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: 'Inter',
              color: BRAND.textTertiary,
              letterSpacing: '3px',
              lineHeight: 1,
            }}
          >
            JAMIE WATTERS
          </div>

          {/* Purple accent bar */}
          <div
            style={{
              display: 'flex',
              width: '48px',
              height: '4px',
              backgroundColor: BRAND.purple,
              marginTop: '28px',
              marginBottom: '20px',
              borderRadius: '2px',
            }}
          />

          {/* Post title — prominent */}
          <div
            style={{
              display: 'flex',
              fontSize: postTitle.length > 50 ? '34px' : '40px',
              fontWeight: 700,
              fontFamily: 'Inter',
              color: BRAND.textPrimary,
              lineHeight: 1.25,
              maxWidth: '580px',
            }}
          >
            {postTitle}
          </div>

          {subtitle && (
            <div
              style={{
                display: 'flex',
                fontSize: '18px',
                fontWeight: 400,
                fontFamily: 'Inter',
                color: BRAND.textSecondary,
                lineHeight: 1.5,
                marginTop: '16px',
                maxWidth: '520px',
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Bottom: journey label + URL */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: '20px',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '4px 12px',
                backgroundColor: `${BRAND.purple}22`,
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'Inter',
                color: BRAND.purple,
                letterSpacing: '0.5px',
              }}
            >
              JOURNEY
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '14px',
                fontWeight: 400,
                fontFamily: 'Inter',
                color: BRAND.textTertiary,
              }}
            >
              jamiewatters.work/journey
            </div>
          </div>
        </div>

        {headshotColumn}

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND.blue}12 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />
      </div>
    );
  } else {
    // ===== PROJECT VARIANT =====
    const projectTitle = title || 'Project';
    content = (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
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
            height: '630px',
            padding: '56px 50px 56px 64px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: 'Inter',
              color: BRAND.textTertiary,
              letterSpacing: '3px',
              lineHeight: 1,
            }}
          >
            JAMIE WATTERS
          </div>

          {/* Amber accent bar for projects */}
          <div
            style={{
              display: 'flex',
              width: '48px',
              height: '4px',
              backgroundColor: BRAND.amber,
              marginTop: '28px',
              marginBottom: '20px',
              borderRadius: '2px',
            }}
          />

          <div
            style={{
              display: 'flex',
              fontSize: projectTitle.length > 40 ? '36px' : '44px',
              fontWeight: 700,
              fontFamily: 'Inter',
              color: BRAND.textPrimary,
              lineHeight: 1.2,
              maxWidth: '580px',
            }}
          >
            {projectTitle}
          </div>

          {subtitle && (
            <div
              style={{
                display: 'flex',
                fontSize: '19px',
                fontWeight: 400,
                fontFamily: 'Inter',
                color: BRAND.textSecondary,
                lineHeight: 1.5,
                marginTop: '16px',
                maxWidth: '520px',
              }}
            >
              {subtitle}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: '20px',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '4px 12px',
                backgroundColor: `${BRAND.amber}22`,
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'Inter',
                color: BRAND.amber,
                letterSpacing: '0.5px',
              }}
            >
              PROJECT
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '14px',
                fontWeight: 400,
                fontFamily: 'Inter',
                color: BRAND.textTertiary,
              }}
            >
              jamiewatters.work
            </div>
          </div>
        </div>

        {headshotColumn}

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND.amber}10 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />
      </div>
    );
  }

  return new ImageResponse(content, {
    width: 1200,
    height: 630,
    fonts,
  });
}
