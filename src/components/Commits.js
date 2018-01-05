import React, { Component } from 'react';
import { getCommits, getAuthor } from '../services/github';
import isEmpty from 'lodash.isempty';
import { LoadingSpinner } from './UI';
import Commit from './Commit';
import styled from 'styled-components';
import { colors, units, px, fontSizes } from '../variables';
import Checkbox from './Checkbox';
import { toQuery, fromQuery, getBoolParam } from '../services/url';

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

const Settings = styled.div`
  display: flex;
  padding: ${px(units.half)};
  justify-content: center;
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

  onMissingBackportsChange = isChecked => {
    this.updateSearch({ missingBackport: isChecked });
  };

  onAuthorChange = isChecked => {
    this.updateSearch({ own: isChecked });
  };

  updateSearch = nextParams => {
    const { history, location } = this.props;

    history.replace({
      ...location,
      search: fromQuery({
        ...toQuery(location.search),
        ...nextParams
      })
    });
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
    this.setState({ isLoading: true });

    const author = onlyOwn ? await getAuthor() : undefined;
    const commits = (await getCommits({
      owner,
      repoName,
      size: 100,
      author
    })).filter(commit => !onlyMissing || isEmpty(commit.branches));

    this.setState({ isLoading: false, commits });
  }

  render() {
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

        <Settings>
          <Checkbox
            checked={getBoolParam(this.props.location, 'own')}
            label="Only my commits"
            onChange={this.onAuthorChange}
          />

          <Checkbox
            checked={getBoolParam(this.props.location, 'missingBackport')}
            label="Only commits without backports"
            onChange={this.onMissingBackportsChange}
          />
        </Settings>

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
