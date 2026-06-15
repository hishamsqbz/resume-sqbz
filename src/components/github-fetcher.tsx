"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, GitBranch, Star, Check } from "lucide-react";
import { toast } from "sonner";
import { fetchGitHubProfile, fetchGitHubRepos, extractUsername, type GitHubRepo, type GitHubProfile } from "@/lib/github";

type GitHubFetcherProps = {
  onReposChange: (repos: GitHubRepo[]) => void;
  selectedRepos: GitHubRepo[];
};

export default function GitHubFetcher({ onReposChange, selectedRepos }: GitHubFetcherProps) {
  const [url, setUrl] = useState("");
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedRepos.map((r) => r.name)));

  const handleFetch = async () => {
    const username = extractUsername(url);
    if (!username) {
      toast.error("Enter a valid GitHub profile URL (e.g., https://github.com/username)");
      return;
    }

    setLoading(true);
    try {
      const [profileData, reposData] = await Promise.all([
        fetchGitHubProfile(username),
        fetchGitHubRepos(username),
      ]);
      setProfile(profileData);
      setRepos(reposData);
      toast.success(`Found ${reposData.length} repos from ${profileData.name || username}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch GitHub data");
    } finally {
      setLoading(false);
    }
  };

  const toggleRepo = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelected(next);
    onReposChange(repos.filter((r) => next.has(r.name)));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/yourusername"
          onKeyDown={(e) => e.key === "Enter" && handleFetch()}
        />
        <Button onClick={handleFetch} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
          Fetch
        </Button>
      </div>

      {profile && (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{profile.name || profile.login}</div>
            <div className="text-xs text-muted-foreground truncate">{profile.bio}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {profile.public_repos} repos · {profile.followers} followers
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            <Check className="w-3 h-3 mr-1" /> Connected
          </Badge>
        </div>
      )}

      {repos.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <div className="text-xs font-medium text-muted-foreground">Select repos to include:</div>
          {repos.map((repo) => (
            <Card
              key={repo.name}
              onClick={() => toggleRepo(repo.name)}
              className={`p-3 cursor-pointer transition-all hover:border-primary/50 ${
                selected.has(repo.name) ? "ring-1 ring-primary border-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{repo.name}</span>
                    {repo.language && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                        {repo.language}
                      </Badge>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {repo.stargazers_count > 0 && (
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stargazers_count}</span>
                    )}
                    {repo.topics?.slice(0, 2).map((t) => (
                      <span key={t} className="bg-primary/5 px-1.5 py-0.5 rounded text-[10px]">{t}</span>
                    ))}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  selected.has(repo.name) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                }`}>
                  {selected.has(repo.name) && <Check className="w-3 h-3" />}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
