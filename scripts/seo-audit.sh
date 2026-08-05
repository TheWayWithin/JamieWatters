#!/usr/bin/env bash
# seo-audit.sh — PRJ-25 mechanical SEO + AI-visibility checks (T-244 pilot).
# Usage: ./scripts/seo-audit.sh [domain]                  site-level audit (default: jamiewatters.work)
#        ./scripts/seo-audit.sh [domain] --page /about    inner-page audit of one path (T-261)
# Reusable on any PRJ-25 product: pass its domain. Exit code = number of FAILs.
# Covers the mechanical half of the frozen checklist in
# ~/Shared/mission-control/projects/PRJ-25-seo-register.md. Lighthouse/CWV,
# Search Console and Plausible-dashboard checks stay manual/monthly.

set -u
DOMAIN="${1:-jamiewatters.work}"
case "$DOMAIN" in
  http*) BASE="$DOMAIN" ;;   # full URL (e.g. http://localhost:3000) for local builds
  *) BASE="https://$DOMAIN" ;;
esac
FAILS=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; FAILS=$((FAILS + 1)); }
warn() { printf 'WARN  %s\n' "$1"; }

fetch() { curl -sL --max-time 20 "$1"; }
code_of() { curl -sL -o /dev/null -w '%{http_code}' --max-time 20 "$1"; }

