import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../api/api';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await loginUser(form.email, form.password);
    setLoading(false);

    if (res.success) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      if (onLogin) onLogin(res.user, res.token);
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 relative"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-xs pointer-events-none" />
      <div className="bg-white/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 w-full max-w-sm p-8 relative z-10">


        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Welcome back</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-gray-400 transition-colors">
            <Mail size={16} className="text-gray-400 shrink-0" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="flex-1 text-sm text-gray-900 outline-none placeholder-gray-400 bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2.5 border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-gray-400 transition-colors">
            <Lock size={16} className="text-gray-400 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="flex-1 text-sm text-gray-900 outline-none placeholder-gray-400 bg-transparent"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full cursor-pointer bg-gray-900 text-white text-sm font-semibold rounded-xl py-3 hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <hr className="my-4 border-gray-400" />

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-bold text-gray-900 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

