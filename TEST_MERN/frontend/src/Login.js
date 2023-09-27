import React, { useState } from 'react';
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import "./Login.css";

export default function Login({setRegister, setCurrentUser, setIsUserAdmin}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    
    const handleSubmit = (e) => {
        const configuration = {
            method: "post",
            url: "https://publicationmolalab.wl.r.appspot.com/posts/users/login",
            data: {
              email,
              password,
            },  
        };
        axios(configuration)
            .then((result) => {
                setRegister(true);
                setCurrentUser(result.data._id);
                setIsUserAdmin(result.data.isAdmin);
                navigate('/Publication');
                //console.log(result);
                //console.log(result.data._id);
                //console.log(result.data.isAdmin);
            })
            .catch((error) => {
                error = new Error();
            });
        //window.location.href = "/";
        // prevent the form from refreshing the whole page
        //window.location.href = "/Publication";
        e.preventDefault();
      }
    return (
        <>
        <Form onSubmit={(e)=>handleSubmit(e)} className="login-form">
            {/* email */}
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                />
            </Form.Group>

            {/* password */}
            <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
            </Form.Group>

            {/* submit button */}
            <Button
                variant="primary"
                type="submit"
                onClick={(e) => handleSubmit(e)}
                className = "mt-3"
            >
            Login
            </Button>
        </Form></>
    )
}