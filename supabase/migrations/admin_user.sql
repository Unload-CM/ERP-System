-- 확장 프로그램 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 기존 관리자 계정 제거 (이미 있는 경우)
DO $$
DECLARE
  admin_email TEXT := 'admin@example.com';
  admin_id UUID;
BEGIN
  -- 기존 사용자 ID 찾기
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  
  -- 존재하는 경우 삭제
  IF admin_id IS NOT NULL THEN
    DELETE FROM public.users WHERE id = admin_id;
    DELETE FROM auth.users WHERE id = admin_id;
  END IF;
END $$;

-- 관리자 계정 생성 
DO $$
DECLARE
  admin_uuid UUID := uuid_generate_v4();
BEGIN
  -- auth.users 테이블에 관리자 추가
  INSERT INTO auth.users (
    id, 
    email,
    raw_user_meta_data,
    raw_app_meta_data,
    aud, 
    role,
    created_at,
    updated_at,
    email_confirmed_at,
    encrypted_password
  )
  VALUES (
    admin_uuid,
    'admin@example.com',
    '{"username":"admin","full_name":"Admin User"}',
    '{"provider":"email","providers":["email"]}',
    'authenticated',
    'authenticated',
    now(),
    now(),
    now(),
    crypt('admin123', gen_salt('bf'))
  );

  -- public.users 테이블에 관리자 정보 추가
  INSERT INTO public.users (
    id,
    email,
    username,
    full_name,
    role,
    created_at
  )
  VALUES (
    admin_uuid,
    'admin@example.com',
    'admin',
    'Admin User',
    'admin',
    now()
  );
END
$$;

-- 관리자 계정이 생성되었는지 확인
SELECT 
  u.email, 
  u.id, 
  pu.username, 
  pu.role 
FROM 
  auth.users u
  JOIN public.users pu ON u.id = pu.id
WHERE 
  u.email = 'admin@example.com'; 