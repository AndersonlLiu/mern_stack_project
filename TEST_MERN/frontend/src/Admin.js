import React, { useState } from 'react';
import axios from 'axios';
import { FormGroup, FormControl, Button, Form } from 'react-bootstrap';
import "./Admin.css"

function Admin() {
    const [userEmail, setUserEmail] = useState('');
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const uploadFile = async () => {
        if (!file) {
            setMessage("Please select a file first.");
            return;
        }
    
        const formData = new FormData();
        formData.append('sampleFile', file);  // 'sampleFile' matches the name expected in the backend route
    
        try {
            const response = await axios.post('http://localhost:3031/posts/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage(response.data);
        } catch (error) {
            console.log(error)
            setMessage(error.response && error.response.data ? error.response.data.message : "An error occurred during file upload.");
        }
    }
    

    const changeUserRole = async (makeAdmin) => {
        if (userEmail === 'admin@mola.lab') {
            setMessage("You can't demote this admin.");
            return;
        }

        try {
            // First, get the user ID based on the email (Assuming you have an endpoint to fetch user by email)
            const userResponse = await axios.get(`http://localhost:3031/posts/users?email=${userEmail}`);
            if (!userResponse.data || !userResponse.data._id) {
                setMessage("User not found");
                return;
            }

            if (makeAdmin && userResponse.data.isAdmin) {
                setMessage("The user is already an admin.");
                return;
            } else if (!makeAdmin && !userResponse.data.isAdmin) {
                setMessage("The user is already a normal user.");
                return;
            }

            const userId = userResponse.data._id;

            // Now, promote/demote the user based on their ID
            const response = await axios.put(`http://localhost:3031/posts/users/${userId}/admin`);

            if (makeAdmin) {
                setMessage(`User ${userEmail} has been promoted to admin.`);
            } else {
                setMessage(`User ${userEmail} has been demoted.`);
            }

        } catch (error) {
            setMessage(error.response && error.response.data ? error.response.data.message : "An error occurred.");
        }
    }

    const promoteUser = () => {
        changeUserRole(true);
    }

    const demoteUser = () => {
        changeUserRole(false);
    }

    return (
        <div className='Admin'>
            <Form>
                <FormGroup>
                    <Form.Label>Upload File</Form.Label>
                    <FormControl type="file" onChange={(e) => setFile(e.target.files[0])} />
                    <Button className="mt-2" onClick={uploadFile}>Upload</Button>
                </FormGroup>

                <FormGroup className="mt-3">
                    <Form.Label>User Management</Form.Label>
                    <FormControl 
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="Enter user email to manage"
                    />
                </FormGroup>
                <Button className="mt-2" onClick={promoteUser}>Promote to Admin</Button>{' '}
                <Button className="mt-2" variant="secondary" onClick={demoteUser}>Demote from Admin</Button>
            </Form>
            {message && <p className="message">{message}</p>}
        </div>
    );
}

export default Admin;
