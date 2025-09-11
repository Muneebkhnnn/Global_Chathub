import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Home, Login, SignUp, ForgetPassword, TermsAndConditions, EmailVerification, ReVerification, EditProfile, ResetPassword } from './pages'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import ProtectedRoute from './components/ProtectedRoutes.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  },
  {
    path: '/Login',
    element: <Login />
  },
  {
    path: '/SignUp',
    element: <SignUp />
  },
  {
    path: '/verify-email/:verificationToken?',
    element:<EmailVerification />
  },      
  {
    path: '/resend-verification-email',
    element:<ReVerification />
  },      
  {
    path: '/forgot-password',
    element: <ForgetPassword />
  },
  {
    path: '/reset-password/:resetPasswordToken?',
    element:<ResetPassword />
  },
  {
    path: '/Terms&Conditions',
    element: <TermsAndConditions />
  },
  {
    path: '/edit-profile',
    element: (
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    )
  }
])


createRoot(document.getElementById('root')).render(
  <Provider store={store} >
    <App />
    <RouterProvider router={router}>
    </RouterProvider>
  </Provider>
);
