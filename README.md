Reservo — Resource Reservation Management System

Reservo is a web application that helps an organization manage and book shared resources such as rooms, equipment, and vehicles. It helps people check availability and make reservations without overlapping bookings.

ER diagram: Add your shareable link here.
Demo video: Add your link here if available. Otherwise, submit it through the assessment form.
The problem

Reservations were managed through messages and manual records. This made it difficult to track bookings, check availability, and avoid double bookings.

Reservo solves this problem by keeping all resources and reservations in one place. Users can easily see which resources are available and when they can be booked.

Features
Resource management: Add, edit, deactivate, and reactivate rooms, equipment, and vehicles.
Prevent double bookings: The system rejects a booking if the selected resource is already booked for that time. It also shows a message about the conflicting booking.
Daily schedule: View all bookings for each resource on a daily timeline. Users can see free time, filter resources by type, and change the date.
Reservation management: View upcoming, past, and cancelled reservations. Users can cancel a reservation after confirmation.
Dashboard: View active resources, resources currently in use, today's bookings, weekly usage, and currently available resources.
Technologies used
Next.js with App Router
TypeScript
PostgreSQL database
Prisma ORM (version 7)
Tailwind CSS
Lucide React icons
Git and GitHub
Important design decisions

1. Preventing double bookings

The database itself prevents two confirmed reservations from overlapping for the same resource. This is important because two users might try to book the same resource at the same time.

The application checks for conflicts first and displays a helpful message. The database also checks for conflicts to prevent problems when requests happen simultaneously.

Bookings can be made one after another. For example, one booking can end at 11:00 AM and the next can start at 11:00 AM.

2. Cancelling reservations and deactivating resources

Reservations are cancelled instead of deleted, so their history is preserved. A cancelled reservation no longer blocks that time slot.

Resources are deactivated instead of deleted, so their booking history remains available. A resource cannot be deactivated while it has upcoming reservations.

3. Automatically calculating booking status

The database stores only two reservation statuses: CONFIRMED and CANCELLED.

The application calculates whether a confirmed reservation is currently in progress or has already finished. This prevents the status from becoming outdated as time passes.

4. Keeping booking rules in one place

All booking rules are handled in lib/reservations.ts. These rules include:

The end time must be after the start time.
Bookings must be between 8:00 AM and 6:00 PM.
Past bookings are not allowed.
The resource must be active.
The number of attendees must not exceed the resource's capacity.
The selected time must not overlap another confirmed reservation.

This makes the rules easier to maintain and test.

5. Checking data on the server

The application checks booking details on the server, not only in the browser. This prevents users from bypassing the rules by changing browser-side data.

6. Using Sri Lanka time

All bookings use the Asia/Colombo time zone (UTC+05:30). The application stores dates and times in PostgreSQL and displays them in Sri Lanka time.

Getting started
Requirements
Node.js 20 or later
PostgreSQL 14 or later
Git
PostgreSQL support for the btree_gist extension
Installation steps

# 1. Download the project

git clone https://github.com/Sowmiya1301/reservo.git
cd reservo

# 2. Install dependencies

npm install

# 3. Create the database

psql -U postgres -c "CREATE DATABASE reservo;"

# 4. Set up environment variables

cp .env.example .env

On Windows, use:

copy .env.example .env

Open the .env file and enter your PostgreSQL connection details.

Then run:

# 5. Set up the database tables

npx prisma migrate deploy

# 6. Generate the Prisma client

npx prisma generate

# 7. Optional: Add sample resources

npx tsx Scripts/seed.ts

# 8. Start the application

npm run dev

Open http://localhost:3000 in your browser.

To add three sample bookings for the current day, you can also run:

npx tsx Scripts/seed-demo.ts

Run this optional script once.

Project structure
app/
page.tsx
schedule/
resources/
reservations/

components/
sidebar.tsx

lib/
prisma.ts
reservations.ts
time.ts

prisma/
schema.prisma
migrations/

Scripts/

app/ contains the pages of the application.
components/ contains reusable interface components.
lib/prisma.ts manages the database connection.
lib/reservations.ts contains the booking rules and conflict checks.
lib/time.ts handles time zones and opening hours.
prisma/ contains the database schema and migration files.
Scripts/ contains scripts for sample data and testing booking rules.
Database design

The application has two main tables.

Resources: Stores resource details such as name, type, capacity, location, and whether the resource is active.

Reservations: Stores booking details such as the resource, booker's name, purpose, number of attendees, notes, start time, end time, and reservation status.

One resource can have many reservations. The database uses a rule to prevent overlapping confirmed reservations for the same resource.

See the ER diagram using the link provided at the top.

Testing the booking rules

Run these commands to test the booking rules:

npx tsx Scripts/test-overlap.ts
npx tsx Scripts/test-booking.ts

test-overlap.ts checks that the database rejects overlapping bookings.
test-booking.ts checks rules such as booking times, past dates, capacity, and overlapping reservations.

Both scripts create temporary test data and remove it after testing.

Assumptions and limitations
The application does not have login or user roles.
The booker's name is entered as plain text.
Existing reservations cannot be edited. To change a booking, users must cancel it and create a new one.
Recurring bookings are not supported.
Resources cannot be marked as under maintenance.
The application uses one time zone: Sri Lanka time.
Opening hours are fixed from 8:00 AM to 6:00 PM.
Testing is done through scripts rather than a complete automated testing system.
Note on AI assistance

Claude was used to help with guidance and code review during development. The design decisions and implementation choices are mine, and I can explain how they work.
