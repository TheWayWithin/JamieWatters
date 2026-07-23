#!/usr/bin/env bash
# seo-audit.sh — PRJ-25 mechanical SEO + AI-visibility checks (T-244 pilot).
# Usage: ./scripts/seo-audit.sh [domain]   (default: jamiewatters.work)
# Reusable on any PRJ-25 product: pass its domain. Exit code = number of FAILs.
# Covers the mechanical half of the frozen checklist in
# ~/Shared/mission-control/projects/PRJ-25-seo-register.md. Lighthouse/CWV,
# Search Console and Plausible-dashboard checks stay manual/monthly.

set -u
DOMAIN="${1:-jamiewatters.work}"
BASE="https://$DOMAIN"
FAILS=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; FAILS=$((FAILS + 1)); }
warn() { printf 'WARN  %s\n' "$1"; }

fetch() { curl -sL --max-time 20 "$1"; }
code_of() { curl -sL -o /dev/null -w '%{http_code}' --max-time 20 "$1"; }

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
