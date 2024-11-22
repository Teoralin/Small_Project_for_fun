import React, { useState } from 'react';
import axios from 'axios';
import classes from './registerPage.module.css';
import MailIcon from "../../assets/Mail.png";
import Key from "../../assets/Key.png";
import User_light from "../../assets/User_light.png";
import Phone from "../../assets/Phone.png";
import Point from "../../assets/Map_Point.png";
import House from "../../assets/House.png";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        isFarmer: false,
        address: { 
            street: '',
            houseNumber: '',
            city: '',
            postCode: '',
    }
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    const handleChange = (e) => {
        const { id, value, type, checked, dataset } = e.target;

        if (dataset.group === "address") {
            // Handle nested address field changes
            setFormData((prevData) => ({
                ...prevData,
                address: {
                    ...prevData.address,
                    [id]: value,
                },
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [id]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {

            const payload = {
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                contact_info: formData.phone,
                password: formData.password,
                is_farmer: formData.isFarmer,
            };
    
            // Include address if the user is a farmer
            if (formData.isFarmer) {
                payload.address = {
                    street: formData.address.street,
                    house_number: formData.address.houseNumber,
                    city: formData.address.city,
                    post_code: formData.address.postCode,
                };
            }
    
            // Send the request to the server
            await axios.post('http://localhost:3000/auth/register', payload);

            // Handle success
            setSuccess('User registered successfully!');
            setError('');
            setFormData({
                name: '',
                surname: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                isFarmer: false,
                address: { 
                    street: '',
                    houseNumber: '',
                    city: '',
                    postCode: '',
            }});
        } catch (err) {
            // Handle error
            setError(err.response?.data?.message || 'Something went wrong');
            setSuccess('');
        }
    };

    return (
        <div className={classes.registerPage}>
            <div className={classes.logo}>YellowShop</div>
            <form className={classes.registerForm} onSubmit={handleSubmit}>
                <div className={classes.formGroup}>
                    <label htmlFor="name">Name</label>
                    <div className={classes.form}>
                        <img
                            src={User_light}
                            alt="User_light Icon"
                            className={classes.icon}
                        />
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="surname">Surname</label>
                    <div className={classes.form}>
                        <img
                            src={User_light}
                            alt="User_light Icon"
                            className={classes.icon}
                        />
                        <input
                            type="text"
                            id="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            placeholder="Enter your surname"
                            required
                        />
                    </div>
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <div className={classes.form}>
                        <img
                            src={MailIcon}
                            alt="Mail Icon"
                            className={classes.icon}
                        />
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <div className={classes.form}>
                        <img
                            src={Phone}
                            alt="Phone Icon"
                            className={classes.icon}
                        />
                        <input
                            type="tel"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="password">Password</label>
                    <div className={classes.form}>
                        <img
                            src={Key}
                            alt="Key Icon"
                            className={classes.icon}
                        />
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className={classes.form}>
                        <img
                            src={Key}
                            alt="Key Icon"
                            className={classes.icon}
                        />
                        <input
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                </div>
                <div className={classes.checkbox}>
                    <label htmlFor="isFarmer" className={classes.checkboxLabel}>
                    <input
                            type="checkbox"
                            id="isFarmer"
                            checked={formData.isFarmer}
                            onChange={handleChange}
                        />
                        <p>Are you a farmer?</p>
                    </label>
                </div>

                        {formData.isFarmer && (
                            <>
                                <div className={classes.formGroup}>
                                    <label htmlFor="city">City</label>
                                    <div className={classes.form}>
                                        <img
                                            src={House}
                                            alt="House Icon"
                                            className={classes.icon}
                                        />
                                        <input
                                            type="text"
                                            id="city"
                                            data-group="address"
                                            value={formData.address.city}
                                            onChange={handleChange}
                                            placeholder="Enter your city"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className={classes.formGroup}>
                                    <label htmlFor="street">Street</label>
                                    <div className={classes.form}>
                                        <img
                                            src={House}
                                            alt="House Icon"
                                            className={classes.icon}
                                        />
                                        <input
                                            type="text"
                                            id="street"
                                            data-group="address"
                                            value={formData.address.street}
                                            onChange={handleChange}
                                            placeholder="Enter your street"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className={classes.formGroup}>
                                    <label htmlFor="houseNumber">House number</label>
                                    <div className={classes.form}>
                                        <img
                                            src={Point}
                                            alt="Point Icon"
                                            className={classes.icon}
                                        />
                                        <input
                                            type="text"
                                            id="houseNumber"
                                            data-group="address"
                                            value={formData.address.houseNumber}
                                            onChange={handleChange}
                                            placeholder="Enter your house number"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className={classes.formGroup}>
                                    <label htmlFor="postCode">Postcode</label>
                                    <div className={classes.form}>
                                        <img
                                            src={Point}
                                            alt="Point Icon"
                                            className={classes.icon}
                                        />
                                        <input
                                            type="text"
                                            id="postCode"
                                            data-group="address"
                                            value={formData.address.postCode}
                                            onChange={handleChange}
                                            placeholder="Enter your city"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                <button type="submit" className={classes.signUpButton}>
                    Sign Up
                </button>
                {error && <p className={classes.error}>{error}</p>}
                {success && <p className={classes.success}>{success}</p>}
            </form>
        </div>
    );
}

