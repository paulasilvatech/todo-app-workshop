import { Octokit } from '@octokit/rest'

export class GitHubService {
  private octokit: Octokit

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken })
  }

  async listRepos() {
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    })
    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
    }))
  }

  async createIssue(owner: string, repo: string, title: string, body?: string) {
    const { data } = await this.octokit.issues.create({
      owner,
      repo,
      title,
      body: body ?? '',
    })
    return {
      number: data.number,
      url: data.html_url,
    }
  }

  async closeIssue(owner: string, repo: string, issueNumber: number) {
    await this.octokit.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      state: 'closed',
    })
  }

  async getIssue(owner: string, repo: string, issueNumber: number) {
    const { data } = await this.octokit.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    })
    return {
      number: data.number,
      title: data.title,
      body: data.body,
      state: data.state,
      url: data.html_url,
    }
  }

  async listOpenIssues(owner: string, repo: string) {
    const { data } = await this.octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 100,
    })
    // Filter out pull requests — GitHub API returns PRs as issues too
    return data
      .filter((issue) => !issue.pull_request)
      .map((issue) => ({
        number: issue.number,
        title: issue.title,
        body: issue.body ?? '',
        url: issue.html_url,
        labels: issue.labels
          .map((l) => (typeof l === 'string' ? l : l.name ?? ''))
          .filter(Boolean),
      }))
  }
}
