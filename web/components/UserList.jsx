/**
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

import PropTypes from 'prop-types';
const React = require('react');

/**
 *
 * @param {object} props
 * @returns {JSX} Userlist element
 */
function UserList({ users, roles }) {
  return <div> {
    users.map((user) => {
      const usernameCSS =
      'slds-m-horizontal_x-small ' +
      'slds-m-bottom_x-small';
      const hasRole = Object.keys(roles).some((roleLabel) => roles[roleLabel]?.user?.value === user.id);
      if (user) {
        return (
          <div
            className={usernameCSS}
            style={{ wordBreak: 'break-all' }}
            key={user.id}>
            <span style={{
              float: 'left',
              width: '20px',
              display: 'inline-block'
            }}>
              {hasRole ?
                '\u{1F3A9}' :
                '\u00A0'}
            </span>
            {user.fullName ? user.fullName : user.name}
          </div>
        );
      }

      return (null);
    })
  } </div>;
}

UserList.propTypes = {
  users: PropTypes.array,
  roles: PropTypes.object
};
export default UserList;
