import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import styled from 'styled-components';
import './global.css';
import { initFirebase } from './services/firebase';
import Repositories from './components/Repositories';
import Commits from './components/Commits';
import withAuthentication from './components/withAuthentication';
import { units, px } from './variables';
initFirebase();

const Container = styled.div`
  margin-right: auto;
  margin-left: auto;
  max-width: 900px;
  position: relative;
  padding: 0 ${px(units.half)};
`;

const Routes = () => (
  <Router>
    <Container>
      <Route exact path={`/`} component={withAuthentication(Repositories)} />
      <Route
        path={`/:owner/:repoName`}
        component={withAuthentication(Commits)}
      />
    </Container>
  </Router>
);

ReactDOM.render(<Routes />, document.getElementById('root'));
