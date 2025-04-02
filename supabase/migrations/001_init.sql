-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  nickname TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  marketing_consent BOOLEAN DEFAULT FALSE,
  password_reset_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 자재 테이블 생성
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 구매 요청 테이블 생성
CREATE TABLE IF NOT EXISTS public.purchase_request (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 구매 요청 항목 테이블 생성
CREATE TABLE IF NOT EXISTS public.purchase_request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_request_id UUID NOT NULL REFERENCES public.purchase_request(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES public.inventory(id),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  estimated_price DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 생산 계획 테이블 생성
CREATE TABLE IF NOT EXISTS public.production_plan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'planned',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 생산 계획 자재 요구 항목 테이블 생성
CREATE TABLE IF NOT EXISTS public.production_plan_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_plan_id UUID NOT NULL REFERENCES public.production_plan(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES public.inventory(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 배송 계획 테이블 생성
CREATE TABLE IF NOT EXISTS public.shipping_plan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  shipping_date DATE,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 배송 계획 항목 테이블 생성
CREATE TABLE IF NOT EXISTS public.shipping_plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipping_plan_id UUID NOT NULL REFERENCES public.shipping_plan(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES public.inventory(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 정책 설정
-- 모든 테이블에 Row Level Security 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_plan_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_plan_items ENABLE ROW LEVEL SECURITY;

-- 사용자 테이블 정책 (관리자는 모든 사용자를 볼 수 있고, 일반 사용자는 자신만 볼 수 있음)
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

-- 관리자만 모든 항목에 접근 가능하게 하는 정책 생성 (예시)
CREATE POLICY "Admins have full access to inventory" ON public.inventory
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

-- 일반 사용자는 읽기만 가능하게 하는 정책 생성 (예시)
CREATE POLICY "All authenticated users can view inventory" ON public.inventory
  FOR SELECT USING (auth.role() = 'authenticated');

-- 관리자 계정 생성 (ID: admin, PW: admin123)
-- UUID 생성 (고정 UUID 사용)
DO $$
DECLARE
  admin_uuid UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- auth.users 테이블에 관리자 추가
  INSERT INTO auth.users (
    id, 
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    admin_uuid,
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"admin","full_name":"Admin User","first_name":"Admin","last_name":"User"}',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- public.users 테이블에 관리자 정보 추가
  INSERT INTO public.users (
    id,
    email,
    username,
    nickname,
    full_name,
    first_name,
    last_name,
    role,
    marketing_consent,
    password_reset_required
  )
  VALUES (
    admin_uuid,
    'admin@example.com',
    'admin',
    'Admin',
    'Admin User',
    'Admin',
    'User',
    'admin',
    FALSE,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
END
$$; 