// ✅ ENHANCED MERCHANT DASHBOARD WITH ADMIN CANCELLATION NOTIFICATIONS
// ✅ UPDATED: Blue sidebar, removed rider leaderboard from sidebar, enhanced settings, payment method in orders
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from './supabaseClient'
import CreateOrder from './CreateOrder'
import {
  Package,
  Clock,
  CheckCircle,
  LogOut,
  UserCircle,
  Phone,
  MapPin,
  Bell,
  PlusCircle,
  Truck,
  Search,
  Layers,
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar,
  Download,
  LayoutDashboard,
  Map,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Eye,
  Activity,
  Star,
  Award,
  Target,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Hash,
  DollarSign,
  Percent,
  Zap,
  Lock,
  Mail,
  Camera,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react'

// ============================================================
// ✅ INDEXEDDB PROFILE PICTURE HELPERS
// Fixes Edge bug: Edge sometimes blocks large base64 in localStorage
// IndexedDB works reliably across Chrome, Edge, Firefox, Safari
// ============================================================
const IDB_DB_NAME = 'chariot_merchant_db'
const IDB_STORE   = 'profile_data'
const IDB_KEY     = 'profile_picture'

function openProfileDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE)
      }
    }
    req.onsuccess  = (e) => resolve(e.target.result)
    req.onerror    = (e) => reject(e.target.error)
  })
}

async function saveProfilePictureToDB(base64) {
  try {
    const db = await openProfileDB()
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(IDB_STORE, 'readwrite')
      const store = tx.objectStore(IDB_STORE)
      const req   = store.put(base64, IDB_KEY)
      req.onsuccess = () => resolve(true)
      req.onerror   = (e) => reject(e.target.error)
    })
  } catch (err) {
    // Fallback: try localStorage if IndexedDB unavailable
    try { localStorage.setItem('merchant_profile_picture', base64) } catch (_) {}
    console.warn('IndexedDB unavailable, used localStorage:', err)
  }
}

async function loadProfilePictureFromDB() {
  try {
    const db = await openProfileDB()
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(IDB_STORE, 'readonly')
      const store = tx.objectStore(IDB_STORE)
      const req   = store.get(IDB_KEY)
      req.onsuccess = (e) => resolve(e.target.result || null)
      req.onerror   = (e) => reject(e.target.error)
    })
  } catch (err) {
    // Fallback: try localStorage
    try { return localStorage.getItem('merchant_profile_picture') } catch (_) {}
    console.warn('IndexedDB unavailable:', err)
    return null
  }
}

async function deleteProfilePictureFromDB() {
  try {
    const db = await openProfileDB()
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(IDB_STORE, 'readwrite')
      const store = tx.objectStore(IDB_STORE)
      const req   = store.delete(IDB_KEY)
      req.onsuccess = () => resolve(true)
      req.onerror   = (e) => reject(e.target.error)
    })
  } catch (err) {
    try { localStorage.removeItem('merchant_profile_picture') } catch (_) {}
  }
}

