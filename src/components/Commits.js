import React, { Component } from 'react';
import { getCommits } from '../services/github';
import isEmpty from 'lodash.isempty';
import { LoadingSpinner } from './UI';
import Commit from './Commit';
import styled from 'styled-components';

const HeaderSection = styled.div`
  text-align: center;
  position: relative;
  padding: 20px;
  background: #3f3798;
  color: #fff;
  font-size: 24px;
`;

const BackButton = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  a {
    color: #fff;
  }
`;

class Commits extends Component {
  state = {
    commits: null,
    isLoading: false
  };

  async componentDidMount() {
    const { owner, repoName } = this.props.match.params;
    this.setState({ isLoading: true });
    const commits = await getCommits({ owner, repoName, size: 5 });
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

    return (
      <div>
        <HeaderSection>
          <BackButton>
            <a href="#/">Back</a>
          </BackButton>
          <div>
            {owner}/{repoName}
          </div>
        </HeaderSection>
        {commits.map(commit => (
          <Commit
            key={commit.oid}
            owner={owner}
            repoName={repoName}
            commit={commit}
          />
        ))}
      </div>
    );
  }
}

export default Commits;
