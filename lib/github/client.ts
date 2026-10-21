/**
 * Fetches the GitHub contribution calendar for a user
 * using the GitHub GraphQL API.
 */
export interface ContributionDay {
  date: string
  contributionCount: number
}

interface GitHubContributionsResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: { contributionDays: ContributionDay[] }[]
        }
      }
    }
  }
  errors?: { message?: string }[]
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = "GitHubApiError"
  }
}

export async function fetchGitHubContributions(
  login: string,
  accessToken: string
): Promise<ContributionDay[]> {
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `

  const from = new Date()
  from.setFullYear(from.getFullYear() - 1)
  const to = new Date()

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        login,
        from: from.toISOString(),
        to: to.toISOString(),
      },
    }),
  })

  if (!res.ok) {
    throw new GitHubApiError(`GitHub API error: ${res.status}`, res.status)
  }

  const { data, errors } = (await res.json()) as GitHubContributionsResponse
  if (errors?.length) {
    throw new GitHubApiError("GitHub GraphQL request failed", 502)
  }

  const weeks =
    data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? []

  if (!data?.user) {
    throw new GitHubApiError("GitHub user was not found", 404)
  }

  return weeks.flatMap(
    (w: { contributionDays: ContributionDay[] }) => w.contributionDays
  )
}

/**
 * Fetches the authenticated user's GitHub login from the REST API.
 */
export async function fetchGitHubUser(
  accessToken: string
): Promise<{ login: string; id: number; avatar_url: string }> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })
  if (!res.ok) throw new GitHubApiError(`GitHub user fetch error: ${res.status}`, res.status)
  return res.json()
}
