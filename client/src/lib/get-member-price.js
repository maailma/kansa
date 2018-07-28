export default function getMemberPrice(data, prevType, nextType, addPaperPubs) {
  const memberTypes = data && data.getIn(['new_member', 'types'])
  if (!memberTypes) return -1
  const t0 = prevType && memberTypes.find(t => t.get('key') === prevType)
  const t1 = memberTypes.find(t => t.get('key') === nextType)
  const pp = addPaperPubs && data.getIn(['paper_pubs', 'types', 0, 'amount']) || 0
  return (t1 && t1.get('amount') || 0) - (t0 && t0.get('amount') || 0) + pp
}
