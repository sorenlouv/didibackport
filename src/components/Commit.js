import React from 'react';
import { LoadingSpinner, Header } from './UI';
import timeagojs from 'timeago.js';
import styled from 'styled-components';
import { units, px } from '../variables';
import BranchLabels from './BranchLabels';

const timeago = timeagojs();

const CommitContainer = styled.div`
  display: flex;
  padding: ${px(units.minus)};
  border-bottom: 1px solid #ccc;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 ${px(units.minus)};
`;

const Avatar = styled.img`
  border-radius: ${px(units.quarter)};
`;

export default function Commit({ owner, repoName, commit }) {
  const { shortMessage, prNumber } = parseCommitMessage(commit.commit.message);
  return (
    <CommitContainer key={commit.sha}>
      <div>
        <Avatar
          src={`${commit.author.avatar_url}&s=72`}
          alt={commit.commit.author.name}
        />
      </div>
      <RightColumn>
        <Header>
          <a
            title={commit.commit.message}
            href={`https://github.com/${owner}/${repoName}/commit/${
              commit.sha
            }`}
          >
            {shortMessage}
          </a>
          (<a href={`https://github.com/${owner}/${repoName}/pull/${prNumber}`}>
            #{prNumber}
          </a>)
        </Header>

        <BranchLabels owner={owner} repoName={repoName} commit={commit} />

        <div>
          {commit.commit.author.name} committed{' '}
          <span title={commit.commit.committer.date}>
            {timeago.format(commit.commit.committer.date)}
          </span>
        </div>
      </RightColumn>
    </CommitContainer>
  );
}

function parseCommitMessage(message) {
  const [shortMessage, prNumber] = message
    .split('\n\n')[0]
    .split(/\(#(\d+)\)$/);

  return { shortMessage, prNumber };
}
