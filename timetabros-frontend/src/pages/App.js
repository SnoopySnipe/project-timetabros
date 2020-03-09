import React from 'react';
import logo from '../logo.svg';
import '../styles/pages/App.css';
import SideNav from './SideNav';
import { render } from '@testing-library/react';

// function App() {
//   return (
//     // <div className="App">
//     //   <header className="App-header">
//     //     <img src={logo} className="App-logo" alt="logo" />
//     //     <p>
//     //       Edit <code>src/App.js</code> and save to reload.
//     //     </p>
//     //     <a
//     //       className="App-link"
//     //       href="https://reactjs.org"
//     //       target="_blank"
//     //       rel="noopener noreferrer"
//     //     >
//     //       Learn React
//     //     </a>
//     //   </header>

//     // </div>
//     <SideNav />
//   );
// }

class App extends React.Component {
  render() {
    return (
      <SideNav />
    );
  }
}

export default App;