// ============================================================
// ✅ DOWNLOAD ORDER RECEIPT (popup-free) -> opens Print dialog
// ============================================================
function downloadOrderReceipt(order, merchant, opts = {}) {
  const { isInBatch = false, dropNumber = null } = opts

  const safe = (v) => (v === null || v === undefined || v === '' ? '-' : String(v))

  const fmtMoney = (n) => {
    const num = Number(n || 0)
    return Number.isFinite(num) ? num.toFixed(2) : '0.00'
  }

  const fmtDate = (d) => {
    try {
      return d ? new Date(d).toLocaleString() : '-'
    } catch {
      return '-'
    }
  }

  const statusText = safe(order?.status)?.toUpperCase()

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Download Order - #${safe(order?.id)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
    .wrap { max-width: 720px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .head { padding: 18px 20px; background: #2563eb; color: #fff; }
    .head h1 { margin: 0; font-size: 18px; letter-spacing: .5px; text-transform: uppercase; }
    .head p { margin: 6px 0 0; font-size: 12px; opacity: .95; }
    .body { padding: 18px 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
    .label { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: .12em; }
    .value { margin-top: 6px; font-size: 13px; font-weight: 700; text-transform: uppercase; }
    .valueSmall { margin-top: 4px; font-size: 12px; font-weight: 600; color: #374151; }
    .big { font-size: 20px; color: #2563eb; }
    .row { display: flex; justify-content: space-between; gap: 12px; margin-top: 10px; align-items: center; }
    .pill { display: inline-block; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; padding: 6px 10px; border-radius: 999px; border: 1px solid #e5e7eb; }
    .pill.green { background: #ecfdf5; border-color: #bbf7d0; color: #065f46; }
    .pill.blue { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
    .pill.gray { background: #f9fafb; border-color: #e5e7eb; color: #374151; }
    .divider { height: 1px; background: #e5e7eb; margin: 14px 0; }
    .foot { padding: 14px 20px; background: #f9fafb; color: #6b7280; font-size: 11px; display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    @media print {
      body { padding: 0; }
      .wrap { border: none; border-radius: 0; }
      .foot { background: #fff; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <h1>Download Order</h1>
      <p>${safe(merchant?.business_name)} • Generated: ${fmtDate(new Date())}</p>
    </div>

    <div class="body">
      <div class="row">
        <div>
          <div class="label">Order ID</div>
          <div class="value">#${safe(order?.id)} ${isInBatch && dropNumber ? `(DROP #${dropNumber})` : ''}</div>
          <div class="valueSmall">Created: ${fmtDate(order?.created_at)}</div>
        </div>
        <div>
          <span class="pill ${
            statusText === 'DELIVERED' ? 'green' : statusText === 'PENDING' ? 'gray' : 'blue'
          }">${statusText}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="grid">
        <div class="card">
          <div class="label">Customer</div>
          <div class="value">${safe(order?.customer_name)}</div>
          <div class="valueSmall">${safe(order?.customer_phone)}</div>
        </div>

        <div class="card">
          <div class="label">Receiver</div>
          <div class="value">${safe(order?.receiver_name)}</div>
          <div class="valueSmall">${safe(order?.receiver_phone)}</div>
        </div>

        <div class="card" style="grid-column: 1 / -1;">
          <div class="label">Pickup Address</div>
          <div class="value">${safe(order?.pickup_address)}</div>
        </div>

        <div class="card" style="grid-column: 1 / -1;">
          <div class="label">Destination</div>
          <div class="value">${safe(order?.dropoff_address)}</div>
        </div>

        <div class="card">
          <div class="label">Amount</div>
          <div class="value big">GH₵ ${fmtMoney(order?.price)}</div>
        </div>

        <div class="card">
          <div class="label">Payment Method</div>
          <div class="value">${safe(order?.payment_method || 'Cash on Delivery')}</div>
        </div>

        <div class="card">
          <div class="label">Assigned Rider</div>
          <div class="value">${safe(order?.driver_name)}</div>
          <div class="valueSmall">${safe(order?.driver_phone)}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="grid">
        <div class="card">
          <div class="label">Assigned At</div>
          <div class="valueSmall">${fmtDate(order?.assigned_at)}</div>
        </div>
        <div class="card">
          <div class="label">Picked Up At</div>
          <div class="valueSmall">${fmtDate(order?.picked_up_at)}</div>
        </div>
        <div class="card" style="grid-column: 1 / -1;">
          <div class="label">Delivered At</div>
          <div class="valueSmall">${fmtDate(order?.delivered_at)}</div>
        </div>
      </div>
    </div>

    <div class="foot">
      <div>Order printout for reference.</div>
      <div>Order #${safe(order?.id)} • ${safe(merchant?.business_name)}</div>
    </div>
  </div>
</body>
</html>`

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    alert('Unable to generate order for download.')
    return
  }

  doc.open()
  doc.write(html)
  doc.close()

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } finally {
      setTimeout(() => {
        try {
          document.body.removeChild(iframe)
        } catch {}
      }, 1000)
    }
  }, 250)
}

// ============================================================
// ✅ STAT CARD MODAL — shows all orders for that stat
// ============================================================
function StatCardModal({ statModal, statModalOrders, onClose, STAT_MODAL_META }) {
  const [modalSearch, setModalSearch] = useState('')

  const filtered = useMemo(() => {
    const q = modalSearch.toLowerCase().trim()
    if (!q) return statModalOrders
    return statModalOrders.filter(o =>
      o.id?.toString().toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.receiver_name?.toLowerCase().includes(q) ||
      o.dropoff_address?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    )
  }, [statModalOrders, modalSearch])

  const totalValue = statModalOrders.reduce((s, o) => s + Number(o.price || 0), 0)
  const meta = STAT_MODAL_META[statModal]

  if (!statModal || !meta) return null

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[88vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${meta.bg} p-5 flex items-center justify-between`}>
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-xl">{meta.icon}</div>
            <div>
              <h3 className="text-lg font-bold">{meta.title}</h3>
              <p className="text-white/70 text-xs">
                {statModalOrders.length} order{statModalOrders.length !== 1 ? 's' : ''} • Total: GH₵ {totalValue.toFixed(2)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={modalSearch}
              onChange={e => setModalSearch(e.target.value)}
              placeholder="Search within these orders…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-500 font-semibold text-sm">No orders found</p>
            </div>
          ) : (
            filtered.map((order) => {
              const isCancelledByAdmin = order.status === 'cancelled' && order.cancelled_by === 'Admin'
              return (
                <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-bold text-gray-900 text-sm uppercase">#{order.id}</span>
                        <StatusPill status={order.status} />
                        {order.batch_id && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase">
                            Batch {order.batch_id}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2 text-xs">
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[10px]">Customer</span>
                          <p className="text-gray-700 font-semibold truncate">{order.customer_name}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[10px]">Receiver</span>
                          <p className="text-gray-700 font-semibold truncate">{order.receiver_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">{order.dropoff_address}</span>
                      </div>
                      {order.driver_name && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Truck className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="font-semibold">{order.driver_name}</span>
                          {order.driver_phone && <span className="text-gray-400">• {order.driver_phone}</span>}
                        </div>
                      )}
                      {order.status === 'cancelled' && order.cancel_reason && (
                        <div className={`mt-2 text-xs px-2 py-1 rounded-lg flex items-start gap-1 ${
                          isCancelledByAdmin ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>
                            <span className="font-bold">{isCancelledByAdmin ? 'Admin cancelled: ' : 'Reason: '}</span>
                            {order.cancel_reason}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-blue-600">GH₵ {Number(order.price || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Showing <span className="font-bold text-gray-700">{filtered.length}</span> of{' '}
            <span className="font-bold text-gray-700">{statModalOrders.length}</span> orders
          </div>
          <button onClick={onClose} className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-200 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ✅ STATUS PILL (reusable badge)
// ============================================================
function StatusPill({ status }) {
  const config = {
    pending:   'bg-amber-100 text-amber-700 border-amber-200',
    assigned:  'bg-blue-100 text-blue-700 border-blue-200',
    picked_up: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  const labels = {
    pending: 'Pending', assigned: 'Assigned', picked_up: 'Out for Delivery',
    delivered: 'Delivered', cancelled: 'Cancelled'
  }
  return (
    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${config[status] || config.pending}`}>
      {labels[status] || status}
    </span>
  )
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
function Dashboard() {
  const [merchant, setMerchant] = useState(null)
  const [orders, setOrders] = useState([])
  const [drivers, setDrivers] = useState([])
  const [merchants, setMerchants] = useState([])

  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const [activeTab, setActiveTab] = useState('orders')
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [timeFilter, setTimeFilter] = useState('all')
  const [lastXHours, setLastXHours] = useState(3)
  const [orderTypeFilter, setOrderTypeFilter] = useState('all')

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  const [statModal, setStatModal] = useState(null)

  // ✅ Settings state — extended with password, email, profile picture
  const [settingsForm, setSettingsForm] = useState({
    business_name: '',
    contact_email: '',
    contact_phone: '',
    pickup_address: '',
    notification_orders: true,
    notification_riders: true,
    notification_delivered: true,
  })
  const [settingsSaved, setSettingsSaved] = useState(false)

  // ✅ New settings states
  const [settingsTab, setSettingsTab] = useState('profile')
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [emailForm, setEmailForm] = useState({ new: '', confirm: '', password: '' })
  const [emailMsg, setEmailMsg] = useState(null)
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  const profilePicInputRef = useRef(null)

  const notificationRef = useRef(null)
  const realtimeChannelRef = useRef(null)

  const STAT_MODAL_META = {
    total:     { title: 'All Orders',       bg: 'bg-blue-600',    icon: <Package className="w-5 h-5" /> },
    pending:   { title: 'Pending Orders',   bg: 'bg-amber-500',   icon: <Clock className="w-5 h-5" /> },
    delivered: { title: 'Delivered Orders', bg: 'bg-emerald-600', icon: <CheckCircle className="w-5 h-5" /> },
    cancelled: { title: 'Cancelled Orders', bg: 'bg-red-600',     icon: <XCircle className="w-5 h-5" /> },
    active:    { title: 'Active Deliveries',bg: 'bg-indigo-600',  icon: <Truck className="w-5 h-5" /> },
  }

  const safeGetMerchantFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem('merchant')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed?.id) return null
      return parsed
    } catch (e) {
      console.error('Invalid merchant in localStorage:', e)
      return null
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('merchant_settings')
    if (saved) { try { setSettingsForm(JSON.parse(saved)) } catch (_) {} }
    else {
      const m = safeGetMerchantFromStorage()
      if (m) setSettingsForm(prev => ({
        ...prev,
        business_name: m.business_name || '',
        contact_email: m.email || '',
        contact_phone: m.phone || '',
      }))
    }
    // Load saved profile picture — use IndexedDB (works in Edge/Chrome/Firefox)
    loadProfilePictureFromDB().then(pic => {
      if (pic) setProfilePicturePreview(pic)
    })
  }, [safeGetMerchantFromStorage])

  const loadData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true)
      const merchantData = safeGetMerchantFromStorage()
      if (!merchantData) {
        localStorage.removeItem('merchant')
        window.location.href = '/'
        return
      }
      try {
        const [ordersRes, driversRes, merchantsRes] = await Promise.all([
          supabase.from('requests').select('*').eq('merchant_id', merchantData.id).order('created_at', { ascending: false }),
          supabase.from('drivers').select('*'),
          supabase.from('merchants').select('*')
        ])
        if (ordersRes.error) console.error('Orders fetch error:', ordersRes.error)
        if (driversRes.error) console.error('Drivers fetch error:', driversRes.error)
        if (merchantsRes.error) console.error('Merchants fetch error:', merchantsRes.error)
        setOrders(ordersRes.data || [])
        setDrivers(driversRes.data || [])
        setMerchants(merchantsRes.data || [])
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        if (!isSilent) setLoading(false)
      }
    },
    [safeGetMerchantFromStorage]
  )

  const addNotification = useCallback((type, orderId, message, metadata = {}) => {
    const notification = {
      id: Date.now() + Math.random(),
      type, orderId, message, metadata,
      timestamp: new Date().toISOString(),
      read: false
    }
    setNotifications((prev) => [notification, ...prev])
    setUnreadCount((prev) => prev + 1)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiP1O')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch (e) {}
  }, [])

  useEffect(() => {
    const merchantData = safeGetMerchantFromStorage()
    if (!merchantData) { window.location.href = '/'; return }
    setMerchant(merchantData)
    loadData(false)

    const channel = supabase
      .channel('merchant-order-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'requests', filter: `merchant_id=eq.${merchantData.id}` },
        (payload) => {
          const updatedOrder = payload.new
          const oldOrder = payload.old
          setOrders((prevOrders) => prevOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))

          if (oldOrder.status !== 'cancelled' && updatedOrder.status === 'cancelled') {
            const cancelledBy = updatedOrder.cancelled_by || 'Unknown'
            if (cancelledBy === 'Admin') {
              addNotification('admin_cancelled', updatedOrder.id, `⚠️ Admin cancelled Order #${updatedOrder.id}`, { reason: updatedOrder.cancel_reason || 'No reason provided', cancelledBy: 'Admin' })
            } else {
              addNotification('cancelled', updatedOrder.id, `Order #${updatedOrder.id} has been cancelled`, { reason: updatedOrder.cancel_reason || 'No reason provided' })
            }
          } else if (oldOrder.driver_id !== updatedOrder.driver_id && updatedOrder.driver_id) {
            addNotification('rider_assigned', updatedOrder.id, `Rider ${updatedOrder.driver_name} assigned to Order #${updatedOrder.id}`, { driverName: updatedOrder.driver_name, driverPhone: updatedOrder.driver_phone })
          } else if (oldOrder.status !== updatedOrder.status) {
            if (updatedOrder.status === 'picked_up') {
              addNotification('picked_up', updatedOrder.id, `Order #${updatedOrder.id} has been picked up by ${updatedOrder.driver_name}`, { driverName: updatedOrder.driver_name })
            } else if (updatedOrder.status === 'delivered') {
              addNotification('delivered', updatedOrder.id, `Order #${updatedOrder.id} has been delivered successfully! 🎉`, { customerName: updatedOrder.customer_name })
            }
          }
        }
      )
      .subscribe()

    realtimeChannelRef.current = channel

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false)
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [loadData, safeGetMerchantFromStorage, addNotification])

  const handleLogout = () => {
    localStorage.removeItem('merchant')
    window.location.href = '/'
  }

  const handleCancelOrder = async () => {
    if (!orderToCancel || !cancelReason.trim()) { alert('Please provide a reason for cancellation'); return }
    try {
      const { error } = await supabase.from('requests').update({
        status: 'cancelled', cancelled_by: 'Merchant', cancel_reason: cancelReason, cancelled_at: new Date().toISOString()
      }).eq('id', orderToCancel.id)
      if (error) throw error
      setOrders((prevOrders) => prevOrders.map((order) =>
        order.id === orderToCancel.id ? { ...order, status: 'cancelled', cancelled_by: 'Merchant', cancel_reason: cancelReason, cancelled_at: new Date().toISOString() } : order
      ))
      setShowCancelModal(false)
      setOrderToCancel(null)
      setCancelReason('')
      alert(`Order #${orderToCancel.id} has been cancelled successfully`)
    } catch (error) {
      console.error('Cancel order error:', error)
      alert('Failed to cancel order. Please try again.')
    }
  }

  const openCancelModal = (order) => { setOrderToCancel(order); setShowCancelModal(true) }
  const closeCancelModal = () => { setShowCancelModal(false); setOrderToCancel(null); setCancelReason('') }

  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }
  const clearAllNotifications = () => { setNotifications([]); setUnreadCount(0) }

  // ✅ Profile picture handler
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result)
      setProfilePicture(file)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfilePicture = async () => {
    if (profilePicturePreview) {
      await saveProfilePictureToDB(profilePicturePreview)
      alert('Profile picture updated!')
    }
  }

  // ✅ Password change handler
  const handleChangePassword = async () => {
    setPasswordMsg(null)
    if (!passwordForm.current) { setPasswordMsg({ type: 'error', text: 'Please enter your current password' }); return }
    if (!passwordForm.new || passwordForm.new.length < 6) { setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' }); return }
    if (passwordForm.new !== passwordForm.confirm) { setPasswordMsg({ type: 'error', text: 'New passwords do not match' }); return }
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new })
      if (error) throw error
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' })
      setPasswordForm({ current: '', new: '', confirm: '' })
    } catch (error) {
      setPasswordMsg({ type: 'error', text: error.message || 'Failed to update password' })
    }
  }

  // ✅ Email change handler
  const handleChangeEmail = async () => {
    setEmailMsg(null)
    if (!emailForm.new || !emailForm.new.includes('@')) { setEmailMsg({ type: 'error', text: 'Please enter a valid email address' }); return }
    if (emailForm.new !== emailForm.confirm) { setEmailMsg({ type: 'error', text: 'Email addresses do not match' }); return }
    try {
      const { error } = await supabase.auth.updateUser({ email: emailForm.new })
      if (error) throw error
      setEmailMsg({ type: 'success', text: 'Verification email sent! Check your inbox to confirm the change.' })
      setEmailForm({ new: '', confirm: '', password: '' })
    } catch (error) {
      setEmailMsg({ type: 'error', text: error.message || 'Failed to update email' })
    }
  }

  const passesTimeFilter = useCallback((order) => {
    if (!order?.created_at) return false
    if (timeFilter === 'all') return true
    const now = new Date()
    const created = new Date(order.created_at)
    if (Number.isNaN(created.getTime())) return false
    if (timeFilter === 'last30m') return now.getTime() - created.getTime() <= 30 * 60 * 1000
    if (timeFilter === 'last1h') return now.getTime() - created.getTime() <= 60 * 60 * 1000
    if (timeFilter === 'lastXh') { const hrs = Math.max(1, Number(lastXHours) || 1); return now.getTime() - created.getTime() <= hrs * 60 * 60 * 1000 }
    if (timeFilter === 'today') { const start = new Date(now); start.setHours(0,0,0,0); return created >= start && created <= now }
    if (timeFilter === 'week') { const start = new Date(now); start.setHours(0,0,0,0); const day = start.getDay(); start.setDate(start.getDate() - (day === 0 ? 6 : day - 1)); return created >= start && created <= now }
    if (timeFilter === 'month') { const start = new Date(now.getFullYear(), now.getMonth(), 1); start.setHours(0,0,0,0); return created >= start && created <= now }
    return true
  }, [timeFilter, lastXHours])

  const timeLabel = useMemo(() => {
    if (timeFilter === 'all') return 'ALL TIME'
    if (timeFilter === 'today') return 'TODAY'
    if (timeFilter === 'week') return 'THIS WEEK'
    if (timeFilter === 'month') return 'THIS MONTH'
    if (timeFilter === 'last30m') return 'LAST 30 MINS'
    if (timeFilter === 'last1h') return 'LAST 1 HOUR'
    if (timeFilter === 'lastXh') return `LAST ${Math.max(1, Number(lastXHours) || 1)} HOURS`
    return 'ALL TIME'
  }, [timeFilter, lastXHours])

  const clearTimeFilter = () => { setTimeFilter('all'); setLastXHours(3) }

  const pendingOrdersAll = useMemo(() => orders.filter((o) => o.status === 'pending'), [orders])
  const completedOrdersAll = useMemo(() => orders.filter((o) => o.status === 'delivered'), [orders])
  const cancelledOrdersAll = useMemo(() => orders.filter((o) => o.status === 'cancelled'), [orders])
  const activeOrdersAll = useMemo(() => orders.filter((o) => o.status === 'assigned' || o.status === 'picked_up'), [orders])

  const statModalOrders = useMemo(() => {
    if (!statModal) return []
    if (statModal === 'total') return orders
    if (statModal === 'pending') return pendingOrdersAll
    if (statModal === 'delivered') return completedOrdersAll
    if (statModal === 'cancelled') return cancelledOrdersAll
    if (statModal === 'active') return activeOrdersAll
    return []
  }, [statModal, orders, pendingOrdersAll, completedOrdersAll, cancelledOrdersAll, activeOrdersAll])

  const baseFilteredOrders = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim()
    return orders.filter((o) => {
      if (activeTab === 'pending' && o.status !== 'pending') return false
      if (activeTab === 'delivered' && o.status !== 'delivered') return false
      if (activeTab === 'cancelled' && o.status !== 'cancelled') return false
      if (!passesTimeFilter(o)) return false
      if (!q) return true
      return (
        o.id?.toString().toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.receiver_name?.toLowerCase().includes(q) ||
        o.pickup_address?.toLowerCase().includes(q) ||
        o.dropoff_address?.toLowerCase().includes(q) ||
        o.status?.toLowerCase().includes(q) ||
        o.batch_id?.toString().toLowerCase().includes(q)
      )
    })
  }, [orders, activeTab, searchQuery, passesTimeFilter])

  const { groupedOrders, singleOrders, batchIds } = useMemo(() => {
    const grouped = {}
    const singles = []
    baseFilteredOrders.forEach((order) => {
      const batchId = order?.batch_id
      const hasValidBatch = batchId !== null && batchId !== undefined && String(batchId).trim() !== ''
      if (hasValidBatch) {
        const key = String(batchId)
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(order)
      } else {
        singles.push(order)
      }
    })
    const ids = Object.keys(grouped)
    ids.forEach((id) => { grouped[id].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) })
    singles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return { groupedOrders: grouped, singleOrders: singles, batchIds: ids }
  }, [baseFilteredOrders])

  const singleCount = singleOrders.length
  const bulkCount = batchIds.length
  const totalCount = singleCount + bulkCount

  const unifiedTimeline = useMemo(() => {
    const items = []
    batchIds.forEach((batchId) => {
      const batchOrders = groupedOrders[batchId] || []
      if (!batchOrders.length) return
      const latestMs = Math.max(...batchOrders.map((o) => new Date(o.created_at).getTime()))
      items.push({ type: 'batch', batchId, sortKey: latestMs })
    })
    singleOrders.forEach((order) => {
      items.push({ type: 'single', order, sortKey: new Date(order.created_at).getTime() })
    })
    items.sort((a, b) => b.sortKey - a.sortKey)
    return items
  }, [batchIds, groupedOrders, singleOrders])

  const visibleTimeline = useMemo(() => {
    if (orderTypeFilter === 'all') return unifiedTimeline
    if (orderTypeFilter === 'bulk') return unifiedTimeline.filter((x) => x.type === 'batch')
    if (orderTypeFilter === 'single') return unifiedTimeline.filter((x) => x.type === 'single')
    return unifiedTimeline
  }, [unifiedTimeline, orderTypeFilter])

  if (!merchant) return null

  const navigate = (view, tab = null) => {
    setActiveView(view)
    if (tab) setActiveTab(tab)
    setSidebarOpen(false)
  }

  // ✅ Shared order list renderer
  const renderOrderList = () => (
    <div className="pb-12">
      {loading ? <LoadingState /> : (
        <>
          {visibleTimeline.map((item) => {
            if (item.type === 'batch') {
              return <BatchOrderGroup key={`batch-${item.batchId}`} batchId={item.batchId} orders={groupedOrders[item.batchId]} merchant={merchant} onCancelOrder={openCancelModal} />
            }
            return <OrderCard key={`order-${item.order.id}`} order={item.order} merchant={merchant} onCancelOrder={openCancelModal} />
          })}
          {visibleTimeline.length === 0 && <EmptyState message={searchQuery ? 'No orders match your search' : 'No orders found for the selected filters'} />}
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">

      {/* ✅ STAT CARD MODAL */}
      {statModal && (
        <StatCardModal statModal={statModal} statModalOrders={statModalOrders} onClose={() => setStatModal(null)} STAT_MODAL_META={STAT_MODAL_META} />
      )}

      {/* ✅ CANCEL ORDER MODAL */}
      {showCancelModal && orderToCancel && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cancel Order</h3>
                <p className="text-sm text-gray-500">Order #{orderToCancel.id}</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Reason for Cancellation <span className="text-red-600">*</span></label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Customer requested cancellation, Wrong address, etc."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  rows={3}
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-xs font-bold text-gray-700 uppercase mb-2">Order Details</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600"><span className="font-semibold">Customer:</span> {orderToCancel.customer_name}</p>
                  <p className="text-gray-600"><span className="font-semibold">Status:</span> <span className="uppercase text-xs">{orderToCancel.status}</span></p>
                  {orderToCancel.driver_name && <p className="text-gray-600"><span className="font-semibold">Rider:</span> {orderToCancel.driver_name}</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={closeCancelModal} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all">Keep Order</button>
                <button onClick={handleCancelOrder} disabled={!cancelReason.trim()} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Cancel Order</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ LEFT SIDEBAR — BLUE BACKGROUND */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 md:w-64 bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 transform transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col shadow-2xl ring-1 ring-white/5`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-blue-600/50">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-tight">Chariot</h2>
                <p className="text-[10px] text-blue-200 uppercase">Deliveries</p>
              </div>
            </div>
          </div>

          {/* ✅ Quick Stats Strip */}
          <div className="px-4 py-3 border-b border-blue-600/30 grid grid-cols-3 gap-2 overflow-x-auto scrollbar-hide">
            {[
              { label: 'Pending', value: pendingOrdersAll.length, color: 'bg-amber-400/20 text-amber-200' },
              { label: 'Active',  value: activeOrdersAll.length,  color: 'bg-white/20 text-white' },
              { label: 'Done',    value: completedOrdersAll.length,color: 'bg-emerald-400/20 text-emerald-200' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-lg p-2 text-center cursor-pointer border border-white/10`}>
                <p className="text-base font-black leading-none">{s.value}</p>
                <p className="text-[9px] font-bold uppercase mt-0.5 opacity-80">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions - compact buttons for mobile */}
          <div className="px-4 py-3 border-b border-blue-600/20 flex gap-2 items-center">
            <button onClick={() => { setShowCreateOrder(true); setSidebarOpen(false) }} className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-white/20 transition">Create</button>
            <button onClick={() => navigate('track')} className="w-20 bg-white/10 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-white/20 transition">Track</button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest px-3 pt-1 pb-2">Main Menu</p>

            <SidebarItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" description={`${orders.length} total · ${pendingOrdersAll.length} pending`} active={activeView === 'dashboard'} onClick={() => navigate('dashboard')} />
            <SidebarItem icon={<Package className="w-5 h-5" />} label="All Orders" description={`${completedOrdersAll.length} delivered · ${cancelledOrdersAll.length} cancelled`} active={activeView === 'orders'} onClick={() => navigate('orders')} badge={orders.length} />
            <SidebarItem icon={<Map className="w-5 h-5" />} label="Track Deliveries" description={activeOrdersAll.length > 0 ? `${activeOrdersAll.length} en route right now` : 'No active deliveries'} active={activeView === 'track'} onClick={() => navigate('track')} badge={activeOrdersAll.length > 0 ? activeOrdersAll.length : null} badgeColor="bg-blue-400" />

            <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest px-3 pt-4 pb-2">Insights</p>

            <SidebarItem icon={<BarChart3 className="w-5 h-5" />} label="Reports" description={`GH₵ ${completedOrdersAll.reduce((s,o)=>s+Number(o.price||0),0).toFixed(0)} total revenue`} active={activeView === 'reports'} onClick={() => navigate('reports')} />
            <SidebarItem icon={<Activity className="w-5 h-5" />} label="Performance" description={`${orders.length ? (completedOrdersAll.length/orders.length*100).toFixed(0) : 0}% completion rate`} active={activeView === 'performance'} onClick={() => navigate('performance')} />

            <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest px-3 pt-4 pb-2">Actions</p>

            <button
              onClick={() => { setShowCreateOrder(true); setSidebarOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all text-left mb-1 border border-white/20"
            >
              <PlusCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-bold leading-none">Create Order</p>
                <p className="text-[10px] text-blue-200 mt-0.5">New delivery request</p>
              </div>
            </button>

            <SidebarItem icon={<Settings className="w-5 h-5" />} label="Settings" description="Profile, security & notifications" active={activeView === 'settings'} onClick={() => navigate('settings')} />
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-blue-600/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/30">
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[120px]">{merchant.business_name}</p>
                  <p className="text-[10px] text-blue-200">Merchant</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 rounded-lg text-xs font-bold text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ✅ MAIN CONTENT */}
      <div className="flex-1 md:ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {activeView === 'dashboard' && 'Dashboard'}
                  {activeView === 'orders' && 'All Orders'}
                  {activeView === 'track' && 'Track Deliveries'}
                  {activeView === 'reports' && 'Reports & Analytics'}
                  {activeView === 'performance' && 'Performance'}
                  {activeView === 'settings' && 'Settings'}
                </h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase hidden sm:block">
                  {activeView === 'dashboard' && 'Manage your deliveries'}
                  {activeView === 'orders' && `${orders.length} total orders`}
                  {activeView === 'track' && `${activeOrdersAll.length} active deliveries`}
                  {activeView === 'reports' && 'Business insights & revenue'}
                  {activeView === 'performance' && 'KPIs & metrics'}
                  {activeView === 'settings' && 'Account configuration'}
                </p>
              </div>
            </div>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  if (!showNotifications) notifications.forEach((notif) => { if (!notif.read) markNotificationAsRead(notif.id) })
                }}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-blue-600 animate-bounce' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black ring-2 ring-white shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border text-gray-800 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b font-bold text-xs uppercase tracking-widest text-gray-400 flex justify-between items-center">
                    <span>Activity Notifications</span>
                    {notifications.length > 0 && <button onClick={clearAllNotifications} className="text-[10px] text-blue-600 hover:underline normal-case">Clear All</button>}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 border-b hover:bg-blue-50 text-left text-xs cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${notif.type === 'admin_cancelled' ? 'bg-red-100' : notif.type === 'rider_assigned' ? 'bg-blue-100' : notif.type === 'picked_up' ? 'bg-amber-100' : notif.type === 'delivered' ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {notif.type === 'admin_cancelled' && <AlertCircle className="w-4 h-4 text-red-600" />}
                            {notif.type === 'rider_assigned' && <Truck className="w-4 h-4 text-blue-600" />}
                            {notif.type === 'picked_up' && <Package className="w-4 h-4 text-amber-600" />}
                            {notif.type === 'delivered' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {notif.type === 'cancelled' && <XCircle className="w-4 h-4 text-gray-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{notif.message}</p>
                            {notif.metadata?.reason && <p className="text-[10px] text-gray-500 mt-1">Reason: {notif.metadata.reason}</p>}
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-400 text-xs italic">No notifications yet</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">

          {/* ═══════════════════════════════════════════════════════
              DASHBOARD VIEW
          ═══════════════════════════════════════════════════════ */}
          {activeView === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <ClickableStatCard title="My Orders"  value={orders.length}              color="blue"   icon={<Package />}    onClick={() => setStatModal('total')}     sub="All time" />
                <ClickableStatCard title="Pending"    value={pendingOrdersAll.length}    color="yellow" icon={<Clock />}       onClick={() => setStatModal('pending')}   sub="Awaiting assignment" />
                <ClickableStatCard title="Delivered"  value={completedOrdersAll.length}  color="green"  icon={<CheckCircle />} onClick={() => setStatModal('delivered')} sub="Successfully completed" />
                <ClickableStatCard title="Cancelled"  value={cancelledOrdersAll.length}  color="red"    icon={<XCircle />}     onClick={() => setStatModal('cancelled')} sub="Click to review" />
              </div>

              {activeOrdersAll.length > 0 && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 mb-6 shadow-lg shadow-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl"><Activity className="w-5 h-5 text-white" /></div>
                      <div>
                        <h3 className="text-white font-black text-sm">Live Deliveries</h3>
                        <p className="text-blue-200 text-xs">{activeOrdersAll.length} order{activeOrdersAll.length > 1 ? 's' : ''} in progress</p>
                      </div>
                    </div>
                    <button onClick={() => navigate('track')} className="text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all">
                      Track All <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {activeOrdersAll.map((o) => (
                      <div key={o.id} className="bg-white/15 border border-white/20 rounded-xl p-3 min-w-[180px] shrink-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${o.status === 'picked_up' ? 'bg-amber-400 animate-pulse' : 'bg-blue-300'}`} />
                          <span className="text-white font-black text-xs uppercase">#{o.id}</span>
                        </div>
                        <p className="text-white/70 text-[10px] font-bold uppercase mb-1">{o.status === 'picked_up' ? '🚴 Out for Delivery' : '⏳ Assigned'}</p>
                        <p className="text-white text-xs font-semibold truncate">{o.receiver_name}</p>
                        {o.driver_name && (
                          <p className="text-blue-200 text-[10px] mt-1 flex items-center gap-1"><Truck className="w-2.5 h-2.5" />{o.driver_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by order ID, customer name, address, or batch ID..." className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
                </div>
                <button onClick={() => setShowCreateOrder(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg font-bold uppercase text-sm">
                  <PlusCircle className="w-5 h-5" />Create Order
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm mb-6 flex border-b overflow-x-auto scrollbar-hide font-bold uppercase">
                <TabButton active={activeTab === 'orders'}    onClick={() => setActiveTab('orders')}    count={orders.length}>All Orders</TabButton>
                <TabButton active={activeTab === 'pending'}   onClick={() => setActiveTab('pending')}   count={pendingOrdersAll.length}>Pending</TabButton>
                <TabButton active={activeTab === 'delivered'} onClick={() => setActiveTab('delivered')} count={completedOrdersAll.length}>Delivered</TabButton>
                <TabButton active={activeTab === 'cancelled'} onClick={() => setActiveTab('cancelled')} count={cancelledOrdersAll.length}>Cancelled</TabButton>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase"><Calendar className="w-4 h-4" /><span>Time:</span></div>
                  <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-bold text-xs uppercase outline-none focus:border-blue-500">
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="last30m">Last 30 mins</option>
                    <option value="last1h">Last 1 hour</option>
                    <option value="lastXh">Last X hours</option>
                  </select>
                  {timeFilter === 'lastXh' && (
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setLastXHours((v) => Math.max(1, (Number(v) || 1) - 1))} className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-black">−</button>
                      <div className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-black uppercase">{Math.max(1, Number(lastXHours) || 1)}h</div>
                      <button type="button" onClick={() => setLastXHours((v) => Math.min(72, (Number(v) || 1) + 1))} className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-black">+</button>
                    </div>
                  )}
                  <span className="text-[10px] font-black uppercase text-gray-400 hidden md:inline">{timeLabel}</span>
                </div>
                <button type="button" onClick={clearTimeFilter} className="self-start md:self-auto px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-bold text-xs uppercase">Clear time filter</button>
              </div>

              <div className="mb-6 flex gap-3 items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase"><Filter className="w-4 h-4" /><span>Filter:</span></div>
                <button onClick={() => setOrderTypeFilter('all')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${orderTypeFilter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>Show All ({totalCount})</button>
                <button onClick={() => setOrderTypeFilter('single')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${orderTypeFilter === 'single' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}><Package className="w-3.5 h-3.5" />Single ({singleCount})</button>
                <button onClick={() => setOrderTypeFilter('bulk')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${orderTypeFilter === 'bulk' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}><Layers className="w-3.5 h-3.5" />Bulk ({bulkCount})</button>
              </div>

              {renderOrderList()}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════
              ALL ORDERS VIEW
          ═══════════════════════════════════════════════════════ */}
          {activeView === 'orders' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <ClickableStatCard title="Total Orders"  value={orders.length}              color="blue"   icon={<Package />}    onClick={() => setStatModal('total')}     sub="All time" />
                <ClickableStatCard title="Pending"       value={pendingOrdersAll.length}    color="yellow" icon={<Clock />}       onClick={() => setStatModal('pending')}   sub="Awaiting rider" />
                <ClickableStatCard title="Delivered"     value={completedOrdersAll.length}  color="green"  icon={<CheckCircle />} onClick={() => setStatModal('delivered')} sub="Completed" />
                <ClickableStatCard title="Cancelled"     value={cancelledOrdersAll.length}  color="red"    icon={<XCircle />}     onClick={() => setStatModal('cancelled')} sub="Click to view" />
              </div>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by order ID, customer, address…" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
                </div>
                <button onClick={() => setShowCreateOrder(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold uppercase text-sm shadow-lg">
                  <PlusCircle className="w-5 h-5" />Create Order
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm mb-6 flex border-b overflow-x-auto font-bold uppercase">
                <TabButton active={activeTab === 'orders'}    onClick={() => setActiveTab('orders')}    count={orders.length}>All Orders</TabButton>
                <TabButton active={activeTab === 'pending'}   onClick={() => setActiveTab('pending')}   count={pendingOrdersAll.length}>Pending</TabButton>
                <TabButton active={activeTab === 'delivered'} onClick={() => setActiveTab('delivered')} count={completedOrdersAll.length}>Delivered</TabButton>
                <TabButton active={activeTab === 'cancelled'} onClick={() => setActiveTab('cancelled')} count={cancelledOrdersAll.length}>Cancelled</TabButton>
              </div>
              {renderOrderList()}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════
              TRACK DELIVERIES VIEW
          ═══════════════════════════════════════════════════════ */}
          {activeView === 'track' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ClickableStatCard title="Active Deliveries" value={activeOrdersAll.length} color="blue" icon={<Truck />} onClick={() => setStatModal('active')} sub="In progress right now" />
                <ClickableStatCard title="Awaiting Pickup" value={orders.filter(o => o.status === 'assigned').length} color="yellow" icon={<Clock />} onClick={() => setStatModal('pending')} sub="Assigned, not picked up" />
                <ClickableStatCard title="Out for Delivery" value={orders.filter(o => o.status === 'picked_up').length} color="indigo" icon={<MapPin />} sub="En route to receiver" />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Live Map Overview</h3>
                    <p className="text-sm text-gray-500 mt-1">Real-time delivery tracking</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>Live
                  </span>
                </div>
                <div className="bg-gradient-to-br from-slate-100 to-blue-50 h-56 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  <div className="relative text-center z-10">
                    <Map className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <p className="font-bold text-gray-600 text-sm">Map integration ready</p>
                    <p className="text-xs text-gray-400 mt-1">Connect Google Maps or Mapbox</p>
                  </div>
                  {activeOrdersAll.slice(0, 3).map((o, i) => (
                    <div key={o.id} className="absolute" style={{ top: `${25 + i * 22}%`, left: `${18 + i * 28}%` }}>
                      <div className="relative">
                        <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-60" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Active Deliveries</h3>
                    <p className="text-sm text-gray-500 mt-1">Orders currently being handled by riders</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase">{activeOrdersAll.length} active</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {orders.filter(o => o.status === 'assigned' || o.status === 'picked_up').map(order => (
                    <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-gray-900 uppercase">Order #{order.id}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.status === 'picked_up' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                              {order.status === 'picked_up' ? '🚴 Out for Delivery' : '⏳ Assigned'}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <div><p className="text-[10px] text-gray-400 uppercase font-bold">Pickup</p><p className="text-gray-700 font-semibold">{order.pickup_address}</p></div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                              <div><p className="text-[10px] text-gray-400 uppercase font-bold">Destination</p><p className="text-gray-700 font-semibold">{order.dropoff_address}</p></div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <p className="text-xs text-gray-500">Customer: <span className="font-bold text-gray-700">{order.customer_name}</span></p>
                            <span className="text-gray-300">•</span>
                            <p className="text-xs text-gray-500">Receiver: <span className="font-bold text-gray-700">{order.receiver_name}</span></p>
                          </div>
                        </div>
                        {order.driver_name && (
                          <div className="shrink-0 bg-blue-50 border border-blue-100 rounded-xl p-4 text-center min-w-[140px]">
                            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"><Truck className="w-5 h-5 text-white" /></div>
                            <p className="text-[10px] text-blue-400 uppercase font-bold mb-1">Rider</p>
                            <p className="text-sm font-bold text-blue-800 uppercase">{order.driver_name}</p>
                            {order.driver_phone && (
                              <a href={`tel:${order.driver_phone}`} className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase">
                                <Phone className="w-3 h-3" />{order.driver_phone}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-0">
                        {['pending','assigned','picked_up','delivered'].map((step, i, arr) => {
                          const statuses = ['pending','assigned','picked_up','delivered']
                          const currentIdx = statuses.indexOf(order.status)
                          const stepIdx = statuses.indexOf(step)
                          const done = stepIdx <= currentIdx
                          const labels = ['Created','Assigned','Picked Up','Delivered']
                          return (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center">
                                <div className={`w-3 h-3 rounded-full border-2 ${done ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`} />
                                <span className={`text-[9px] font-bold uppercase mt-1 ${done ? 'text-blue-600' : 'text-gray-400'}`}>{labels[i]}</span>
                              </div>
                              {i < arr.length - 1 && <div className={`flex-1 h-0.5 mb-4 ${stepIdx < currentIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'assigned' || o.status === 'picked_up').length === 0 && (
                    <div className="p-12 text-center">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"><Truck className="w-8 h-8 text-gray-400" /></div>
                      <p className="font-bold text-gray-700">No active deliveries</p>
                      <p className="text-sm text-gray-500 mt-1">Orders that are assigned or picked up will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Pending Assignment</h3>
                    <p className="text-sm text-gray-500 mt-1">Orders waiting for a rider to be assigned</p>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase">{pendingOrdersAll.length} pending</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {pendingOrdersAll.slice(0, 5).map(order => (
                    <div key={order.id} className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900 uppercase text-sm">Order #{order.id}</p>
                        <p className="text-xs text-gray-500 mt-1">{order.customer_name} → {order.receiver_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.dropoff_address}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-blue-600">GH₵ {order.price || '0.00'}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {pendingOrdersAll.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No pending orders</div>}
                  {pendingOrdersAll.length > 5 && (
                    <div className="p-4 text-center">
                      <button onClick={() => navigate('dashboard', 'pending')} className="text-sm font-bold text-blue-600 hover:underline">
                        View all {pendingOrdersAll.length} pending orders →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              REPORTS & ANALYTICS VIEW
          ═══════════════════════════════════════════════════════ */}
          {activeView === 'reports' && (() => {
            const delivered = orders.filter(o => o.status === 'delivered')
            const cancelled = orders.filter(o => o.status === 'cancelled')
            const totalRev  = delivered.reduce((s, o) => s + Number(o.price || 0), 0)
            const todayDel  = delivered.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
            const todayRev  = todayDel.reduce((s, o) => s + Number(o.price || 0), 0)
            const avgVal    = delivered.length ? totalRev / delivered.length : 0
            const compRate  = orders.length ? ((delivered.length / orders.length) * 100).toFixed(1) : 0
            const cancelRate= orders.length ? ((cancelled.length / orders.length) * 100).toFixed(1) : 0
            const last7 = [...Array(7)].map((_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (6 - i))
              const label = d.toLocaleDateString('en', { weekday: 'short' })
              const count = orders.filter(o => new Date(o.created_at).toDateString() === d.toDateString()).length
              return { label, count }
            })
            const maxCount = Math.max(...last7.map(d => d.count), 1)
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue',    value: `GH₵ ${totalRev.toFixed(2)}`,  sub: 'All time delivered', color: 'green' },
                    { label: "Today's Revenue",  value: `GH₵ ${todayRev.toFixed(2)}`,  sub: `${todayDel.length} orders today`, color: 'blue' },
                    { label: 'Avg Order Value',  value: `GH₵ ${avgVal.toFixed(2)}`,    sub: 'Per completed order', color: 'indigo' },
                    { label: 'Completion Rate',  value: `${compRate}%`,                 sub: `${delivered.length} of ${orders.length} completed`, color: 'yellow' },
                  ].map(card => (
                    <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
                      <p className={`text-2xl font-bold ${card.color === 'green' ? 'text-emerald-600' : card.color === 'blue' ? 'text-blue-600' : card.color === 'indigo' ? 'text-indigo-600' : 'text-amber-600'}`}>{card.value}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{card.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Orders — Last 7 Days</h3>
                    <div className="flex items-end gap-2 h-32">
                      {last7.map(({ label, count }) => (
                        <div key={label} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-gray-500">{count}</span>
                          <div className="w-full bg-blue-500 rounded-t-md transition-all" style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? '4px' : '2px', opacity: count > 0 ? 1 : 0.2 }} />
                          <span className="text-[10px] text-gray-400 font-bold">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Order Status Breakdown</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Pending',   count: pendingOrdersAll.length,   color: 'bg-amber-400',   pct: orders.length ? (pendingOrdersAll.length/orders.length*100).toFixed(0) : 0 },
                        { label: 'Delivered', count: delivered.length,           color: 'bg-emerald-500', pct: orders.length ? (delivered.length/orders.length*100).toFixed(0) : 0 },
                        { label: 'Cancelled', count: cancelled.length,           color: 'bg-gray-400',    pct: orders.length ? (cancelled.length/orders.length*100).toFixed(0) : 0 },
                        { label: 'Active',    count: activeOrdersAll.length,     color: 'bg-blue-500',    pct: orders.length ? (activeOrdersAll.length/orders.length*100).toFixed(0) : 0 },
                      ].map(({ label, count, color, pct }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1"><span className="font-bold text-gray-700">{label}</span><span className="text-gray-500">{count} orders ({pct}%)</span></div>
                          <div className="w-full bg-gray-100 rounded-full h-2"><div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">Recent Completed Orders</h3>
                    <span className="text-xs text-gray-400 font-bold uppercase">{delivered.length} total</span>
                  </div>
                  {delivered.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No completed orders yet</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-bold uppercase">
                        <thead className="bg-gray-50 text-gray-400 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3">Order</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Destination</th>
                            <th className="px-6 py-3">Rider</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {delivered.slice(0, 8).map(o => (
                            <tr key={o.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-gray-900">#{o.id}</td>
                              <td className="px-6 py-4 text-gray-700 normal-case font-semibold">{o.customer_name}</td>
                              <td className="px-6 py-4 text-gray-500 normal-case font-semibold max-w-[160px] truncate">{o.dropoff_address}</td>
                              <td className="px-6 py-4 text-gray-700 normal-case font-semibold">{o.driver_name || '-'}</td>
                              <td className="px-6 py-4 text-right text-blue-600">GH₵ {Number(o.price||0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {cancelled.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900">Cancellation Summary</h3>
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase">{cancelRate}% cancel rate</span>
                    </div>
                    <div className="p-6 grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 text-center"><p className="text-3xl font-bold text-gray-800">{cancelled.length}</p><p className="text-xs text-gray-500 font-bold uppercase mt-1">Total Cancelled</p></div>
                      <div className="bg-red-50 rounded-xl p-4 text-center"><p className="text-3xl font-bold text-red-700">{cancelled.filter(o=>o.cancelled_by==='Admin').length}</p><p className="text-xs text-red-400 font-bold uppercase mt-1">By Admin</p></div>
                      <div className="bg-amber-50 rounded-xl p-4 text-center"><p className="text-3xl font-bold text-amber-700">{cancelled.filter(o=>o.cancelled_by!=='Admin').length}</p><p className="text-xs text-amber-400 font-bold uppercase mt-1">By Merchant</p></div>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ═══════════════════════════════════════════════════════
              PERFORMANCE VIEW — NO RIDER LEADERBOARD IN SIDEBAR
          ═══════════════════════════════════════════════════════ */}
          {activeView === 'performance' && (() => {
            const delivered = completedOrdersAll
            const totalRev = delivered.reduce((s, o) => s + Number(o.price || 0), 0)
            const compRate = orders.length ? (delivered.length / orders.length * 100).toFixed(1) : 0
            const riderMap = {}
            delivered.forEach(o => {
              if (!o.driver_name) return
              if (!riderMap[o.driver_name]) riderMap[o.driver_name] = { name: o.driver_name, phone: o.driver_phone, count: 0, revenue: 0 }
              riderMap[o.driver_name].count++
              riderMap[o.driver_name].revenue += Number(o.price || 0)
            })
            const riders = Object.values(riderMap).sort((a, b) => b.count - a.count)
            const topRider = riders[0]

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ClickableStatCard title="Total Orders"   value={orders.length}              color="blue"   icon={<Package />}    onClick={() => setStatModal('total')}     sub="All time" />
                  <ClickableStatCard title="Delivered"      value={completedOrdersAll.length}  color="green"  icon={<CheckCircle />} onClick={() => setStatModal('delivered')} sub="Completed" />
                  <ClickableStatCard title="Cancelled"      value={cancelledOrdersAll.length}  color="red"    icon={<XCircle />}     onClick={() => setStatModal('cancelled')} sub="Click to review" />
                  <ClickableStatCard title="Active Now"     value={activeOrdersAll.length}     color="indigo" icon={<Truck />}       onClick={() => setStatModal('active')}    sub="In progress" />
                </div>

                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-white/20 p-2.5 rounded-xl"><Award className="w-6 h-6 text-white" /></div>
                    <div>
                      <h3 className="font-black text-lg">Performance Overview</h3>
                      <p className="text-indigo-200 text-xs">Your delivery performance metrics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Completion Rate', value: `${compRate}%` },
                      { label: 'Total Revenue',   value: `GH₵ ${totalRev.toFixed(0)}` },
                      { label: 'Total Deliveries',value: delivered.length },
                    ].map(m => (
                      <div key={m.label} className="bg-white/10 rounded-xl p-4 text-center">
                        <p className="text-2xl font-black">{m.value}</p>
                        <p className="text-indigo-200 text-[10px] font-bold uppercase mt-1">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {topRider && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4"><Star className="w-5 h-5 text-amber-500" /><h3 className="font-bold text-gray-900">Top Performing Rider</h3></div>
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-xl">{topRider.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-gray-900 text-base">{topRider.name}</p>
                        {topRider.phone && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{topRider.phone}</p>}
                        <div className="flex gap-6 mt-2">
                          <div><p className="text-[10px] text-gray-400 font-bold uppercase">Deliveries</p><p className="font-black text-blue-600 text-xl leading-none">{topRider.count}</p></div>
                          <div><p className="text-[10px] text-gray-400 font-bold uppercase">Revenue</p><p className="font-black text-emerald-600 text-xl leading-none">GH₵ {topRider.revenue.toFixed(0)}</p></div>
                        </div>
                      </div>
                      <div className="shrink-0 bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                        <Star className="w-6 h-6 text-amber-500 mx-auto" />
                        <p className="text-xs font-black text-amber-700 mt-1">Top Rider</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Quick Stats Breakdown (replaces full leaderboard) */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Admin Cancels',    value: cancelledOrdersAll.filter(o => o.cancelled_by === 'Admin').length,  color: 'text-red-600',    bg: 'bg-red-50' },
                      { label: 'Merchant Cancels', value: cancelledOrdersAll.filter(o => o.cancelled_by !== 'Admin').length,  color: 'text-amber-600',  bg: 'bg-amber-50' },
                      { label: 'Batch Orders',     value: orders.filter(o => o.batch_id).length,                              color: 'text-purple-600', bg: 'bg-purple-50' },
                      { label: 'Single Orders',    value: orders.filter(o => !o.batch_id).length,                            color: 'text-blue-600',   bg: 'bg-blue-50' },
                    ].map(s => (
                      <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ✅ Rider Summary Cards (lighter than leaderboard) */}
                {riders.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Rider Summary</h3>
                      <span className="text-xs text-gray-400 font-bold">{riders.length} riders</span>
                    </div>
                    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {riders.slice(0, 6).map((rider, i) => (
                        <div key={rider.name} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shrink-0">
                              <span className="text-white font-black text-sm">{rider.name.charAt(0)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-gray-900 text-sm truncate">{rider.name}</p>
                              {rider.phone && <p className="text-[10px] text-gray-400 truncate">{rider.phone}</p>}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <div><p className="text-gray-400 font-bold uppercase text-[9px]">Deliveries</p><p className="font-black text-blue-600">{rider.count}</p></div>
                            <div className="text-right"><p className="text-gray-400 font-bold uppercase text-[9px]">Revenue</p><p className="font-black text-emerald-600">GH₵ {rider.revenue.toFixed(0)}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ═══════════════════════════════════════════════════════
              ✅ SETTINGS VIEW — ENHANCED WITH TABS
          ═══════════════════════════════════════════════════════ */}
          {activeView === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* ✅ Settings Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto">
                  {[
                    { id: 'profile',  label: 'Profile',   icon: <UserCircle className="w-4 h-4" /> },
                    { id: 'security', label: 'Security',  icon: <Lock className="w-4 h-4" /> },
                    { id: 'account',  label: 'Account',   icon: <Hash className="w-4 h-4" /> },
                    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-4 text-xs font-bold uppercase whitespace-nowrap border-b-2 transition-all ${
                        settingsTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {tab.icon}{tab.label}
                    </button>
                  ))}
                </div>

                {/* ✅ PROFILE TAB */}
                {settingsTab === 'profile' && (
                  <div className="p-6 space-y-6">
                    {/* Profile Picture Upload */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase mb-4">Profile Picture</p>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
                            {profilePicturePreview ? (
                              <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <UserCircle className="w-10 h-10 text-blue-300" />
                            )}
                          </div>
                          <button
                            onClick={() => profilePicInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-md hover:bg-blue-700 transition-all"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                          <input
                            ref={profilePicInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="hidden"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{merchant.business_name}</p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => profilePicInputRef.current?.click()}
                              className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all border border-blue-200"
                            >
                              Upload Photo
                            </button>
                            {profilePicturePreview && (
                              <button
                                onClick={handleSaveProfilePicture}
                                className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all"
                              >
                                Save
                              </button>
                            )}
                            {profilePicturePreview && (
                              <button
                                onClick={() => { setProfilePicturePreview(null); setProfilePicture(null); deleteProfilePictureFromDB() }}
                                className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all border border-red-200"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Business Info */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase mb-4">Business Information</p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Business Name</label>
                          <input type="text" value={settingsForm.business_name} onChange={e => setSettingsForm(p => ({ ...p, business_name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Your Business Name" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Contact Phone</label>
                            <input type="tel" value={settingsForm.contact_phone} onChange={e => setSettingsForm(p => ({ ...p, contact_phone: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="+233 XX XXX XXXX" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Contact Email</label>
                            <input type="email" value={settingsForm.contact_email} onChange={e => setSettingsForm(p => ({ ...p, contact_email: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="email@example.com" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Default Pickup Address</label>
                          <input type="text" value={settingsForm.pickup_address} onChange={e => setSettingsForm(p => ({ ...p, pickup_address: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="123 Main Street, Accra" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {settingsSaved && <span className="text-sm font-bold text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Settings saved!</span>}
                      <div className="ml-auto">
                        <button
                          onClick={() => { localStorage.setItem('merchant_settings', JSON.stringify(settingsForm)); setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000) }}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md"
                        >
                          <CheckCircle className="w-4 h-4" />Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ SECURITY TAB */}
                {settingsTab === 'security' && (
                  <div className="p-6 space-y-8">
                    {/* Change Password */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-50 p-1.5 rounded-lg"><Lock className="w-4 h-4 text-blue-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Change Password</p>
                          <p className="text-xs text-gray-500">Update your account password</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Current Password</label>
                          <input
                            type="password"
                            value={passwordForm.current}
                            onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">New Password</label>
                            <input
                              type="password"
                              value={passwordForm.new}
                              onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Min. 6 characters"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Confirm New Password</label>
                            <input
                              type="password"
                              value={passwordForm.confirm}
                              onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Repeat new password"
                            />
                          </div>
                        </div>
                        {passwordMsg && (
                          <div className={`p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {passwordMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                            {passwordMsg.text}
                          </div>
                        )}
                        <button
                          onClick={handleChangePassword}
                          disabled={!passwordForm.current || !passwordForm.new || !passwordForm.confirm}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Lock className="w-4 h-4" />Update Password
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Change Email */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-indigo-50 p-1.5 rounded-lg"><Mail className="w-4 h-4 text-indigo-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Change Email Address</p>
                          <p className="text-xs text-gray-500">A verification link will be sent to your new email</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700 font-semibold">
                          Current email: <span className="font-black">{settingsForm.contact_email || merchant?.email || 'Not set'}</span>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">New Email Address</label>
                          <input
                            type="email"
                            value={emailForm.new}
                            onChange={e => setEmailForm(p => ({ ...p, new: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="new@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Confirm New Email</label>
                          <input
                            type="email"
                            value={emailForm.confirm}
                            onChange={e => setEmailForm(p => ({ ...p, confirm: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="Repeat new email"
                          />
                        </div>
                        {emailMsg && (
                          <div className={`p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${emailMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {emailMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                            {emailMsg.text}
                          </div>
                        )}
                        <button
                          onClick={handleChangeEmail}
                          disabled={!emailForm.new || !emailForm.confirm}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />Update Email
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ ACCOUNT TAB */}
                {settingsTab === 'account' && (
                  <div className="p-6 space-y-6">
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase mb-4">Account Information</p>
                      <div className="space-y-3">
                        {[
                          ['Merchant ID',       merchant?.id || '-'],
                          ['Business Name',     merchant?.business_name || '-'],
                          ['Account Status',    'Active'],
                          ['Total Orders',      orders.length],
                          ['Completed Orders',  completedOrdersAll.length],
                          ['Cancellation Rate', `${orders.length ? (cancelledOrdersAll.length / orders.length * 100).toFixed(1) : 0}%`],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                            <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
                            <span className="text-sm font-bold text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Danger Zone */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-red-50 p-1.5 rounded-lg"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-red-700">Danger Zone</p>
                          <p className="text-xs text-gray-400">Irreversible account actions</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl bg-red-50">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Log Out of Account</p>
                          <p className="text-xs text-gray-500">You'll need to log in again</p>
                        </div>
                        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ml-4">
                          <LogOut className="w-3.5 h-3.5" />Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ NOTIFICATIONS TAB */}
                {settingsTab === 'notifications' && (
                  <div className="p-6 space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-4">Choose which events trigger in-app notifications</p>
                    {[
                      ['notification_orders',   'New / Cancelled Orders',    'Alert when an order status changes'],
                      ['notification_riders',   'Rider Assignments',          'Alert when a rider is assigned to your order'],
                      ['notification_delivered','Delivery Confirmations',     'Alert when an order is successfully delivered'],
                    ].map(([key, label, desc]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                          <input type="checkbox" checked={!!settingsForm[key]} onChange={e => setSettingsForm(p => ({ ...p, [key]: e.target.checked }))} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                        </label>
                      </div>
                    ))}
                    <div className="pt-4">
                      <button
                        onClick={() => { localStorage.setItem('merchant_settings', JSON.stringify(settingsForm)); setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000) }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md"
                      >
                        <CheckCircle className="w-4 h-4" />Save Preferences
                      </button>
                      {settingsSaved && <span className="text-sm font-bold text-green-600 flex items-center gap-2 mt-3"><CheckCircle className="w-4 h-4" /> Saved!</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {showCreateOrder && (
        <CreateOrder
          merchant={merchant}
          onClose={() => setShowCreateOrder(false)}
          onOrderCreated={() => loadData(false)}
          defaultPaymentMethod="cash_on_delivery"
        />
      )}
    </div>
  )
}

// ============================================================
// ✅ CLICKABLE STAT CARD
// ============================================================
function ClickableStatCard({ title, value, color, icon, onClick, sub, trend, trendUp }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-600',    ring: 'focus:ring-blue-300',   hover: 'hover:shadow-blue-100',   accent: 'bg-blue-600' },
    yellow: { bg: 'bg-amber-500',   ring: 'focus:ring-amber-300',  hover: 'hover:shadow-amber-100',  accent: 'bg-amber-500' },
    green:  { bg: 'bg-emerald-600', ring: 'focus:ring-emerald-300',hover: 'hover:shadow-emerald-100',accent: 'bg-emerald-600' },
    red:    { bg: 'bg-red-600',     ring: 'focus:ring-red-300',    hover: 'hover:shadow-red-100',    accent: 'bg-red-600' },
    indigo: { bg: 'bg-indigo-600',  ring: 'focus:ring-indigo-300', hover: 'hover:shadow-indigo-100', accent: 'bg-indigo-600' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <button
      onClick={onClick}
      className={`group relative bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 text-left w-full transition-all duration-200 hover:shadow-lg ${c.hover} hover:-translate-y-0.5 focus:outline-none focus:ring-2 ${c.ring} active:scale-95`}
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
        <Eye className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pr-5">{title}</p>
        <div className={`${c.bg} p-3.5 rounded-2xl shadow-lg`}>
          {React.cloneElement(icon, { className: 'w-5 h-5 text-white' })}
        </div>
      </div>
      <p className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-none mb-2">{value}</p>
      <div className="flex items-center justify-between">
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-black ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${c.accent} rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
    </button>
  )
}

// ============================================================
// ✅ SIDEBAR ITEM — blue sidebar variant with richer detail
// ============================================================
function SidebarItem({ icon, label, description, active, onClick, badge, badgeColor = 'bg-blue-500' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
        active
          ? 'bg-white/20 text-white shadow-inner ring-1 ring-white/20'
          : 'text-blue-100 hover:bg-white/10 hover:text-white'
      }`}
    >
      {/* Icon with active highlight */}
      <div className={`shrink-0 p-1.5 rounded-lg transition-all ${
        active ? 'bg-white/20 text-white' : 'text-blue-300 group-hover:text-white group-hover:bg-white/10'
      }`}>
        {icon}
      </div>

      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold leading-tight ${active ? 'text-white' : 'text-blue-100 group-hover:text-white'}`}>
          {label}
        </p>
        {description && (
          <p className={`text-[10px] mt-0.5 truncate leading-tight ${
            active ? 'text-blue-200' : 'text-blue-400 group-hover:text-blue-200'
          }`}>
            {description}
          </p>
        )}
      </div>

      {/* Badge */}
      {badge !== null && badge !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
          active ? 'bg-white text-blue-700' : 'bg-white/10 text-blue-200 group-hover:bg-white/20'
        }`}>
          {badge}
        </span>
      )}

      {/* Active indicator dot */}
      {active && (
        <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 shadow-sm" />
      )}
    </button>
  )
}

// ============================================================
// BATCH ORDER GROUP
// ============================================================
function BatchOrderGroup({ batchId, orders, merchant, onCancelOrder }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const allDelivered = orders.every((o) => o.status === 'delivered')
  const allCancelled = orders.every((o) => o.status === 'cancelled')
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const assignedCount = orders.filter((o) => o.status === 'assigned' || o.status === 'picked_up').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length
  const firstDriver = orders[0]?.driver_id
  const sameDriver = orders.every((o) => o.driver_id === firstDriver)

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md p-6 mb-6 border-l-[8px] ${allDelivered ? 'border-l-green-600' : allCancelled ? 'border-l-gray-400' : 'border-l-purple-600'} font-bold`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="bg-purple-600 p-3 rounded-lg"><Layers className="w-6 h-6 text-white" /></div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg uppercase tracking-tight text-gray-900">BULK ORDER</p>
              <span className="text-[10px] bg-purple-600 text-white px-2 py-1 rounded uppercase">{orders.length} Drops</span>
            </div>
            <p className="text-[10px] uppercase text-gray-400 mt-1">Batch ID: {batchId}</p>
            <p className="text-xs text-gray-600 mt-1">Pickup: <span className="font-bold text-gray-900">{orders[0]?.pickup_address}</span></p>
          </div>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 text-sm text-purple-600 bg-white px-4 py-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-all">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {isExpanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] uppercase text-gray-500 mb-2">
          <span>Pending: {pendingCount}</span>
          <span>In Progress: {assignedCount}</span>
          <span>Delivered: {deliveredCount}</span>
          {cancelledCount > 0 && <span>Cancelled: {cancelledCount}</span>}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="h-full flex">
            <div className="bg-amber-400" style={{ width: `${(pendingCount / orders.length) * 100}%` }} />
            <div className="bg-blue-500" style={{ width: `${(assignedCount / orders.length) * 100}%` }} />
            <div className="bg-green-600" style={{ width: `${(deliveredCount / orders.length) * 100}%` }} />
            {cancelledCount > 0 && <div className="bg-gray-400" style={{ width: `${(cancelledCount / orders.length) * 100}%` }} />}
          </div>
        </div>
      </div>

      {sameDriver && firstDriver && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-[10px] uppercase text-blue-400 leading-none mb-1">All Drops Assigned To</p>
              <p className="text-sm text-blue-800 uppercase tracking-tight font-bold">{orders[0]?.driver_name}</p>
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-3 mt-4 border-t border-purple-200 pt-4">
          <p className="text-xs uppercase text-gray-500 font-bold mb-3">Individual Drop Details</p>
          {orders.map((order, index) => (
            <OrderCard key={order.id} order={order} merchant={merchant} isInBatch={true} dropNumber={index + 1} onCancelOrder={onCancelOrder} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// TAB BUTTON
// ============================================================
function TabButton({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-6 py-5 text-sm font-bold transition-all whitespace-nowrap border-b-[3px] ${active ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-blue-500'}`}
    >
      <span className="flex items-center justify-center gap-2">
        {children}
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
      </span>
    </button>
  )
}

// ============================================================
// ORDER CARD — with payment_method display
// ============================================================
function OrderCard({ order, merchant, isInBatch = false, dropNumber = null, onCancelOrder }) {
  const [showLogs, setShowLogs] = useState(false)
  const formatTime = (ts) => (ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null)
  const canCancel = order.status === 'pending' || order.status === 'assigned'
  const isCancelledByAdmin = order.status === 'cancelled' && order.cancelled_by === 'Admin'

  const paymentLabel = {
    cash_on_delivery: '💵 Cash on Delivery',
    mobile_money: '📱 Mobile Money',
    card: '💳 Card Payment',
    bank_transfer: '🏦 Bank Transfer',
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${!isInBatch && 'mb-5'} border ${isInBatch ? 'border-gray-200' : 'border-gray-100 border-l-[8px]'} ${order.status === 'delivered' ? 'border-l-green-600' : order.status === 'cancelled' ? 'border-l-gray-400' : 'border-l-blue-600'} text-left font-bold`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xl uppercase tracking-tight text-gray-900">
              {isInBatch && <span className="text-purple-600 mr-2">Drop #{dropNumber}</span>}
              ORDER #{order.id}
            </p>
            <p className="text-[10px] uppercase text-gray-400 mt-1">{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {order.status === 'delivered' && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase">Completed</span>}
          {order.status === 'cancelled' && <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200 uppercase">Cancelled</span>}
          {canCancel && (
            <button onClick={() => onCancelOrder(order)} className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 uppercase flex items-center gap-2 hover:bg-red-100" type="button">
              <XCircle className="w-3.5 h-3.5" />Cancel
            </button>
          )}
          <button onClick={() => downloadOrderReceipt(order, merchant, { isInBatch, dropNumber })} className="text-[10px] font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 uppercase flex items-center gap-2 hover:bg-gray-100" type="button">
            <Download className="w-3.5 h-3.5" />Download
          </button>
          <button onClick={() => setShowLogs(!showLogs)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase" type="button">
            {showLogs ? 'Close History' : 'View History'}
          </button>
        </div>
      </div>

      {order.status === 'cancelled' && (
        <div className={`mb-4 p-3 border rounded-lg ${isCancelledByAdmin ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            {isCancelledByAdmin && <AlertCircle className="w-4 h-4 text-red-600" />}
            <p className={`text-[10px] uppercase font-bold ${isCancelledByAdmin ? 'text-red-600' : 'text-gray-400'}`}>
              {isCancelledByAdmin ? '⚠️ CANCELLED BY ADMIN' : 'Cancellation Reason'}
            </p>
          </div>
          <p className={`text-sm ${isCancelledByAdmin ? 'text-red-700' : 'text-gray-700'}`}>{order.cancel_reason || 'No reason provided'}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-4">
        <div className="space-y-4">
          <DetailRow label="Customer" name={order.customer_name} phone={order.customer_phone} />
          <DetailRow label="Receiver" name={order.receiver_name} phone={order.receiver_phone} />
        </div>
        <div className="space-y-4">
          <MapRow label="Pickup Address" address={order.pickup_address} color="text-emerald-600" />
          <MapRow label="Destination" address={order.dropoff_address} color="text-rose-600" />
          <div className="flex items-center justify-between pt-2">
            <span className="text-blue-700 text-xl tracking-tight">GH₵ {order.price || '0.00'}</span>
            {/* ✅ Payment Method Badge */}
            {order.payment_method && (
              <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 uppercase">
                {paymentLabel[order.payment_method] || order.payment_method}
              </span>
            )}
          </div>
        </div>
      </div>

      {order.driver_name && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-wrap justify-between items-center gap-4 font-bold">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg"><Truck className="w-4 h-4 text-white" /></div>
            <div>
              <p className="text-[10px] uppercase text-blue-400 leading-none mb-1">Assigned Rider</p>
              <p className="text-sm text-blue-800 uppercase tracking-tight">{order.driver_name}</p>
            </div>
          </div>
          {order.driver_phone && (
            <a href={`tel:${order.driver_phone}`} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
              <Phone className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-tighter">{order.driver_phone}</span>
            </a>
          )}
        </div>
      )}

      {showLogs && (
        <div className="mt-4 p-5 bg-gray-50 rounded-xl space-y-4 border border-gray-200 border-dashed">
          <TimelineStep label="ORDER INITIALIZED" time={formatTime(order.created_at)} isDone={true} />
          <TimelineStep label="RIDER ASSIGNED" time={formatTime(order.assigned_at)} isDone={!!order.driver_id} />
          <TimelineStep label="PICKED UP" time={formatTime(order.picked_up_at)} isDone={order.status === 'picked_up' || order.status === 'delivered'} />
          <TimelineStep label="DELIVERED" time={formatTime(order.delivered_at)} isDone={order.status === 'delivered'} />
          {order.status === 'cancelled' && <TimelineStep label="CANCELLED" time={formatTime(order.cancelled_at)} isDone={true} isRed={true} />}
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, name, phone }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1"><UserCircle className="w-5 h-5 text-gray-300" /></div>
      <div>
        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-tighter">{label}</p>
        <p className="font-bold text-gray-800 text-sm leading-tight uppercase">{name}</p>
        {phone && <p className="text-[11px] font-semibold text-gray-500 tracking-tight">{phone}</p>}
      </div>
    </div>
  )
}

function MapRow({ label, address, color }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1"><MapPin className={`w-5 h-5 ${color} opacity-80`} /></div>
      <div>
        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-tighter">{label}</p>
        <p className="font-bold text-gray-800 text-sm leading-tight uppercase line-clamp-1">{address}</p>
      </div>
    </div>
  )
}

function TimelineStep({ label, time, isDone, isRed = false }) {
  return (
    <div className="flex items-center gap-4 font-bold">
      <div className={`w-4 h-4 rounded-full border-2 ${isRed ? 'bg-red-500 border-red-500' : isDone ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`} />
      <div className="flex-1 flex justify-between items-center border-b border-gray-200 pb-1">
        <span className={`text-[10px] uppercase ${isRed ? 'text-red-600' : isDone ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
        <span className={`text-[10px] ${isRed ? 'text-red-500' : 'text-blue-600'}`}>{time || '--:--'}</span>
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
      <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-10 h-10 text-gray-400" />
      </div>
      <p className="text-gray-500 text-lg font-semibold">{message}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white h-48 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

export default Dashboard
