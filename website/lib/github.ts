/**
 * GitHub API Integration
 *
 * Provides functions to interact with GitHub REST API for:
 * - Fetching file content from repositories
 * - Parsing GitHub URLs
 * - Reading project-plan.md files
 *
 * Security Implementation:
 * - Supports both public (no token) and private repos (with token)
 * - Handles rate limiting gracefully
 * - Never logs or exposes tokens
 * - Proper error handling without information leakage
 *
 * Rate Limits:
 * - With token: 5000 requests/hour
 * - Without token: 60 requests/hour
 */

export interface GitHubConfig {
  owner: string;      // Repository owner (user or org)
  repo: string;       // Repository name
  token?: string;     // Optional: decrypted GitHub token for private repos
}

export interface GitHubFile {
  content: string;    // Decoded file content
  sha: string;        // File SHA hash
  size: number;       // File size in bytes
}

export interface GitHubError {
  status: number;
  message: string;
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
}

/**
 * Parse GitHub URL to extract owner and repo
 *
 * Supports formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 * - owner/repo
 *
 * @param url - GitHub URL in various formats
 * @returns Object with owner and repo, or null if invalid
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    if (!url || typeof url !== 'string') {
      return null;
    }

    url = url.trim();

    // Remove .git suffix if present
    url = url.replace(/\.git$/, '');

    // Handle SSH format: git@github.com:owner/repo
    const sshMatch = url.match(/git@github\.com:([^/]+)\/(.+)/);
    if (sshMatch) {
      return {
        owner: sshMatch[1],
        repo: sshMatch[2],
      };
    }

    // Handle HTTPS format: https://github.com/owner/repo
    const httpsMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (httpsMatch) {
      return {
        owner: httpsMatch[1],
        repo: httpsMatch[2],
      };
    }

    // Handle short format: owner/repo
    const shortMatch = url.match(/^([^/]+)\/([^/]+)$/);
    if (shortMatch) {
      return {
        owner: shortMatch[1],
        repo: shortMatch[2],
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to parse GitHub URL:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Fetch file content from GitHub using REST API
 *
 * @param config - GitHub configuration (owner, repo, optional token)
 * @param filePath - Path to file in repository (e.g., "project-plan.md")
 * @param branch - Optional branch name (default: repository's default branch)
 * @returns File content as string
 * @throws GitHubError with status code and message
 */
export async function fetchFileFromGitHub(
  config: GitHubConfig,
  filePath: string,
  branch?: string
): Promise<string> {
  try {
    const { owner, repo, token } = config;

    // Build API URL
    // GET /repos/{owner}/{repo}/contents/{path}
    let url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    if (branch) {
      url += `?ref=${encodeURIComponent(branch)}`;
    }

    // Build headers
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'JamieWatters-BuildInPublic/1.0',
    };

    // Add authorization header if token provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make request
    const response = await fetch(url, {
      method: 'GET',
      headers,
      // Cache for 60 seconds to avoid hammering GitHub API
      next: { revalidate: 60 },
    });

    // Handle rate limiting
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      const rateLimitReset = response.headers.get('x-ratelimit-reset');

      if (rateLimitRemaining === '0') {
        const resetDate = rateLimitReset
          ? new Date(parseInt(rateLimitReset) * 1000)
          : new Date(Date.now() + 3600000); // Default: 1 hour from now

        const error: GitHubError = {
          status: 403,
          message: 'GitHub API rate limit exceeded',
          rateLimitRemaining: 0,
          rateLimitReset: resetDate,
        };
        throw error;
      }

      // Other 403 errors (permissions)
      const error: GitHubError = {
        status: 403,
        message: 'Access forbidden. Check repository permissions or token.',
      };
      throw error;
    }

    // Handle not found
    if (response.status === 404) {
      const error: GitHubError = {
        status: 404,
        message: `File not found: ${filePath}`,
      };
      throw error;
    }

    // Handle other errors
    if (!response.ok) {
      const error: GitHubError = {
        status: response.status,
        message: `GitHub API error: ${response.statusText}`,
      };
      throw error;
    }

    // Parse response
    const data = await response.json();

    // GitHub returns file content as base64 encoded
    if (!data.content) {
      throw new Error('No content returned from GitHub API');
    }

    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    return content;

  } catch (error) {
    // Re-throw GitHubError as-is
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }

    // Wrap other errors
    console.error('GitHub API error:', error instanceof Error ? error.message : 'Unknown error');
    throw {
      status: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch file from GitHub',
    } as GitHubError;
  }
}

