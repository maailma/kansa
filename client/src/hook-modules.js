import PropTypes from 'prop-types'
import React from 'react'

import { ModuleConsumer } from './context'
import { ConfigConsumer } from './lib/config-context'
import { person as MemberPropType } from './membership/proptypes'

const HookModules = ({ args = [], base = [], children, hook, member }) => (
  <ConfigConsumer>
    {({ getMemberAttr }) => (
      <ModuleConsumer>
        {modules => {
          if (member) {
            const attr = getMemberAttr(member)
            args = [attr, member].concat(args)
          }
          const res = modules.reduce(
            (res, mod) =>
              mod[hook] ? res.concat(mod[hook].apply(null, args)) : res,
            base
          )
          res.sort((a, b) => ((a && a.key) < (b && b.key) ? -1 : 1))
          return children(res)
        }}
      </ModuleConsumer>
    )}
  </ConfigConsumer>
)

HookModules.propTypes = {
  args: PropTypes.array,
  base: PropTypes.array,
  children: PropTypes.func.isRequired,
  hook: PropTypes.string.isRequired,
  member: MemberPropType
}

export default HookModules
