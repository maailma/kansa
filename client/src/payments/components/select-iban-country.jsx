import React from 'react'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'

export const ibanCountries = {
  Albania: 'AL', Algeria: 'DZ', Andorra: 'AD', Angola: 'AO', Austria: 'AT', Azerbaijan: 'AZ', Bahrain: 'BH',
  Belarus: 'BY', Belgium: 'BE', Benin: 'BJ', 'Bosnia and Herzegovina': 'BA', Brazil: 'BR',
  'British Virgin Islands': 'VG', Bulgaria: 'BG', 'Burkina Faso': 'BF', Burundi: 'BI', Cameroon: 'CM',
  'Cape Verde': 'CV', Congo: 'CG', 'Costa Rica': 'CR', Croatia: 'HR', Cyprus: 'CY', 'Czech Republic': 'CZ',
  Denmark: 'DK', 'Dominican Republic': 'DO', Egypt: 'EG', Estonia: 'EE', 'Faroe Islands': 'FO', Finland: 'FI',
  France: 'FR', Gabon: 'GA', Georgia: 'GE', Germany: 'DE', Gibraltar: 'GI', Greece: 'GR', Greenland: 'GL',
  Guatemala: 'GT', Guernsey: 'GG', Hungary: 'HU', Iceland: 'IS', Iran: 'IR', Iraq: 'IQ', Ireland: 'IE',
  'Isle of Man': 'IM', Israel: 'IL', Italy: 'IT', 'Ivory Coast': 'CI', Jersey: 'JE', Jordan: 'JO',
  Kazakhstan: 'KZ', Kosovo: 'XK', Kuwait: 'KW', Latvia: 'LV', Lebanon: 'LB', Liechtenstein: 'LI',
  Lithuania: 'LT', Luxembourg: 'LU', Macedonia: 'MK', Madagascar: 'MG', Mali: 'ML', Malta: 'MT',
  Mauritania: 'MR', Mauritius: 'MU', Moldova: 'MD', Monaco: 'MC', Montenegro: 'ME', Mozambique: 'MZ',
  Netherlands: 'NL', Norway: 'NO', Pakistan: 'PK', 'Palestine, State of': 'PS', Poland: 'PL', Portugal: 'PT',
  Qatar: 'QA', Romania: 'RO', 'Saint Lucia': 'LC', 'San Marino': 'SM', 'Sao Tome and Principe': 'ST',
  'Saudi Arabia': 'SA', Senegal: 'SN', Serbia: 'RS', Seychelles: 'SC', Slovakia: 'SK', Slovenia: 'SI',
  Spain: 'ES', Sweden: 'SE', Switzerland: 'CH', 'Timor-Leste': 'TL', Tunisia: 'TN', Turkey: 'TR',
  Ukraine: 'UA', 'United Arab Emirates': 'AE', 'United Kingdom': 'GB'
}

const items = Object.keys(ibanCountries).map(label => {
  const value = ibanCountries[label]
  return <MenuItem key={value} value={value} primaryText={label} />
})

export default (props) => <SelectField {...props}>{items}</SelectField>
