import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import styled from 'styled-components';
import './global.css';
import { initFirebase } from './services/firebase';
import Repositories from './components/Repositories';
import Commits from './components/Commits';
import withAuthentication from './components/withAuthentication';
initFirebase();

const Container = styled.div`
  margin-right: auto;
  margin-left: auto;
  width: 900px;
  position: relative;
`;

const Routes = () => (
  <Router>
    <Container>
      <Route exact path="/" component={withAuthentication(Repositories)} />
      <Route path="/:owner/:repoName" component={withAuthentication(Commits)} />
    </Container>
  </Router>
);

ReactDOM.render(<Routes />, document.getElementById('root'));
