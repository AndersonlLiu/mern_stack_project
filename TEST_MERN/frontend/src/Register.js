import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import "./Register.css";


function Register({setRegister, setCurrentUser}) {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isCompletion = queryParams.get('complete') === 'true';
    const token = queryParams.get('token');
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleEmailSubmission = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://publicationmolalab.wl.r.appspot.com/posts/users/requestEmailConfirmation', { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error occurred.');
        }
    };

    const handleCompletion = async (e) => {
        e.preventDefault();
        try {
            setRegister(true);
            const response = await axios.post(`https://publicationmolalab.wl.r.appspot.com/posts/users/completeRegistration/${token}`, { password });
            setMessage(response.data.message);
            console.log(response.data._id);
            setCurrentUser(response.data._id);
            navigate('/Publication');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error occurred.');
        }
    };

    if (isCompletion) {
        return (
            <div className='Register'>
                <h2>Complete your Registration</h2>
                <Form onSubmit={handleCompletion}>
                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </Form.Group>
                    <Button type="submit" className='mt-2'>Complete Registration</Button>
                </Form>
                {message && <p className='message'>{message}</p>}
            </div>
        );
    } else {
        return (
            <div className='Register'>
                <Form onSubmit={handleEmailSubmission}>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </Form.Group>
                    <Button type="submit" className='mt-3'>Register</Button>
                </Form>
                {message && <p className='message'>{message}</p>}
            </div>
        );
    }
}

export default Register;
