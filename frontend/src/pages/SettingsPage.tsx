import { useState, useEffect } from 'react'
import { useGitHub } from '../hooks/useGitHub'
import { GithubRepoItem } from '../api/client'
import { GitHubRepo } from '../types'

export function SettingsPage() {
  const {
    githubRepos,
    connectedRepos,
    isLoading,
    error,
    fetchGithubRepos,
    fetchConnectedRepos,
    connectRepo,
    disconnectRepo,
    importIssues,
    syncTasks,
  } = useGitHub()

  const [showRepoSelector, setShowRepoSelector] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    fetchConnectedRepos()
  }, []) // eslint-disable-line

  const handleOpenSelector = async () => {
    setShowRepoSelector(true)
    await fetchGithubRepos()
  }

  const handleConnect = async (repo: GithubRepoItem) => {
    try {
      await connectRepo(repo)
      setShowRepoSelector(false)
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  const handleImport = async (repo: GitHubRepo) => {
    try {
      const result = await importIssues(repo.id)
      setSyncResult(`Imported ${result.imported} of ${result.total} issues as tasks.`)
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  const handleSyncAll = async () => {
    try {
      const result = await syncTasks()
      setSyncResult(`Synced ${result.synced} of ${result.total} out-of-sync tasks.`)
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Settings</h1>

      {(error || actionError) && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded" role="alert">
          {error ?? actionError}
        </div>
      )}

      {syncResult && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 px-3 py-2 rounded flex items-center justify-between">
          {syncResult}
          <button onClick={() => setSyncResult(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Connected Repositories */}
      <section className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-medium text-gray-900">Connected Repositories</h2>
          <button
            onClick={handleOpenSelector}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Connect Repo
          </button>
        </div>

        {connectedRepos.length === 0 ? (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">
            No repositories connected yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {connectedRepos.map((repo) => (
              <li key={repo.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{repo.fullName}</p>
                  <p className="text-xs text-gray-400">{repo.owner}/{repo.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleImport(repo)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Import issues
                  </button>
                  <button
                    onClick={() => disconnectRepo(repo.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sync */}
      <section className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-medium text-gray-900">GitHub Sync</h2>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-gray-600 mb-3">
            Reconcile all out-of-sync tasks against their linked GitHub Issues.
          </p>
          <button
            onClick={handleSyncAll}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
          >
            Sync All Tasks
          </button>
        </div>
      </section>

      {/* Repo Selector Modal */}
      {showRepoSelector && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Select repository"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-medium text-gray-900">Select a Repository</h3>
              <button
                onClick={() => setShowRepoSelector(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto">
              {isLoading ? (
                <p className="text-sm text-gray-400 text-center py-8">Loading repositories…</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {githubRepos.map((repo) => {
                    const isConnected = connectedRepos.some(
                      (r) => r.fullName === repo.fullName
                    )
                    return (
                      <li key={repo.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{repo.fullName}</p>
                          <p className="text-xs text-gray-400">{repo.private ? 'Private' : 'Public'}</p>
                        </div>
                        <button
                          onClick={() => handleConnect(repo)}
                          disabled={isConnected}
                          className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                        >
                          {isConnected ? 'Connected' : 'Connect'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
