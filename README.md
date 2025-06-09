# 🎓 University Admission System - Frontend

## 📋 Introduction

This is the frontend application for the University Admission System of Ho Chi Minh City University of Technology and Education (HCMUTE), developed with React.js. The system provides a complete platform for online admission processes with 3 main user groups: Students, Reviewer and Administrators.

## ✨ Key Features

### 👨‍🎓 For Students:
- **Account Registration**: 3-step registration process with email verification
- **Profile Management**: Update personal information and profile pictures
- **Wish Registration**: Select majors and prioritize admission preferences
- **Admission Results**: Check admission results
- **Live Chat**: Chat support with administrators
- **Admission Information**: View announcements, timeline, majors, and criteria

### 👩‍💼 For Admission Officers (Reviewers):
- **Student Application Review**: View detailed student information
- **Application Management**: View personal information, academic progress, transcripts, photos
- **Application Approval**: Approve or reject student applications

### 🔧 For Administrators:
- **Admission System Management**: Admission years, blocks, majors, criteria, regions, objects, quotas
- **User Management**: User lists and permission management
- **Statistics**: System overview reports
- **Chat Support**: Answer questions from students
- **Filtering and Export**: Filter students by criteria, export admission lists

## 🛠️ Technologies Used

### Core Technologies:
- **React 18.3.1**: JavaScript library for building user interfaces
- **React Router DOM 7.6.0**: Navigation for SPA applications
- **React Scripts 5.0.1**: Build tools and development server

### UI & Styling:
- **Tailwind CSS 3.4.13**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **React Icons**: Diverse icon library
- **Heroicons**: Icon set from Tailwind team

### Forms & Rich Text:
- **CKEditor 5**: Rich text editor
- **TinyMCE**: Advanced text editor
- **React Quill**: Rich text editor for React

### Data & API:
- **Axios 1.9.0**: HTTP client for API calls
- **JWT Decode**: JSON Web Token decoder
- **PapaParse**: CSV file parser
- **XLSX**: Excel file processing

### Real-time & Communication:
- **Socket.io Client**: WebSocket connection for real-time chat
- **React Toastify**: Toast notifications

### Visualization:
- **Chart.js & React-ChartJS-2**: Charts and statistics
- **Day.js**: Date/time manipulation library

### Testing:
- **Testing Library**: React testing suite
- **Jest**: Testing framework

## 📁 Project Structure

```
kltn-frontend/
├── public/
│   ├── index.html              # Main HTML template
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt              # SEO robots
│   ├── logo_hcmute.png         # University logo
│   ├── banner-*.jpg            # Banner images
│   └── Major/                  # Major images
├── src/
│   ├── components/             # Reusable components
│   │   ├── HomePage.jsx        # Home page
│   │   ├── Header.jsx          # Navigation bar
│   │   ├── Footer.jsx          # Footer
│   │   ├── Banner.jsx          # Main banner
│   │   ├── ProtectedRoute.jsx  # Route protection by role
│   │   ├── Timeline.jsx        # Admission timeline
│   │   └── Announcements.jsx   # Announcements
│   ├── pages/
│   │   ├── UserPages/          # Student pages
│   │   │   ├── Register/       # Registration process
│   │   │   ├── ProfilePage/    # Profile management
│   │   │   ├── ForgotPassword/ # Password recovery
│   │   │   ├── Wish.jsx        # Wish registration
│   │   │   ├── Major.jsx       # Major list
│   │   │   ├── Block.jsx       # Exam blocks
│   │   │   ├── Criteria.jsx    # Admission criteria
│   │   │   ├── Chat.jsx        # Chat with admin
│   │   │   └── AdmissionResult.jsx # Admission results
│   │   ├── AdminPages/         # Admin pages
│   │   │   ├── AdminPage.jsx   # Admin layout
│   │   │   ├── StatisticsPage/ # Statistics
│   │   │   ├── UserPage/       # User management
│   │   │   ├── AdmissionYearPage/ # Admission year management
│   │   │   ├── AdmissionMajorPage/ # Major management
│   │   │   ├── ChatPage/       # Admin chat
│   │   │   └── FilterPage/     # Student filtering
│   │   ├── ReviewerPages/      # Reviewer pages
│   │   │   ├── ReviewerPage.jsx # Reviewer layout
│   │   │   ├── UserDetailPage.jsx # Student details
│   │   │   ├── Information.jsx # Personal information
│   │   │   ├── LearningProcess.jsx # Academic progress
│   │   │   ├── Transcript.jsx  # Transcripts
│   │   │   └── Photo.jsx       # Student photos
│   │   ├── Login.jsx           # Login page
│   │   └── GoogleCallback.jsx  # Google authentication
│   ├── contexts/
│   │   └── AuthContext.js      # Authentication context
│   ├── hooks/                  # Custom hooks
│   ├── layouts/
│   │   └── AppLayout.jsx       # Main layout
│   ├── styles/                 # Custom CSS files
│   ├── assets/                 # Static resources
│   ├── App.js                  # Main component
│   └── index.js                # Entry point
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # Documentation
```

