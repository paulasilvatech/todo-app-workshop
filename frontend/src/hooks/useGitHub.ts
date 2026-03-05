import { useState } from 'react'
import {
  getGithubRepos,
  getConnectedRepos,
  connectRepo,
  disconnectRepo,
  importIssues,
  syncTasks,
  GithubRepoItem,
} from '../api/client'
import { GitHubRepo } from '../types'

export function useGitHub() {
  const [githubRepos, setGithubRepos] = useState<GithubRepoItem[]>([])
  const [connectedRepos, setConnectedRepos] = useState<GitHubRepo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGithubRepos = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const repos = await getGithubRepos()
      setGithubRepos(repos)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConnectedRepos = async () => {
    try {
      const repos = await getConnectedRepos()
      setConnectedRepos(repos)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleConnectRepo = async (repo: GithubRepoItem) => {
    const connected = await connectRepo({
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
    })
    setConnectedRepos((prev) => [...prev, connected])
    return connected
  }

  const handleDisconnectRepo = async (id: string) => {
    await disconnectRepo(id)
    setConnectedRepos((prev) => prev.filter((r) => r.id !== id))
  }

  const handleImportIssues = async (repoId: string) => {
    return importIssues(repoId)
  }

  const handleSyncTasks = async () => {
    return syncTasks()
  }

  return {
    githubRepos,
    connectedRepos,
    isLoading,
    error,
    fetchGithubRepos,
    fetchConnectedRepos,
    connectRepo: handleConnectRepo,
    disconnectRepo: handleDisconnectRepo,
    importIssues: handleImportIssues,
    syncTasks: handleSyncTasks,
  }
}
