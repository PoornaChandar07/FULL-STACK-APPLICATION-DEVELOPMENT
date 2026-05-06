import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">

        <img src={logo} className="App-logo" alt="logo" />

        <h1 className="text-gradient">Welcome to React</h1>

        <p className="text-muted">
          Build something amazing with modern React and advanced styling.
        </p>

        <div className="card">
          <p>Edit <code>src/App.js</code> and save to reload.</p>
          <div className="flex-center mt-2" style={{ gap: '12px' }}>
            
              className="btn btn-primary"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
            
              className="btn btn-outline"
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              React Docs
            </a>
          </div>
        </div>

        
          className="App-link mt-2"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more →
        </a>

      </header>
    </div>
  );
}

export default App;