import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { Clock } from 'lucide-react';

export default function PendingApproval() {
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Hesap Onay Bekliyor
        </h2>
        <p className="text-gray-600 mb-6">
          Hesabınız şu anda yönetici onayı bekliyor. Onaylandıktan sonra sisteme giriş yapabileceksiniz.
        </p>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}