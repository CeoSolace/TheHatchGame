# Admin Guide

This guide explains how to use the built‑in admin panel of **THE HATCH**. The admin panel allows moderators to manage players, teams, reports and more.

## Enabling the Admin Panel

1. Set the environment variables `ADMIN_USER` and `ADMIN_PASS` in your `.env` file or Render environment group. If either variable is missing the `/admin` routes will return **404 Not Found** and the panel will be disabled.
2. Restart the server. The credentials are read at runtime and compared using constant‑time comparison.

## Logging In

Navigate to `/admin/login`. Enter your username and password. Upon successful authentication you will be redirected to the dashboard and an HTTP‑only cookie will be set with an 8‑hour expiry. Do not share this cookie.

## Dashboard

The dashboard provides high‑level metrics such as the number of pending reports. Additional cards can be added to summarise active rooms, total users, etc.

## Reports

The **Reports** page lists all in‑game reports submitted by players. Each report includes:

- `reportedUserId`: the ID of the player being reported
- `category`: the type of infraction
- `text`: free‑form description (up to 500 characters)
- `roomId`: the match in which the report occurred
- `events`: up to the last 50 game events for context (chat is excluded)

Use the **Mark Reviewed** button to mark a report as handled. Use **Dismiss** to mark it without taking action. Both actions set the `reviewed` flag so the report is no longer highlighted.

## Users

The **Users** page will display a list of registered players when MongoDB is configured. You can ban or unban accounts, view their friend lists and reset their passwords. In guest‑only mode this page is empty.

## Teams

The **Teams** page lists all community teams. Admins can toggle the verified badge on a team. Verified teams appear with a ✔️ on their public page. Additional actions could include editing the description, uploading new artwork and deleting the team entirely.

## Invites

Organisation Owner invites grant a user the ability to create and manage their own team. Admins can generate a new invite token with an optional preset slug. Share the token privately with the intended user. Invites can be revoked at any time.

## Logging Out

Click the **Logout** link in the admin header to invalidate your session. The cookie will be cleared and you will be redirected to the login page.

## Rate Limits and Security

Admin routes are protected by a middleware that checks for a valid session cookie and the existence of admin credentials. All sensitive actions are handled server‑side. Do not attempt to perform admin actions via the client API without a valid session.