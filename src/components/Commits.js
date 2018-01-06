import React, { Component } from 'react';
import { getCommits, getAuthorId } from '../services/github';
import isEmpty from 'lodash.isempty';
import styled from 'styled-components';
import { LoadingSpinner } from './UI';
import Commit from './Commit';
import { colors, units, px, fontSizes } from '../variables';
import { toQuery, getBoolParam } from '../services/url';
import Settings from './Settings';

const HeaderSection = styled.div`
  text-align: center;
  position: relative;
  padding: ${px(units.plus)};
  background: ${colors.blue};
  color: #fff;
  font-size: ${fontSizes.xlarge};
`;

const BackButton = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: ${fontSizes.normal};
  a {
    color: #fff;
  }
`;

const EmptyState = styled.div`
  margin-top: ${px(units.triple)};
  text-align: center;
  font-size: ${fontSizes.xlarge};
`;

class Commits extends Component {
  state = {
    commits: [],
    isLoading: false
  };

  async componentDidMount() {
    this.getCommits(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      this.getCommits(nextProps);
    }
  }

  async getCommits(props) {
    const { owner, repoName } = props.match.params;
    const onlyOwn = getBoolParam(props.location, 'own');
    const onlyMissing = getBoolParam(props.location, 'missingBackport');
    const authorId = toQuery(props.location.search).author;

    this.setState({ isLoading: true });

    const author = onlyOwn ? await getAuthorId() : authorId;
    const commits = (await getCommits({
      owner,
      repoName,
      size: 100,
      author
    })).filter(commit => !onlyMissing || isEmpty(commit.branches));

    this.setState({ isLoading: false, commits });
  }

  render() {
    const { history, location } = this.props;
    const { owner, repoName } = this.props.match.params;
    const { commits, isLoading } = this.state;

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

        <Settings location={location} history={history} />

        {isLoading && <LoadingSpinner center />}
        {!isLoading &&
          isEmpty(commits) && <EmptyState>No commits were found</EmptyState>}

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
