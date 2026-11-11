import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, DollarSign, Pencil, LogOut, ChevronDown, X, Check,
} from 'lucide-react';
import { updateUserProfile } from '../api/api';

const PREFERENCE_OPTIONS = {
  currency: {
    label: 'Currency',
    icon: DollarSign,
    options: ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'JPY (¥)', 'CAD ($)', 'AUD ($)'],
  },
};

const Profile = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return user || JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  });

  const [phone, setPhone] = useState(() => {
    return localStorage.getItem('expense_tracker_phone') || '';
  });

  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('expense_tracker_preferences');
      return saved ? JSON.parse(saved) : { currency: 'INR (₹)' };
    } catch {
      return { currency: 'INR (₹)' };
    }
  });

  const [openDropdown, setOpenDropdown] = useState(null);
  const prefsRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (prefsRef.current && !prefsRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const memberSince = (() => {
    try {
      if (currentUser?.createdAt) {
        return new Date(currentUser.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      }
    } catch {}
    return 'Aug 2026';
  })();

  const handlePreferenceChange = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('expense_tracker_preferences', JSON.stringify(updated));
    setOpenDropdown(null);
  };

  const openEditModal = () => {
    setEditForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: phone || '',
    });
    setEditError('');
    setEditSuccess('');
    setModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');
    setEditSuccess('');
    try {
      const res = await updateUserProfile({
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      });
      if (res.success && res.user) {
        const updated = { ...currentUser, name: res.user.name, email: res.user.email };
        setCurrentUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        setPhone(editForm.phone.trim());
        localStorage.setItem('expense_tracker_phone', editForm.phone.trim());
        setEditSuccess('Profile updated successfully!');
        setTimeout(() => {
          setModalOpen(false);
          setEditSuccess('');
        }, 500);
      } else {
        setEditError(res.message || 'Profile update failed');
      }
    } catch (err) {
      setEditError(err.message || 'Server error while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/signup');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <User size={28} className="text-gray-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{currentUser?.name || 'User'}</p>
            <p className="text-sm text-gray-500">{currentUser?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={openEditModal}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-white/60 bg-white/70 backdrop-blur-md rounded-xl text-sm font-medium text-gray-800 hover:bg-white/95 transition-all shadow-sm"
        >
          <Pencil size={14} />Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <h2 className="font-semibold text-gray-900 mb-5">Account Details</h2>
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-500">
                <Mail size={16} />
                <span className="text-sm">Email</span>
              </div>
              <span className="text-sm text-gray-700 font-medium">{currentUser?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-500">
                <Phone size={16} />
                <span className="text-sm">Phone</span>
              </div>
              <span className="text-sm text-gray-700 font-medium">{phone || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-500">
                <Calendar size={16} />
                <span className="text-sm">Member Since</span>
              </div>
              <span className="text-sm text-gray-700 font-medium">{memberSince}</span>
            </div>
          </div>
        </div>

        <div
          ref={prefsRef}
          className="bg-white/75 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
        >
          <h2 className="font-semibold text-gray-900 mb-5">Preferences</h2>
          <div className="flex flex-col gap-5">
            {Object.entries(PREFERENCE_OPTIONS).map(([key, config]) => {
              const IconComp = config.icon;
              const isOpen = openDropdown === key;
              return (
                <div key={key} className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-500">
                    <IconComp size={16} />
                    <span className="text-sm">{config.label}</span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(isOpen ? null : key)}
                      className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-800 bg-white/70 hover:bg-white/95 border border-white/60 transition-all shadow-sm"
                    >
                      <span>{preferences[key]}</span>
                      <ChevronDown
                        size={14}
                        className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="absolute right-0 top-full mt-2 w-44 bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/80 py-1.5 z-30 flex flex-col animate-slide-down">
                        {config.options.map((opt) => {
                          const isSelected = preferences[key] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handlePreferenceChange(key, opt)}
                              className={`px-3.5 py-2 text-left text-xs font-medium transition-colors hover:bg-gray-100 flex items-center justify-between ${
                                isSelected ? 'text-gray-900 cursor-pointer font-bold bg-gray-50' : 'text-gray-700'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check size={14} className="text-gray-900" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="flex cursor-pointer items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors"
      >
        <LogOut size={16} />Sign Out
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/70 w-full max-w-md p-6 relative animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 text-lg">Edit Profile</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="p-3 mb-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl">
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-sm text-gray-900 outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-sm text-gray-900 outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-sm text-gray-900 outline-none focus:border-gray-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
