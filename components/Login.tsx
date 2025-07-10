

import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(user => user.username.toLowerCase() === username.toLowerCase());
    
    // Hardcode admin password check
    const isPasswordCorrect = (foundUser?.role === UserRole.ADMIN && foundUser.username === 'admin') 
                                ? password === 'admin' 
                                : foundUser?.password === password;

    if (foundUser && isPasswordCorrect) {
      setError('');
      // If admin logs in, ensure their password in the state is updated for this session
      // This doesn't persist, but makes other logic (like profile update) consistent
      if (foundUser.role === UserRole.ADMIN && foundUser.username === 'admin') {
          onLoginSuccess({ ...foundUser, password: 'admin' });
      } else {
          onLoginSuccess(foundUser);
      }
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-light">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <div className="bg-brand-primary p-3 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.85,7.15C17.42,5.82,16.21,4.8,14.78,4.8H9.22c-1.43,0-2.64,1.02-3.07,2.35L6,7.5v6 c0,1.93,1.57,3.5,3.5,3.5h0.11c0.23,1.21,1.3,2,2.39,2s2.16-0.79,2.39-2H14.5c1.93,0,3.5-1.57,3.5-3.5v-6L17.85,7.15z M9.89,14.5c-0.49-0.49-0.8-1.15-0.8-1.89c0-0.73,0.31-1.39,0.8-1.89C10.38,10.23,11.12,10,12,10 c0.88,0,1.62,0.23,2.11,0.72c0.49,0.49,0.8,1.15,0.8,1.89s-0.31,1.39-0.8,1.89c-0.49,0.49-1.23,0.72-2.11,0.72 C11.12,15.22,10.38,14.99,9.89,14.5z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-brand-secondary">Auntie Dental Clinic</h1>
          <p className="text-text-secondary mt-2">Portal Login</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                placeholder="Username (try 'admin' or 'ereed')"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                placeholder="Password (try 'admin' or 'password123')"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;