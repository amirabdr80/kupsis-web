import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UserRole {
  role: string
  subjects: string[]
  can_gallery: boolean
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [roleFetched, setRoleFetched] = useState(false)

  async function fetchRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, subjects, can_gallery')
        .eq('user_id', userId)
        .single()

      // Jika table belum wujud atau tiada rekod → null (admin penuh)
      if (error || !data) {
        setUserRole(null)
      } else {
        setUserRole(data as UserRole)
      }
    } catch {
      // Sebarang error → fallback ke null (admin penuh untuk user yg log masuk)
      setUserRole(null)
    } finally {
      setRoleFetched(true)
    }
  }

  useEffect(() => {
    // Timeout safety — pastikan loading sentiasa jadi false walaupun ada error
    const timeout = setTimeout(() => setLoading(false), 5000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user?.id) {
        fetchRole(session.user.id).finally(() => {
          clearTimeout(timeout)
          setLoading(false)
        })
      } else {
        clearTimeout(timeout)
        setLoading(false)
      }
    }).catch(() => {
      clearTimeout(timeout)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.id) {
        fetchRole(session.user.id)
      } else {
        setUserRole(null)
        setRoleFetched(true)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  const loggedIn  = !!session
  // Tiada entry dalam user_roles = admin penuh (backward compatible untuk Amir)
  const isAdmin   = loggedIn && (!roleFetched || userRole === null || userRole.role === 'admin')
  const isChampion = loggedIn && roleFetched && userRole?.role === 'champion'
  const championSubjects: string[] = isChampion ? (userRole?.subjects ?? []) : []
  const canGallery = isAdmin || (isChampion && (userRole?.can_gallery ?? false))

  function canEditSubject(subject: string): boolean {
    if (isAdmin) return true
    if (isChampion) return championSubjects.includes(subject)
    return false
  }

  return {
    session, loading,
    loggedIn,
    isAdmin, isChampion, championSubjects, canGallery,
    canEditSubject,
    signIn, signOut,
  }
}
