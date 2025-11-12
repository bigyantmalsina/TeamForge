# Web Development Project 7 - *TeamForge*

Submitted by: **Bigyan Timalsina**

This web app: **TeamForge is a modern team management application that allows users to create, organize, and manage their dream team members. Users can add crewmates with custom attributes including roles, multiple skills, experience levels, and notes. The app features a sleek cyan and pink gradient UI with real-time updates, search functionality, category filtering, and comprehensive CRUD operations for managing team members.**

Time spent: **12** hours spent in total

## Required Features

The following **required** functionality is completed:

- [x] **The web app contains a page that features a create form to add a new crewmate**
  - Users can name the crewmate
  - Users can set the crewmate's attributes by clicking on one of several values
- [x] **The web app includes a summary page of all the user's added crewmates**
  - The web app contains a summary page dedicated to displaying all the crewmates the user has made so far
  - The summary page is sorted by creation date such that the most recently created crewmates appear at the top
- [x] **A previously created crewmate can be updated from the list of crewmates in the summary page**
  - Each crewmate has an edit button that will take users to an update form for the relevant crewmate
  - Users can see the current attributes of their crewmate on the update form
  - After editing the crewmate's attribute values using the form, the user can immediately see those changes reflected in the update form and on the summary page 
- [x] **A previously created crewmate can be deleted from the crewmate list**
  - Using the edit form detailed in the previous _crewmates can be updated_ feature, there is a button that allows users to delete that crewmate
  - After deleting a crewmate, the crewmate should no longer be visible in the summary page
- [x] **Each crewmate has a direct, unique URL link to an info page about them**
  - Clicking on a crewmate in the summary page navigates to a detail page for that crewmate
  - The detail page contains extra information about the crewmate not included in the summary page
  - Users can navigate to to the edit form from the detail page

The following **optional** features are implemented:

- [x] A crewmate can be given a category upon creation which restricts their attribute value options
  - e.g., a Dungeons and Dragons class or a development team role (project manager, product owner, etc.)
  - User can choose a `category` option to describe their crewmate before any attributes are specified
  - Based on the category value, users are allowed to access only a subset of the possible attributes
- [x] A section of the summary page, displays summary statistics about a user's crew on their crew page
  - e.g., the percent of members with a certain attribute 
- [x] The summary page displays a custom "success" metric about a user's crew which changes the look of the crewmate list
  - e.g., a pirate crew's predicted success at commandeering a new galley

The following **additional** features are implemented:

* [x] Multi-select skills functionality - users can select multiple skills per crewmate instead of just one
* [x] Search functionality to filter team members by name
* [x] Loading states and error handling for better user experience
* [x] Responsive design that works seamlessly on mobile, tablet, and desktop
* [x] Smooth animations and hover effects throughout the application
* [x] Back button navigation for intuitive user flow
* [x] Skill counter showing how many skills are selected
* [x] Visual role selection with emoji icons (👑 Leader, 🔧 Engineer, etc.)

## Video Walkthrough

Here's a walkthrough of implemented user stories:

<img src='TeamForge.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />

GIF created with adobe.com 

## Notes

Challenges encountered while building the app:

- Implementing multi-select skills functionality required careful state management to handle arrays of selected skills
- Setting up Supabase real-time subscriptions to automatically update the gallery when changes occur
- Designing a responsive grid layout that works well across all screen sizes
- Managing the dynamic category-based skill and level options that change based on user selection
- Creating smooth transitions and animations while maintaining good performance
- Handling edge cases like empty states, loading states, and error messages gracefully

## License

    Copyright 2024 Your Name

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.