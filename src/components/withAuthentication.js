import React, { Component } from 'react';
import { login, onAuthChangeState } from '../services/github';
import isEmpty from 'lodash.isempty';
import { LoadingSpinner } from './UI';

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
          {!isLoading && !user && <button onClick={login}>Login</button>}
          {isLoading && <LoadingSpinner />}
          {isLoggedIn && <WrappedComponent {...this.props} />}
        </div>
      );
    }
  }

  return Authenticate;
}

export default withAuthentication;
