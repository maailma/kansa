import getMuiTheme from 'material-ui/styles/getMuiTheme'

import '../img/bg-aurora.jpg'
import '../img/ursa.png'
import './theme.css'
import {
  accent1Color,
  primary1Color,
  primary2Color,
  disabledColor
} from './colors'

export const theme = getMuiTheme({
  fontFamily: '"Open Sans", sans-serif',
  card: {
    titleColor: accent1Color,
    subtitleColor: disabledColor
  },
  palette: { primary1Color, primary2Color, accent1Color, disabledColor },
  textField: {
    errorColor: accent1Color
  }
})
