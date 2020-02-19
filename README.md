# TimetaBros

- Andrew Leung
- Alex Wong
- Jeffrey So

Users submit their weekly schedule to the application. Users may add friends which may be through the recommendation system either through common friends or through similar schedule. Users may also form groups and the application will then generate one collective schedule using all members' individual schedules. Users may also create events and invite others to this event; all schedules the users are involved in will reflect this change. There will be privacy settings involving events and schedules.

## Technologies

- Golang (back-end)
- Flutter (front-end)

## Beta version features

- Users can publish their schedules which can be changed at any time
- Users can add in temporary items to their schedules (with an expiry date)
- Users can add friends through recommendations by either common friends or similar schedules
- Users can create groups which will have a group schedule
- Users can create events and invite friends to it
- Privacy settings for who can view your schedule and events

## Final version features

- Use Cobalt API to let users input courses they plan to take and make it easier to fill in their schedule and possibly optimize their schedules with other users (for example: so that they can spend the most time together)
- Users receive notifications whenever a friend makes a change to their schedule (this can be adjusted with notification settings whether they must have a common group, or receive no notifications at all, etc.)
- Provide support for sharing their schedule to other social media networks

## Top 5 technical challenges

- Generating and displaying a visually appealing group schedule with all invdividual schedules compiled dynamically
- How users will be notified when a friend makes a change to their schedule
- Processing information from Cobalt API to suggest optimal scheduling for users
- Learning Golang and Flutter
- Friend recommendation algorithms
