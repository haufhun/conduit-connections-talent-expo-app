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

  -- Insert sample blockouts for all users (around June 11, 2025)
  INSERT INTO talent_blockouts (talent_id, title, description, start_time, end_time, is_all_day, timezone)
  VALUES 
    -- John Doe (user1) blockouts
    (user1_id, 'Conference Trip', 'Attending React Conference in San Jose', '2025-06-08 09:00:00-07:00', '2025-06-10 18:00:00-07:00', false, 'America/Los_Angeles'),
    (user1_id, 'Family Vacation', 'Week off for family time', '2025-06-14 00:00:00-07:00', '2025-06-21 23:59:59-07:00', true, 'America/Los_Angeles'),
    (user1_id, 'Client Meeting', 'Important client presentation', '2025-06-12 14:00:00-07:00', '2025-06-12 16:00:00-07:00', false, 'America/Los_Angeles'),
    
    -- Harry Potter blockouts
    (harry_id, 'Recording Session', 'Studio time for new album', '2025-06-09 10:00:00-05:00', '2025-06-09 22:00:00-05:00', false, 'America/Chicago'),
    (harry_id, 'Wizard Convention', 'Annual gathering of magical musicians', '2025-06-15 00:00:00-05:00', '2025-06-16 23:59:59-05:00', true, 'America/Chicago'),
    (harry_id, 'Equipment Maintenance', 'Guitar and lighting gear service', '2025-06-13 09:00:00-05:00', '2025-06-13 17:00:00-05:00', false, 'America/Chicago'),
    
    -- Hermione Granger blockouts  
    (hermione_id, 'Wedding Event', 'Sound engineering for wedding ceremony', '2025-06-07 08:00:00-05:00', '2025-06-07 23:00:00-05:00', false, 'America/Chicago'),
    (hermione_id, 'Equipment Training', 'Learning new sound board techniques', '2025-06-11 13:00:00-05:00', '2025-06-11 18:00:00-05:00', false, 'America/Chicago'),
    (hermione_id, 'Corporate Event', 'Managing audio for business conference', '2025-06-18 07:00:00-05:00', '2025-06-18 19:00:00-05:00', false, 'America/Chicago'),
    
    -- Ron Weasley blockouts
    (ron_id, 'Band Practice', 'Weekly rehearsal with the Weasley Brothers Band', '2025-06-10 19:00:00-05:00', '2025-06-10 22:00:00-05:00', false, 'America/Chicago'),
    (ron_id, 'Drum Lesson', 'Teaching drums to local kids', '2025-06-12 16:00:00-05:00', '2025-06-12 18:00:00-05:00', false, 'America/Chicago'),
    (ron_id, 'Music Festival', 'Three-day festival performance', '2025-06-20 00:00:00-05:00', '2025-06-22 23:59:59-05:00', true, 'America/Chicago'),
    
    -- Luna Lovegood blockouts
    (luna_id, 'Full Moon Concert', 'Special ethereal performance under full moon', '2025-06-11 20:00:00-05:00', '2025-06-12 02:00:00-05:00', false, 'America/Chicago'),
    (luna_id, 'DJ Workshop', 'Teaching experimental mixing techniques', '2025-06-14 14:00:00-05:00', '2025-06-14 18:00:00-05:00', false, 'America/Chicago'),
    (luna_id, 'Meditation Retreat', 'Silent retreat for creative inspiration', '2025-06-16 00:00:00-05:00', '2025-06-18 23:59:59-05:00', true, 'America/Chicago'),
    
    -- Neville Longbottom blockouts
    (neville_id, 'Film Shoot', 'Documentary about local gardens', '2025-06-09 06:00:00-05:00', '2025-06-09 20:00:00-05:00', false, 'America/Chicago'),
    (neville_id, 'Equipment Rental', 'Picking up new camera gear', '2025-06-13 10:00:00-05:00', '2025-06-13 12:00:00-05:00', false, 'America/Chicago'),
    (neville_id, 'Video Editing', 'Post-production work on recent project', '2025-06-15 09:00:00-05:00', '2025-06-15 17:00:00-05:00', false, 'America/Chicago'),
    
    -- Ginny Weasley blockouts
    (ginny_id, 'Charity Gala', 'Managing large charity fundraising event', '2025-06-08 17:00:00-05:00', '2025-06-08 23:30:00-05:00', false, 'America/Chicago'),
    (ginny_id, 'Venue Scouting', 'Checking potential locations for summer events', '2025-06-12 10:00:00-05:00', '2025-06-12 15:00:00-05:00', false, 'America/Chicago'),
    (ginny_id, 'Event Planning Meeting', 'Client consultation for wedding', '2025-06-17 14:00:00-05:00', '2025-06-17 16:00:00-05:00', false, 'America/Chicago'),
    
    -- Draco Malfoy blockouts
    (draco_id, 'Theater Production', 'Lighting design for local theater', '2025-06-07 18:00:00-05:00', '2025-06-07 23:00:00-05:00', false, 'America/Chicago'),
    (draco_id, 'Equipment Upgrade', 'Installing new LED lighting system', '2025-06-11 08:00:00-05:00', '2025-06-11 16:00:00-05:00', false, 'America/Chicago'),
    (draco_id, 'Fashion Show', 'Runway lighting for fashion week', '2025-06-19 15:00:00-05:00', '2025-06-19 22:00:00-05:00', false, 'America/Chicago'),
    
    -- Cho Chang blockouts  
    (cho_id, 'Orchestra Recording', 'Sound engineering for symphony', '2025-06-10 09:00:00-05:00', '2025-06-10 17:00:00-05:00', false, 'America/Chicago'),
    (cho_id, 'Audio Workshop', 'Teaching sound engineering basics', '2025-06-14 10:00:00-05:00', '2025-06-14 16:00:00-05:00', false, 'America/Chicago'),
    (cho_id, 'Studio Maintenance', 'Calibrating recording equipment', '2025-06-16 09:00:00-05:00', '2025-06-16 12:00:00-05:00', false, 'America/Chicago'),
    
    -- Cedric Diggory blockouts
    (cedric_id, 'Commercial Shoot', 'Video production for local business', '2025-06-09 08:00:00-05:00', '2025-06-09 18:00:00-05:00', false, 'America/Chicago'),
    (cedric_id, 'Film Festival', 'Attending regional film festival', '2025-06-13 00:00:00-05:00', '2025-06-15 23:59:59-05:00', true, 'America/Chicago'),
    (cedric_id, 'Client Review', 'Presenting final cut to client', '2025-06-17 13:00:00-05:00', '2025-06-17 15:00:00-05:00', false, 'America/Chicago'),
    
    -- Fred Weasley blockouts
    (fred_id, 'Club Night', 'DJ set at downtown venue', '2025-06-07 21:00:00-05:00', '2025-06-08 03:00:00-05:00', false, 'America/Chicago'),
    (fred_id, 'Equipment Setup', 'Installing sound system for weekend event', '2025-06-11 14:00:00-05:00', '2025-06-11 20:00:00-05:00', false, 'America/Chicago'),
    (fred_id, 'Music Festival', 'Headlining summer music festival', '2025-06-21 00:00:00-05:00', '2025-06-22 23:59:59-05:00', true, 'America/Chicago');
  
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
