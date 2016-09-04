import React from 'react'

export default ({ children, route: { title } }) => <div>
  <h1>{title}</h1>
  {children}
</div>;
