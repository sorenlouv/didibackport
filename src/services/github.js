import axios from 'axios';
import get from 'lodash.get';
import memoize from 'lodash.memoize';

const LS_REPOSITORIES = 'repositories_with_counter';
const LS_ACCESS_TOKEN = 'github_access_token';

export function searchRepositories(owner, keyword) {
  const q = [`org:${owner}`, 'in:name', keyword].join(' ');
  return req({
    url: `https://api.github.com/search/repositories?q=${q}`
  }).then(res => sortRepositories(res.data.items));
}

export function sortRepositories(repositories) {
  const repos = getCountPerRepo();
  return repositories.concat().sort((a, b) => {
    if ((repos[a.id] || 0) > (repos[b.id] || 0)) return -1;
    if ((repos[a.id] || 0) < (repos[b.id] || 0)) return 1;
    return 0;
  });
}

function getCountPerRepo() {
  try {
    return JSON.parse(localStorage.getItem(LS_REPOSITORIES)) || {};
  } catch (e) {
    return {};
  }
}

export function incrementRepoCounter(repoId) {
  const currentRepos = getCountPerRepo();
  const nextRepos = {
    ...currentRepos,
    [repoId]: get(currentRepos, repoId, 0) + 1
  };

  localStorage.setItem(LS_REPOSITORIES, JSON.stringify(nextRepos));
}

const BRANCHES = {
  v5_6: '5.6',
  v6_0: '6.0',
  v6_1: '6.1',
  v6_x: '6.x'
};

export function getCommits({ owner, repoName, author = '', size }) {
  return gql({
    variables: {
      owner,
      name: repoName,
      author,
      hasAuthor: Boolean(author),
      size
    },
    query: `
    query CommitsAcrossBranches(
      $owner: String!
      $name: String!
      $author: ID!
      $hasAuthor: Boolean!
      $size: Int = 10
    ) {
      viewer {
        id
      }
      repository(owner: $owner, name: $name) {
        master: ref(qualifiedName: "master") {
          ...RefFragment
        }
        ${Object.keys(BRANCHES).map(
          branch => `${branch}: ref(qualifiedName: "${BRANCHES[branch]}") {
            ...RefFragment
          }`
        )}
      }
    }

    fragment RefFragment on Ref {
      id
      name
      target {
        ... on Commit {
          id
          history(first: $size, author: { id: $author })
            @include(if: $hasAuthor) {
            ...HistoryFragment
          }
          history(first: $size) @skip(if: $hasAuthor) {
            ...HistoryFragment
          }
        }
      }
    }

    fragment HistoryFragment on CommitHistoryConnection {
      totalCount
      nodes {
        author {
          user {
            id
            login
          }
          avatarUrl
          name
          date
        }
        messageHeadline
        message
        oid
      }
    }`
  }).then(res => withBranches(res.data.data.repository, size));
}

function withBranches(repository, size) {
  return repository.master.target.history.nodes
    .slice(0, size - 10) // Hack to avoid getting commits where the backported commit is too old to be in top 100
    .map(masterCommit => {
      masterCommit.branches = Object.keys(BRANCHES)
        .map(branchName => {
          const backportCommit = get(
            repository[branchName],
            'target.history.nodes',
            []
          ).find(commit => {
            return commit.message.includes(masterCommit.message.split('\n')[0]);
          });
          return {
            name: BRANCHES[branchName],
            commit: backportCommit && backportCommit.oid
          };
        })
        .filter(item => item.commit);
      return masterCommit;
    });
}

export function getAuthorId() {
  return gql({
    query: `query GetAuthor {
      viewer {
        id
      }
    }`
  }).then(res => res.data.data.viewer.id);
}

export function isAccessTokenValid() {
  return getAuthorId()
    .then(() => true)
    .catch(() => false);
}

const gql = memoize(
  ({ query, variables }) => {
    const opts = {
      url: 'https://api.github.com/graphql',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      },
      data: {
        query,
        variables
      }
    };
    return axios(opts).then(res => {
      if (res.data.errors) {
        console.error(res.data.errors);
        throw new Error('Error in graphql response');
      }
      return res;
    });
  },
  opts => JSON.stringify(opts)
);

const req = memoize(
  options => {
    const opts = {
      ...options,
      params: {
        ...options.params,
        access_token: getAccessToken()
      }
    };
    return axios(opts);
  },
  opts => JSON.stringify(opts)
);

export function setAccessToken(accessToken) {
  return localStorage.setItem(LS_ACCESS_TOKEN, accessToken);
}

function getAccessToken() {
  return localStorage.getItem(LS_ACCESS_TOKEN);
}
