import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useDispatch } from "react-redux"
import { setAuthToken } from './../API/index.js';
import { logInUser } from './../API/auth.js'

const Login = () => {
  const dispatch = useDispatch();

  const [user, setUser] = useState({
    email: '',
    password: ''
  });

  async function onFormSubmit(event) {
        event.preventDefault();

        try {
            const response = await logInUser(user);

            if (response?.success) {
                const token = response.token;
                if (token) {
                    // FIX: Use the helper function to set the token on the instance
                    setAuthToken(token); 
                    
                    localStorage.setItem('token', token); 
                    console.log("Token stored:", token);
                    window.location.href = "/RAG";
                } else {
                    console.log("Token not found in response");
                    alert("Login successful, but no token received. Please check backend.");
                }
            } else {
                // Display the error message from the API call
                alert(response.message || "Login failed due to a backend issue.");
                console.log("Login failed or backend problem:", response.message);
            }

        } catch (err) {
            console.log(err);
            alert("An unexpected error occurred: " + (err.message || "Please check your network."));
        }
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
          Welcome Back!
        </h2>
        <p className="mt-2 text-center text-md text-gray-600">
          Sign in to unlock precise insights from your documents.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]">
          <form className="space-y-7" onSubmit={onFormSubmit}>
            <div>
  
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out text-gray-900"
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
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out text-gray-900"
                  value={user.password}
                        onChange={(e) => {
                            setUser({ ...user, password: e.target.value })
                        }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="#" className="font-medium text-purple-600 hover:text-purple-500 transition duration-150 ease-in-out">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition ease-in-out duration-200 transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                Sign in
              </button>
            </div>
          </form>


          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-purple-600 hover:text-purple-500 transition duration-150 ease-in-out">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;