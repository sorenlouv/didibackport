import axios from 'axios';
import Cookies from 'js-cookie';
import get from 'lodash.get';
import memoize from 'lodash.memoize';

export function searchRepositories(owner, keyword) {
  const q = [`org:${owner}`, 'in:name', keyword].join(' ');
  return req({
    url: `https://api.github.com/search/repositories?q=${q}`
  }).then(res => res.data.items);
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
  }).then(res => withBranches(res.data.data.repository));
}

function withBranches(repository) {
  return repository.master.target.history.nodes.map(masterCommit => {
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

export function getAuthor() {
  return gql({
    query: `query GetAuthor {
      viewer {
        id
      }
    }`
  }).then(res => res.data.data.viewer.id);
}

export function isAccessTokenValid() {
  return getAuthor()
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
    return axios(opts);
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

const COOKIE_NAME = 'github_access_token';

export function setAccessToken(accessToken) {
  return Cookies.set(COOKIE_NAME, accessToken);
}

function getAccessToken() {
  return Cookies.get(COOKIE_NAME);
}