## 🚀 Installation and Setup

### System Requirements:
- Node.js >= 16.0.0
- npm >= 8.0.0

### Step 1: Clone repository
```bash
git clone <repository-url>
cd kltn-frontend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure environment variables
Create a `.env` file in the root directory:
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Step 4: Run the application
```bash
# Run development environment
npm start

# Build for production
npm run build

# Run tests
npm test
```

The application will run at: `http://localhost:3000`

## 🔐 Permission System

### User Roles:
- **user**: Students - Can register, manage profiles, register wishes
- **reviewer**: Admission Officers - Review student applications
- **admin**: Administrators - Manage entire system

### Protected Routes:
- Uses `ProtectedRoute` component to protect routes by role
- JWT token stored in localStorage
- Auto-refresh token when expired

## 📱 Responsive Design

The application is designed to be responsive, compatible with:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🎨 UI/UX Features

### Design System:
- **Color Scheme**: Blue gradient theme suitable for educational context
- **Typography**: Clear, readable font system
- **Icons**: Lucide React and Heroicons
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: ARIA labels and keyboard navigation

### Key UI Components:
- Gradient buttons with hover effects
- Modal dialogs for important actions
- Toast notifications for feedback
- Loading spinners for async operations
- Form validation with error messages
- Rich text editors for content

## 🔧 Advanced Features

### Real-time Chat:
- Socket.io integration
- Admin-user communication
- Online status tracking
- Message history

### File Upload:
- Image upload for profiles and documents
- Excel file processing for data import
- CSV export for reports

### Data Visualization:
- Chart.js integration
- Statistics dashboard
- Real-time data updates

### Authentication:
- JWT-based authentication
- Google OAuth integration
- Password reset flow
- Session management

## 📊 Performance Optimization

- **Code Splitting**: Lazy loading for routes
- **Image Optimization**: Responsive images with appropriate sizing
- **Bundle Analysis**: Optimized bundle size
- **Caching**: Service worker for offline support

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

## 🚀 Deployment

### Build Production:
```bash
npm run build
```

### Deploy to hosting platforms:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop build folder
- **Firebase**: `firebase deploy`

## 📋 API Integration

The application connects to backend API through:
- **Base URL**: Configured in environment variables
- **Authentication**: Bearer token in headers
- **Error Handling**: Centralized error handling with Axios interceptors

### Main API Endpoints:
```javascript
// Authentication
POST /api/auth/login
POST /api/auth/register
POST /api/auth/forgot-password

// User Management
GET /api/users/profile
PUT /api/users/profile
POST /api/users/upload-avatar

// Admission
GET /api/admission/majors
POST /api/admission/register-wish
GET /api/admission/results

// Admin
GET /api/admin/statistics
GET /api/admin/users
POST /api/admin/approve-user
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Create a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Team

- **Frontend Developer**: Nguyễn Duy Sơn - Phạm Lê Thiên Phú 
- **Backend Developer**: Nguyễn Duy Sơn - Phạm Lê Thiên Phú 
- **UI/UX Designer**: Nguyễn Duy Sơn - Phạm Lê Thiên Phú 



---

*The product is a non-commercial graduation thesis developed by students at Ho Chi Minh City University of Technology and Education*

