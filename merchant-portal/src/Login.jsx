import { useState } from 'react'
import { supabase } from './supabaseClient'
import { Mail, Lock, Package } from 'lucide-react'
import { Link } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // ✅ 1) Sign in with Supabase Auth (creates a real auth session)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setMessage(authError.message || 'Invalid email or password.')
        setLoading(false)
        return
      }

      const user = authData?.user
      if (!user?.id) {
        setMessage('Login failed: missing auth user. Please try again.')
        setLoading(false)
        return
      }

      // ✅ 2) Fetch merchant record by email
      // (You can also fetch by user_id if you want, but first-time merchants may have user_id empty)
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('email', email)
        .single()

      if (merchantError || !merchant) {
        setMessage('Merchant profile not found. Contact support.')
        setLoading(false)
        return
      }

      // ✅ 3) Check active status
      if (!merchant.is_active) {
        setMessage('Your account has been deactivated. Contact support.')
        setLoading(false)
        return
      }

      // ✅ 4) Ensure merchants.user_id is linked to this auth user
      // If it's empty or different, update it to auth.uid()
      if (!merchant.user_id || merchant.user_id !== user.id) {
        const { error: linkError } = await supabase
          .from('merchants')
          .update({ user_id: user.id })
          .eq('id', merchant.id)

        if (linkError) {
          console.error('Failed to link user_id:', linkError)
          setMessage('Login failed: could not link your account. Contact support.')
          setLoading(false)
          return
        }

        // Re-fetch merchant after update (so localStorage has correct user_id)
        const { data: updatedMerchant, error: reFetchError } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', merchant.id)
          .single()

        if (reFetchError || !updatedMerchant) {
          setMessage('Login failed: could not load your profile. Try again.')
          setLoading(false)
          return
        }

        localStorage.setItem('merchant', JSON.stringify(updatedMerchant))
      } else {
        localStorage.setItem('merchant', JSON.stringify(merchant))
      }

      setMessage('Login successful! Redirecting...')

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 700)
    } catch (err) {
      console.error(err)
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center p-6">
      <div className="bg-white/95 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-4 rounded-xl shadow-md mb-4">
            <Package className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Merchant Login</h1>
          <p className="text-gray-500 text-sm mt-1">Access your delivery dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-600 text-sm mb-2 font-medium">Email Address</label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
              <Mail className="w-5 h-5 text-blue-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full outline-none text-gray-700"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-2 font-medium">Password</label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
              <Lock className="w-5 h-5 text-blue-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none text-gray-700"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-60 font-semibold"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 text-center px-4 py-3 rounded-lg text-sm font-medium ${
              message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
