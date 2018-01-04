import React, { Component } from 'react';
import isEmpty from 'lodash.isempty';
import throttle from 'lodash.throttle';
import styled from 'styled-components';
import { searchRepositories } from '../services/github';
import { LoadingSpinner, Searchbox } from './UI';

const RepositoryContainer = styled.div`
  border-bottom: 1px solid #d1d5da;
  padding-bottom: 20px;
  overflow: hidden;
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
                  <h3>
                    <a href={`#/${repo.full_name}`}>{repo.name}</a>
                  </h3>
                  <div>{repo.description}</div>
                </RepositoryContainer>
              );
            })}
        </div>
      </div>
    );
  }
}
