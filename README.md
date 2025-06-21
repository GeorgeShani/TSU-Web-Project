# Echowave 🎵

A full-featured music player web application built for the TSU Web Project course.

**Lecturer:** Miranda Makharashvili  
**Project:** TSU Web Project  
**Developer:** [Your Name]

## 📖 Overview

Echowave is a modern, responsive music player web application that allows users to upload, organize, and stream their music collection. Built with a focus on user experience and advanced audio capabilities, it provides a comprehensive platform for music enthusiasts to manage their digital music library.

## 🚀 Features

- **User Authentication** - Secure signup and login system
- **Music Upload** - Upload and store music files in the cloud
- **Playlist Management** - Create and organize custom playlists
- **Advanced Audio Player** - High-quality audio playback with AudioContext API
- **Music Search** - Find tracks quickly with integrated search functionality
- **User Profiles** - Personalized user profiles and preferences
- **Cloud Storage** - Reliable file storage with AWS S3 integration
- **Responsive Design** - Optimized for desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup structure
- **SCSS** - Advanced CSS preprocessing for maintainable styles
- **JavaScript (ES6+)** - Modern JavaScript for interactive functionality
- **AudioContext API** - Advanced audio handling and processing

### Backend
- **PHP** - Server-side logic and API endpoints
- **MySQL** - Relational database for user data and music metadata
- **AJAX** - Asynchronous communication between frontend and backend

### Tools & Services
- **Composer** - PHP package manager for dependency management
- **Laravel Herd** - Modern PHP development server for local development
- **AWS S3** - Cloud storage bucket for music file storage

## 📁 Project Structure

The application consists of 8 main pages:

1. **index** - Homepage and main music player interface
2. **signup** - User registration page
3. **login** - User authentication page
4. **profile** - User profile management
5. **upload** - Music file upload interface
6. **add-playlist** - Playlist creation and management
7. **play** - Dedicated music playback page
8. **search** - Music search and discovery

## 🎵 Audio Features

- **AudioContext Integration** - Utilizes the Web Audio API for:
  - High-quality audio processing
  - Real-time audio analysis
  - Custom audio effects and filters
  - Precise playback control
  - Audio visualization capabilities

## 🔧 Installation & Setup

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Composer
- Laravel Herd (PHP development server)
- AWS S3 account and credentials

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd echowave
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Database Setup**
   - Create a MySQL database
   - Import the provided SQL schema
   - Update database credentials in configuration files

4. **AWS S3 Configuration**
   - Set up AWS S3 bucket
   - Configure AWS credentials
   - Update S3 settings in the application

5. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update all necessary environment variables

6. **Start the development server**
   ```bash
   # Using Laravel Herd
   herd serve
   
   # Or using PHP built-in server
   php -S localhost:8000
   ```
   - Access the application at the URL provided by Herd or `http://localhost:8000`
   - Herd automatically handles PHP server configuration

## 🌟 Key Technical Highlights

- **Modular Architecture** - Clean separation of concerns with organized file structure
- **Secure File Upload** - Validated file uploads with cloud storage integration
- **Responsive Design** - Mobile-first approach with SCSS for maintainable styles
- **AJAX-Powered** - Smooth user experience with asynchronous operations
- **Advanced Audio Processing** - AudioContext API for professional audio handling
- **Database Optimization** - Efficient MySQL queries and proper indexing

## 📱 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

*Note: AudioContext API features require modern browser support*

## 🔐 Security Features

- Password hashing and salting
- SQL injection prevention
- XSS protection
- CSRF token validation
- Secure file upload validation

## 📊 Database Schema

The application uses a normalized MySQL database structure with tables for:
- Users and authentication
- Music tracks and metadata
- Playlists and user preferences
- File storage references

## 🎯 Future Enhancements

- Real-time collaboration on playlists
- Social sharing features
- Advanced audio equalizer
- Mobile application development
- Integration with music streaming APIs

## 📄 License

This project is developed as part of the TSU Web Project course.

---

**Academic Project** - Tbilisi State University  
**Course:** Web Development  
**Instructor:** Miranda Makharashvili