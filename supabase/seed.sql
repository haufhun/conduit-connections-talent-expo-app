DO $$ 
DECLARE 
  user1_id UUID;
  skill_react_id bigint;
  skill_typescript_id bigint;
  skill_node_id bigint;
BEGIN
  -- Create main user
  INSERT INTO
    auth.users (
      email,
      encrypted_password,
      raw_user_meta_data,
      raw_app_meta_data,
      instance_id,
      id,
      aud,
      role,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) (
      select
        'user1@example.com',
        crypt('password123', gen_salt('bf')),
        '{"first_name":"John","last_name":"Doe"}',
        '{"provider":"email","providers":["email"]}',
        '00000000-0000-0000-0000-000000000000',
        uuid_generate_v4(),
        'authenticated',
        'authenticated',
        current_timestamp,
        current_timestamp,
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO user1_id;

  -- Update the public users profile
  UPDATE public.users 
  SET 
    first_name = 'John',
    last_name = 'Doe',
    city = 'San Francisco',
    state = 'CA',
    metadata = '{"bio": "Full-stack developer with a passion for building great user experiences"}'::jsonb
  WHERE id = user1_id;

  -- -- Insert sample skills
  INSERT INTO skills (name, image_url)
  VALUES
    ('React', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png') RETURNING id INTO skill_react_id;

  INSERT INTO skills (name, image_url)
  VALUES
    ('TypeScript', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/1200px-Typescript_logo_2020.svg.png') RETURNING id INTO skill_typescript_id;

  INSERT INTO skills (name, image_url)
  VALUES
    ('Node.js', 'https://nodejs.org/static/images/logo.svg') RETURNING id INTO skill_node_id;

  -- Insert talent skills for user1
  INSERT INTO talent_skills (user_id, skill_id, summary, years_of_experience, image_urls)
  VALUES
    (user1_id, skill_react_id, 'Built multiple production React applications with complex state management and custom hooks.', 3.5, ARRAY['https://picsum.photos/200/300', 'https://picsum.photos/200/301']),
    (user1_id, skill_typescript_id, 'Extensive experience with TypeScript in both frontend and backend development.', 2.0, ARRAY['https://picsum.photos/200/302']),
    (user1_id, skill_node_id, 'Developed RESTful APIs and microservices using Node.js and Express.', 10.0, ARRAY['https://picsum.photos/200/303', 'https://picsum.photos/200/304', 'https://picsum.photos/200/305']);
END $$;

-- Set up email identity for the user
INSERT INTO
  auth.identities (
    id,
    user_id,
    identity_data,
    provider_id,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) (
    select
      uuid_generate_v4(),
      id,
      format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
      id,
      'email',
      current_timestamp,
      current_timestamp,
      current_timestamp
    from
      auth.users
  );
