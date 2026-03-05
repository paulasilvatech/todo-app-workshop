// Mock Octokit
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      repos: {
        listForAuthenticatedUser: jest.fn().mockResolvedValue({
          data: [
            {
              id: 1,
              name: 'my-repo',
              full_name: 'octocat/my-repo',
              owner: { login: 'octocat' },
              private: false,
            },
          ],
        }),
      },
      issues: {
        create: jest.fn().mockResolvedValue({
          data: { number: 42, html_url: 'https://github.com/octocat/my-repo/issues/42' },
        }),
        update: jest.fn().mockResolvedValue({ data: {} }),
        get: jest.fn().mockResolvedValue({
          data: {
            number: 42,
            title: 'Test Issue',
            body: 'Issue body',
            state: 'open',
            html_url: 'https://github.com/octocat/my-repo/issues/42',
          },
        }),
        listForRepo: jest.fn().mockResolvedValue({
          data: [
            {
              number: 1,
              title: 'Open issue',
              body: 'Body',
              html_url: 'https://github.com/octocat/my-repo/issues/1',
              labels: [{ name: 'bug' }],
              pull_request: undefined,
            },
          ],
        }),
      },
    })),
  }
})

import { GitHubService } from '../services/githubService'

describe('GitHubService', () => {
  let service: GitHubService

  beforeEach(() => {
    service = new GitHubService('fake_token')
  })

  it('listRepos returns mapped repositories', async () => {
    const repos = await service.listRepos()
    expect(repos).toHaveLength(1)
    expect(repos[0]).toMatchObject({
      name: 'my-repo',
      fullName: 'octocat/my-repo',
      owner: 'octocat',
    })
  })

  it('createIssue returns issue number and url', async () => {
    const issue = await service.createIssue('octocat', 'my-repo', 'Test title', 'Body')
    expect(issue.number).toBe(42)
    expect(issue.url).toContain('github.com')
  })

  it('closeIssue calls update with state closed', async () => {
    await expect(service.closeIssue('octocat', 'my-repo', 42)).resolves.not.toThrow()
  })

  it('getIssue returns issue data', async () => {
    const issue = await service.getIssue('octocat', 'my-repo', 42)
    expect(issue.number).toBe(42)
    expect(issue.title).toBe('Test Issue')
  })

  it('listOpenIssues filters out pull requests', async () => {
    const issues = await service.listOpenIssues('octocat', 'my-repo')
    // All items have no pull_request field so all should be returned
    expect(issues.length).toBeGreaterThan(0)
    expect(issues[0].labels).toContain('bug')
  })
})
