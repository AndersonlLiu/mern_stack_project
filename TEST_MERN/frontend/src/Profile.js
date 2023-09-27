import React, { useState } from 'react';
import { Button, Form, Alert } from "react-bootstrap";
import "./Profile.css";

function Profile({ setRegister, currentUser }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('danger');

    const logout = () => {
        window.location.href = "/Publication";
        setRegister(false);
    }

    const handleChangePassword = async () => {
        try {
            console.log('currentUser:',currentUser);
            const response = await fetch(`https://publicationmolalab.wl.r.appspot.com/posts/users/${currentUser}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const result = await response.json();

            if (response.status === 200) {
                setAlertVariant('success');
            } else {
                setAlertVariant('danger');
            }
            
            setMessage(result.message);
        } catch (error) {
            setAlertVariant('danger');
            setMessage("An error occurred while changing the password.");
        }
    }

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch(`https://publicationmolalab.wl.r.appspot.com/posts/users/${currentUser}/delete`, {
                method: 'DELETE'
            });

            if (response.status === 200) {
                logout();
            } else {
                const result = await response.json();
                setAlertVariant('danger');
                setMessage(result.message || "Failed to delete the account.");
            }
        } catch (error) {
            setAlertVariant('danger');
            setMessage("An error occurred while deleting the account.");
        }
    }

    return (
        <div className="Profile">
            <Form>
                <Form.Group>
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>New Password</Form.Label>
                    <Form.Control type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </Form.Group>
                <Button variant="primary" onClick={handleChangePassword} className='mt-3'>Change Password</Button>
                
            </Form>
            {message && <Alert variant={alertVariant} className="mt-3">{message}</Alert>}

            <Button variant="warning" className="ml-2 mt-3" onClick={handleDeleteAccount}>Delete Your Account</Button>
        </div>
    );
}

export default Profile;
