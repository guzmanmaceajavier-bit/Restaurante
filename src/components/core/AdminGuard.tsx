import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { storage } from '../../lib/storage'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!storage.isAdmin()) {
      navigate('/admin-login', { replace: true })
    }
  }, [navigate])

  if (!storage.isAdmin()) return null

  return <>{children}</>
}
