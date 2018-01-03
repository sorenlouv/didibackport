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

  componentDidMount() {
    const { owner, repoName } = this.props.match.params;
    this.setState({ isLoading: true });
    getCommits(owner, repoName, { author: 'sqren' }).then(commits => {
      this.setState({ isLoading: false, commits });
    });
  }

  render() {
    const { owner, repoName } = this.props.match.params;
    const { commits, isLoading } = this.state;

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (isEmpty(commits)) {
      return null;
    }

    return commits.map(commit => (
      <Commit
        key={commit.sha}
        owner={owner}
        repoName={repoName}
        commit={commit}
      />
    ));
  }
}

export default Commits;
