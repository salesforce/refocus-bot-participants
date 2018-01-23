import PropTypes from 'prop-types';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
const React=require('react');
const env = process.env.NODE_ENV || 'dev';
const config = require('../../config.js')[env];
const bdk = require('@salesforce/refocus-bdk')(config);

class App extends React.Component{
  constructor(props){
    super(props);
    this.state= {
      roomId: this.props.roomId,
      users: this.props.users,
      value: [],
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.toggleRtl = this.toggleRtl.bind(this);
  }

  // componentWillReceiveProps(nextProps) {
  // }

  handleSelectChange (value) {
    const values = value.split(',');
    if (Array.isArray(values)) {
      this.setState({ value: values });
    } else {
      this.setState({ value: [values] });
    }
  }

  toggleRtl (e) {
    const rtl = e.target.checked;
    this.setState({ rtl });
  }

  render() {
    const options = ['test', 'test2'];

    return (
      <div>
        <Select
          multi
          onChange={this.handleSelectChange}
          options={options}
          placeholder="Choose Incident Commander"
          rtl={this.state.rtl}
          simpleValue
          value={this.state.value}
        />
      </div>
    );
  }
}

App.propTypes={
  roomId: PropTypes.number,
  users: PropTypes.array,
};

module.exports=App;
