#!/usr/bin/env python3
"""
Daily Report AI Enhancement Script

Transforms structured daily reports into engaging, blog-ready narrative posts
using OpenAI's GPT models.

Usage:
    python3 enhance_dailyreport.py /path/to/report.md

Environment Variables:
    OPENAI_API_KEY - Required
    DAILYREPORT_MODEL - Optional (default: gpt-4o-mini)
    DAILYREPORT_ENABLE_ENHANCEMENT - Optional (default: true)
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

def load_env_file(env_path):
    """Load environment variables from .env.mcp file"""
    if not env_path.exists():
        return {}

    env_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            # Skip comments and empty lines
            if not line or line.startswith('#'):
                continue
            # Parse KEY=value
            if '=' in line:
                key, value = line.split('=', 1)
                # Remove quotes if present
                value = value.strip().strip('"').strip("'")
                env_vars[key] = value

    return env_vars

def enhance_with_openai(structured_report, api_key, model="gpt-4o-mini"):
    """Call OpenAI API to transform structured report into blog post"""

    try:
        import requests
    except ImportError:
        print("❌ Error: 'requests' library not installed")
        print("   Install with: pip3 install requests")
        return None

    url = "https://api.openai.com/v1/chat/completions"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    system_prompt = """You are an expert technical writer who transforms structured daily progress reports into engaging blog posts for a "build in public" audience.

Your writing style:
- Conversational and authentic, like talking to a friend
- Technical but accessible to non-technical readers
- Focuses on the "why it matters" not just the "what"
- Structures challenges as compelling problem → solution journeys
- Highlights learnings and insights gained
- Makes the reader feel the emotional journey (frustration → breakthrough)

Format guidelines:
- Start with a catchy title that captures the day's main theme
- Include a TL;DR summary upfront
- Use section headers (##) for major topics
- Include emojis sparingly for visual interest
- End with reflections and what's next
- Keep it under 1000 words
- Use "I/we" voice (first person)

Transform the technical progress into a narrative that:
1. Makes technical concepts accessible
2. Shows the human side of development
3. Provides value to readers facing similar challenges
4. Maintains authenticity (include failures and struggles)"""

    user_prompt = f"""Transform this structured daily report into an engaging blog post:

{structured_report}

Create a narrative blog post that tells the story of today's work. Focus on the most interesting challenges and learnings. Make it engaging for both technical and non-technical readers."""

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 2000
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        data = response.json()
        return data['choices'][0]['message']['content']

    except requests.exceptions.RequestException as e:
        print(f"❌ API request failed: {e}")
        return None
    except (KeyError, IndexError) as e:
        print(f"❌ Unexpected API response format: {e}")
        return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 enhance_dailyreport.py /path/to/report.md")
        sys.exit(1)

    report_path = Path(sys.argv[1])

    if not report_path.exists():
        print(f"❌ Report file not found: {report_path}")
        sys.exit(1)

    # Load environment variables from .env.mcp
    env_path = Path.cwd() / '.env.mcp'
    env_vars = load_env_file(env_path)

    # Check if enhancement is enabled
    enable_enhancement = env_vars.get('DAILYREPORT_ENABLE_ENHANCEMENT', 'true').lower()
    if enable_enhancement == 'false':
        print("ℹ️  AI enhancement is disabled (DAILYREPORT_ENABLE_ENHANCEMENT=false)")
        sys.exit(0)

    # Get API key
    api_key = env_vars.get('OPENAI_API_KEY') or os.environ.get('OPENAI_API_KEY')

    if not api_key:
        print("ℹ️  AI Enhancement unavailable: OPENAI_API_KEY not found in .env.mcp")
        print("   Add your API key to enable blog-ready post generation")
        print("   Get key from: https://platform.openai.com/api-keys")
        sys.exit(0)

    # Get model preference
    model = env_vars.get('DAILYREPORT_MODEL', 'gpt-4o-mini')

    # Read structured report
    print(f"📖 Reading structured report: {report_path.name}")
    with open(report_path, 'r') as f:
        structured_report = f.read()

    # Generate enhanced version
    print(f"🤖 Generating blog-ready version with {model}...")
    enhanced_content = enhance_with_openai(structured_report, api_key, model)

    if not enhanced_content:
        print("❌ Enhancement failed - keeping structured report only")
        sys.exit(1)

    # Create blog version file
    blog_path = report_path.parent / f"{report_path.stem}-blog.md"

    # Add metadata footer
    timestamp = datetime.now().strftime("%Y-%m-%d at %H:%M")
    enhanced_with_footer = f"""{enhanced_content}

---

_AI-enhanced blog post generated from structured report on {timestamp}_
_Original report: {report_path.name}_
_Enhancement model: {model}_
"""

    with open(blog_path, 'w') as f:
        f.write(enhanced_with_footer)

    print(f"✨ Blog post created: {blog_path.name}")
    print(f"📝 Ready to publish!")

    # Show preview
    lines = enhanced_content.split('\n')
    title = lines[0] if lines else "No title"
    tldr_line = next((line for line in lines if 'TL;DR' in line.upper()), None)

    print("\n" + "━" * 60)
    print(title)
    if tldr_line:
        print(tldr_line)
    print("━" * 60)
    print(f"\n💡 Tip: Use {blog_path} for your daily update post")

if __name__ == "__main__":
    main()