/**
 * Fetch project-plan.md specifically
 *
 * Convenience function for the most common use case
 *
 * @param config - GitHub configuration
 * @returns project-plan.md content as string
 */
export async function fetchProjectPlan(config: GitHubConfig): Promise<string> {
  return fetchFileFromGitHub(config, 'project-plan.md');
}

export interface GitHubDirectoryEntry {
  name: string;        // File or directory name
  path: string;        // Full path in repo
  type: 'file' | 'dir';
  size: number;        // Size in bytes (0 for directories)
  sha: string;         // Git SHA
}

/**
 * List contents of a directory from GitHub
 *
 * @param config - GitHub configuration (owner, repo, optional token)
 * @param dirPath - Path to directory in repository (e.g., "progress")
 * @param branch - Optional branch name (default: repository's default branch)
 * @returns Array of directory entries
 * @throws GitHubError with status code and message
 */
export async function listDirectoryFromGitHub(
  config: GitHubConfig,
  dirPath: string,
  branch?: string
): Promise<GitHubDirectoryEntry[]> {
  try {
    const { owner, repo, token } = config;

    // Build API URL
    let url = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}`;
    if (branch) {
      url += `?ref=${encodeURIComponent(branch)}`;
    }

    // Build headers
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'JamieWatters-BuildInPublic/1.0',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      next: { revalidate: 60 },
    });

    // Handle rate limiting
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      const rateLimitReset = response.headers.get('x-ratelimit-reset');

      if (rateLimitRemaining === '0') {
        const resetDate = rateLimitReset
          ? new Date(parseInt(rateLimitReset) * 1000)
          : new Date(Date.now() + 3600000);

        const error: GitHubError = {
          status: 403,
          message: 'GitHub API rate limit exceeded',
          rateLimitRemaining: 0,
          rateLimitReset: resetDate,
        };
        throw error;
      }

      const error: GitHubError = {
        status: 403,
        message: 'Access forbidden. Check repository permissions or token.',
      };
      throw error;
    }

    // Handle not found (directory doesn't exist)
    if (response.status === 404) {
      // Return empty array instead of throwing - directory just doesn't exist yet
      return [];
    }

    if (!response.ok) {
      const error: GitHubError = {
        status: response.status,
        message: `GitHub API error: ${response.statusText}`,
      };
      throw error;
    }

    const data = await response.json();

    // GitHub returns an array for directories
    if (!Array.isArray(data)) {
      // Path points to a file, not a directory
      return [];
    }

    // Map to our interface
    return data.map((entry: { name: string; path: string; type: string; size: number; sha: string }) => ({
      name: entry.name,
      path: entry.path,
      type: entry.type === 'dir' ? 'dir' : 'file',
      size: entry.size || 0,
      sha: entry.sha,
    }));

  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }

    console.error('GitHub API error:', error instanceof Error ? error.message : 'Unknown error');
    throw {
      status: 500,
      message: error instanceof Error ? error.message : 'Failed to list directory from GitHub',
    } as GitHubError;
  }
}

/**
 * Format GitHub error for user display
 *
 * @param error - GitHubError object
 * @returns User-friendly error message
 */
export function formatGitHubError(error: GitHubError): string {
  switch (error.status) {
    case 404:
      return 'File not found in repository. Make sure project-plan.md exists in the root directory.';

    case 403:
      if (error.rateLimitRemaining === 0 && error.rateLimitReset) {
        const resetTime = error.rateLimitReset.toLocaleTimeString();
        return `GitHub API rate limit exceeded. Resets at ${resetTime}.`;
      }
      return 'Access forbidden. Check if the repository is private and you have provided a valid GitHub token.';

    case 401:
      return 'Invalid GitHub token. Please check your token has the correct permissions.';

    default:
      return error.message || 'Failed to fetch from GitHub';
  }
}
