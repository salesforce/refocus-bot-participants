import React from 'react';
import 'react-select/dist/react-select.css';
import Select from 'react-select';
import PropTypes from 'prop-types';
import Roles from '../state/Roles';

const env = require('../../config.js').env;
const config = require('../../config.js')[env];
const botName = require('../../package.json').name;
const bdk = require('@salesforce/refocus-bdk')(config, botName);
const roleManager = new Roles(bdk, botName);

/**
 *
 * @param {string} roleLabel - Label of role being assigned eg. IC
 * @param {object} user - user object being assigned
 */
async function assignRole(roleLabel, user) {
  const success = roleManager.assignUserToRole(roleLabel, user);
  if (!success) return;

  const roomId = bdk.getRoomId();
  const eventType = { 'type': 'Event', 'newUser': user };
  const message = (user === null) ? `Role Unassigned: ${roleLabel}` :
    `Role Assigned: ${roleLabel} to ${user.label}`;

  bdk.createEvents(roomId, message, eventType);
}

/**
 * Dropdown selector component. Allows user to select a user
 * from a list.
 * @param {object} props
 * @returns {JSX} - div containing selector element.
 */
function RoleSelector({ roleLabel, role, options }) {
  return (
    <div className="slds-m-horizontal_small slds-m-bottom_small"
      key={roleLabel}>
      <div
        className="slds-text-body_small slds-m-bottom_xx-small">
        <button
          className="slds-button slds-m-right_x-small slds-required"
          style={{ lineHeight: 'inherit', float: 'left' }}
          onClick={() => roleManager.deleteRole(roleLabel)}>
          x
        </button>
        <div>{role.name}</div>
      </div>

      <Select.Creatable
        onChange={(user) => assignRole(roleLabel, user)}
        options={options}
        placeholder={'Choose ' + roleLabel}
        value={role.user}
        newOptionCreator={(newOption) => {
          return {
            label: newOption.label + ' (External)',
            email: `${newOption.label}@external.none`,
            value: newOption.label + ' (External)',
            role: roleLabel,
            name: role.name
          };
        }}
        clearable={true}
      />
    </div>
  );
}

RoleSelector.propTypes = {
  roleLabel: PropTypes.string.isRequired,
  role: PropTypes.object,
  options: PropTypes.array.isRequired
};

export default RoleSelector;
