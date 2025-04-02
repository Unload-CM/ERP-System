'use client';

import { useState, useEffect } from 'react';
import { supabase, safeSupabaseQuery } from '@/lib/supabase';
import Link from 'next/link';

// 모킹 데이터 - API 연결 실패 시 사용
const MOCK_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@example.com',
    full_name: '관리자',
    role: 'admin',
    created_at: '2023-09-01T00:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'manager@example.com',
    full_name: '매니저',
    role: 'manager',
    created_at: '2023-09-15T00:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'staff1@example.com',
    full_name: '직원 1',
    role: 'staff',
    created_at: '2023-10-01T00:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'staff2@example.com',
    full_name: '직원 2',
    role: 'staff',
    created_at: '2023-10-15T00:00:00Z'
  }
];

type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      
      try {
        // Supabase API 사용 시도 (오류 발생 시 모킹 데이터 사용)
        const { data, error } = await safeSupabaseQuery(
          async () => {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (userError) throw userError;
            
            return { data: userData, error: null };
          },
          MOCK_USERS
        );
        
        if (error) {
          setError('사용자 목록을 불러오는 데 실패했습니다.');
        } else if (data) {
          setUsers(data);
          
          // 현재 로그인한 사용자 정보 가져오기
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const currentUserData = data.find(u => u.id === user.id);
            if (currentUserData) {
              setCurrentUser(currentUserData);
            }
          }
        }
      } catch (err) {
        console.error('사용자 데이터 불러오기 오류:', err);
        setError('데이터 로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'manager':
        return '매니저';
      case 'staff':
        return '직원';
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p className="font-bold">오류</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">사용자 관리</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link href="/dashboard/users/invite">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              사용자 초대
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            등록된 사용자가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    권한
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        disabled={currentUser?.id === user.id}
                      >
                        상세
                      </button>
                      {currentUser?.role === 'admin' && currentUser?.id !== user.id && (
                        <button className="text-red-600 hover:text-red-900">
                          비활성화
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 