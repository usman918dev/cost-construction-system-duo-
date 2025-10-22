'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '../ui/Button';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // MOCK USER FOR TESTING - No API call needed
    setUser({
      name: 'Test User',
      role: 'admin',
    });

    /* ORIGINAL CODE - COMMENTED FOR TESTING
    fetchUser();
    */
  }, []);

  /* ORIGINAL fetchUser - Keep for later
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };
  */

  /* ORIGINAL handleLogout - Keep for later
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  */

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Construction Cost Management</h1>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-gray-500 capitalize">{user.role}</p>
              </div>
              {/* LOGOUT BUTTON DISABLED FOR TESTING */}
              {/* <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button> */}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
