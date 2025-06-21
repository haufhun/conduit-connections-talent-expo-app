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
        '{"first_name":"John","last_name":"Doe","user_type":"TALENT"}',
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

  -- Create organizer user
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
    ) VALUES (
      'organizer@example.com',
      crypt('password123', gen_salt('bf')),
      '{"first_name":"Sarah","last_name":"Martinez","user_type":"ORGANIZER"}',
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
    );

  -- Update the public users profile for organizer
  UPDATE public.users 
  SET 
    first_name = 'Sarah',
    last_name = 'Martinez',
    city = 'Austin',
    state = 'TX',
    metadata = '{"bio": "Event organizer specializing in music festivals and corporate events. Passionate about creating memorable experiences."}'::jsonb
  WHERE email = 'organizer@example.com';

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
          '{"first_name":"Harry","last_name":"Potter","user_type":"TALENT"}',
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

        -- Create Hermione Granger
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
          '{"first_name":"Hermione","last_name":"Granger","user_type":"TALENT"}',
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
          '{"first_name":"Ron","last_name":"Weasley","user_type":"TALENT"}',
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
          '{"first_name":"Luna","last_name":"Lovegood","user_type":"TALENT"}',
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
          '{"first_name":"Neville","last_name":"Longbottom","user_type":"TALENT"}',
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
          '{"first_name":"Ginny","last_name":"Weasley","user_type":"TALENT"}',
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
          '{"first_name":"Draco","last_name":"Malfoy","user_type":"TALENT"}',
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
          '{"first_name":"Cho","last_name":"Chang","user_type":"TALENT"}',
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
          '{"first_name":"Cedric","last_name":"Diggory","user_type":"TALENT"}',
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
          '{"first_name":"Fred","last_name":"Weasley","user_type":"TALENT"}',
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

  -- Insert sample blockouts for all users (around June 11, 2025)
  INSERT INTO talent_blockouts (talent_id, title, description, start_time, end_time, is_all_day)
  VALUES
    -- John Doe (user1) blockouts (San Francisco, CA - UTC-8)
      (user1_id, 'Conference Trip', 'Attending React Conference in San Jose', '2025-06-08 16:00:00+00:00', '2025-06-10 01:00:00+00:00', false),
      (user1_id, 'Family Vacation', 'Week off for family time', '2025-06-14 07:00:00+00:00', '2025-06-22 06:59:59+00:00', true),
      (user1_id, 'Client Meeting', 'Important client presentation', '2025-06-12 21:00:00+00:00', '2025-06-12 23:00:00+00:00', false),
      
      -- Harry Potter blockouts (Kansas City, KS - UTC-6, UTC-5 during summer)
      (harry_id, 'Recording Session', 'Studio time for new album', '2025-06-24 15:00:00+00:00', '2025-06-24 16:00:00+00:00', false),
      (harry_id, 'Wizard Convention', 'Annual gathering of magical musicians', '2025-06-20 05:00:00+00:00', '2025-06-23 04:59:59+00:00', true),
      (harry_id, 'Equipment Maintenance', 'Guitar and lighting gear service', '2025-06-13 14:00:00+00:00', '2025-06-13 22:00:00+00:00', false),

      -- Hermione Granger blockouts (St. Louis, MO - UTC-6, UTC-5 during summer)
      (hermione_id, 'Wedding Event', 'Sound engineering for wedding ceremony', '2025-06-07 13:00:00+00:00', '2025-06-08 04:00:00+00:00', false),
      (hermione_id, 'Equipment Training', 'Learning new sound board techniques', '2025-06-11 18:00:00+00:00', '2025-06-11 23:00:00+00:00', false),
      (hermione_id, 'Corporate Event', 'Managing audio for business conference', '2025-06-18 12:00:00+00:00', '2025-06-19 00:00:00+00:00', false),
      
      -- Ron Weasley blockouts (Omaha, NE - UTC-6, UTC-5 during summer)
      (ron_id, 'Band Practice', 'Weekly rehearsal with the Weasley Brothers Band', '2025-06-11 00:00:00+00:00', '2025-06-11 03:00:00+00:00', false),
      (ron_id, 'Drum Lesson', 'Teaching drums to local kids', '2025-06-12 21:00:00+00:00', '2025-06-12 23:00:00+00:00', false),
      (ron_id, 'Music Festival', 'Three-day festival performance', '2025-06-20 05:00:00+00:00', '2025-06-23 04:59:59+00:00', true),
      
      -- Luna Lovegood blockouts (Lincoln, NE - UTC-6, UTC-5 during summer)
      (luna_id, 'Full Moon Concert', 'Special ethereal performance under full moon', '2025-06-12 01:00:00+00:00', '2025-06-12 07:00:00+00:00', false),
      (luna_id, 'DJ Workshop', 'Teaching experimental mixing techniques', '2025-06-14 19:00:00+00:00', '2025-06-14 23:00:00+00:00', false),
      (luna_id, 'Meditation Retreat', 'Silent retreat for creative inspiration', '2025-06-16 05:00:00+00:00', '2025-06-19 04:59:59+00:00', true),
      
      -- Neville Longbottom blockouts (Wichita, KS - UTC-6, UTC-5 during summer))
      (neville_id, 'Film Shoot', 'Documentary about local gardens', '2025-06-09 11:00:00+00:00', '2025-06-10 01:00:00+00:00', false),
      (neville_id, 'Equipment Rental', 'Picking up new camera gear', '2025-06-13 15:00:00+00:00', '2025-06-13 17:00:00+00:00', false),
      (neville_id, 'Video Editing', 'Post-production work on recent project', '2025-06-15 14:00:00+00:00', '2025-06-15 22:00:00+00:00', false),
      
      -- Ginny Weasley blockouts (Kansas City, MO - UTC-6, UTC-5 during summer))
      (ginny_id, 'Charity Gala', 'Managing large charity fundraising event', '2025-06-08 22:00:00+00:00', '2025-06-09 04:30:00+00:00', false),
      (ginny_id, 'Venue Scouting', 'Checking potential locations for summer events', '2025-06-12 15:00:00+00:00', '2025-06-12 20:00:00+00:00', false),
      (ginny_id, 'Event Planning Meeting', 'Client consultation for wedding', '2025-06-17 19:00:00+00:00', '2025-06-17 21:00:00+00:00', false),
      
      -- Draco Malfoy blockouts (Overland Park, KS - UTC-6, UTC-5 during summer))
      (draco_id, 'Theater Production', 'Lighting design for local theater', '2025-06-07 23:00:00+00:00', '2025-06-08 04:00:00+00:00', false),
      (draco_id, 'Equipment Upgrade', 'Installing new LED lighting system', '2025-06-11 13:00:00+00:00', '2025-06-11 21:00:00+00:00', false),
      (draco_id, 'Fashion Show', 'Runway lighting for fashion week', '2025-06-19 20:00:00+00:00', '2025-06-20 03:00:00+00:00', false),
      
      -- Cho Chang blockouts (Springfield, MO - UTC-6, UTC-5 during summer)
      (cho_id, 'Orchestra Recording', 'Sound engineering for symphony', '2025-06-10 14:00:00+00:00', '2025-06-10 22:00:00+00:00', false),
      (cho_id, 'Audio Workshop', 'Teaching sound engineering basics', '2025-06-14 15:00:00+00:00', '2025-06-14 21:00:00+00:00', false),
      (cho_id, 'Studio Maintenance', 'Calibrating recording equipment', '2025-06-16 14:00:00+00:00', '2025-06-16 17:00:00+00:00', false),
      
      -- Cedric Diggory blockouts (Independence, MO - UTC-6, UTC-5 during summer))
      (cedric_id, 'Commercial Shoot', 'Video production for local business', '2025-06-09 13:00:00+00:00', '2025-06-09 23:00:00+00:00', false),
      (cedric_id, 'Film Festival', 'Attending regional film festival', '2025-06-13 05:00:00+00:00', '2025-06-16 04:59:59+00:00', true),
      (cedric_id, 'Client Review', 'Presenting final cut to client', '2025-06-17 18:00:00+00:00', '2025-06-17 20:00:00+00:00', false),
      
      -- Fred Weasley blockouts (Grand Island, NE - UTC-6, UTC-5 during summer))
      (fred_id, 'Club Night', 'DJ set at downtown venue', '2025-06-08 02:00:00+00:00', '2025-06-08 08:00:00+00:00', false),
      (fred_id, 'Equipment Setup', 'Installing sound system for weekend event', '2025-06-11 19:00:00+00:00', '2025-06-12 01:00:00+00:00', false),
      (fred_id, 'Music Festival', 'Headlining summer music festival', '2025-06-21 05:00:00+00:00', '2025-06-23 04:59:59+00:00', true);
  
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
