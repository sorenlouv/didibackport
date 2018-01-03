import axios from 'axios';
import Cookies from 'js-cookie';
import get from 'lodash.get';
import flatten from 'lodash.flatten';
import firebase from 'firebase/app';
require('firebase/auth');

const COOKIE_NAME = 'github_access_token';

export function initFirebase() {
  const config = {
    apiKey: 'AIzaSyAdWAnFs34BotZKhRJ0VFJq7O0wDpwnQrY',
    authDomain: 'did-i-backport.firebaseapp.com',
    databaseURL: 'https://did-i-backport.firebaseio.com',
    projectId: 'did-i-backport',
    storageBucket: 'did-i-backport.appspot.com',
    messagingSenderId: '756066915864'
  };
  firebase.initializeApp(config);

  // set accessToken if a new is received
  return getAccessTokenFromRedirectResult().then(accessToken => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
  });
}

export function onAuthChangeState(authStateChangeCallback) {
  // listen for auth updates
  firebase.auth().onAuthStateChanged(() => {
    isAccessTokenValid()
      .then(isValid =>
        authStateChangeCallback(isValid ? firebase.auth().currentUser : null)
      )
      .catch(e => console.error('Could not verify accessToken', e));
  });
}

export function login() {
  const provider = new firebase.auth.GithubAuthProvider();
  provider.addScope('repo');

  return firebase.auth().signInWithRedirect(provider);
}

export function getBranchesByKeyword(owner, repoName, keyword) {
  const q = [
    `repo:${owner}/${repoName}`,
    'is:merged',
    'label:backport',
    'in:body',
    '"Backports+the+following+commits+to"',
    keyword
  ].join(' ');

  return req({
    url: `https://api.github.com/search/issues`,
    params: { q }
  }).then(res => {
    return res.data.items.map(item => {
      return {
        name: getBranchNameFromBody(item.body),
        url: item.pull_request.html_url
      };
    });
  });
}

function getBranchNameFromBody(body) {
  const matches = body.match(
    /Backports the following commits to ([a-z.0-9]{3})/
  );
  return get(matches, 1);
}

function getIssueTimeline(owner, repoName, prNumber) {
  return req({
    url: `https://api.github.com/repos/${owner}/${repoName}/issues/${prNumber}/timeline`,
    params: {
      per_page: 300
    },
    headers: {
      Accept: 'application/vnd.github.mockingbird-preview'
    }
  });
}

async function getBranchesByReferenceCommits(
  owner,
  repoName,
  commit,
  prNumber
) {
  const res = await getIssueTimeline(owner, repoName, prNumber);

  const promises = res.data
    .filter(item => {
      // TODO: this needs to be escaped
      const regex = new RegExp(
        `https://api.github.com/repos/${owner}/${repoName}/commits/`
      );

      return (
        item.event === 'referenced' &&
        item.commit_id &&
        item.commit_url.match(regex)
      );
    })
    .map(async item => {
      const res = await req({ url: item.commit_url });

      if (
        res.data.commit.message.includes(commit.commit.message.split('\n')[0])
      ) {
        const promises = ['6.x', '6.1', '6.0'].map(async branchName => {
          return {
            commits: await getCommits(owner, repoName, {
              author: 'sqren',
              sha: branchName,
              per_page: 100
            }),
            branchName: branchName
          };
        });

        const branches = await Promise.all(promises);
        return branches.map(branch => {
          const backportCommit = branch.commits.find(
            c => c.sha === res.data.sha
          );
          if (backportCommit) {
            return {
              name: branch.branchName,
              url: backportCommit.html_url
            };
          }
        });
      }
    });

  const branches = await Promise.all(promises);
  return flatten(branches).filter(branch => branch);
}

async function getBranchesByPr(owner, repoName, prNumber) {
  const res = await getIssueTimeline(owner, repoName, prNumber);

  const promises = res.data
    .filter(item => {
      return (
        item.event === 'cross-referenced' &&
        get(item, 'source.issue.pull_request.url') &&
        item.source.issue.repository.owner.login === owner &&
        item.source.issue.repository.name === repoName &&
        item.source.issue.state === 'closed' &&
        item.source.issue.labels.some(label => label.name === 'backport') &&
        item.source.issue.body.includes(prNumber) &&
        getBranchNameFromBody(item.source.issue.body)
      );
    })
    .map(async item => {
      const res = await req({ url: item.source.issue.pull_request.url });
      if (res.data.merged) {
        return {
          name: res.data.base.ref,
          url: item.source.issue.pull_request.html_url
        };
      }
    });

  const branches = await Promise.all(promises);
  return branches.filter(branch => branch);
}

export function searchRepositories(owner, keyword) {
  const q = [`org:${owner}`, 'in:name', keyword].join(' ');
  return req({
    url: `https://api.github.com/search/repositories?q=${q}`
  }).then(res => res.data.items);
}

export function getCommits(owner, repoName, options) {
  const params = {
    ...options
  };

  return req({
    url: `https://api.github.com/repos/${owner}/${repoName}/commits`,
    params
  }).then(res => res.data);
}

export async function getBranchesForCommit(owner, repoName, commit) {
  const pullRequestNumber = getPullRequestNumber(commit.commit.message);
  if (pullRequestNumber) {
    return getBranchesByReferenceCommits(
      owner,
      repoName,
      commit,
      pullRequestNumber
    );
  }
  const shortSha = commit.sha.slice(0, 7);
  return getBranchesByKeyword(owner, repoName, shortSha);
}

function getPullRequestNumber(message) {
  const matches = message.match(/\(#(\d+)\)/);
  return get(matches, 1);
}

function getAccessTokenFromRedirectResult() {
  return firebase
    .auth()
    .getRedirectResult()
    .then(res => get(res, 'credential.accessToken'));
}

function setAccessToken(accessToken) {
  return Cookies.set(COOKIE_NAME, accessToken);
}

function getAccessToken() {
  return Cookies.get(COOKIE_NAME);
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

function isAccessTokenValid() {
  return req({ url: 'https://api.github.com/user' })
    .then(() => true)
    .catch(() => false);
}
