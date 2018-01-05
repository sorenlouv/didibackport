import React from 'react';
import styled from 'styled-components';
import { units, px } from '../variables';

const ContainerLabel = styled.label`
  display: flex;
  align-items: center;
  user-select: none;
  margin-right: ${px(units.half)};
`;

export default function Checkbox({ checked, label, onChange }) {
  return (
    <ContainerLabel>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <div>{label}</div>
    </ContainerLabel>
  );
}
