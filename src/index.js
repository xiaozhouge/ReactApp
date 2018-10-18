import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/reset.less';
import App from './pages/App';
import { BrowserRouter as Router, Route } from 'react-router-dom'
// import registerServiceWorker from './registerServiceWorker';
ReactDOM.render((
    <Router >
      <div>
         <Route path="/"  component={App}/>
      </div>
   </Router>
  ) , document.getElementById('root'));
// registerServiceWorker();
