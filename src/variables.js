// Units
export const unit = 16;
export const units = {
  unit,
  eighth: unit / 8,
  quarter: unit / 4,
  half: unit / 2,
  minus: unit * 0.75,
  plus: unit * 1.5,
  double: unit * 2,
  triple: unit * 3,
  quadruple: unit * 4
};

export function px(value) {
  return `${value}px`;
}

export function pct(value) {
  return `${value}%`;
}

// Styling
export const borderRadius = '5px';
export const colors = {};

// Font sizes
export const fontSize = '14px';
export const fontSizes = {
  tiny: '10px',
  small: '12px',
  large: '16px',
  xlarge: '18px',
  xxlarge: '20px',
  xxxlarge: '30px'
};

export function truncate(width) {
  return `
      max-width: ${width};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
}
