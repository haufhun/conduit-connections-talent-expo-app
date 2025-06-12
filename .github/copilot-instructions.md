We are creating a react-native, iOS and Android expo app using the following technologies:

- React Native
- Expo
- TypeScript
- Expo Router
- Tanstack Query
- Supabase
- Gluestack UI (which uses some nativewind classes)
- Zod, and React Hook Form for form validation

Our app needs to appeal to users who are in their 20s and 30s.
Our app needs to appeal to users who are gig workers in the entertainment industry.
Our app needs to look professional but creative so that the 20s and 30s can relate to it and want to use it.
The app should be easy to use and navigate, with a clean and modern design.
The app should be responsive and work well on both iOS and Android devices.
The app should have a consistent color scheme and typography that reflects the brand identity.
The app should have a clear and concise layout, with easy-to-read text and intuitive icons.
The app should have a user-friendly interface that allows users to easily access the features and functionality they need.
The app should have a visually appealing design that incorporates images and graphics to enhance the user experience.
The app should have a professional look and feel, with a polished and refined design that reflects the quality of the brand.

There are a few purposes of this app:
Tab 1: Profile

- Allow a user to view and change their profile details
- Allow a user to view, create or change their skills (skills are associated with a profile)
  Tab 2: Schedule
- Allow a user to view, create, or change the blockouts they've put on their schedule

When creating, make sure to use Glustack components and nativewind classes (they are at /src/components/ui. Use the npx gluestack-ui add command to add new components)
When creating, make sure to use Expo Router for navigation
When creating, make sure to use Tanstack Query for data fetching and caching
When creating, make sure to use Zod and React Hook Form for form validation
When creating, make sure to use TypeScript for type safety
When creating, make sure to use Supabase for the backend
When creating, make sure to use Expo for the app development

Put the apis in the /src/api directory
Put the components in the /src/components directory
Put the screens in the /src/app directory
Put the types in the /src/types directory
Put the utils in the /src/utils directory
Put the hooks in the /src/hooks directory
Put the providers in the /src/providers directory

Make sure to reference the supabase migration file (at ./supabase/migrations/) for the database schema

Make sure that the look and feel of the app is consistent across all screens and components.
Make sure that the app is using the correct colors, fonts, and styles as per the design guidelines.

Design Guidelines:

- Use a color palette that is modern and appealing to the target audience
- Use a clean and simple layout that is easy to navigate
- Use typography that is easy to read and reflects the brand identity
- Use images and graphics that are relevant to the target audience and enhance the user experience
- Use icons that are intuitive and easy to understand
- Use a consistent design language throughout the app
- Use responsive design principles to ensure the app works well on all devices
- Use animations and transitions that are smooth and enhance the user experience (but not too much)
- Use a design system that is easy to maintain and update
  And make sure that the designs use gluestack theme provider so that it's easy to change the theme

## icons

Use icons from gluestack-ui first. If they are unavailable, use icons from lucide-react-native.

## COLOR SCHEME

Primary Color: Light Blue
Secondary Color: Dark Blue
Third Color: Yellow
Fourth Color: White
Gradient Style: Linear 180

### Code:

Light Blue: #5de0e6
Dark Blue: #004aad
White: #ffffff
Yellow: #ffde59

### Logo

Background: Lighting Arc
Foreground: Logo/Image
“Conduit” Font Size: 45
