-- Enable the crypt function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  target_email text := 'admin@waveacademy.in';
  target_pass text := 'admin123';
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- 1. Insert or update the user in Supabase Authentication
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = target_email) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      target_email,
      crypt(target_pass, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now()
    );

    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id::text,
      new_user_id,
      format('{"sub":"%s","email":"%s"}', new_user_id::text, target_email)::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  ELSE
    -- Re-synchronize the password and ensure they are confirmed
    UPDATE auth.users 
    SET 
      encrypted_password = crypt(target_pass, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = target_email;
  END IF;

  -- 2. Ensure they have the admin role in our custom table
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin' FROM auth.users WHERE email = target_email
  ON CONFLICT DO NOTHING;
END $$;
