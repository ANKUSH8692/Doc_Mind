import React, { useState } from 'react';
import { href, Link } from 'react-router-dom';

import { SignUpUser } from './../API/auth.js';

const Signup = () => {
  const [user, setUser] = React.useState({
    name: '',
    email: '',
    password: ''
  })
const [passwordError, setPasswordError] = React.useState("");

  //Password validation function
  function validatePassword(password) {
    const specialChars = "!@#$%^&*()_+\\-={}\\[\\]:;\"'<>,.?/`~|";
    if(password.length === 0){
      return "Password is required.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!new RegExp("[" + specialChars + "]").test(password)) {
      return "Password must contain at least one special character.";
    }
    return ""; // No errors
  }

async function onFormSubmit(event) {
    event.preventDefault();

    try {
      const response = await SignUpUser(user);
      if (response.success) {
        console.log("sucess singup");
        window.location.href = "/login";
      } else {
        console.log("failed singup");
      }
    } catch (e) {
      console.error("Singup Error:", e);
      
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col justify-center py-8 sm:px-4 lg:px-6"> {/* py-8, sm:px-4, lg:px-6 for overall smaller padding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm"> {/* sm:max-w-sm for narrower form */}
        {/* Optional: Add your Doc Mind logo here */}
        {/*
          <img
            className="mx-auto h-12 w-auto mb-3" // Smaller logo
            src="/your-doc-mind-logo-circular.png"
            alt="Doc Mind Logo"
          />
        */}
        <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight"> {/* text-3xl for headline */}
          Create Your Account
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600"> {/* text-sm for subtitle */}
          Join Doc Mind to unlock powerful document insights.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm"> {/* mt-8, sm:max-w-sm */}
        <div className="bg-white py-6 px-5 shadow-xl rounded-xl sm:px-8 transition-all duration-300 hover:shadow-lg hover:scale-[1.005]"> {/* py-6, px-5, shadow-xl, rounded-xl, hover:shadow-lg */}
          <form className="space-y-6" onSubmit={onFormSubmit}> {/* space-y-6 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1.5"> {/* mt-1.5 */}
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out text-gray-900 text-sm" // text-sm for input
                  value={user.name}
              onChange={(e) => {
                setUser({ ...user, name: e.target.value })
              }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1.5"> {/* mt-1.5 */}
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out text-gray-900 text-sm" // text-sm for input
                  value={user.email}
            onChange={(e) => {
              setUser({ ...user, email: e.target.value })
            }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1.5"> {/* mt-1.5 */}
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out text-gray-900 text-sm" // text-sm for input
                  value={user.password}
            onChange={(e) => {
                const newPassword = e.target.value;
                setUser({ ...user, password: newPassword });

                // Live validation as user types
                const error = validatePassword(newPassword);
                setPasswordError(error);
              }}
                />
              </div>
            </div>

            

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-3 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition ease-in-out duration-200 transform hover:-translate-y-px hover:shadow-lg" // py-2.5, px-3, text-base, shadow-md, hover:shadow-lg, hover:-translate-y-px
              >
                Sign up
              </button>
            </div>
          </form>


          <div className="mt-6 text-center text-sm text-gray-600"> {/* mt-6 */}
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition duration-150 ease-in-out">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;