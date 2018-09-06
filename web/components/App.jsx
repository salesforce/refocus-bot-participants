import PropTypes from 'prop-types';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import moment from 'moment';
const React=require('react');
const _ = require('lodash');
const serialize = require('serialize-javascript');
const env = require('../../config.js').env;
const config = require('../../config.js')[env];
const bdk = require('@salesforce/refocus-bdk')(config);
const botName = require('../../package.json').name;
const MIN_HATS = 0;

class App extends React.Component{
  constructor(props){
    super(props);
    this.state= {
      roomId: this.props.roomId,
      users: this.props.users,
      roles: this.props.roles,
      currentRole: this.props.currentRole,
      currentUser: this.props.currentUser,
      value: {},
      creatingRole: false,
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.toggleRtl = this.toggleRtl.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.users !== null) {
      const newUsers = _.extend(this.state.users, nextProps.users);
      this.setState({ users: newUsers });
    }
    this.setState({ roles: nextProps.roles });
    this.setState({ currentRole: nextProps.currentRole });
    const currentValues = this.state.value;
    Object.keys(nextProps.currentRole).forEach((role) => {
      if (nextProps.currentRole[role] !== undefined) {
        currentValues[role] = JSON.parse(nextProps.currentRole[role].value);
      }
    });
    this.setState({ value: currentValues });
  }

  handleSelectChange (role) {
    return (inputValue) => {
      let values = inputValue || null;
      if ((values) && (values.role === undefined)) {
        values.label = values.value;
      }
      const { roomId, currentUser } = this.state;
      const newValue = this.state.value;
      newValue[role.label] = values;
      this.setState({ value: newValue });
      const currentRole = this.state.currentRole;
      const eventType = {
        'type': 'Event',
        'newUser': values,
      };
      values = values ? values : '';
      const outputValue = values.label ? values.label : '';
      if (currentRole[role.label]) {
        bdk.changeBotData(currentRole[role.label].id,
          serialize(values))
          .then((o) => {
            if (o.ok) {
              bdk.createEvents(
                roomId,
                (currentUser.fullName ?
                  currentUser.fullName :currentUser.name) +
                ' has changed ' + role.label +
                ' to ' + outputValue + ' at ' +
                moment().format('YYYY-MM-DD HH:mm Z'),
                eventType
              );
            }
          });
      } else {
        bdk.createBotData(
          this.props.roomId,
          botName,
          'participants' + role.label,
          serialize(values)
        )
          .then((o) => {
            if (o.ok) {
              bdk.createEvents(
                roomId,
                (currentUser.fullName ?
                  currentUser.fullName : currentUser.name) +
                ' has added ' + outputValue +
                ' to ' + role.label + ' at ' +
                moment().format('YYYY-MM-DD HH:mm Z'),
                eventType
              );
            }
          });
      }
    };
  }

  toggleRtl (e) {
    const rtl = e.target.checked;
    this.setState({ rtl });
  }

  renderPrompt (role) {
    return (inputValue) => {
      return `Add '${inputValue}' to ${role.label}`;
    };
  }

  render() {
    const { users, value, roles, currentRole, creatingRole } = this.state;

    const divider = 'slds-m-horizontal_x-small ' +
      'slds-m-vertical_small ' +
      'slds-border_bottom';

    return (
      <div>
        {roles.map((role) => {
          const options = [];
          Object.keys(users).forEach((id) => {
            options.push({
              label: users[id].fullName ? users[id].fullName : users[id].name,
              email: users[id].name,
              value: users[id].id,
              role: role.label,
            });
            if (!value[role.label]) {
              value[role.label] = currentRole[role.label] === undefined ? '' :
                JSON.parse(currentRole[role.label].value);
            }
          });
          return (
            <div className="slds-m-horizontal_small slds-m-bottom_small"
              key={role.label}>
              <div
                className="slds-text-body_small slds-m-bottom_xx-small">               
                <button className="slds-button slds-m-right_x-small slds-required" style={{lineHeight: 'inherit', float: 'left'}}>x</button>
                <div>{role.name}
              </div>
              </div>

              <Select.Creatable
                onChange={this.handleSelectChange(role)}
                options={options}
                placeholder={ 'Choose ' + role.label }
                rtl={this.state.rtl}
                value={value[role.label]}
                promptTextCreator={this.renderPrompt(role)}
                newOptionCreator={(newOption) => {
                  return {
                    label: newOption.label,
                    value: newOption.label + ' (External)'
                  };
                }}
                clearable={true}
              />
            </div>
          );
        })}
        <div
          className="slds-m-horizontal_small slds-m-bottom_small">
          {creatingRole &&
            <div>
              <section className="slds-modal slds-fade-in-open">
                <div className="slds-modal__container">
                  <header className="slds-modal__header">
                    <h2 className="slds-text-heading_medium slds-hyphenate">
                      Create New Role
                    </h2>
                  </header>
                  <div className="slds-modal__content slds-p-around_medium">
                    <div className="slds-form-element slds-grid">
                      <div className="slds-col slds-p-horizontal_xx-small">
                        <input type="text"
                          id="roleName"
                          className="slds-input" 
                          placeholder="Role Name"/>
                      </div>
                      <div className="slds-col slds-p-horizontal_xx-small">
                        <input type="text"
                          id="roleLabel"
                          className="slds-input"
                          placeholder="Role Label"/>
                      </div>
                    </div>
                  </div>
                  <footer className="slds-modal__footer">
                    <button
                      className="slds-button slds-button_neutral"
                      onClick = {() => this.setState({creatingRole: false})}>
                      Cancel
                    </button>
                    <button
                      className="slds-button slds-button_brand"
                      onClick={() => {
                        this.props.createRole();
                        this.setState({ creatingRole: false });
                      }}>
                      Create Role
                    </button>
                  </footer>
                </div>
              </section>
              <div className="slds-backdrop slds-backdrop_open"></div>
            </div>
          }
          <div className="slds-m-horizontal_small slds-m-bottom_small">
            <span className="slds-col">
              <button
                className="slds-button slds-align_absolute-center"
                onClick={ () => this.setState({ creatingRole: true }) }>
                + Create New Role
              </button>
            </span>
          </div>
        </div>
        <div className={divider}></div>
        {Object.keys(users).map((id) => {
          const usernameCSS =
            'slds-m-horizontal_x-small ' +
            'slds-m-bottom_x-small';
          const hats = serialize(value).indexOf(id);
          if (users[id].isActive) {
            return (
              <div
                className={usernameCSS}
                style={{ wordBreak: 'break-all' }}
                key={id}>
                <span style={{
                  float: 'left',
                  width: '20px',
                  display: 'inline-block'
                }}>
                  {hats > MIN_HATS ?
                    '\u{1F3A9}':
                    '\u00A0'}
                </span>
                {users[id].fullName ? users[id].fullName : users[id].name}
              </div>
            );
          }

          return (null);
        })}
      </div>
    );
  }
}

App.propTypes={
  roomId: PropTypes.number,
  users: PropTypes.object,
  roles: PropTypes.array,
  currentRole: PropTypes.object,
  currentUser: PropTypes.object,
};

module.exports=App;
