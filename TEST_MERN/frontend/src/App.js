import React, { useState, useEffect, useRef  } from 'react';
import "./App.css";
import './fonts.css';
import Register from "./Register";
import Login from "./Login";
import Profile from './Profile';
import Admin from './Admin';
import Pub from './pub';
import Logout from './Logout';
import { BrowserRouter as Router, Route, Link, Routes, useLocation, useNavigate } from "react-router-dom";


function Subtitle() {
  const location = useLocation();
  const currentRoute = location.pathname;
  let pageTitle;

  if (currentRoute === '/Publication') {
    pageTitle = 'Publications';
  } else if (currentRoute === '/Register') {
    pageTitle = 'Register';
  } else if (currentRoute === '/Login') {
    pageTitle = 'Log In';
  } else if (currentRoute === '/Profile') {
    pageTitle = 'Profile';
  } else if (currentRoute === '/Admin') {
    pageTitle = 'Admin';
  } 
  else if (currentRoute === '/Logout') {
    pageTitle = 'Log Out';
  }else {
    pageTitle = 'Default Page Title';
  }

  return (
    <div className="subtitle-container">
      <h1>{pageTitle}</h1>
    </div>
  );
}

function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname === "/") {
      navigate("/Publication");
    }
  }, [navigate]);

  return null;
}

function MobileNavMenu({ register, isUserAdmin }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const yearSelectElement = document.querySelector('.year_select');
    const typeSelectElement = document.querySelector('.type_select');
    const topicSelectElement = document.querySelector('.topic_select');
    const searchInputElement = document.querySelector('.search_input');
    if (yearSelectElement) {
      if (isOpen) {
        yearSelectElement.classList.remove('position-relative');
      } else {
        yearSelectElement.classList.add('position-relative');
      }
    }
    if (typeSelectElement) {
      if (isOpen) {
        typeSelectElement.classList.remove('position-relative');
      } else {
        typeSelectElement.classList.add('position-relative');
      }
    }
    if (topicSelectElement) {
      if (isOpen) {
        topicSelectElement.classList.remove('position-relative');
      } else {
        topicSelectElement.classList.add('position-relative');
      }
    }
    if (searchInputElement) {
      if (isOpen) {
        searchInputElement.classList.remove('position-relative');
      } else {
        searchInputElement.classList.add('position-relative');
      }
    }
  }, [isOpen]);

  const guestLinks = [
    { path: '/Publication', label: 'Publications' },
    { path: '/Login', label: 'Log In' },
    { path: '/Register', label: 'Sign Up' },
  ];

  const loggedInLinks = [
    { path: '/Publication', label: 'Publications' },
    { path: '/Profile', label: 'Profile' },
    { path: '/Logout', label: 'Log Out' },
    { path: '/Admin', label: 'Admin', restrictedToAdmin: true },
  ];

  const linksToDisplay = register ? loggedInLinks : guestLinks;

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {!isOpen && (
        <div 
          className="mobile-nav-icon" 
          onClick={() => setIsOpen(!isOpen)}
        >
          +
        </div>
      )}
      {isOpen && (
        <div className="mobile-nav-menu">
          <div 
              className="close_route" 
              style={{ position: 'absolute', top: '19px', right: '52px' }} 
              onClick={() => setIsOpen(false)}
          >
              +
          </div>
          {linksToDisplay.map(link => (
            (!link.restrictedToAdmin || (link.restrictedToAdmin && isUserAdmin)) && <Link key={link.path} to={link.path}>{link.label}</Link>
          ))}
          
        </div>
      )}
      
    </div>
  );
}

function App() {
  const [register, setRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  return (
    <Router>
      <RootRedirect />
      <div className="contain">
        <header className="header">
          <h1>Morality and Language Lab</h1>
          <MobileNavMenu register={register} isUserAdmin={isUserAdmin} />
          <nav className="navLink">
            {register ? (
              <>
                <Link to="/Publication">PUBLICATIONS</Link>
                <Link to="/Profile">PROFILE</Link>
                <Link to="/Logout">LOG OUT</Link>
                {isUserAdmin && <Link to="/Admin">ADMIN</Link>}
              </>
            ) : (
              <>
                <Link to="/Publication">PUBLICATIONS</Link>
                <Link to="/Login">LOG IN</Link>
                <Link to="/Register">SIGN UP</Link>
              </>
            )}
          </nav>
        </header>
        <h2 className="subtitle-usc">University of Southern California</h2>
        <Subtitle />
        <div className="main-content">
          <Routes>
            <Route path="/Login" element={<Login register={register} setRegister={setRegister} setCurrentUser={setCurrentUser} setIsUserAdmin={setIsUserAdmin} />} />
            <Route path="/Register" element={<Register register={register} setRegister={setRegister} setCurrentUser={setCurrentUser} />} />
            <Route path="/Profile" element={<Profile setRegister={setRegister} currentUser={currentUser} />} />
            <Route path="/Publication" element={<Pub />} />
            <Route path="/Logout" element={<Logout setRegister={setRegister} />}/>
            {isUserAdmin && <Route path="/Admin" element={<Admin currentUser={currentUser} />} />}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
