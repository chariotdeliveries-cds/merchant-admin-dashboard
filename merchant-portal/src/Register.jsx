import { useState } from 'react'
import { supabase } from './supabaseClient'
import { Mail, Lock, Package, User, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

function Register() {
  const [businessName, setBusinessName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const clean = (v) => (v ?? '').toString().trim()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (
        !clean(businessName) ||
        !clean(ownerName) ||
        !clean(email) ||
        !clean(phone) ||
        !clean(businessAddress) ||
        !clean(password)
      ) {
        setMessage('Please fill all required fields.')
        setLoading(false)
        return
      }

      // ✅ 1) Create Supabase Auth user with merchant role metadata
      const { error: signUpError } = await supabase.auth.signUp({
        email: clean(email),
        password,
        options: {
          data: {
            role: 'merchant',
            full_name: clean(ownerName),
            phone: clean(phone)
          }
        }
      })

      if (signUpError) {
        setMessage(signUpError.message || 'Failed to create account.')
        setLoading(false)
        return
      }

      // ✅ 2) Sign in immediately to create session (needed for RLS insert)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: clean(email),
        password,
      })

      if (signInError) {
        setMessage('Account created. Please check your email to confirm, then login.')
        setLoading(false)
        return
      }

      const userId = signInData?.user?.id
      if (!userId) {
        setMessage('Account created but no session found. Please login.')
        setLoading(false)
        return
      }

      // ✅ 3) Insert/Link merchant row (avoid 406 using maybeSingle)
      const { data: existingMerchant, error: existsErr } = await supabase
        .from('merchants')
        .select('id,email,user_id,is_active')
        .eq('email', clean(email))
        .maybeSingle()

      if (existsErr) {
        setMessage(existsErr.message || 'Could not check existing merchant.')
        setLoading(false)
        return
      }

      if (existingMerchant?.id) {
        if (existingMerchant.is_active === false) {
          setMessage('Your account has been deactivated. Contact support.')
          setLoading(false)
          return
        }

        const { error: linkErr } = await supabase
          .from('merchants')
          .update({ user_id: userId })
          .eq('id', existingMerchant.id)

        if (linkErr) {
          setMessage(linkErr.message || 'Account created but linking failed. Contact support.')
          setLoading(false)
          return
        }

        const { data: linkedMerchant, error: fetchErr } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', existingMerchant.id)
          .single()

        if (fetchErr || !linkedMerchant) {
          setMessage('Account created but profile load failed. Please login.')
          setLoading(false)
          return
        }

        localStorage.setItem('merchant', JSON.stringify(linkedMerchant))
      } else {
        const { data: merchantRow, error: insertErr } = await supabase
          .from('merchants')
          .insert([
            {
              business_name: clean(businessName),
              owner_name: clean(ownerName),
              email: clean(email),
              phone: clean(phone),
              business_address: clean(businessAddress),
              is_active: true,
              is_verified: false,
              user_id: userId,
            },
          ])
          .select()
          .single()

        if (insertErr) {
          setMessage(insertErr.message || 'Failed to create merchant profile.')
          setLoading(false)
          return
        }

        localStorage.setItem('merchant', JSON.stringify(merchantRow))
      }

      setMessage('Account created successfully! Redirecting...')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 900)
    } catch (err) {
      console.error(err)
      setMessage(err?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center p-6">
      {/* Wider card so it looks more square */}
      <div className="bg-white/95 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-4 rounded-xl shadow-md mb-4">
            <Package className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Register to access your delivery dashboard
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* ✅ 2-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Business Name */}
            <div>
              <label className="block text-gray-600 text-sm mb-2 font-medium">Business Name</label>
              <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                <Package className="w-5 h-5 text-blue-500" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full outline-none text-gray-700"
                  placeholder="e.g., Kofi Foods"
                  required
                />
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-gray-600 text-sm mb-2 font-medium">Owner Name</label>
              <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                <User className="w-5 h-5 text-blue-500" />
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full outline-none text-gray-700"
                  placeholder="e.g., Roland Mireku"
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Phone */}
            <div>
              <label className="block text-gray-600 text-sm mb-2 font-medium">Phone</label>
              <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                <Phone className="w-5 h-5 text-blue-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full outline-none text-gray-700"
                  placeholder="0201234567"
                  required
                />
              </div>
            </div>

            {/* Address spans both columns */}
            <div className="md:col-span-2">
              <label className="block text-gray-600 text-sm mb-2 font-medium">Business Address</label>
              <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                <MapPin className="w-5 h-5 text-blue-500" />
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full outline-none text-gray-700"
                  placeholder="e.g., East Legon, Accra"
                  required
                />
              </div>
            </div>

            {/* Password spans both columns to keep it clean */}
            <div className="md:col-span-2">
              <label className="block text-gray-600 text-sm mb-2 font-medium">Password</label>
              <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                <Lock className="w-5 h-5 text-blue-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none text-gray-700"
                  placeholder="Create a password"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-60 font-semibold"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 text-center px-4 py-3 rounded-lg text-sm font-medium ${
              message.toLowerCase().includes('success')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/" className="text-blue-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
