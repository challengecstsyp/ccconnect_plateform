import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export const metadata = {
   icons: {
    icon: '/icon.png',
  },
  title: 'CConnect - AI-Powered Career Platform',
  description: 'Boost your career with AI-powered resume analysis, interview simulation, and job matching',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

