"use client";

import { useState, useRef } from 'react';
import { Mail, Camera, Edit2, Check, X, MapPin, Phone } from 'lucide-react';

export default function ProfileWrapper({ initialUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [formData, setFormData] = useState({
    name: initialUser.name || '',
    phone: initialUser.phone || '',
    address: initialUser.address || '',
    profilePic: initialUser.profilePic || initialUser.image || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, ...data.user }));
        setIsEditing(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const displayImage = formData.profilePic || user.profilePic || user.image || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=8b5cf6&color=fff&size=150`;

  return (
    <div className="relative p-8 md:p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden text-center md:text-left transition-all duration-300">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl mix-blend-overlay"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl mix-blend-overlay"></div>
      
      {!isEditing ? (
        <div className="relative flex flex-col md:flex-row items-center gap-8 justify-center md:justify-start">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 transition-opacity duration-300"></div>
            <img 
              src={displayImage}
              alt="Profile picture"
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 dark:border-gray-700/50 object-cover shadow-2xl"
            />
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                  {user.name || 'User'}
                </h1>
                <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 flex flex-col items-center md:items-start text-sm">
                  <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" /> <span className="text-gray-900 dark:text-gray-100">{user.email}</span></span>
                  {user.phone && <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" /> <span className="text-gray-900 dark:text-gray-100">{user.phone}</span></span>}
                  {user.address && <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" /> <span className="text-gray-900 dark:text-gray-100">{user.address}</span></span>}
                </div>
              </div>
              <button 
                onClick={() => {
                  setFormData({
                    name: user.name || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    profilePic: user.profilePic || user.image || ''
                  });
                  setIsEditing(true);
                }}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors text-sm font-medium"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
              <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25">
                Pro Member
              </span>
              <span className="px-4 py-1.5 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 backdrop-blur-sm">
                Active
              </span>
              <button 
                onClick={() => {
                  setFormData({
                    name: user.name || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    profilePic: user.profilePic || user.image || ''
                  });
                  setIsEditing(true);
                }}
                className="md:hidden flex flex-1 w-full justify-center items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors text-sm font-medium mt-2"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative flex flex-col md:flex-row gap-8 w-full animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer w-32 h-32 md:w-40 md:h-40" onClick={() => fileInputRef.current?.click()}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <img 
                src={displayImage}
                alt="Profile picture"
                className="relative w-full h-full rounded-full border-4 border-white/20 dark:border-gray-700/50 object-cover shadow-2xl transition-all group-hover:brightness-50"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-10 h-10 text-white drop-shadow-md" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">Click to change photo</span>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100"
                  placeholder="e.g., +1 234 567 8900"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100"
                  placeholder="Full Address"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <button 
                type="button"
                onClick={() => {
                  setFormData({ name: user.name || '', phone: user.phone || '', address: user.address || '', profilePic: user.profilePic || user.image || '' });
                  setIsEditing(false);
                }}
                className="px-4 py-2 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors font-medium text-sm"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md transition-all font-medium text-sm disabled:opacity-70"
              >
                {isLoading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : <><Check className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
