import React from 'react';
import styled from 'styled-components';
import { units, px, colors } from '../variables';
import Checkbox from './Checkbox';
import { getBoolParam } from '../services/url';
import { toQuery, fromQuery } from '../services/url';

const Container = styled.div`
  display: flex;
  padding: ${px(units.half)};
  justify-content: center;
`;

const ClearButton = styled.span`
  border: 1px solid ${colors.black};
  padding: 4px;
  cursor: pointer;
  background-color: ${colors.blue};
  color: #fff;
  border-radius: 4px;

  :hover {
    background-color: #005cac;
  }
`;

export default class Settings extends React.Component {
  updateSearch(nextParams) {
    const { location, history } = this.props;
    history.replace({
      ...location,
      search: fromQuery({
        ...toQuery(location.search),
        ...nextParams
      })
    });
  }

  render() {
    const { location } = this.props;
    const authorId = toQuery(location.search).author;
    return (
      <Container>
        {
          <Checkbox
            checked={getBoolParam(location, 'own')}
            label="Commits by me"
            onChange={isChecked =>
              this.updateSearch({ own: isChecked, author: null })
            }
          />
        }

        <Checkbox
          checked={getBoolParam(location, 'missingBackport')}
          label="Commits without backports"
          onChange={isChecked =>
            this.updateSearch({ missingBackport: isChecked })
          }
        />

        {authorId && (
          <ClearButton onClick={() => this.updateSearch({ author: null })}>
            Clear selection
          </ClearButton>
        )}
      </Container>
    );
  }
}