# ---------------------------------------------------------------------------
# Inner-page mode (--page /path): template-level checks for the monthly
# re-score — meta description quality, date metadata, structured data,
# outbound links. The homepage-only checks above don't cover templates.
# ---------------------------------------------------------------------------
if [ "${2:-}" = "--page" ]; then
  PAGEPATH="${3:?usage: seo-audit.sh <domain> --page /path}"
  URL="$BASE$PAGEPATH"
  echo "== SEO page audit: $URL =="
  c=$(code_of "$URL")
  [ "$c" = "200" ] || { fail "$PAGEPATH -> $c"; echo "== done: $FAILS fail(s) =="; exit "$FAILS"; }
  pass "$PAGEPATH -> 200"
  PAGE=$(fetch "$URL")

  echo "$PAGE" | grep -qiE '<title>[^<]+</title>' && pass "<title>" || fail "<title> MISSING"
  echo "$PAGE" | grep -qi 'rel="canonical"' && pass "canonical" || fail "canonical MISSING"

  # Flatten first: meta tags are legally multi-line (seen on llmtxtmastery.com)
  DESC=$(echo "$PAGE" | tr '\n' ' ' | grep -o '<meta[^>]*name="description"[^>]*>' | head -1 | sed 's/.*content="\([^"]*\)".*/\1/')
  if [ -z "$DESC" ]; then
    fail "meta description MISSING"
  else
    LEN=${#DESC}
    if [ "$LEN" -ge 120 ] && [ "$LEN" -le 180 ]; then
      pass "meta description present ($LEN chars, in 120-180 band)"
    else
      warn "meta description present but $LEN chars (aim 150-160)"
    fi
  fi

  # Date metadata: article meta tags, a <time datetime>, or dates in JSON-LD
  echo "$PAGE" | grep -qE 'article:published_time|article:modified_time|<time[^>]*datetime=|datePublished|dateModified' \
    && pass "date metadata present" || fail "date metadata MISSING"

  # Structured data: present and every block parses as JSON
  if echo "$PAGE" | grep -q 'application/ld+json'; then
    BLOCKS=$(echo "$PAGE" | python3 -c "
import re, sys, json
c = sys.stdin.read()
blocks = re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', c, re.S)
bad = 0
types = []
for b in blocks:
    try:
        d = json.loads(b)
        types.append(str(d.get('@type')))
    except Exception:
        bad += 1
print(len(blocks), bad, ','.join(types) if types else '-')
")
    N=$(echo "$BLOCKS" | cut -d' ' -f1); BAD=$(echo "$BLOCKS" | cut -d' ' -f2); TYPES=$(echo "$BLOCKS" | cut -d' ' -f3)
    if [ "$BAD" = "0" ]; then pass "ld+json: $N block(s) all parse [$TYPES]"; else fail "ld+json: $BAD of $N block(s) fail to parse"; fi
  else
    fail "ld+json MISSING"
  fi

  # Outbound links (R.1.1): at least one external href in the page body
  HOST=$(echo "$BASE" | sed 's|^https://||;s|^http://||;s|/.*||;s|:.*||')
  EXT=$(echo "$PAGE" | grep -o 'href="https\?://[^"]*"' | grep -cv "$HOST")
  [ "$EXT" -ge 1 ] && pass "outbound links present ($EXT external href(s))" || fail "no outbound links"

  echo "$PAGE" | grep -q 'FAQPage' && pass "FAQPage schema present" || warn "no FAQPage schema (fine unless the page has Q&A content)"

  echo "== done: $FAILS fail(s) =="
  exit "$FAILS"
fi

echo "== SEO audit: $BASE =="

# 1. Core URLs respond
for path in "" robots.txt sitemap.xml llms.txt rss.xml; do
  c=$(code_of "$BASE/$path")
  label="${path:-/} -> $c"
  if [ "$c" = "200" ]; then pass "$label"; else
    # rss.xml is recommended, not required, on non-blog products
    if [ "$path" = "rss.xml" ]; then warn "$label (rss optional)"; else fail "$label"; fi
  fi
done

# 2. robots.txt content
ROBOTS=$(fetch "$BASE/robots.txt")
echo "$ROBOTS" | grep -qi '^Sitemap:' && pass "robots.txt declares Sitemap" || fail "robots.txt missing Sitemap line"
for bot in GPTBot ClaudeBot PerplexityBot Google-Extended; do
  echo "$ROBOTS" | grep -qi "$bot" && pass "robots.txt names $bot (deliberate AI policy)" || warn "robots.txt does not name $bot (policy implicit)"
done

# 3. Homepage head tags
HOME=$(fetch "$BASE/")
check_tag() { echo "$HOME" | grep -qiE "$1" && pass "$2" || fail "$2 MISSING"; }
check_tag '<title>[^<]+</title>' 'homepage <title>'
check_tag 'name="description"' 'homepage meta description'
check_tag 'rel="canonical"' 'homepage canonical'
check_tag 'property="og:image"' 'homepage og:image'
check_tag 'property="og:url"' 'homepage og:url'
check_tag 'name="twitter:card"' 'twitter card'
check_tag 'application/ld\+json' 'structured data (ld+json)'

# 3b. AI-visibility head/content signals (T-247)
check_tag 'rel="sitemap"' 'sitemap <link> in head'
echo "$HOME" | grep -qE 'datePublished|dateModified|article:published_time' && pass "date metadata present" || fail "date metadata MISSING (datePublished/dateModified/article:published_time)"
echo "$HOME" | grep -q 'FAQPage' && pass "FAQPage schema present" || warn "no FAQPage schema (fine unless the page has Q&A content)"

# 4. Analytics
echo "$HOME" | grep -qi 'plausible' && pass "Plausible script present" || fail "Plausible script MISSING"

# 5. llms.txt sanity (exists already checked; is it non-trivial + fresh-marked?)
LLMS=$(fetch "$BASE/llms.txt")
[ "$(echo "$LLMS" | wc -l)" -gt 10 ] && pass "llms.txt has content" || fail "llms.txt empty/thin"
echo "$LLMS" | grep -qE '20[0-9]{2}-[0-9]{2}-[0-9]{2}|20[0-9]{2}' && pass "llms.txt carries a date (freshness checkable)" || warn "llms.txt has no date — freshness unknown"

# 6. Sitemap parses and has URLs
SM=$(fetch "$BASE/sitemap.xml")
N=$(echo "$SM" | grep -c '<loc>')
[ "$N" -gt 0 ] && pass "sitemap.xml contains $N URLs" || fail "sitemap.xml has no <loc> entries"

echo "== done: $FAILS fail(s) =="
exit "$FAILS"
