import React, { Component } from 'react';
import logo from '../assets/images/logo.png';
import '../less/App.less';
import $Ajax from '../utils/ajax.js'
import {Route,Switch,Link } from 'react-router-dom';
import ServerConfig from './ServerConfig';
import Home from './Home'
class App extends Component {
  componentDidMount() {
    this.getToken()
  }
  async getToken(){
    let TOKEN=await $Ajax("GenerateToken","POST","test=baba")
    sessionStorage.setItem("TOKEN",TOKEN)
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <span className="babel">DIAGRAMMER</span>
          <Link to={'/'}>home</Link>
          <Link to={'/serverConfig/'}>serverConfig</Link>
        </header>
        <Switch>
          <Route path="/serverConfig"  component={ServerConfig}/>
          <Route path="/"  component={Home}/>
        </Switch>
      </div>
    );
  }
}

export default App;
