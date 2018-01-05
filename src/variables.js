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

export const colors = {
  aqua: '#7FDBFF',
  black: '#111111',
  blue: '#0074D9',
  fuchsia: '#F012BE',
  gray: '#AAAAAA',
  green: '#2ECC40',
  lime: '#01FF70',
  maroon: '#85144B',
  navy: '#001F3F',
  olive: '#3D9970',
  orange: '#FF851B',
  purple: '#B10DC9',
  red: '#FF4136',
  silver: '#DDDDDD',
  teal: '#39CCCC',
  white: '#FFFFFF',
  yellow: '#FFDC00'
};

// Styling
export const borderRadius = '4px';

// Font sizes
export const fontSizes = {
  small: '12px',
  normal: '16px',
  large: '18px',
  xlarge: '24px'
};

export function truncate(width) {
  return `
      max-width: ${width};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
}
