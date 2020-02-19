# TimetaBros

- Andrew Leung | leunga56 | 1003289498
- Alex Wong
- Jeffrey So

The goal of TimetaBros is to form new connections as well as strengthen existing connections between users through their schedules.

## Technologies

- Golang (back-end)
- Flutter (front-end)

## Beta version features

- Users can publish their weekly schedules which can be changed at any time
- Users can add in temporary items to their schedules (with an expiry date)
- Users can add friends manually or through recommendations by either common friends or similar schedules
- Users can create groups which will generate one collective schedule using all members' individual schedules
- Users can create events and invite friends to it; all schedules the users are involved in will reflect this change
- Privacy settings for who can view your schedule and events

## Final version features

- Use Cobalt API to let users input courses they plan to take and make it easier to fill in their schedule as well as possibly optimize their schedules with other users (for example: so that they can spend the most time together)
- Users receive notifications whenever a friend makes a change to their schedule (this can be adjusted with notification settings for example: whether they must have group in common, or receive no notifications at all, etc.)
- Provide support for sharing their schedule to other social media networks

## Top 5 technical challenges

- Generating and displaying a visually appealing group schedule with all invdividual schedules compiled dynamically
- How users will be notified when a friend makes a change to their schedule
- Processing information from Cobalt API to suggest optimal scheduling for users
- Learning Golang and Flutter
- Friend recommendation algorithms
