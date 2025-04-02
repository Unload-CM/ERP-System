'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [searchMethod, setSearchMethod] = useState<'email' | 'username'>('email');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toggleSearchMethod = () => {
    setSearchMethod(prev => prev === 'email' ? 'username' : 'email');
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let tempPassword = '';
    for (let i = 0; i < 10; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return tempPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (searchMethod === 'email') {
        await resetPasswordWithEmail();
      } else {
        await resetPasswordWithUsername();
      }
    } catch (err: any) {
      console.error('비밀번호 재설정 오류:', err);
      setError(err.message || '비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordWithEmail = async () => {
    const email = formData.email.trim();
    
    if (!email) {
      throw new Error('이메일을 입력해주세요.');
    }

    // 이메일이 존재하는지 확인
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        throw new Error('등록되지 않은 이메일입니다.');
      }
      throw userError;
    }

    // 임시 비밀번호 생성
    const tempPassword = generateTemporaryPassword();

    // 사용자 비밀번호 업데이트
    const { error: updateError } = await supabase.auth.updateUser({
      password: tempPassword,
    });

    if (updateError) {
      throw updateError;
    }

    // DB에 비밀번호 변경 필요 플래그 추가
    const { error: flagError } = await supabase
      .from('users')
      .update({ password_reset_required: true })
      .eq('id', userData.id);

    if (flagError) {
      throw flagError;
    }

    setSuccess(`임시 비밀번호가 발급되었습니다: ${tempPassword}`);
    setTimeout(() => {
      router.push('/login');
    }, 10000);
  };

  const resetPasswordWithUsername = async () => {
    const username = formData.username.trim();
    
    if (!username) {
      throw new Error('아이디를 입력해주세요.');
    }

    // 아이디로 사용자 찾기
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('username', username)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        throw new Error('존재하지 않는 아이디입니다.');
      }
      throw userError;
    }

    // 임시 비밀번호 생성
    const tempPassword = generateTemporaryPassword();

    // 사용자 비밀번호 업데이트
    const { error: updateError } = await supabase.auth.updateUser({
      email: userData.email,
      password: tempPassword,
    });

    if (updateError) {
      throw updateError;
    }

    // DB에 비밀번호 변경 필요 플래그 추가
    const { error: flagError } = await supabase
      .from('users')
      .update({ password_reset_required: true })
      .eq('id', userData.id);

    if (flagError) {
      throw flagError;
    }

    setSuccess(`임시 비밀번호가 발급되었습니다: ${tempPassword}`);
    setTimeout(() => {
      router.push('/login');
    }, 10000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">비밀번호 찾기</h2>
          <p className="mt-2 text-sm text-gray-600">
            아이디 또는 이메일을 입력하여 임시 비밀번호를 발급받으세요
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex justify-center mb-6">
            <div className="flex p-1 rounded-lg bg-gray-100">
              <button
                type="button"
                onClick={() => searchMethod !== 'email' && toggleSearchMethod()}
                className={`py-2 px-4 text-sm font-medium rounded ${
                  searchMethod === 'email'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                이메일로 찾기
              </button>
              <button
                type="button"
                onClick={() => searchMethod !== 'username' && toggleSearchMethod()}
                className={`py-2 px-4 text-sm font-medium rounded ${
                  searchMethod === 'username'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                아이디로 찾기
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 text-sm text-green-700 bg-green-100 rounded-md">
              {success}
              <p className="mt-2 font-bold">이 임시 비밀번호는 보안을 위해 10초 후에 사라집니다. 지금 바로 저장하세요!</p>
              <p className="mt-2">로그인 페이지로 자동으로 이동됩니다.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {searchMethod === 'email' ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="py-3 px-10 block w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  아이디
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="py-3 px-10 block w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="사용자 아이디"
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? '처리 중...' : '임시 비밀번호 발급'}
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm">
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                로그인 페이지로 돌아가기
              </Link>
            </div>
            <div className="text-sm">
              <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                계정 만들기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 