import React from 'react';
import './App.css';

// put all necessary body elements onto page
class Body extends React.Component{
  render() {
    return (
      <main>
        <p>Welcome to the Image Processing Toolkit</p>
      </main>
    );
  }
}

// put all necessary header elements onto webpage
class Header extends React.Component{
  render() {
    return (
      <header className="head">
        <h1>Image Processing Toolkit!</h1>
      </header>
    );
  }
}

function App() {
  return (
    <div className="App-page">
      <div className="App-head">
        <Header />
      </div>
      <div className="App-body">
        <Body />
      </div>
    </div>
  );
}

export default App;
