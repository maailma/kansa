import getMuiTheme from 'material-ui/styles/getMuiTheme'

import './theme.css'
import '../img/ursa.png'

export const black = '#262626';
export const darkGray = '#393939';
export const midGray = '#616161';
export const bgGray = '#f3f3f3';
export const white = '#ffffff';
export const lightBlue = '#2787ea';
export const darkBlue = '#005f96';
export const orange1 = '#ff9049';
export const orange2 = '#fc7c39';

export const theme = getMuiTheme({
  fontFamily: '"Open Sans", sans-serif',
  card: {
    titleColor: orange2,
    subtitleColor: midGray
  },
});
