import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../features/auth/auth.service'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!authService.isAdmin()) {
      navigate('/admin-login', { replace: true })
    }
  }, [navigate])

  if (!authService.isAdmin()) return null

  return <>{children}</>
}
