/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

import PropTypes from 'prop-types';
import UserList from './UserList.jsx';
import RoleSelector from './RoleSelector.jsx';
import CreateRoleModal from './CreateRoleModal.jsx';
import { useState } from 'react';

const React = require('react');

/**
 *
 * @param {object} props
 * @returns {JSX} App element
 */
function App({ users, roles }) {
  const [showingCreateRoleModal, setShowingCreateRoleModal] = useState(false);
  const divider = 'slds-m-horizontal_x-small ' +
    'slds-m-vertical_small ' +
    'slds-border_bottom';

  return (
    <div>
      {Object.keys(roles).map((roleLabel) => {
        const role = roles[roleLabel];
        const options = users.map((user) => {
          return ({
            label: user.fullName ? user.fullName : user.name,
            email: user.name,
            value: user.id,
            role: roleLabel,
            name: role.name
          });
        });
        return <RoleSelector roleLabel={roleLabel} role={role} options={options} key={`${roleLabel}Selector`}/>;
      })}
      <div className="slds-m-horizontal_small slds-m-bottom_small">
        {
          showingCreateRoleModal ? <CreateRoleModal setVisible={setShowingCreateRoleModal}/> : ''
        }
        <div className="slds-m-horizontal_small slds-m-bottom_small">
          <span className="slds-col">
            <button
              className="slds-button slds-align_absolute-center"
              onClick={() => setShowingCreateRoleModal(true)}>
              + Create New Role
            </button>
          </span>
        </div>
      </div>
      <div className={divider}></div>
      <UserList users={users} roles={roles}></UserList>
    </div>
  );
}

App.propTypes = {
  users: PropTypes.object,
  roles: PropTypes.array,
};

export default App;
