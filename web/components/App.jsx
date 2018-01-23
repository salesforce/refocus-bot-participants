import PropTypes from 'prop-types';
const React=require('react');
const env = process.env.NODE_ENV || 'dev';

class App extends React.Component{
  constructor(props){
    super(props);
    this.state= {
      roomId: this.props.roomId,
      users: this.props.users,
    };
  }

  // componentWillReceiveProps(nextProps) {
  // }

  render() {
    return (
      <div>
      </div>
    );
  }
}

App.propTypes={
  roomId: PropTypes.number,
  users: PropTypes.array,
};

module.exports=App;
