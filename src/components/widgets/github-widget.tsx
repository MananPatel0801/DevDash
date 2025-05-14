
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Github, Star, GitFork, AlertCircle, ExternalLink, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WidgetCard } from '@/components/widget-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';


interface RepoStats {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  name: string;
  description: string;
  owner: { login: string; avatar_url: string; html_url: string; };
}

interface Commit {
  sha: string;
  commit: {
    author: { name: string; date: string };
    message: string;
  };
  html_url: string;
  author: { login: string; avatar_url: string; html_url: string } | null;
}

const DEFAULT_REPO = 'facebook/react';

export function GitHubWidget() {
  const [repoInput, setRepoInput] = useState(DEFAULT_REPO);
  const [currentRepo, setCurrentRepo] = useState(DEFAULT_REPO);
  const [repoStats, setRepoStats] = useState<RepoStats | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Initialize to true as we fetch default repo on load
  const [error, setError] = useState<string | null>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  const fetchGitHubData = useCallback(async (repoFullName: string) => {
    if (!repoFullName || !repoFullName.includes('/')) {
      setError("Invalid repository format. Use 'owner/repo'.");
      setRepoStats(null);
      setCommits([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true); // Set loading true before each fetch
    setError(null);
    try {
      const [owner, repoName] = repoFullName.split('/');
      const [repoRes, commitsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repoName}`),
        fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=5`)
      ]);

      if (!repoRes.ok) {
        const errorData = await repoRes.json();
        throw new Error(`Failed to fetch repo stats: ${repoRes.status} ${errorData.message || 'Unknown error'}`);
      }
      const repoData: RepoStats = await repoRes.json();
      setRepoStats(repoData);

      if (!commitsRes.ok) {
         const errorData = await commitsRes.json();
        throw new Error(`Failed to fetch commits: ${commitsRes.status} ${errorData.message || 'Unknown error'}`);
      }
      const commitsData: Commit[] = await commitsRes.json();
      setCommits(commitsData);

    } catch (err: any) {
      console.error("GitHub API error:", err);
      setError(err.message || 'Failed to fetch data from GitHub.');
      setRepoStats(null);
      setCommits([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array, fetchGitHubData is stable

  useEffect(() => {
    if (currentRepo) { // Ensure currentRepo is not empty before fetching
        fetchGitHubData(currentRepo);
    } else { // Handle case where currentRepo might be cleared or invalid initially
        setIsLoading(false);
        setRepoStats(null);
        setCommits([]);
        setError("No repository specified.");
    }
  }, [currentRepo, fetchGitHubData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim() !== currentRepo) {
        setCurrentRepo(repoInput.trim());
    } else if (repoInput.trim() === currentRepo && (error || !repoStats)) { 
        // If same repo but had an error or no stats, try fetching again
        fetchGitHubData(repoInput.trim());
    }
  };

  return (
    <WidgetCard 
      title="GitHub Repository"
      description="Track stats and recent commits."
      className="min-h-[400px]"
    >
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          type="text"
          value={repoInput}
          onChange={(e) => setRepoInput(e.target.value)}
          placeholder="e.g., vercel/next.js"
          className="flex-grow"
          aria-label="GitHub repository input"
        />
        <Button type="submit" disabled={isLoading && currentRepo === repoInput} aria-label="Load repository data">
          {isLoading && currentRepo === repoInput ? 'Loading...' : 'Load'}
        </Button>
      </form>

      {error && (
         <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && ( // Simplified loading state: show skeletons if isLoading is true
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-6 w-1/2" />
          </div>
           <Skeleton className="h-4 w-full mb-2" />
          <div className="flex space-x-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/4" />
          </div>
          <Separator />
          <h3 className="text-md font-semibold">Recent Commits:</h3>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1 py-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && repoStats && ( // Only show data if not loading AND repoStats exist
        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
               <img src={repoStats.owner.avatar_url} alt={repoStats.owner.login} className="w-6 h-6 rounded-full" data-ai-hint="avatar user" />
               <Link href={repoStats.owner.html_url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold hover:underline text-primary">
                {repoStats.owner.login} / {repoStats.name}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{repoStats.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5" /> {repoStats.stargazers_count.toLocaleString()} Stars
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <GitFork className="h-3.5 w-3.5" /> {repoStats.forks_count.toLocaleString()} Forks
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {repoStats.open_issues_count.toLocaleString()} Open Issues
              </Badge>
              <Link href={repoStats.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                View on GitHub <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <Separator className="my-3"/>
          <h3 className="text-md font-semibold mb-2">Recent Commits ({commits.length}):</h3>
          <ScrollArea className="flex-grow pr-2">
            {commits.length === 0 && <p className="text-sm text-muted-foreground">No commits found or repository is empty.</p>}
            <ul className="space-y-3">
              {commits.map(commit => (
                <li key={commit.sha} className="text-sm border-l-2 border-primary/50 pl-3 py-1 hover:bg-accent/10 rounded-r-md">
                  <Link href={commit.html_url} target="_blank" rel="noopener noreferrer" className="block hover:text-primary transition-colors">
                    <p className="font-medium truncate" title={commit.commit.message}>{commit.commit.message.split('\n')[0]}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                       {commit.author?.avatar_url ? <img src={commit.author.avatar_url} alt={commit.commit.author.name} className="w-4 h-4 rounded-full" data-ai-hint="avatar user" /> : <CircleDot className="w-3 h-3"/>}
                      <span>{commit.commit.author.name}</span>
                      <span>&bull;</span>
                      {isClientMounted ? (
                        <span>{formatDistanceToNow(new Date(commit.commit.author.date), { addSuffix: true })}</span>
                      ) : (
                        <Skeleton className="h-3 w-20" /> 
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
      {!isLoading && !repoStats && !error && ( // Initial state or after clearing input
         <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Github className="w-12 h-12 mb-4" />
            <p>Enter a repository (e.g., owner/repo) and click Load.</p>
          </div>
      )}
    </WidgetCard>
  );
}
