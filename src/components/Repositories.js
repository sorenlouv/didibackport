import React, { Component } from 'react';
import isEmpty from 'lodash.isempty';
import throttle from 'lodash.throttle';
import styled from 'styled-components';
import { searchRepositories, incrementRepoCounter } from '../services/github';
import { LoadingSpinner } from './UI';
import { fontSizes, px, units } from '../variables';

const RepositoryContainer = styled.div`
  border-bottom: 1px solid #d1d5da;
  padding: ${px(units.plus)} 0;
  overflow: hidden;
`;

const HeaderLink = styled.a`
  font-size: ${fontSizes.xlarge};
`;

const Searchbox = styled.input`
  font-size: ${fontSizes.large};
  padding: ${px(units.quarter)};
  height: ${px(units.double)};
  line-height: ${px(units.double)};
  color: #24292e;
  vertical-align: middle;
  background-color: #fff;
  border: 1px solid #d1d5da;
  border-radius: ${px(units.quarter)};
  outline: none;
  width: calc(100% - ${px(units.half)});
  margin-top: ${px(units.plus)};

  &::placeholder {
    color: #bbb;
  }
`;

export default class Repositories extends Component {
  state = {
    repositories: null,
    isLoading: false
  };

  searchRepos = throttle(async searchQuery => {
    this.setState({ isLoading: true });
    const owner = 'elastic';
    const repositories = await searchRepositories(owner, searchQuery);
    this.setState({ isLoading: false, repositories });
  }, 1000);

  onInputChange = e => {
    this.setState({ isLoading: true });
    const searchQuery = e.target.value;
    this.searchRepos(searchQuery);
  };

  componentDidMount() {
    this.setState({ isLoading: true });
    this.searchRepos('');
  }

  incrementRepoCounter = repoId => {
    incrementRepoCounter(repoId);
  };

  render() {
    const { repositories, isLoading } = this.state;

    return (
      <div>
        <Searchbox
          onChange={this.onInputChange}
          placeholder="Search repositories..."
        />
        {isLoading && <LoadingSpinner center />}

        <div>
          {!isEmpty(repositories) &&
            repositories.map(repo => {
              return (
                <RepositoryContainer key={repo.id}>
                  <HeaderLink
                    href={`#/${repo.full_name}`}
                    onClick={() => this.incrementRepoCounter(repo.id)}
                  >
                    {repo.name}
                  </HeaderLink>

                  <div>{repo.description}</div>
                </RepositoryContainer>
              );
            })}
        </div>
      </div>
    );
  }
}
