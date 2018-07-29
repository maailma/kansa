function ballotData({ member_number, legal_name, email, city, state, country, badge_name, paper_pubs, token }) {
  const address = paper_pubs && paper_pubs.address.split(/[\n\r]+/) || ['']
  return {
    info: {
      Title: 'Ballot for ' + legal_name,
      Author: 'Worldcon 77 Site Selection',
      Creator: 'members.worldcon.fi'
    },
    fields: {
      'Name': legal_name,
      'Address': address[0],
      'Address (2nd line)': address.length > 1 ? address.slice(1).join('; ') : '',
      'City': city || '',
      'Country': paper_pubs ? paper_pubs.country : country || '',
      'Membership number': member_number || '........',
      'Voting token': token,
      'E-mail': email,
      'State/Province/Prefecture': state || '',
      'Badge name': badge_name || '',
      'Voting fee': 'Yes',
      'Member': member_number ? 'Yes' : 'No'
    }
  }
}

module.exports = ballotData
