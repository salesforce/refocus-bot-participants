import React, { useState } from 'react';
import PropTypes from 'prop-types';
import RoleManager from '../state/RoleManager';
const env = require('../../config.js').env;
const config = require('../../config.js')[env];
const botName = require('../../package.json').name;
const bdk = require('@salesforce/refocus-bdk')(config, botName);
const roleManager = new RoleManager(bdk, botName);

const FALSE = 0;
const errorTexts = ['Error, please provide a role name',
  'Error, please do not include spaces in role label',
  'Error, a role with this name/label already exists'];

/**
 * @returns {JSX} modal element
 */
function CreateRoleModal({ setVisible }) {
  const [error, setError] = useState(0);
  const [newRoleNameText, setNewRoleNameText] = useState('');
  const [newRoleLabelText, setNewRoleLabelText] = useState('');

  return (
    <div style={{ minHeight: '200px' }}>
      <section className="slds-modal slds-fade-in-open">
        <div className="slds-modal__container">
          <header className="slds-modal__header">
            <h2 className="slds-text-heading_medium slds-hyphenate">
            Create New Role
            </h2>
          </header>
          <div className="slds-modal__content slds-p-around_medium">
            {
              error !== FALSE &&
            <div id="errorText"
              className="slds-text-color_error slds-text-align_center">
              {errorTexts[error - 1]}
            </div>
            }
            <div className="slds-form-element slds-grid">
              <div className="slds-col slds-p-horizontal_xx-small">
                <input type="text"
                  id="roleName"
                  className="slds-input"
                  value={newRoleNameText}
                  onChange={(e) => setNewRoleNameText(e.target.value)}
                  placeholder="Role Name"/>
              </div>
              <div className="slds-col slds-p-horizontal_xx-small">
                <input type="text"
                  id="roleLabel"
                  className="slds-input"
                  value={newRoleLabelText}
                  onChange={(e) => setNewRoleLabelText(e.target.value)}
                  placeholder="Role Label"/>
              </div>
            </div>
          </div>
          <footer className="slds-modal__footer">
            <button
              className="slds-button slds-button_neutral"
              onClick={() => setVisible(false)}>
            Cancel
            </button>
            <button
              className="slds-button slds-button_brand"
              onClick={() => {
                roleManager.createRole(newRoleNameText, newRoleLabelText).then((result) => {
                  setError(result);
                  setVisible(result !== 0);
                });
              }}>
            Create Role
            </button>
          </footer>
        </div>
      </section>
      <div className="slds-backdrop slds-backdrop_open"></div>
    </div>
  );
}

CreateRoleModal.propTypes = {
  setVisible: PropTypes.func
};

export default CreateRoleModal;
