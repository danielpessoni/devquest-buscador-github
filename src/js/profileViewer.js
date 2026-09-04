import { fetchRepoReadme } from './githubApi.js';

export async function renderProfile(userData, userRepos, container) {
    const {
        avatar_url,
        name,
        bio,
        followers,
        following,
        login: userLogin
    } = userData;

    let repositoriesHTML = `<p>Este usuário não possui repositórios públicos</p>`;

    if (userRepos?.length > 0) {
        const reposWithDetails = await Promise.all(
            userRepos.map(async (repo) => {
                const ownerLogin = repo.owner?.login || userLogin;
                const defaultBranch = repo.default_branch || 'main';

                let readmeInfo = null;
                if (repo.readmeInfo !== undefined) {
                    readmeInfo = repo.readmeInfo;
                } else if (repo.has_readme !== undefined) {
                    readmeInfo = repo.has_readme ? { html_url: `${repo.html_url}/blob/${defaultBranch}/README.md` } : null;
                } else {
                    readmeInfo = await fetchRepoReadme(ownerLogin, repo.name, defaultBranch);
                }

                return {
                    ...repo,
                    ownerLogin,
                    readmeInfo
                };
            })
        );

        repositoriesHTML = reposWithDetails.map(repo => {
            const {
                html_url,
                name: repositoryName,
                description,
                stargazers_count,
                forks_count,
                watchers_count,
                language,
                has_pages,
                homepage,
                ownerLogin,
                readmeInfo,
                default_branch
            } = repo;

            const hasReadme = Boolean(readmeInfo);
            const readmeUrl = readmeInfo?.html_url || `${html_url}/blob/${default_branch || 'main'}/README.md`;
            const readmeButtonText = hasReadme ? 'README - OK' : 'README - N/A';

            const hasPages = Boolean(has_pages || (homepage && homepage.includes('github.io')));
            const isUserSite = repositoryName.toLowerCase() === `${ownerLogin.toLowerCase()}.github.io`;
            const defaultPagesUrl = isUserSite
                ? `https://${ownerLogin}.github.io/`
                : `https://${ownerLogin}.github.io/${repositoryName}/`;
            const pagesUrl = hasPages
                ? (homepage && homepage.startsWith('http') ? homepage : defaultPagesUrl)
                : null;
            const pagesButtonText = hasPages ? 'Página do Projeto' : 'Sem Página Disponível';

            return `
                <div class="repository-card">
                    <a class="repository-link" href="${html_url}" target="_blank" rel="noopener noreferrer">
                        <h3>${repositoryName}</h3>
                    </a>
                    <p>${description || "Sem descrição"}</p>
                    <div class="repository-stats">
                        <span class="repository-stat">⭐ ${stargazers_count}</span>
                        <span class="repository-stat">🍴 ${forks_count}</span>
                        <span class="repository-stat">👀 ${watchers_count}</span>
                        <span class="repository-stat">📝 ${language || "Não informada"}</span>
                        <div class="repository-buttons">
                            <button
                                type="button"
                                class="repository-btn repository-btn-readme"
                                ${hasReadme ? `data-url="${readmeUrl}" onclick="window.open('${readmeUrl}', '_blank')"` : 'disabled'}
                            >
                                ${readmeButtonText}
                            </button>
                            <button
                                type="button"
                                class="repository-btn repository-btn-pages"
                                ${hasPages ? `data-url="${pagesUrl}" onclick="window.open('${pagesUrl}', '_blank')"` : 'disabled'}
                            >
                                ${pagesButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    container.innerHTML = `
        <div class="profile-card">
            <img src="${avatar_url}" alt="Avatar de ${name}" class="profile-avatar">
            <div class="profile-info">
                <h2>${name || 'Não possui nome cadastrado 😢'}</h2>
                <p>${bio || 'Não possui bio cadastrada 😢.'}</p>
            </div>
        </div>

        <div class="profile-counters">
            <div class="followers">
                <h4>👥 Seguidores</h4>
                <span>${followers}</span>
            </div>
            <div class="following">
                <h4>👥 Seguindo</h4>
                <span>${following}</span>
            </div>
        </div>

        <div class="profile-repositories">
            <h2>Repositórios</h2>
            <div class="repositories">
                ${repositoriesHTML}
            </div>
        </div>
    `;
}

export function setLoading(container) {
    container.innerHTML = `<p class="loading">Carregando...</p>`;
}

export function clearProfile(container) {
    container.innerHTML = '';
}