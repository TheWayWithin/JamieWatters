/**
 * Portfolio proof points (PRJ-18 Wave 4).
 *
 * One honest, verifiable line per live product — the strongest REAL thing, not a
 * vanity metric. Curated copy lives here (version-controlled, reviewable) rather
 * than in the DB. Keyed by project slug. A product with no entry simply renders
 * no proof line.
 *
 * Rule: no invented numbers. A line may cite a real artifact, open code, a
 * genuine count, or an honest "what I learned" — nothing that isn't checkable.
 */

const PROOF_POINTS: Record<string, string> = {
  'ai-search-arena':
    'A head-to-head benchmark of AI search tools: six models, 51 scoring dimensions. The whole methodology is public, so you can check my working.',
  aimpactscanner:
    'Scores any page against 132 factors for how AI search actually sees it. Free to run, no sign-up.',
  'agent-11':
    'Deploy 11 AI agents in Claude Code with one command. Open source, so you read the code before you trust it.',
  aisearchmastery:
    'The guides and frameworks behind the tools. Where I work the AI-search thinking out in public.',
  'bos-ai':
    'An open-source agent framework for running the back office of a one-person business. The code is all there to read.',
  'executor-file':
    'Everything your executor needs, in one encrypted file. Age encryption and 2-of-3 Shamir shares, no service to depend on. In beta.',
  freecalchub:
    '55+ free calculators across seven categories. No sign-up, no paywall.',
  'jamiewatters-work':
    'This site. Built in public, code on GitHub, and it runs the Mission Control behind my week.',
  llmtxtmastery:
    'Generates the llms.txt file that tells AI crawlers how to read your site. Free to start.',
  'master-ai-framework':
    'The open-source scoring framework the scanner runs on. 132 factors, all documented.',
};

export function getProofPoint(slug: string): string | undefined {
  return PROOF_POINTS[slug];
}
