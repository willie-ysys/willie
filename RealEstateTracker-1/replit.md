# Smart Fridge Manager Application

## Overview

The Smart Fridge Manager is a web application designed to help users track food items in their refrigerator, organized by compartments, with expiration date tracking. The application allows users to visualize their fridge contents, add new items (including through image recognition), and receive alerts about expiring food items.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture:

1. **Frontend**: React-based SPA (Single Page Application) using Vite as the build tool
2. **Backend**: Express.js server with RESTful API endpoints
3. **Database**: Drizzle ORM with PostgreSQL (currently needs to be set up)
4. **UI Framework**: Custom UI using ShadCN UI components (based on Radix UI primitives)
5. **State Management**: React Query for server state management
6. **Styling**: Tailwind CSS for styling and theming

The application is structured with a clear separation between client, server, and shared code:

- `/client`: Contains the React frontend application
- `/server`: Houses the Express.js backend
- `/shared`: Stores schema definitions and types shared between frontend and backend

## Key Components

### Backend Components

1. **Express Server** (`server/index.ts`): The main entry point for the backend application which sets up the server, handles middleware, and registers routes.

2. **API Routes** (`server/routes.ts`): Defines RESTful API endpoints for:
   - Food item management (CRUD operations)
   - Compartment-specific queries
   - Expiring items tracking
   - (Potentially) OCR image processing for food recognition

3. **Data Storage** (`server/storage.ts`): Implements data access operations using Drizzle ORM:
   - Food item operations
   - User management
   - Statistics calculations

4. **Database Schema** (`shared/schema.ts`): Defines the database schema using Drizzle ORM with:
   - Food items table
   - Zod validation schemas
   - Type definitions for food categories and compartments

### Frontend Components

1. **Main Application** (`client/src/App.tsx` & `client/src/main.tsx`): The entry point for the React application, setting up routing and global providers.

2. **Home Page** (`client/src/pages/home.tsx`): The main dashboard displaying:
   - Fridge visualization
   - Food item statistics
   - Quick add functionality
   - Expiring items list

3. **Interactive Fridge** (`client/src/components/FridgeImage.tsx`): Visual representation of a refrigerator with clickable compartments.

4. **Modals**:
   - `CompartmentModal.tsx`: Shows items in a selected compartment
   - `AddItemModal.tsx`: Form for adding/editing food items
   - `OcrProcessingModal.tsx`: Handles image upload and OCR processing for automatic food recognition

5. **Utility Components**:
   - UI components from ShadCN UI library
   - Custom hooks for toast notifications, mobile detection, etc.
   - Query client for data fetching

## Data Flow

1. **Adding Food Items**:
   - User clicks on a fridge compartment or "Quick Add" button
   - Add Item modal appears allowing manual entry or image upload
   - Data is validated and sent to the backend via API
   - Database is updated and UI refreshes with the new item

2. **Viewing Compartment Contents**:
   - User clicks on a compartment in the fridge visualization
   - Backend retrieves items for that compartment
   - Compartment modal displays items with options to edit or delete

3. **Monitoring Expiration Dates**:
   - Backend regularly checks for expiring items
   - UI displays notifications for items nearing expiration
   - Statistics are updated to reflect current fridge state

## External Dependencies

### Frontend
- React for UI rendering
- React Query for data fetching
- Radix UI for accessible UI components
- Tailwind CSS for styling
- Zod for form validation
- React Hook Form for form handling
- Lucide for icons
- date-fns for date formatting

### Backend
- Express for server and routing
- Drizzle ORM for database operations
- Multer for file uploads (for OCR feature)
- Zod for validation

## Deployment Strategy

The application is designed to be deployed on Replit:

1. **Development Mode**: 
   - Uses `npm run dev` command
   - Starts the Express server with vite in middleware mode for hot reloading
   - Connects to the database

2. **Production Mode**:
   - Build step: `npm run build`
   - Compiles frontend with Vite and backend with esbuild
   - Starts the server with `npm run start`
   - Serves static files from the built frontend

3. **Database**:
   - Postgres is provisioned as a Replit module
   - Connection is established via DATABASE_URL environment variable
   - Drizzle schema is pushed using `npm run db:push`

## Setup Requirements

To get the application running:

1. Ensure the PostgreSQL module is properly initialized
2. Set up the DATABASE_URL environment variable
3. Run `npm run db:push` to initialize the database schema
4. Start the application with `npm run dev`

## Current Limitations

1. The image recognition/OCR feature appears to be planned but not fully implemented
2. User authentication system is defined in the storage interface but not fully implemented
3. Database schema and queries need to be correctly set up for PostgreSQL