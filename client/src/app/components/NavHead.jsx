import React from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');

import { JS_ROOT } from '../../constants'
import headerBg from '../../img/header-bg.jpg'
import titleImg from '../../img/title.png'
import MemberAvatar from './MemberAvatar'

const NavAvatars = ({ currentMember, otherMembers }) => <div style={{ display: 'flex', padding: 16 }}>
  <div style={{ flexGrow: otherMembers ? 1 : 0 }}>{
    currentMember && <MemberAvatar
      member={currentMember}
      single={!otherMembers}
      size={56}
    />
  }</div>
  {otherMembers
    ? otherMembers.map((member, key) => (
        <div key={key} style={{ marginLeft: 16 }}>
          <MemberAvatar member={member} />
        </div>
      ))
    : currentMember && <div style={{
        alignItems: 'center',
        display: 'flex',
        height: 56,
        marginLeft: 16
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
        }}>{
          currentMember.get('legal_name')
        }</div>
      </div>
  }
</div>;

const NavHead = ({ currentMember, handleNav, otherMembers }) => <div
  onTouchTap={() => handleNav('/')}
  style={{
    background: `url(${JS_ROOT}${headerBg})  30% 0 / auto 100%  #337ab7`,
    color: '#fff',
    cursor: 'pointer',
  }}
>
  <div
    src={JS_ROOT + titleImg}
    style={{
      alignItems: 'center',
      display: 'flex',
      height: 56,
      justifyContent: 'center'
    }}
  >
    <img
      alt="Worldcon 75"
      src={JS_ROOT + titleImg}
      style={{ marginLeft: -16 }}
      width={160}
    />
  </div>
  <NavAvatars
    currentMember={currentMember}
    otherMembers={otherMembers}
  />
  {currentMember && otherMembers && <div style={{
    fontSize: 12,
    fontWeight: 600,
    marginTop: -12,
    padding: '0 0 16px 16px'
  }}>{currentMember.get('legal_name')}</div>}
</div>;

NavHead.propTypes = {
  currentMember: ImmutablePropTypes.map,
  handleNav: React.PropTypes.func.isRequired,
  otherMembers: ImmutablePropTypes.list
};

export default NavHead;
