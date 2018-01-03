import React, { Component } from 'react';
import styled from 'styled-components';
import isEmpty from 'lodash.isempty';
import { units, px } from '../variables';
import { getBranchesForCommit } from '../services/github';
import { LoadingSpinner } from './UI';

const BranchLabel = styled.div`
  display: inline-block;
  padding: 1px ${px(units.quarter)};
  border-radius: ${px(units.quarter)};
  background: #009800;
  margin-right: ${px(units.half)};

  a {
    color: #ffffff;
    text-decoration: none;
  }
`;

class BranchLabels extends Component {
  state = {
    branches: [],
    isLoading: false
  };

  async componentDidMount() {
    const { owner, repoName, commit } = this.props;
    this.setState({ isLoading: true });

    const branches = await getBranchesForCommit(owner, repoName, commit);
    this.setState({ isLoading: false, branches });
  }

  componentWillReceiveProps() {
    console.log('TODO: should I fetch data?');
  }

  render() {
    const { branches, isLoading } = this.state;

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (isEmpty(branches)) {
      return null;
    }

    return (
      <div>
        {branches.map(branch => (
          <BranchLabel key={branch.name}>
            <a href={branch.url}>{branch.name}</a>{' '}
          </BranchLabel>
        ))}
      </div>
    );
  }
}

export default BranchLabels;
