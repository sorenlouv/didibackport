import axios from 'axios';
import Cookies from 'js-cookie';

export function searchRepositories(owner, keyword) {
  const q = [`org:${owner}`, 'in:name', keyword].join(' ');
  return req({
    url: `https://api.github.com/search/repositories?q=${q}`
  }).then(res => res.data.items);
}

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
      $author: String!
      $hasAuthor: Boolean!
      $size: Int = 10
    ) {
      viewer {
        id
      }
      repository(owner: $owner, name: $name) {
        v5_6: ref(qualifiedName: "5.6") {
          ...RefFragment
        }
        v6_0: ref(qualifiedName: "6.0") {
          ...RefFragment
        }
        v6_1: ref(qualifiedName: "6.1") {
          ...RefFragment
        }
        v6_x: ref(qualifiedName: "6.x") {
          ...RefFragment
        }
        master: ref(qualifiedName: "master") {
          ...RefFragment
        }
      }
    }

    fragment RefFragment on Ref {
      id
      name
      target {
        ... on Commit {
          id
          history(first: $size, author: { emails: [$author] })
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
    masterCommit.branches = ['v5_6', 'v6_0', 'v6_1', 'v6_x']
      .map(branchName => {
        const backportCommit = repository[branchName].target.history.nodes.find(
          commit => {
            return commit.message.includes(masterCommit.message.split('\n')[0]);
          }
        );
        return {
          name: branchName,
          commit: backportCommit && backportCommit.oid
        };
      })
      .filter(item => item.commit);
    return masterCommit;
  });
}

export function isAccessTokenValid() {
  return req({ url: 'https://api.github.com/user' })
    .then(() => true)
    .catch(() => false);
}

export function gql({ query, variables }) {
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
}

function req(options) {
  const opts = {
    ...options,
    params: {
      ...options.params,
      access_token: getAccessToken()
    }
  };
  return axios(opts);
}

const COOKIE_NAME = 'github_access_token';

export function setAccessToken(accessToken) {
  return Cookies.set(COOKIE_NAME, accessToken);
}

function getAccessToken() {
  return Cookies.get(COOKIE_NAME);
}
