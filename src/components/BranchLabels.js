import React from 'react';
import styled from 'styled-components';
import isEmpty from 'lodash.isempty';
import { units, px } from '../variables';

const BranchLabel = styled.div`
  display: inline-block;
  padding: 1px ${px(units.quarter)};
  border-radius: ${px(units.quarter)};
  background: #009800;
  margin-right: ${px(units.half)};

  a {
    color: #ffffff;
    text-decoration: none;
  }
`;

function BranchLabels({ owner, repoName, commit }) {
  if (isEmpty(commit)) {
    return null;
  }

  return (
    <div>
      {commit.branches.map(branch => (
        <BranchLabel key={branch.name}>
          <a
            href={`https://github.com/${owner}/${repoName}/commit/${
              branch.commit
            }`}
          >
            {branch.name}
          </a>{' '}
        </BranchLabel>
      ))}
    </div>
  );
}

export default BranchLabels;
