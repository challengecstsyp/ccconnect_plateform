import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export const metadata = {
  title: 'UtopiaHire - AI-Powered Career Platform',
  description: 'Boost your career with AI-powered resume analysis, interview simulation, and job matching',
  icons: {
    icon: '/challenge_cs_logo_mini_without_bg.png',
    apple: '/challenge_cs_logo_mini_without_bg.png',
  },
  openGraph: {
    images: ['/challenge_cs_logo_mini_without_bg.png'],
  },
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

