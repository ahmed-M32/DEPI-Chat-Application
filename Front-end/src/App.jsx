/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Route,Routes,BrowserRouter } from 'react-router-dom';
import HomePage from "./pages/hamepage.jsx"
import Login from "./pages/login.jsx"
import Signup from './pages/signup.jsx';



function App() {
  

  return (
	  <BrowserRouter>
	  <Routes>
	  	<Route path='/'  element={<Signup/>}/>
	  	<Route path='/home' element={<HomePage/>}/>
		<Route path='/login' element = {<Login/>}></Route>
	  </Routes>

	  </BrowserRouter>
  );
}

export default App;
