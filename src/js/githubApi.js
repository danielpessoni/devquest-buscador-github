const BASE_URL = 'https://api.github.com';

export async function fetchGitHubUser(userName) {
  const response = await fetch(`${BASE_URL}/users/${userName}`);

  if (!response.ok) {
    throw new Error('Usuário não encontrado.');
  }

  return response.json();
}

export async function fetchGitHubUserRepos(userName) {
  const repositories = await fetch(`${BASE_URL}/users/${userName}/repos?per_page=10&sort=created`);
  if (!repositories.ok) {
    throw new Error("Repositórios não encontrados");
  }
  return await repositories.json();
}

export async function fetchRepoReadme(owner, repoName, defaultBranch = 'main') {
  if (!owner || !repoName) return null;

  try {
    const response = await fetch(`${BASE_URL}/repos/${owner}/${repoName}/readme`);
    if (response.ok) {
      return await response.json();
    }
    if (response.status === 404) {
      return null;
    }
  } catch {
    // API request failed (e.g. rate limit), fallback to raw.githubusercontent.com
  }

  try {
    const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repoName}/${defaultBranch}/README.md`, { method: 'HEAD' });
    if (rawRes.ok) {
      return {
        html_url: `https://github.com/${owner}/${repoName}/blob/${defaultBranch}/README.md`
      };
    }
  } catch {
    // Fallback failed
  }

  return null;
}