/**
 * Fetches the GitHub contribution calendar for a user
 * using the GitHub GraphQL API.
 */
export interface ContributionDay {
  date: string
  contributionCount: number
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
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const { data } = await res.json()
  const weeks =
    data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? []

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
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`GitHub user fetch error: ${res.status}`)
  return res.json()
}
