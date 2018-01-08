import React, { Component } from 'react';
import { login, onAuthChangeState } from '../services/firebase';
import isEmpty from 'lodash.isempty';
import { LoadingSpinner } from './UI';
import octocatIcon from '../octocat-icon.png';
import styled from 'styled-components';
import { units, px, unit, borderRadius } from '../variables';

const GithubButton = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  font-size: 30px;
  width: ${px(unit * 19)};
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: ${borderRadius};
  cursor: pointer;
  margin: ${px(units.double)} auto;
  user-select: none;
  color: #333;
`;

function withAuthentication(WrappedComponent) {
  class Authenticate extends Component {
    state = {
      user: null,
      isLoading: false
    };

    componentDidMount() {
      this.setState({ isLoading: true });
      onAuthChangeState(user => {
        this.setState({ user, isLoading: false });
      });
    }

    render() {
      const { user, isLoading } = this.state;
      const isLoggedIn = !isEmpty(user);
      return (
        <div>
          {!isLoading &&
            !user && (
              <GithubButton onClick={login}>
                <div>Sign In With GitHub</div>
                <img width="25" src={octocatIcon} alt="Login with Github" />
              </GithubButton>
            )}
          {isLoading && <LoadingSpinner center />}
          {isLoggedIn && <WrappedComponent {...this.props} />}
        </div>
      );
    }
  }

  return Authenticate;
}

export default withAuthentication;
