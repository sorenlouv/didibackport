import React, { Component } from 'react';
import { getCommits } from '../services/github';
import isEmpty from 'lodash.isempty';
import { LoadingSpinner } from './UI';
import Commit from './Commit';

class Commits extends Component {
  state = {
    commits: null,
    isLoading: false
  };

  async componentDidMount() {
    const { owner, repoName } = this.props.match.params;
    this.setState({ isLoading: true });
    const commits = await getCommits({ owner, repoName, size: 20 });
    this.setState({ isLoading: false, commits });
  }

  render() {
    const { owner, repoName } = this.props.match.params;
    const { commits, isLoading } = this.state;

    if (isLoading) {
      return <LoadingSpinner center />;
    }

    if (isEmpty(commits)) {
      return 'No commits were found';
    }

    return commits.map(commit => (
      <Commit
        key={commit.oid}
        owner={owner}
        repoName={repoName}
        commit={commit}
      />
    ));
  }
}

export default Commits;
