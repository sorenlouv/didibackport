import React from 'react';
import styled from 'styled-components';
import logo from '../spinner.svg';
import { units, px, fontSizes } from '../variables';

export function LoadingSpinner({ center, ...props }) {
  return (
    <img
      src={logo}
      alt="Loading..."
      {...props}
      style={
        center
          ? {
              top: '100px',
              left: '50%',
              position: 'absolute',
              transform: 'translateX(-50%)'
            }
          : {}
      }
    />
  );
}

export const Searchbox = styled.input`
  font-size: ${fontSizes.xlarge};
  padding: ${px(units.quarter)};
  height: ${px(units.double)};
  line-height: ${px(units.double)};
  color: #24292e;
  vertical-align: middle;
  background-color: #fff;
  border: 1px solid #d1d5da;
  border-radius: ${px(units.quarter)};
  outline: none;
  width: calc(100% - 10px);
  margin: 20px 0;

  &::placeholder {
    color: #bbb;
  }
`;

export const Header = styled.div`
  font-size: ${fontSizes.xlarge};
  font-weight: 600;
`;
