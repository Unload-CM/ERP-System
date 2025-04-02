'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const menuItems = [
  { name: '대시보드', path: '/dashboard', icon: '📊' },
  { name: '자재 관리', path: '/dashboard/inventory', icon: '📦' },
  { name: '구매 요청', path: '/dashboard/purchase', icon: '🛒' },
  { name: '생산 계획', path: '/dashboard/production', icon: '🏭' },
  { name: '배송 계획', path: '/dashboard/shipping', icon: '🚚' },
  { name: '사용자 관리', path: '/dashboard/users', icon: '👥' },
  { name: '설정', path: '/dashboard/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <h1 className={`font-bold text-xl transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          ERP 시스템
        </h1>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded hover:bg-gray-700"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <div className={`
                  flex items-center px-4 py-3 rounded-lg transition-colors
                  ${pathname === item.path ? 'bg-primary-600 text-white' : 'hover:bg-gray-700'}
                `}>
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-3 transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2 text-left rounded-lg hover:bg-gray-700"
        >
          <span className="text-xl">🚪</span>
          <span className={`ml-3 transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>로그아웃</span>
        </button>
      </div>
    </div>
  );
} 