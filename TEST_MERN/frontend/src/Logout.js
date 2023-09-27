import React from 'react';
import { Button } from "react-bootstrap";
import "./Logout.css";

function Logout({ setRegister}) {

    const logout = () => {
        window.location.href = "/Publication";
        setRegister(false);
    }

    return (
        <div className="Logout">
            <Button variant="danger" onClick={logout}>Logout Your Account</Button>
        </div>
    );
}

export default Logout;
