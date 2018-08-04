export default function getMemberPrice(data, prevType, nextType, addPaperPubs) {
  const memberTypes = data && data.getIn(['new_member', 'types'])
  if (!memberTypes) return -1
  const a0 = (prevType && memberTypes.getIn([prevType, 'amount'])) || 0
  const a1 = memberTypes.getIn([nextType, 'amount']) || 0
  const pp =
    (addPaperPubs &&
      data.getIn(['paper_pubs', 'types', 'paper_pubs', 'amount'])) ||
    0
  return a1 - a0 + pp
}
