import React from 'react';
import get from 'lodash.get';
import styled from 'styled-components';
import { Header } from './UI';
import timeagojs from 'timeago.js';
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
  width: 72px;
`;

export default function Commit({ owner, repoName, commit }) {
  const { shortMessage, prNumber } = parseCommitMessage(commit);
  return (
    <CommitContainer key={commit.oid}>
      <div>
        <Avatar
          src={`${commit.author.avatarUrl}&s=72`}
          alt={commit.author.name}
        />
      </div>
      <RightColumn>
        <Header>
          <a
            title={commit.message}
            href={`https://github.com/${owner}/${repoName}/commit/${
              commit.oid
            }`}
          >
            {shortMessage}
          </a>
          {prNumber && (
            <span>
              (
              <a
                href={`https://github.com/${owner}/${repoName}/pull/${prNumber}`}
              >
                #{prNumber}
              </a>
              )
            </span>
          )}
        </Header>

        <BranchLabels owner={owner} repoName={repoName} commit={commit} />

        <div>
          <a
            href={`#/${owner}/${repoName}?author=${get(
              commit.author.user,
              'id'
            )}`}
            style={{ color: '#000000' }}
          >
            {commit.author.name}
          </a>{' '}
          committed{' '}
          <span title={commit.author.date}>
            {timeago.format(commit.author.date)}
          </span>
        </div>
      </RightColumn>
    </CommitContainer>
  );
}

function parseCommitMessage(commit) {
  const prNumber = get(commit.message.split(/\n\n/)[0].match(/\(#(\d+)\)$/), 1);
  const shortMessage = commit.messageHeadline.split(/\(#(\d+)\)/)[0];
  return { shortMessage, prNumber };
}
