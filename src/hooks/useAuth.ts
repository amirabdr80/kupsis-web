import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UserRole {
  role: string
  subjects: string[]
  can_gallery: boolean
}

interface AuthState {
  session: Session | null
  loading: boolean
  isAdmin: boolean
  isChampion: boolean
  championSubjects: string[]
  canGallery: boolean
  canEditSubject: (subject: string) => boolean
}

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
} {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  async function fetchRole(userId: string) {
    const { data } = await supabase
      .from('user_roles')
      .select('role, subjects, can_gallery')
      .eq('user_id', userId)
      .single()
    setUserRole(data ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user?.id) {
        fetchRole(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.id) {
        fetchRole(session.user.id)
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  // Logged in but NO entry in user_roles → full admin (backward compatible for Amir)
  const loggedIn = !!session
  const isAdmin  = loggedIn && (userRole === null || userRole.role === 'admin')
  const isChampion = loggedIn && userRole?.role === 'champion'
  const championSubjects: string[] = isChampion ? (userRole?.subjects ?? []) : []
  const canGallery = isAdmin || (isChampion && (userRole?.can_gallery ?? false))

  function canEditSubject(subject: string): boolean {
    if (isAdmin) return true
    if (isChampion) return championSubjects.includes(subject)
    return false
  }

  return {
    session, loading,
    isAdmin, isChampion, championSubjects, canGallery,
    canEditSubject,
    signIn, signOut,
  }
}
