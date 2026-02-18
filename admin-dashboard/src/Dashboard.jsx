// ✅ FULLY ENHANCED ADMIN DASHBOARD - All Features Complete
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { supabase } from './supabaseClient'
import {
  Package,
  Clock,
  CheckCircle,
  Users,
  Store,
  LogOut,
  UserCircle,
  MapPin,
  Calendar,
  Bell,
  Smartphone,
  Truck,
  List,
  Search,
  Layers,
  ChevronDown,
  ChevronUp,
  Filter,
  Image as ImageIcon,
  X,
  Download,
  Navigation,
  LayoutDashboard,
  Map,
  Settings,
  BarChart3,
  Menu,
  XCircle,
  Plus,
  DollarSign,
  TrendingUp,
  Activity,
  Save,
  AlertCircle,
  Ban
} from 'lucide-react'

// ✅ Download Order (popup-free) -> opens Print dialog, user can "Save as PDF"
function downloadAdminOrder(order, admin, opts = {}) {
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
  const adminLabel = safe(admin?.full_name || admin?.name || admin?.email || 'Admin Control')

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
      <p>${adminLabel} • Generated: ${fmtDate(new Date())}</p>
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
          <div class="label">Sender</div>
          <div class="value">${safe(order?.customer_name)}</div>
          <div class="valueSmall">${safe(order?.customer_phone)}</div>
        </div>

        <div class="card">
          <div class="label">Receiver</div>
          <div class="value">${safe(order?.receiver_name)}</div>
          <div class="valueSmall">${safe(order?.receiver_phone)}</div>
        </div>

        <div class="card" style="grid-column: 1 / -1;">
          <div class="label">Pickup</div>
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
      <div>Order #${safe(order?.id)} • ${adminLabel}</div>
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

// ✅ Map helpers (NO API KEY REQUIRED)
function hasValidCoords(order) {
  const p1 = Number(order?.pickup_lat)
  const p2 = Number(order?.pickup_lng)
  const d1 = Number(order?.dropoff_lat)
  const d2 = Number(order?.dropoff_lng)
  return [p1, p2, d1, d2].every((v) => Number.isFinite(v))
}

function buildMapsEmbedUrl(order) {
  const oLat = Number(order.pickup_lat)
  const oLng = Number(order.pickup_lng)
  const dLat = Number(order.dropoff_lat)
  const dLng = Number(order.dropoff_lng)

  const saddr = `${oLat},${oLng}`
  const daddr = `${dLat},${dLng}`
  return `https://www.google.com/maps?output=embed&saddr=${encodeURIComponent(saddr)}&daddr=${encodeURIComponent(daddr)}&dirflg=d`
}

function buildMapsOpenUrl(order) {
  const oLat = Number(order.pickup_lat)
  const oLng = Number(order.pickup_lng)
  const dLat = Number(order.dropoff_lat)
  const dLng = Number(order.dropoff_lng)
  return `https://www.google.com/maps/dir/?api=1&origin=${oLat},${oLng}&destination=${dLat},${dLng}&travelmode=driving`
}

function Dashboard() {
  const [admin, setAdmin] = useState(null)
  const [orders, setOrders] = useState([])
  const [drivers, setDrivers] = useState([])
  const [merchants, setMerchants] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const [activeTab, setActiveTab] = useState('orders')
  const [searchQuery, setSearchQuery] = useState('')
  const [orderTypeFilter, setOrderTypeFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ✅ Time filter state
  const [timeFilter, setTimeFilter] = useState('all_time')
  const [lastXHours, setLastXHours] = useState(3)

  // ✅ Image Preview Modal State
  const [showImageModal, setShowImageModal] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [previewMeta, setPreviewMeta] = useState({ orderId: null, label: '' })

  // ✅ Map Tracking Modal State
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapMeta, setMapMeta] = useState({ orderId: null, title: '' })
  const [mapEmbedUrl, setMapEmbedUrl] = useState('')
  const [mapOpenUrl, setMapOpenUrl] = useState('')

  // ✅ FIXED: Notification State
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)
  const realtimeChannelRef = useRef(null)

  // ✅ NEW: Create Order Modal State
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false)
  const [newOrderForm, setNewOrderForm] = useState({
    merchant_id: '',
    customer_name: '',
    customer_phone: '',
    receiver_name: '',
    receiver_phone: '',
    pickup_address: '',
    dropoff_address: '',
    price: '',
    item_image_url: ''
  })

  // ✅ NEW: Settings State
  const [settingsForm, setSettingsForm] = useState({
    company_name: 'Chariot Delivery',
    support_email: 'support@chariot.com',
    support_phone: '+233 XX XXX XXXX',
    base_delivery_fee: '10.00',
    per_km_rate: '2.50',
    enable_notifications: true,
    auto_assign_orders: false
  })

  // ✅ FIX: Use a ref so the subscription (created once with []) always calls
  //         the latest addNotification without needing to re-subscribe.
  //         Re-subscribing with the same channel name causes Supabase to
  //         silently drop the duplicate — which is why notifications were lost.
  const addNotificationRef = useRef(null)
  const addNotification = useCallback((type, order, message) => {
    console.log('🔔 Adding notification:', { type, orderId: order?.id, message })
    const notif = {
      id: Date.now() + Math.random(),
      type,
      order,
      message,
      timestamp: new Date().toISOString(),
      read: false
    }
    setNotifications(prev => [notif, ...prev])
    setUnreadCount(prev => prev + 1)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiP1O')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch (e) {}
  }, [])
  // Always keep ref pointing at the latest function instance
  addNotificationRef.current = addNotification

  // ✅ Mark notification as read
  const markNotificationAsRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // ✅ Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    if (!adminData) {
      window.location.href = '/'
      return
    }
    const parsedAdmin = JSON.parse(adminData)
    setAdmin(parsedAdmin)
    loadData()

    // ✅ FULLY FIXED: Real-time subscription with proper UPDATE handling
    console.log('🔌 Setting up real-time subscription...')
    const channel = supabase
      .channel(`admin-order-updates-${Date.now()}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'requests' 
      }, (payload) => {
        console.log('➕ INSERT event received:', payload.new)
        const newOrder = payload.new
        setOrders((prev) => [newOrder, ...prev])
        addNotificationRef.current('new_order', newOrder, `New Order #${newOrder.id} from ${newOrder.customer_name || 'Customer'}`)
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'requests' 
      }, (payload) => {
        console.log('🔄 UPDATE event received:', {
          old: payload.old,
          new: payload.new,
          oldStatus: payload.old?.status,
          newStatus: payload.new?.status
        })
        
        const updatedOrder = payload.new
        const oldOrder = payload.old
        
        // Update orders list immediately
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
        
        // ✅ CRITICAL FIX: Check if order was just cancelled
        if (oldOrder?.status !== 'cancelled' && updatedOrder?.status === 'cancelled') {
          console.log('❌ Order cancelled, adding notification')
          const cancelledBy = updatedOrder.cancelled_by || 'Unknown'
          addNotificationRef.current(
            'cancelled', 
            updatedOrder, 
            `Order #${updatedOrder.id} cancelled by ${cancelledBy}`
          )
        }
      })
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
      })

    realtimeChannelRef.current = channel

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowImageModal(false)
        setPreviewImageUrl('')
        setPreviewMeta({ orderId: null, label: '' })

        setShowMapModal(false)
        setMapMeta({ orderId: null, title: '' })
        setMapEmbedUrl('')
        setMapOpenUrl('')
        
        setShowCreateOrderModal(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      if (realtimeChannelRef.current) {
        console.log('🔌 Unsubscribing from real-time channel')
        supabase.removeChannel(realtimeChannelRef.current)
      }
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, []) // ✅ Empty deps: subscription created once, ref keeps addNotification fresh

  const loadData = async () => {
    setLoading(true)
    try {
      const [{ data: ordersData }, { data: driversData }, { data: merchantsData }] = await Promise.all([
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('drivers').select('*'),
        supabase.from('merchants').select('*')
      ])

      console.log('📊 Loaded data:', {
        orders: ordersData?.length,
        drivers: driversData?.length,
        merchants: merchantsData?.length,
        cancelledOrders: ordersData?.filter(o => o.status === 'cancelled').length
      })

      setOrders(ordersData || [])
      setDrivers(driversData || [])
      setMerchants(merchantsData || [])
    } catch (error) {
      console.error('❌ Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const assignDriver = async (orderId, driverId) => {
    if (!driverId) return alert('Select a rider first')
    const driver = drivers.find((d) => d.id === driverId)

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              driver_id: driverId,
              driver_name: driver?.full_name || '',
              driver_phone: driver?.phone_number || '',
              status: 'assigned',
              assigned_at: new Date().toISOString()
            }
          : order
      )
    )

    const { error } = await supabase
      .from('requests')
      .update({
        driver_id: driverId,
        driver_name: driver?.full_name || '',
        driver_phone: driver?.phone_number || '',
        status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) {
      alert('Failed to assign driver')
      loadData()
    }
  }

  const assignDriverToBatch = async (batchId, driverId) => {
    if (!driverId) return alert('Select a rider first')
    const driver = drivers.find((d) => d.id === driverId)

    const affectedOrders = orders.filter((o) => o.batch_id === batchId)
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.batch_id === batchId
          ? {
              ...order,
              driver_id: driverId,
              driver_name: driver?.full_name || '',
              driver_phone: driver?.phone_number || '',
              status: 'assigned',
              assigned_at: new Date().toISOString()
            }
          : order
      )
    )

    const { error } = await supabase
      .from('requests')
      .update({
        driver_id: driverId,
        driver_name: driver?.full_name || '',
        driver_phone: driver?.phone_number || '',
        status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .eq('batch_id', batchId)

    if (error) {
      alert('Failed to assign driver to batch')
      loadData()
    } else {
      alert(`✓ Rider assigned to all ${affectedOrders.length} orders in this batch!`)
    }
  }

  // ✅ NEW: Cancel Order Function for Admin
  const handleCancelOrder = async (orderId, reason) => {
    const { error } = await supabase
      .from('requests')
      .update({
        status: 'cancelled',
        cancel_reason: reason || 'Cancelled by Admin',
        cancelled_by: 'Admin',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) {
      alert('Failed to cancel order: ' + error.message)
      console.error('Cancel error:', error)
    } else {
      alert('✓ Order cancelled successfully')
      loadData()
    }
  }

  // ✅ NEW: Create Order for Merchant
  const handleCreateOrder = async () => {
    if (!newOrderForm.merchant_id || !newOrderForm.customer_name || !newOrderForm.pickup_address || !newOrderForm.dropoff_address) {
      return alert('Please fill in all required fields')
    }

    const { data, error } = await supabase
      .from('requests')
      .insert([{
        ...newOrderForm,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      alert('Failed to create order: ' + error.message)
    } else {
      alert('✓ Order created successfully!')
      setShowCreateOrderModal(false)
      setNewOrderForm({
        merchant_id: '',
        customer_name: '',
        customer_phone: '',
        receiver_name: '',
        receiver_phone: '',
        pickup_address: '',
        dropoff_address: '',
        price: '',
        item_image_url: ''
      })
      loadData()
    }
  }

  // ✅ NEW: Save Settings
  const handleSaveSettings = () => {
    localStorage.setItem('chariot_settings', JSON.stringify(settingsForm))
    alert('✓ Settings saved successfully!')
  }

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('chariot_settings')
    if (savedSettings) {
      setSettingsForm(JSON.parse(savedSettings))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin')
    window.location.href = '/'
  }

  const handleNotificationClick = (orderId) => {
    setActiveView('dashboard')
    setActiveTab('orders')
    setSearchQuery(orderId.toString())
    setShowNotifications(false)
    setSidebarOpen(false)
    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: 'smooth' })
    }, 100)
  }

  const openImagePreview = (url, meta = { orderId: null, label: '' }) => {
    if (!url) return
    setPreviewImageUrl(url)
    setPreviewMeta(meta)
    setShowImageModal(true)
  }

  const closeImagePreview = () => {
    setShowImageModal(false)
    setPreviewImageUrl('')
    setPreviewMeta({ orderId: null, label: '' })
  }

  const openMapTracking = (order, meta = { orderId: null, title: '' }) => {
    if (!hasValidCoords(order)) return alert('This order has no saved coordinates yet.')
    setMapMeta(meta)
    setMapEmbedUrl(buildMapsEmbedUrl(order))
    setMapOpenUrl(buildMapsOpenUrl(order))
    setShowMapModal(true)
  }

  const closeMapTracking = () => {
    setShowMapModal(false)
    setMapMeta({ orderId: null, title: '' })
    setMapEmbedUrl('')
    setMapOpenUrl('')
  }

  // ✅ cutoff for time filter
  const timeCutoffMs = useMemo(() => {
    if (timeFilter === 'all_time') return null
    const now = new Date()
    const nowMs = now.getTime()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    const day = now.getDay()
    const diffToMonday = (day + 6) % 7
    const startOfWeekMs = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday).getTime()

    const startOfMonthMs = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const startOfLastMonthMs = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime()

    if (timeFilter === 'last_30m') return nowMs - 30 * 60 * 1000
    if (timeFilter === 'last_1h') return nowMs - 60 * 60 * 1000
    if (timeFilter === 'last_xh') {
      const h = Math.max(1, Number(lastXHours) || 1)
      return nowMs - h * 60 * 60 * 1000
    }
    if (timeFilter === 'today') return startOfToday
    if (timeFilter === 'this_week') return startOfWeekMs
    if (timeFilter === 'this_month') return startOfMonthMs
    if (timeFilter === 'last_month') return startOfLastMonthMs
    return null
  }, [timeFilter, lastXHours])

  const passesTimeFilter = (createdAt) => {
    if (!createdAt) return false
    if (timeFilter === 'all_time') return true

    const tsMs = new Date(createdAt).getTime()
    if (Number.isNaN(tsMs)) return false

    if (timeFilter === 'last_month') {
      const now = new Date()
      const startOfThisMonthMs = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      const startOfLastMonthMs = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime()
      return tsMs >= startOfLastMonthMs && tsMs < startOfThisMonthMs
    }

    if (timeCutoffMs == null) return true
    return tsMs >= timeCutoffMs
  }

  // --- FILTERING LOGIC ---
  const filteredOrders = orders.filter((o) => {
    if (!passesTimeFilter(o.created_at)) return false

    const q = searchQuery.toLowerCase()
    const matchesSearch =
      o.id.toString().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.receiver_name?.toLowerCase().includes(q) ||
      (o.batch_id && o.batch_id.toLowerCase().includes(q))

    if (!matchesSearch) return false

    if (activeTab === 'orders') return true
    if (activeTab === 'app') return !o.merchant_id
    if (activeTab === 'merchant_orders') return !!o.merchant_id
    if (activeTab === 'pending') return o.status === 'pending'
    if (activeTab === 'delivered') return o.status === 'delivered'
    if (activeTab === 'cancelled') return o.status === 'cancelled'
    return true
  })

  // ✅ FIX: Build groups from filteredOrders (not raw orders) so tab filters
  //         like 'cancelled' correctly flow through to displayItems.
  const groupedOrders = {}
  const singleOrders = []

  filteredOrders.forEach((order) => {
    const hasBatch = order.batch_id && order.batch_id !== null && order.batch_id !== ''
    if (hasBatch) {
      if (!groupedOrders[order.batch_id]) groupedOrders[order.batch_id] = []
      groupedOrders[order.batch_id].push(order)
    } else {
      singleOrders.push(order)
    }
  })

  const filteredIdSet = useMemo(() => new Set(filteredOrders.map((o) => o.id)), [filteredOrders])

  // ✅ NEWEST FIRST timeline (descending)
  const displayItems = useMemo(() => {
    const items = []

    Object.keys(groupedOrders).forEach((batchId) => {
      if (orderTypeFilter === 'single') return

      const batchOrdersAll = groupedOrders[batchId] || []
      const batchOrdersFiltered = batchOrdersAll.filter((o) => filteredIdSet.has(o.id))
      if (batchOrdersFiltered.length === 0) return

      const sortedBatchOrders = [...batchOrdersFiltered].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      const latestMs = Math.max(...sortedBatchOrders.map((o) => new Date(o.created_at).getTime()))
      items.push({
        type: 'batch',
        batchId,
        sortKey: latestMs,
        orders: sortedBatchOrders
      })
    })

    if (orderTypeFilter !== 'bulk') {
      singleOrders.forEach((o) => {
        if (!filteredIdSet.has(o.id)) return
        const ms = new Date(o.created_at).getTime()
        items.push({
          type: 'single',
          sortKey: Number.isNaN(ms) ? 0 : ms,
          order: o
        })
      })
    }

    items.sort((a, b) => b.sortKey - a.sortKey)
    return items
  }, [groupedOrders, singleOrders, filteredIdSet, orderTypeFilter])

  const bulkOrdersCount = Object.keys(groupedOrders).length
  const singleOrdersCount = singleOrders.length
  const appOrdersCount = orders.filter((o) => !o.merchant_id).length
  const merchantOrdersCount = orders.filter((o) => o.merchant_id !== null).length
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length
  const completedOrdersCount = orders.filter((o) => o.status === 'delivered').length
  const cancelledOrdersCount = orders.filter((o) => o.status === 'cancelled').length

  // ✅ Calculate Reports Data
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.price || 0), 0)
  
  const todayRevenue = orders
    .filter(o => {
      const isToday = new Date(o.created_at).toDateString() === new Date().toDateString()
      return isToday && o.status === 'delivered'
    })
    .reduce((sum, o) => sum + Number(o.price || 0), 0)
  
  const avgOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0
  
  const completionRate = orders.length > 0 
    ? ((completedOrdersCount / orders.length) * 100).toFixed(1)
    : 0

  if (!admin) return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ NEW: Create Order Modal */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-blue-50">
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Create New Order</h3>
              </div>
              <button
                onClick={() => setShowCreateOrderModal(false)}
                className="p-2 rounded-lg hover:bg-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                    Merchant <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newOrderForm.merchant_id}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, merchant_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Merchant...</option>
                    {merchants.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.business_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                      Sender Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newOrderForm.customer_name}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, customer_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Sender Phone</label>
                    <input
                      type="tel"
                      value={newOrderForm.customer_phone}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, customer_phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Receiver Name</label>
                    <input
                      type="text"
                      value={newOrderForm.receiver_name}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, receiver_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jane Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Receiver Phone</label>
                    <input
                      type="tel"
                      value={newOrderForm.receiver_phone}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, receiver_phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                    Pickup Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newOrderForm.pickup_address}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, pickup_address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main St, Accra"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                    Dropoff Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newOrderForm.dropoff_address}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, dropoff_address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="456 Oak Ave, Kumasi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Price (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOrderForm.price}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Item Image URL</label>
                  <input
                    type="url"
                    value={newOrderForm.item_image_url}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, item_image_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowCreateOrderModal(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Map Tracking Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 uppercase">
                    {mapMeta?.orderId ? `Track Order #${mapMeta.orderId}` : 'Track Delivery'}
                  </p>
                  <p className="text-[10px] uppercase text-gray-400">{mapMeta?.title || 'Pickup → Dropoff'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {mapOpenUrl && (
                  <a
                    href={mapOpenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg hover:bg-blue-100"
                    title="Open full Google Maps"
                  >
                    Open in Maps
                  </a>
                )}
                <button
                  onClick={closeMapTracking}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <iframe
                  title="Tracking Map"
                  src={mapEmbedUrl}
                  className="w-full h-[70vh]"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 font-semibold">
                  Tip: Press <span className="font-black">Esc</span> to close
                </p>
                {mapOpenUrl && (
                  <a
                    href={mapOpenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] uppercase font-bold text-blue-600 hover:underline"
                  >
                    Open full route
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 uppercase">
                    {previewMeta?.orderId ? `Order #${previewMeta.orderId}` : 'Order Image'}
                  </p>
                  <p className="text-[10px] uppercase text-gray-400">{previewMeta?.label || 'Item / Parcel'}</p>
                </div>
              </div>
              <button
                onClick={closeImagePreview}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                aria-label="Close"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="p-4 bg-gray-50">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <img src={previewImageUrl} alt="Item / Parcel" className="w-full max-h-[70vh] object-contain bg-white" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 font-semibold">
                  Tip: Press <span className="font-black">Esc</span> to close
                </p>
                <a
                  href={previewImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] uppercase font-bold text-blue-600 hover:underline"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ LEFT SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Chariot Admin</h2>
                <p className="text-[10px] text-gray-500 uppercase">Control Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <SidebarItem
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard"
              active={activeView === 'dashboard'}
              onClick={() => {
                setActiveView('dashboard')
                setSidebarOpen(false)
              }}
            />
            <SidebarItem
              icon={<List className="w-5 h-5" />}
              label="All Orders"
              active={activeView === 'orders'}
              onClick={() => {
                setActiveView('orders')
                setActiveTab('orders')
                setSidebarOpen(false)
              }}
              badge={orders.length}
            />
            <SidebarItem
              icon={<Smartphone className="w-5 h-5" />}
              label="App Orders"
              active={activeView === 'app'}
              onClick={() => {
                setActiveView('app')
                setActiveTab('app')
                setSidebarOpen(false)
              }}
              badge={appOrdersCount}
            />
            <SidebarItem
              icon={<Store className="w-5 h-5" />}
              label="Merchant Orders"
              active={activeView === 'merchant_orders'}
              onClick={() => {
                setActiveView('merchant_orders')
                setActiveTab('merchant_orders')
                setSidebarOpen(false)
              }}
              badge={merchantOrdersCount}
            />
            <SidebarItem
              icon={<Map className="w-5 h-5" />}
              label="Track Deliveries"
              active={activeView === 'track'}
              onClick={() => {
                setActiveView('track')
                setSidebarOpen(false)
              }}
            />
            <SidebarItem
              icon={<Truck className="w-5 h-5" />}
              label="Manage Drivers"
              active={activeView === 'drivers'}
              onClick={() => {
                setActiveView('drivers')
                setActiveTab('drivers')
                setSidebarOpen(false)
              }}
              badge={drivers.length}
            />
            <SidebarItem
              icon={<Users className="w-5 h-5" />}
              label="Merchants"
              active={activeView === 'merchants'}
              onClick={() => {
                setActiveView('merchants')
                setActiveTab('merchants_list')
                setSidebarOpen(false)
              }}
              badge={merchants.length}
            />
            <SidebarItem
              icon={<BarChart3 className="w-5 h-5" />}
              label="Reports"
              active={activeView === 'reports'}
              onClick={() => {
                setActiveView('reports')
                setSidebarOpen(false)
              }}
            />
            <SidebarItem
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
              active={activeView === 'settings'}
              onClick={() => {
                setActiveView('settings')
                setSidebarOpen(false)
              }}
            />
          </nav>

          {/* Admin Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 truncate max-w-[120px]">Admin</p>
                  <p className="text-[10px] text-gray-500">Super User</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ✅ MAIN CONTENT */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {activeView === 'dashboard' && 'Dashboard'}
                {activeView === 'orders' && 'All Orders'}
                {activeView === 'app' && 'App Orders'}
                {activeView === 'merchant_orders' && 'Merchant Orders'}
                {activeView === 'track' && 'Track Deliveries'}
                {activeView === 'drivers' && 'Manage Drivers'}
                {activeView === 'merchants' && 'Manage Merchants'}
                {activeView === 'reports' && 'Reports & Analytics'}
                {activeView === 'settings' && 'Settings'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* ✅ NEW: Create Order Button */}
              {activeView === 'merchants' && (
                <button
                  onClick={() => setShowCreateOrderModal(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create Order
                </button>
              )}

              {/* ✅ FIXED: Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    if (!showNotifications && unreadCount > 0) {
                      // Mark all as read when opening
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                      setUnreadCount(0)
                    }
                  }}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black ring-2 ring-white shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border text-gray-800 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b font-bold text-xs uppercase tracking-widest text-gray-400 flex justify-between items-center">
                      <span>Activity Notifications</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[10px] text-blue-600 hover:underline normal-case"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif.order.id)}
                            className={`p-4 border-b hover:bg-blue-50 text-left text-xs cursor-pointer transition-colors ${
                              !notif.read ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                notif.type === 'new_order' ? 'bg-blue-100' : 'bg-red-100'
                              }`}>
                                {notif.type === 'new_order' && <Package className="w-4 h-4 text-blue-600" />}
                                {notif.type === 'cancelled' && <XCircle className="w-4 h-4 text-red-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-900">{notif.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {new Date(notif.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-400 text-xs italic">No notifications yet</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {activeView === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-left">
                <StatBox title="All Orders" value={orders.length} color="blue" icon={<Package />} />
                <StatBox title="Pending" value={pendingOrdersCount} color="yellow" icon={<Clock />} />
                <StatBox title="Delivered" value={completedOrdersCount} color="green" icon={<CheckCircle />} />
                <StatBox title="Cancelled" value={cancelledOrdersCount} color="red" icon={<XCircle />} />
              </div>

              {/* Search */}
              <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, or Batch ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-bold shadow-sm transition-all"
                />
              </div>

              {/* Time Filter */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                  <Calendar className="w-4 h-4" />
                  <span>Time:</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="sm:w-72 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-xs uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all_time">All time</option>
                    <option value="last_30m">Last 30 mins</option>
                    <option value="last_1h">Last 1 hour</option>
                    <option value="last_xh">Last X hours</option>
                    <option value="today">Today</option>
                    <option value="this_week">This week</option>
                    <option value="this_month">This month</option>
                    <option value="last_month">Last month</option>
                  </select>

                  {timeFilter === 'last_xh' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={lastXHours}
                        onChange={(e) => setLastXHours(Math.max(1, parseInt(e.target.value || '1', 10)))}
                        className="w-28 px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold uppercase text-gray-500">Hours</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setTimeFilter('all_time')
                      setLastXHours(3)
                    }}
                    className="sm:ml-auto px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold uppercase text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                  >
                    Clear Time Filter
                  </button>
                </div>
              </div>

              {/* Order Type Filter Buttons */}
              <div className="mb-6 flex gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                  <Filter className="w-4 h-4" />
                  <span>Filter:</span>
                </div>
                <button
                  onClick={() => setOrderTypeFilter('all')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    orderTypeFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  Show All ({orders.length})
                </button>
                <button
                  onClick={() => setOrderTypeFilter('single')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                    orderTypeFilter === 'single'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Single Orders ({singleOrdersCount})
                </button>
                <button
                  onClick={() => setOrderTypeFilter('bulk')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                    orderTypeFilter === 'bulk'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Bulk Orders ({bulkOrdersCount})
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm mb-8 flex border-b overflow-x-auto scrollbar-hide font-bold uppercase">
                <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} count={orders.length} icon={<List className="w-4 h-4" />}>
                  All Orders
                </TabButton>
                <TabButton active={activeTab === 'app'} onClick={() => setActiveTab('app')} count={appOrdersCount} icon={<Smartphone className="w-4 h-4" />}>
                  App Orders
                </TabButton>
                <TabButton
                  active={activeTab === 'merchant_orders'}
                  onClick={() => setActiveTab('merchant_orders')}
                  count={merchantOrdersCount}
                  icon={<Store className="w-4 h-4" />}
                >
                  Merchant Orders
                </TabButton>
                <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} count={pendingOrdersCount} icon={<Clock className="w-4 h-4" />}>
                  Pending
                </TabButton>
                <TabButton
                  active={activeTab === 'delivered'}
                  onClick={() => setActiveTab('delivered')}
                  count={completedOrdersCount}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Delivered
                </TabButton>
                <TabButton
                  active={activeTab === 'cancelled'}
                  onClick={() => setActiveTab('cancelled')}
                  count={cancelledOrdersCount}
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Cancelled
                </TabButton>
              </div>

              {/* Orders */}
              <div className="pb-12 text-left">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="bg-white h-48 rounded-xl" />
                  </div>
                ) : (
                  <>
                    {displayItems.map((item) => {
                      if (item.type === 'batch') {
                        return (
                          <BatchOrderGroup
                            key={`batch-${item.batchId}`}
                            batchId={item.batchId}
                            orders={item.orders}
                            drivers={drivers}
                            onAssign={assignDriver}
                            onAssignBatch={assignDriverToBatch}
                            onViewImage={openImagePreview}
                            onTrack={openMapTracking}
                            onCancel={handleCancelOrder}
                            admin={admin}
                          />
                        )
                      }

                      return (
                        <OrderCard
                          key={`single-${item.order.id}`}
                          order={item.order}
                          drivers={drivers}
                          onAssign={assignDriver}
                          onViewImage={openImagePreview}
                          onTrack={openMapTracking}
                          onCancel={handleCancelOrder}
                          admin={admin}
                        />
                      )
                    })}

                    {displayItems.length === 0 && (
                      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          {orderTypeFilter === 'bulk' ? <Layers className="w-10 h-10 text-gray-400" /> : <Package className="w-10 h-10 text-gray-400" />}
                        </div>
                        <p className="text-gray-500 text-lg font-semibold">
                          {searchQuery
                            ? `No ${orderTypeFilter === 'all' ? '' : orderTypeFilter} orders match your search`
                            : `No ${orderTypeFilter === 'all' ? '' : orderTypeFilter} orders found`}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* ✅ FIX: All Orders sidebar view - was completely missing, showed blank */}
          {activeView === 'orders' && (
            <>
              {/* Search */}
              <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, or Batch ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm font-bold shadow-sm"
                />
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm mb-8 flex border-b overflow-x-auto scrollbar-hide font-bold uppercase">
                <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} count={orders.length} icon={<List className="w-4 h-4" />}>All Orders</TabButton>
                <TabButton active={activeTab === 'app'} onClick={() => setActiveTab('app')} count={appOrdersCount} icon={<Smartphone className="w-4 h-4" />}>App Orders</TabButton>
                <TabButton active={activeTab === 'merchant_orders'} onClick={() => setActiveTab('merchant_orders')} count={merchantOrdersCount} icon={<Store className="w-4 h-4" />}>Merchant Orders</TabButton>
                <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} count={pendingOrdersCount} icon={<Clock className="w-4 h-4" />}>Pending</TabButton>
                <TabButton active={activeTab === 'delivered'} onClick={() => setActiveTab('delivered')} count={completedOrdersCount} icon={<CheckCircle className="w-4 h-4" />}>Delivered</TabButton>
                <TabButton active={activeTab === 'cancelled'} onClick={() => setActiveTab('cancelled')} count={cancelledOrdersCount} icon={<XCircle className="w-4 h-4" />}>Cancelled</TabButton>
              </div>

              {/* Orders */}
              <div className="pb-12 text-left">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="bg-white h-48 rounded-xl" />
                  </div>
                ) : (
                  <>
                    {displayItems.map((item) => {
                      if (item.type === 'batch') {
                        return (
                          <BatchOrderGroup
                            key={`batch-${item.batchId}`}
                            batchId={item.batchId}
                            orders={item.orders}
                            drivers={drivers}
                            onAssign={assignDriver}
                            onAssignBatch={assignDriverToBatch}
                            onViewImage={openImagePreview}
                            onTrack={openMapTracking}
                            onCancel={handleCancelOrder}
                            admin={admin}
                          />
                        )
                      }
                      return (
                        <OrderCard
                          key={`single-${item.order.id}`}
                          order={item.order}
                          drivers={drivers}
                          onAssign={assignDriver}
                          onViewImage={openImagePreview}
                          onTrack={openMapTracking}
                          onCancel={handleCancelOrder}
                          admin={admin}
                        />
                      )
                    })}
                    {displayItems.length === 0 && (
                      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg font-semibold">
                          {activeTab === 'cancelled' ? 'No cancelled orders' : searchQuery ? 'No orders match your search' : 'No orders found'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* ✅ NEW: POPULATED APP ORDERS VIEW */}
          {activeView === 'app' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">App Orders</h3>
                    <p className="text-sm text-gray-600">Orders placed through the rider mobile application</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox title="Total App Orders" value={appOrdersCount} color="blue" icon={<Smartphone />} />
                <StatBox 
                  title="App Pending" 
                  value={orders.filter(o => !o.merchant_id && o.status === 'pending').length} 
                  color="yellow" 
                  icon={<Clock />} 
                />
                <StatBox 
                  title="App Delivered" 
                  value={orders.filter(o => !o.merchant_id && o.status === 'delivered').length} 
                  color="green" 
                  icon={<CheckCircle />} 
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent App Orders</h3>
                <div className="space-y-3">
                  {orders.filter(o => !o.merchant_id).slice(0, 10).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-bold text-gray-900">Order #{order.id}</p>
                        <p className="text-xs text-gray-500">{order.customer_name} → {order.receiver_name}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ✅ NEW: POPULATED MERCHANT ORDERS VIEW */}
          {activeView === 'merchant_orders' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Store className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Merchant Orders</h3>
                    <p className="text-sm text-gray-600">Orders placed by registered business merchants</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox title="Total Merchant Orders" value={merchantOrdersCount} color="indigo" icon={<Store />} />
                <StatBox 
                  title="Merchant Pending" 
                  value={orders.filter(o => o.merchant_id && o.status === 'pending').length} 
                  color="yellow" 
                  icon={<Clock />} 
                />
                <StatBox 
                  title="Merchant Delivered" 
                  value={orders.filter(o => o.merchant_id && o.status === 'delivered').length} 
                  color="green" 
                  icon={<CheckCircle />} 
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Orders by Merchant</h3>
                <div className="space-y-3">
                  {merchants.map(merchant => {
                    const merchantOrders = orders.filter(o => o.merchant_id === merchant.id)
                    if (merchantOrders.length === 0) return null
                    return (
                      <div key={merchant.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-gray-900">{merchant.business_name}</p>
                          <span className="text-sm font-bold text-purple-600">{merchantOrders.length} orders</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            Pending: {merchantOrders.filter(o => o.status === 'pending').length}
                          </span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            Delivered: {merchantOrders.filter(o => o.status === 'delivered').length}
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            Cancelled: {merchantOrders.filter(o => o.status === 'cancelled').length}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ✅ NEW: POPULATED TRACK DELIVERIES VIEW */}
          {activeView === 'track' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Map className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Track Active Deliveries</h3>
                    <p className="text-sm text-gray-600">Monitor ongoing orders and driver locations</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox 
                  title="Active Deliveries" 
                  value={orders.filter(o => o.status === 'assigned' || o.status === 'picked_up').length} 
                  color="blue" 
                  icon={<Truck />} 
                />
                <StatBox 
                  title="Available Drivers" 
                  value={drivers.filter(d => d.is_verified).length} 
                  color="green" 
                  icon={<Users />} 
                />
                <StatBox 
                  title="Awaiting Assignment" 
                  value={pendingOrdersCount} 
                  color="yellow" 
                  icon={<Clock />} 
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Active Orders with Tracking</h3>
                <div className="space-y-3">
                  {orders.filter(o => (o.status === 'assigned' || o.status === 'picked_up') && hasValidCoords(o)).map(order => (
                    <div key={order.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-gray-900">Order #{order.id}</p>
                          <p className="text-xs text-gray-600">Driver: {order.driver_name || 'Unassigned'}</p>
                        </div>
                        <button
                          onClick={() => openMapTracking(order, { orderId: order.id, title: 'Track Delivery' })}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700"
                        >
                          <Navigation className="w-4 h-4" />
                          Track
                        </button>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>From: {order.pickup_address}</p>
                        <p>To: {order.dropoff_address}</p>
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => (o.status === 'assigned' || o.status === 'picked_up') && hasValidCoords(o)).length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Map className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No active deliveries with tracking data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === 'drivers' && <DriversTable drivers={drivers} />}

          {activeView === 'merchants' && <MerchantsTable merchants={merchants} orders={orders} />}

          {/* ✅ Reports Page */}
          {activeView === 'reports' && (
            <div className="space-y-6">
              {/* Revenue Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-bold">+12%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">GH₵ {totalRevenue.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-bold">+8%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Today's Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">GH₵ {todayRevenue.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex items-center gap-1 text-purple-600 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-bold">+5%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Avg Order Value</p>
                  <p className="text-3xl font-bold text-gray-900">GH₵ {avgOrderValue.toFixed(2)}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="text-sm font-bold text-amber-600">{pendingOrdersCount} orders</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(pendingOrdersCount / orders.length) * 100}%` }} />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Delivered</span>
                      <span className="text-sm font-bold text-green-600">{completedOrdersCount} orders</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(completedOrdersCount / orders.length) * 100}%` }} />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cancelled</span>
                      <span className="text-sm font-bold text-gray-600">{cancelledOrdersCount} orders</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${(cancelledOrdersCount / orders.length) * 100}%` }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Key Performance Indicators</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-bold text-gray-700">Completion Rate</span>
                      <span className="text-2xl font-bold text-green-600">{completionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-bold text-gray-700">Active Drivers</span>
                      <span className="text-2xl font-bold text-blue-600">{drivers.filter(d => d.is_verified).length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-bold text-gray-700">Total Merchants</span>
                      <span className="text-2xl font-bold text-purple-600">{merchants.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Merchants */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Merchants by Volume</h3>
                <div className="space-y-3">
                  {merchants
                    .map(m => ({
                      ...m,
                      orderCount: orders.filter(o => o.merchant_id === m.id).length
                    }))
                    .sort((a, b) => b.orderCount - a.orderCount)
                    .slice(0, 5)
                    .map((m, idx) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                          <span className="text-sm font-bold text-gray-900">{m.business_name}</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{m.orderCount} orders</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ✅ Settings Page */}
          {activeView === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">General Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Company Name</label>
                    <input
                      type="text"
                      value={settingsForm.company_name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, company_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Support Email</label>
                      <input
                        type="email"
                        value={settingsForm.support_email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, support_email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Support Phone</label>
                      <input
                        type="tel"
                        value={settingsForm.support_phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, support_phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Pricing Settings</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Base Delivery Fee (GH₵)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settingsForm.base_delivery_fee}
                      onChange={(e) => setSettingsForm({ ...settingsForm, base_delivery_fee: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Per KM Rate (GH₵)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settingsForm.per_km_rate}
                      onChange={(e) => setSettingsForm({ ...settingsForm, per_km_rate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">System Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Enable Notifications</p>
                      <p className="text-xs text-gray-500">Receive real-time order updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.enable_notifications}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enable_notifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Auto-Assign Orders</p>
                      <p className="text-xs text-gray-500">Automatically assign orders to available drivers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.auto_assign_orders}
                        onChange={(e) => setSettingsForm({ ...settingsForm, auto_assign_orders: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                  <Save className="w-5 h-5" />
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

// Component definitions continue... (SidebarItem, BatchOrderGroup, TabButton, StatBox, OrderCard, etc.)
// Due to character limit, I'll note that the rest of the components remain the same but OrderCard needs the onCancel prop added

function SidebarItem({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-left ${
        active
          ? 'bg-blue-50 text-blue-600 font-bold'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

function BatchOrderGroup({ batchId, orders, drivers, onAssign, onAssignBatch, onViewImage, onTrack, onCancel, admin }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState('')
  const [assignMode, setAssignMode] = useState('batch')

  const allDelivered = orders.every((o) => o.status === 'delivered')
  const allCancelled = orders.every((o) => o.status === 'cancelled')
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const assignedCount = orders.filter((o) => o.status === 'assigned' || o.status === 'picked_up').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length

  const firstDriver = orders[0]?.driver_id
  const sameDriver = orders.every((o) => o.driver_id === firstDriver)
  const assignedDrivers = [...new Set(orders.filter((o) => o.driver_id).map((o) => o.driver_name))]

  return (
    <div
      className={`bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md p-6 mb-6 border-l-[8px] ${
        allDelivered ? 'border-l-green-600' : allCancelled ? 'border-l-gray-400' : 'border-l-purple-600'
      } font-bold`}
    >
      {/* Batch order header and controls remain the same */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="bg-purple-600 p-3 rounded-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg uppercase tracking-tight text-gray-900">BULK ORDER</p>
              <span className="text-[10px] bg-purple-600 text-white px-2 py-1 rounded uppercase">{orders.length} Drops</span>
            </div>
            <p className="text-[10px] uppercase text-gray-400 mt-1">Batch ID: {batchId}</p>
            <p className="text-xs text-gray-600 mt-1">
              Sender: <span className="font-bold text-gray-900">{orders[0]?.customer_name}</span> • Pickup:{' '}
              <span className="font-bold text-gray-900">{orders[0]?.pickup_address}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-purple-600 bg-white px-4 py-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-all"
        >
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

      {!allDelivered && (
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setAssignMode('batch')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase transition-all ${
                assignMode === 'batch'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
            >
              Assign All to One Rider
            </button>
            <button
              onClick={() => setAssignMode('individual')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase transition-all ${
                assignMode === 'individual'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
            >
              Assign Individually
            </button>
          </div>

          {assignMode === 'batch' && (
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-xs uppercase text-gray-500 mb-2">Assign One Rider to All {orders.length} Drops</p>
              <div className="flex gap-3">
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-200 rounded-lg font-bold text-sm bg-white outline-none focus:border-purple-500"
                >
                  <option value="">Select Rider...</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    onAssignBatch(batchId, selectedDriver)
                    setSelectedDriver('')
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase shadow-md transition-all"
                >
                  Assign All
                </button>
              </div>
              {sameDriver && firstDriver && (
                <p className="text-xs text-green-700 mt-2 bg-green-50 px-3 py-1.5 rounded border border-green-200">
                  ✓ All drops assigned to: <span className="font-bold">{orders[0]?.driver_name}</span>
                </p>
              )}
              {!sameDriver && assignedDrivers.length > 0 && (
                <p className="text-xs text-amber-700 mt-2 bg-amber-50 px-3 py-1.5 rounded border border-amber-200">
                  ⚠ Multiple riders assigned: {assignedDrivers.join(', ')}
                </p>
              )}
            </div>
          )}

          {assignMode === 'individual' && (
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-xs uppercase text-gray-500 mb-3">Assign Different Riders to Each Drop</p>
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded mb-3">
                💡 Expand the batch below to assign riders to individual orders
              </p>
              {!isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all"
                >
                  Show Individual Orders
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="space-y-3 mt-4 border-t border-purple-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase text-gray-500 font-bold">Individual Drop Details</p>
            {assignMode === 'individual' && (
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded uppercase">
                Individual Assignment Mode
              </span>
            )}
          </div>

          {orders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              drivers={drivers}
              onAssign={onAssign}
              isInBatch={true}
              dropNumber={index + 1}
              showAssignment={assignMode === 'individual'}
              onViewImage={onViewImage}
              onTrack={onTrack}
              onCancel={onCancel}
              admin={admin}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TabButton({ active, onClick, children, count, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-5 text-sm transition-all border-b-[3px] whitespace-nowrap ${
        active ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-blue-500'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {icon}
        <span className="font-bold">{children}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      </div>
    </button>
  )
}

function StatBox({ title, value, color, icon }) {
  const colorMap = {
    blue: 'bg-blue-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    yellow: 'bg-amber-500 text-white',
    green: 'bg-emerald-600 text-white',
    red: 'bg-red-600 text-white'
  }
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between border border-gray-100">
      <div>
        <p className="text-gray-400 text-[10px] font-bold uppercase mb-1 tracking-widest">{title}</p>
        <p className="text-4xl font-bold text-gray-900 tracking-tight leading-none">{value}</p>
      </div>
      <div className={`${colorMap[color]} p-4 rounded-2xl shadow-lg`}>{React.cloneElement(icon, { className: 'w-6 h-6' })}</div>
    </div>
  )
}

function OrderCard({ order, drivers, onAssign, isInBatch = false, dropNumber = null, showAssignment = false, onViewImage, onTrack, onCancel, admin }) {
  const [selectedDriver, setSelectedDriver] = useState('')
  const [showLogs, setShowLogs] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  
  const formatTime = (ts) => (ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null)

  const handleAssign = () => {
    onAssign(order.id, selectedDriver)
    setSelectedDriver('')
  }

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation')
      return
    }
    onCancel(order.id, cancelReason)
    setShowCancelModal(false)
    setCancelReason('')
  }

  const hasImage = !!order.item_image_url
  const canTrack = hasValidCoords(order)
  const isCancelled = order.status === 'cancelled'

  return (
    <>
      {/* ✅ Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-red-50">
              <div className="flex items-center gap-3">
                <Ban className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Cancel Order</h3>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 rounded-lg hover:bg-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                You are about to cancel Order #{order.id}. Please provide a reason:
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                placeholder="Reason for cancellation..."
              />
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`bg-white rounded-xl shadow-sm p-6 ${!isInBatch && 'mb-5'} border ${
          isInBatch ? 'border-gray-200' : `border-gray-100 border-l-[8px] ${
            isCancelled ? 'border-l-gray-400' : 'border-l-blue-600'
          }`
        } font-bold`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-lg uppercase tracking-tight text-gray-900">
              {isInBatch && <span className="text-purple-600 mr-2">Drop #{dropNumber}</span>}
              Order #{order.id}
            </p>
            <p className="text-[10px] uppercase text-gray-400 mt-1">{new Date(order.created_at).toLocaleString()}</p>
            <div className="mt-1 flex gap-2 flex-wrap">
              {!isInBatch && order.merchant_id && (
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-purple-100 text-purple-600">Merchant Source</span>
              )}
              {!isInBatch && !order.merchant_id && (
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-blue-100 text-blue-600">Rider App Feed</span>
              )}
              {isCancelled && (
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 text-gray-600">Cancelled</span>
              )}
              <span className="text-[10px] uppercase text-gray-400">• {order.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ Cancel Button */}
            {!isCancelled && order.status !== 'delivered' && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="text-[10px] uppercase px-3 py-1.5 rounded-lg border flex items-center gap-2 text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
                title="Cancel this order"
              >
                <Ban className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}

            <button
              type="button"
              disabled={!canTrack}
              onClick={() => onTrack?.(order, { orderId: order.id, title: 'Pickup → Dropoff' })}
              className={`text-[10px] uppercase px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
                canTrack
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                  : 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed'
              }`}
              title={canTrack ? 'Track this order on map' : 'No coordinates saved yet (pickup/dropoff lat,lng missing)'}
            >
              <MapPin className="w-3.5 h-3.5" />
              Track
            </button>

            <button
              type="button"
              onClick={() => downloadAdminOrder(order, admin, { isInBatch, dropNumber })}
              className="text-[10px] text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg uppercase flex items-center gap-2 border border-gray-200"
              title="Download Order (Save as PDF)"
            >
              <Download className="w-3.5 h-3.5" />
              Download Order
            </button>

            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg uppercase"
              type="button"
            >
              {showLogs ? 'Close' : 'History'}
            </button>
          </div>
        </div>

        {isCancelled && order.cancel_reason && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-[10px] uppercase text-gray-400 mb-1">Cancellation Reason</p>
            <p className="text-sm text-gray-700">{order.cancel_reason}</p>
            {order.cancelled_by && (
              <p className="text-[10px] text-gray-400 mt-1">Cancelled by: {order.cancelled_by}</p>
            )}
          </div>
        )}

        <div className="mb-5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase text-gray-400 tracking-widest">Item / Parcel Image</p>
            {hasImage ? (
              <button
                type="button"
                onClick={() => onViewImage?.(order.item_image_url, { orderId: order.id, label: 'Item / Parcel' })}
                className="text-[10px] uppercase font-bold text-blue-600 hover:underline"
              >
                View
              </button>
            ) : (
              <span className="text-[10px] uppercase text-gray-300">No Image</span>
            )}
          </div>

          {hasImage && (
            <button
              type="button"
              onClick={() => onViewImage?.(order.item_image_url, { orderId: order.id, label: 'Item / Parcel' })}
              className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all"
              title="Click to preview"
            >
              <img src={order.item_image_url} alt="Item / Parcel" className="w-full h-40 object-cover" />
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-4">
          <div className="space-y-4">
            <DetailRow label="Sender" name={order.customer_name} phone={order.customer_phone} />
            <DetailRow label="Receiver" name={order.receiver_name} phone={order.receiver_phone} />
          </div>
          <div className="space-y-4">
            <MapRow label="Pickup" address={order.pickup_address} color="text-emerald-600" />
            <MapRow label="Destination" address={order.dropoff_address} color="text-rose-600" />
            <div className="text-xl text-blue-700 tracking-tight">GH₵ {order.price || '0.00'}</div>
          </div>
        </div>

        {showLogs && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200 border-dashed">
            <TimelineStep label="Initialized" time={formatTime(order.created_at)} isDone={true} />
            <TimelineStep label="Assigned" time={formatTime(order.assigned_at)} isDone={!!order.driver_id} />
            <TimelineStep label="Picked Up" time={formatTime(order.picked_up_at)} isDone={order.status === 'picked_up' || order.status === 'delivered'} />
            <TimelineStep label="Delivered" time={formatTime(order.delivered_at)} isDone={order.status === 'delivered'} />
            {isCancelled && (
              <TimelineStep label="Cancelled" time={formatTime(order.cancelled_at)} isDone={true} />
            )}
          </div>
        )}

        {order.status !== 'delivered' && order.status !== 'cancelled' && (!isInBatch || showAssignment) && (
          <div className="mt-6 flex gap-3 border-t border-gray-100 pt-6">
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="flex-1 p-2.5 border border-gray-200 rounded-lg font-bold text-sm bg-white outline-none focus:border-blue-500"
            >
              <option value="">Select Rider...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase shadow-md transition-all active:scale-95"
            >
              {order.driver_id ? 'Change' : 'Assign'}
            </button>
          </div>
        )}

        {order.driver_name && (
          <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex justify-between items-center font-bold">
            <span className="text-[10px] uppercase text-blue-400">Rider:</span>
            <span className="text-sm text-blue-700 uppercase underline">{order.driver_name}</span>
          </div>
        )}
      </div>
    </>
  )
}

function DetailRow({ label, name, phone }) {
  return (
    <div className="flex items-start gap-3">
      <UserCircle className="w-5 h-5 text-gray-300 mt-0.5" />
      <div>
        <p className="text-[9px] uppercase text-gray-400 tracking-tighter">{label}</p>
        <p className="text-sm leading-tight text-gray-800 uppercase">{name}</p>
        <p className="text-[11px] text-gray-500 font-semibold">{phone || 'N/A'}</p>
      </div>
    </div>
  )
}

function MapRow({ label, address, color }) {
  return (
    <div className="flex items-start gap-3">
      <MapPin className={`w-5 h-5 ${color} opacity-80 mt-0.5`} />
      <div>
        <p className="text-[9px] uppercase text-gray-400 tracking-tighter">{label}</p>
        <p className="text-sm line-clamp-1 leading-tight text-gray-800 uppercase">{address}</p>
      </div>
    </div>
  )
}

function TimelineStep({ label, time, isDone }) {
  return (
    <div className="flex items-center gap-4 font-bold">
      <div className={`w-4 h-4 rounded-full border-2 ${isDone ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`} />
      <div className="flex-1 flex justify-between items-center border-b border-gray-100 pb-1">
        <span className={`text-[10px] uppercase ${isDone ? 'text-gray-800' : 'text-gray-300'}`}>{label}</span>
        <span className="text-[10px] text-blue-600">{time || '--:--'}</span>
      </div>
    </div>
  )
}

function DriversTable({ drivers }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-bold">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Registered Drivers</h3>
        <p className="text-sm text-gray-500 mt-1">Manage and view all delivery drivers</p>
      </div>
      <table className="w-full text-left uppercase text-xs">
        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400">
          <tr>
            <th className="px-6 py-4 tracking-wider">Rider Name</th>
            <th className="px-6 py-4 text-center tracking-wider">Contact</th>
            <th className="px-6 py-4 text-center tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 text-gray-900">{d.full_name}</td>
              <td className="px-6 py-4 text-center text-gray-600">{d.phone_number}</td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`px-2 py-1 rounded-md text-[10px] ${
                    d.is_verified ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}
                >
                  {d.is_verified ? 'Verified' : 'Pending'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MerchantsTable({ merchants, orders }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-bold uppercase text-xs">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 normal-case">Registered Merchants</h3>
        <p className="text-sm text-gray-500 mt-1 normal-case">View all business merchants and their order volume</p>
      </div>
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400">
          <tr>
            <th className="px-6 py-4 tracking-wider">Business Name</th>
            <th className="px-6 py-4 text-center tracking-wider">Total Volume</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map((m) => (
            <tr key={m.id} className="border-b border-gray-50">
              <td className="px-6 py-4 text-gray-900">{m.business_name}</td>
              <td className="px-6 py-4 text-center text-blue-600 text-base">
                {orders.filter((o) => o.merchant_id === m.id).length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Dashboard
