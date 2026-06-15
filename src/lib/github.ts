export type GitHubRepo = {
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  fork: boolean;
  topics: string[];
  updated_at: string;
};

export type GitHubProfile = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string;
};

export async function fetchGitHubProfile(username: string): Promise<GitHubProfile> {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) throw new Error(`GitHub user not found: ${res.status}`);
  return res.json();
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=50&sort=updated&direction=desc`);
  if (!res.ok) throw new Error(`Failed to fetch repos: ${res.status}`);
  const repos: GitHubRepo[] = await res.json();
  return repos.filter((r) => !r.fork).slice(0, 10);
}

export function extractUsername(url: string): string | null {
  const match = url.match(/github\.com\/([^/\s?#]+)/);
  return match ? match[1] : null;
}
