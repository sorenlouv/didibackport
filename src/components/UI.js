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
              top: px(units.double * 3),
              left: '50%',
              position: 'absolute',
              transform: 'translateX(-50%)'
            }
          : {}
      }
    />
  );
}

export const Header = styled.div`
  font-size: ${fontSizes.large};
  font-weight: 600;
`;
