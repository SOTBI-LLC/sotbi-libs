import { getColorByName, getContrastYIQ, getInitials } from './utils';

export type MaxNumOfLetters = 1 | 2 | 3;

export interface IOptions {
  backgroundColor?: string;
  fontFamily?: string;
  maxNumOfLetters: MaxNumOfLetters;
  rounded?: boolean;
  textColor?: string;
}

export function generateAvatarSvgUrl(text: string, ops?: IOptions) {
  const bgc = (ops && ops.backgroundColor) || getColorByName(text);
  const fgc = (ops && ops.textColor) || getContrastYIQ(bgc);
  const options = {
    ...{
      backgroundColor: bgc,
      fontFamily: 'sans-serif',
      maxNumOfLetters: 2,
      rounded: true,
      textColor: fgc,
    },
    ...ops,
  } as IOptions;
  const initials = getInitials(text, options.maxNumOfLetters);
  // SVG Code
  const svgC = `<circle cx="500" cy="500" r="500" fill="${options.backgroundColor}" />`;
  const svgS = `<path fill="${options.backgroundColor}" d="M0 0h1000v1000H0z"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${
    options.rounded ? svgC : svgS
  }<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" letter-spacing="${
    initials.length > 2 ? '-25' : 0
  }" font-size="${initials.length > 2 ? 400 : 500}" fill="${options.textColor}" font-family="${
    options.fontFamily
  }">${initials}</text></svg>`;

  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
