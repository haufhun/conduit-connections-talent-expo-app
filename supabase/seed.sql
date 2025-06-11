DO $$ 
DECLARE 
  user1_id UUID;
  skill_react_id bigint;
  skill_typescript_id bigint;
  skill_node_id bigint;
  skill_guitar_id bigint;
  skill_keyboard_id bigint;
  skill_drums_id bigint;
  skill_video_id bigint;
  skill_sound_id bigint;
  skill_lighting_id bigint;
  skill_event_id bigint;
  skill_dj_id bigint;
  harry_id UUID;
  hermione_id UUID;
  ron_id UUID;
  luna_id UUID;
  neville_id UUID;
  ginny_id UUID;
  draco_id UUID;
  cho_id UUID;
  cedric_id UUID;
  fred_id UUID;
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

  INSERT INTO skills (name, image_url)
  VALUES
    ('Guitar', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&h=800') RETURNING id INTO skill_guitar_id;

  INSERT INTO skills (name, image_url)
  VALUES
    ('Keyboard', 'https://images.unsplash.com/photo-1552056776-9b5657118ca4?auto=format&fit=crop&w=800&h=800') RETURNING id INTO skill_keyboard_id;

  INSERT INTO skills (name, image_url)
  VALUES
    ('Drums', 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&h=800') RETURNING id INTO skill_drums_id;

  INSERT INTO skills (name, image_url)
  VALUES
    ('Video Production', 'https://images.unsplash.com/photo-1601506521617-8ce5f39288de?auto=format&fit=crop&w=800&h=800') RETURNING id INTO skill_video_id;

  INSERT INTO skills (name, image_url)
  VALUES
    ('Sound Engineering', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&h=800') RETURNING id INTO skill_sound_id;

  INSERT INTO skills (name, image_url)
  VALUES
    ('Stage Lighting', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&h=800') RETURNING id INTO skill_lighting_id;

  INSERT INTO skills (name, image_url) 
  VALUES
    ('Event Management', 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=800&h=800') RETURNING id INTO skill_event_id;

  INSERT INTO skills (name, image_url)
  VALUES
    ('DJ Performance', 'https://images.unsplash.com/photo-1571935822631-26757b496866?auto=format&fit=crop&w=800&h=800') RETURNING id INTO skill_dj_id;

  -- Insert talent skills for user1
  INSERT INTO talent_skills (user_id, skill_id, summary, years_of_experience, image_urls, hourly_rate)
    VALUES
      (user1_id, skill_react_id, 'Built multiple production React applications with complex state management and custom hooks.', 3.5, ARRAY['https://picsum.photos/200/300', 'https://picsum.photos/200/301'], 75.00),
      (user1_id, skill_typescript_id, 'Extensive experience with TypeScript in both frontend and backend development.', 2.0, ARRAY['https://picsum.photos/200/302'], 80.00),
      (user1_id, skill_node_id, 'Developed RESTful APIs and microservices using Node.js and Express.', 10.0, ARRAY['https://picsum.photos/200/303', 'https://picsum.photos/200/304', 'https://picsum.photos/200/305'], 95.00);

      -- Harry Potter character talents
        -- Create Harry Potter
        INSERT INTO auth.users (
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
        ) VALUES (
          'harry.potter@hogwarts.edu',
          crypt('password123', gen_salt('bf')),
          '{"first_name":"Harry","last_name":"Potter"}',
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
        ) RETURNING id INTO harry_id;

        -- Create remaining characters
        INSERT INTO auth.users (
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
        ) VALUES (
          'hermione.granger@hogwarts.edu',
          crypt('password123', gen_salt('bf')),
          '{"first_name":"Hermione","last_name":"Granger"}',
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
        ) RETURNING id INTO hermione_id;

        -- Create Ron
        INSERT INTO auth.users (
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
        ) VALUES (
          'ron.weasley@hogwarts.edu',
          crypt('password123', gen_salt('bf')),
          '{"first_name":"Ron","last_name":"Weasley"}',
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
        ) RETURNING id INTO ron_id;

        -- Create Luna
        INSERT INTO auth.users (
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
        ) VALUES (
          'luna.lovegood@hogwarts.edu',
          crypt('password123', gen_salt('bf')),
          '{"first_name":"Luna","last_name":"Lovegood"}',
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
        ) RETURNING id INTO luna_id;

        -- Create Neville
        INSERT INTO auth.users (
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
        ) VALUES (
          'neville.longbottom@hogwarts.edu',
          crypt('password123', gen_salt('bf')),
          '{"first_name":"Neville","last_name":"Longbottom"}',
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
        ) RETURNING id INTO neville_id;

        -- Create Ginny
        INSERT INTO auth.users (
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
        ) VALUES (
          'ginny.weasley@hogwarts.edu',
          crypt('password123', gen_salt('bf')),
          '{"first_name":"Ginny","last_name":"Weasley"}',
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
        ) RETURNING id INTO ginny_id;

        -- Create Draco
        INSERT INTO auth.users (
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
        ) VALUES (
          'draco.malfoy@hogwarts.edu',
          crypt('password123', gen_salt('bf')),
          '{"first_name":"Draco","last_name":"Malfoy"}',
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
        ) RETURNING id INTO draco_id;

        -- Create Cho
        INSERT INTO auth.users (
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
        ) VALUES (
          'cho.chang@hogwarts.edu',
          crypt('password123', gen_salt('bf')),
          '{"first_name":"Cho","last_name":"Chang"}',
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
        ) RETURNING id INTO cho_id;

        -- Create Cedric
        INSERT INTO auth.users (
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
        ) VALUES (
          'cedric.diggory@hogwarts.edu',
          crypt('password123', gen_salt('bf')),
          '{"first_name":"Cedric","last_name":"Diggory"}',
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
        ) RETURNING id INTO cedric_id;

        -- Create Fred
        INSERT INTO auth.users (
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
        ) VALUES (
          'fred.weasley@hogwarts.edu',
          crypt('password123', gen_salt('bf')),
          '{"first_name":"Fred","last_name":"Weasley"}',
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
        ) RETURNING id INTO fred_id;

        -- Add their skills
        INSERT INTO talent_skills (user_id, skill_id, summary, years_of_experience, image_urls, hourly_rate)
        VALUES 
          (harry_id, skill_guitar_id, 'Magical guitarist with enchanting melodies', 2.5, ARRAY['https://picsum.photos/200/310'], 65.00),
          (harry_id, skill_lighting_id, 'Specializes in dramatic stage lighting', 1.5, ARRAY['https://picsum.photos/200/311'], 55.00),
          (hermione_id, skill_sound_id, 'Expert sound engineering with precision', 4.0, ARRAY['https://picsum.photos/200/312'], 85.00),
          (hermione_id, skill_event_id, 'Organized numerous magical events', 3.0, ARRAY['https://picsum.photos/200/313'], 75.00),
          (ron_id, skill_drums_id, 'Rhythmic wizard on the drums', 2.0, ARRAY['https://picsum.photos/200/314'], 60.00),
          (luna_id, skill_keyboard_id, 'Ethereal keyboard performances', 3.5, ARRAY['https://picsum.photos/200/315'], 70.00),
          (luna_id, skill_dj_id, 'Experimental DJ sets', 2.0, ARRAY['https://picsum.photos/200/316'], 80.00),
          (neville_id, skill_video_id, 'Creative video production', 1.5, ARRAY['https://picsum.photos/200/317'], 65.00),
          (ginny_id, skill_event_id, 'Dynamic event management', 2.5, ARRAY['https://picsum.photos/200/318'], 70.00),
          (draco_id, skill_lighting_id, 'Sophisticated lighting design', 3.0, ARRAY['https://picsum.photos/200/319'], 90.00),
          (cho_id, skill_sound_id, 'Detailed sound engineering', 2.0, ARRAY['https://picsum.photos/200/320'], 75.00),
          (cedric_id, skill_video_id, 'Cinematic video production', 4.0, ARRAY['https://picsum.photos/200/321'], 85.00),
          (fred_id, skill_dj_id, 'High-energy DJ performances', 3.5, ARRAY['https://picsum.photos/200/322'], 95.00);

            -- Update their profiles with Midwest cities
            UPDATE public.users SET first_name = 'Harry', last_name = 'Potter', city = 'Kansas City', state = 'KS', 
                  metadata = '{"bio": "The boy who lived to make music"}'::jsonb WHERE id = harry_id;
                UPDATE public.users SET first_name = 'Hermione', last_name = 'Granger', city = 'St. Louis', state = 'MO', 
                  metadata = '{"bio": "Bringing magic to every event"}'::jsonb WHERE id = hermione_id;
                UPDATE public.users SET first_name = 'Ron', last_name = 'Weasley', city = 'Omaha', state = 'NE', 
                  metadata = '{"bio": "Drumming up magical beats"}'::jsonb WHERE id = ron_id;
                UPDATE public.users SET first_name = 'Luna', last_name = 'Lovegood', city = 'Lincoln', state = 'NE', 
                  metadata = '{"bio": "Creating ethereal soundscapes"}'::jsonb WHERE id = luna_id;
                UPDATE public.users SET first_name = 'Neville', last_name = 'Longbottom', city = 'Wichita', state = 'KS', 
                  metadata = '{"bio": "Capturing magical moments on film"}'::jsonb WHERE id = neville_id;
                UPDATE public.users SET first_name = 'Ginny', last_name = 'Weasley', city = 'Kansas City', state = 'MO', 
                  metadata = '{"bio": "Making events extraordinary"}'::jsonb WHERE id = ginny_id;
                UPDATE public.users SET first_name = 'Draco', last_name = 'Malfoy', city = 'Overland Park', state = 'KS', 
                  metadata = '{"bio": "Illuminating performances with style"}'::jsonb WHERE id = draco_id;
                UPDATE public.users SET first_name = 'Cho', last_name = 'Chang', city = 'Springfield', state = 'MO', 
                  metadata = '{"bio": "Crafting perfect sound experiences"}'::jsonb WHERE id = cho_id;
                UPDATE public.users SET first_name = 'Cedric', last_name = 'Diggory', city = 'Independence', state = 'MO', 
                  metadata = '{"bio": "Creating cinematic magic"}'::jsonb WHERE id = cedric_id;
                UPDATE public.users SET first_name = 'Fred', last_name = 'Weasley', city = 'Grand Island', state = 'NE', 
                  metadata = '{"bio": "Turning parties into celebrations"}'::jsonb WHERE id = fred_id;
  
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
