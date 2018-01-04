import React, { Component } from 'react';
import { login, onAuthChangeState } from '../services/firebase';
import isEmpty from 'lodash.isempty';
import { LoadingSpinner } from './UI';
import githubLoginButton from '../github-login-button.png';

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
              <div style={{ textAlign: 'center' }}>
                <img
                  style={{ cursor: 'pointer' }}
                  src={githubLoginButton}
                  alt="Login with Github"
                  onClick={login}
                />
              </div>
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
