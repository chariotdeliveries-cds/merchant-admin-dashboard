import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  ChevronUp
} from 'lucide-react'

/**
 * ✅ What this update fixes / improves
 * 1) Prevents silent failures by logging Supabase errors for orders/drivers/merchants fetch
 * 2) Uses safer merchant parsing + guards (no crash if localStorage is corrupted)
 * 3) Prevents memory leaks: interval + click listener cleaned properly
 * 4) Ensures grouping logic treats null/empty batch_id as SINGLE
 * 5) Makes refresh stable (no UI flicker on silent refresh)
 *
 * NOTE:
 * - This file does NOT create orders. Order creation happens in <CreateOrder />.
 *   If CreateOrder says "failed to create order", we must update CreateOrder to show error.message.
 */

function Dashboard() {
  const [merchant, setMerchant] = useState(null)
  const [orders, setOrders] = useState([])
  const [drivers, setDrivers] = useState([])
  const [merchants, setMerchants] = useState([])

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)
  const lastDeliveredCountRef = useRef(0)
  const intervalRef = useRef(null)

  // --- Helpers ---
  const safeGetMerchantFromStorage = () => {
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
  }

  const loadData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true)

      const merchantData = safeGetMerchantFromStorage()
      if (!merchantData) {
        // If merchant disappears/corrupts while app is open
        localStorage.removeItem('merchant')
        window.location.href = '/'
        return
      }

      try {
        const [ordersRes, driversRes, merchantsRes] = await Promise.all([
          supabase
            .from('requests')
            .select('*')
            .eq('merchant_id', merchantData.id)
            .order('created_at', { ascending: false }),

          supabase.from('drivers').select('*'),

          supabase.from('merchants').select('*')
        ])

        // ✅ Log real errors (RLS, permissions, schema issues, etc.)
        if (ordersRes.error) console.error('Orders fetch error:', ordersRes.error)
        if (driversRes.error) console.error('Drivers fetch error:', driversRes.error)
        if (merchantsRes.error) console.error('Merchants fetch error:', merchantsRes.error)

        const fetchedOrders = ordersRes.data || []
        const fetchedDrivers = driversRes.data || []
        const fetchedMerchants = merchantsRes.data || []

        // Notify ONLY when delivered count increases
        const currentDeliveredCount = fetchedOrders.filter((o) => o.status === 'delivered').length
        if (isSilent && currentDeliveredCount > lastDeliveredCountRef.current) {
          setUnreadCount((prev) => prev + (currentDeliveredCount - lastDeliveredCountRef.current))
        }

        // ✅ Update state
        setOrders(fetchedOrders)
        setDrivers(fetchedDrivers)
        setMerchants(fetchedMerchants)
        lastDeliveredCountRef.current = currentDeliveredCount
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        if (!isSilent) setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    const merchantData = safeGetMerchantFromStorage()
    if (!merchantData) {
      window.location.href = '/'
      return
    }

    setMerchant(merchantData)
    loadData(false)

    // Silent refresh every 10 seconds
    intervalRef.current = setInterval(() => {
      loadData(true)
    }, 10000)

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [loadData])

  const handleLogout = () => {
    localStorage.removeItem('merchant')
    window.location.href = '/'
  }

  if (!merchant) return null

  // --- Derived data (grouping) ---
  const groupedOrders = {}
  const singleOrders = []

  orders.forEach((order) => {
    const batchId = order?.batch_id
    const hasValidBatch =
      batchId !== null &&
      batchId !== undefined &&
      String(batchId).trim() !== '' // handles '' and '   '

    if (hasValidBatch) {
      const key = String(batchId)
      if (!groupedOrders[key]) groupedOrders[key] = []
      groupedOrders[key].push(order)
    } else {
      singleOrders.push(order)
    }
  })

  const batchIds = Object.keys(groupedOrders)

  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const completedOrders = orders.filter((o) => o.status === 'delivered')

  // Search filtering
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()

    return (
      order.id?.toString().includes(query) ||
      order.customer_name?.toLowerCase().includes(query) ||
      order.receiver_name?.toLowerCase().includes(query) ||
      order.pickup_address?.toLowerCase().includes(query) ||
      order.dropoff_address?.toLowerCase().includes(query) ||
      order.status?.toLowerCase().includes(query) ||
      order.batch_id?.toString().toLowerCase().includes(query)
    )
  })

  const getFilteredBatches = (filterFn) => {
    return batchIds.filter((batchId) => {
      const batchOrders = groupedOrders[batchId] || []
      return batchOrders.some((o) => filterFn(o) && filteredOrders.includes(o))
    })
  }

  const getFilteredSingleOrders = (filterFn) => {
    return singleOrders.filter((o) => filterFn(o) && filteredOrders.includes(o))
  }

  const allBatches = getFilteredBatches(() => true)
  const allSingles = getFilteredSingleOrders(() => true)

  const pendingBatches = getFilteredBatches((o) => o.status === 'pending')
  const pendingSingles = getFilteredSingleOrders((o) => o.status === 'pending')

  const deliveredBatches = getFilteredBatches((o) => o.status === 'delivered')
  const deliveredSingles = getFilteredSingleOrders((o) => o.status === 'delivered')

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-blue-600 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight leading-tight">
                  Merchant Dashboard
                </h1>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">
                  {merchant.business_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    setUnreadCount(0)
                  }}
                  className="relative p-2 hover:bg-blue-500 rounded-full transition-all"
                >
                  <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-blue-600 shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border text-gray-800 overflow-hidden z-50">
                    <div className="p-4 bg-gray-50 border-b font-bold text-xs uppercase tracking-widest text-gray-400">
                      Recent Deliveries
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {completedOrders.length > 0 ? (
                        completedOrders.slice(0, 8).map((o) => (
                          <div
                            key={o.id}
                            className="p-4 border-b hover:bg-blue-50 text-left text-xs cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-blue-600">Order #{o.id}</p>
                              <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">
                                Delivered
                              </span>
                            </div>
                            <p className="font-semibold text-gray-700">{o.customer_name}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-400 text-xs italic">
                          No delivered orders yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/30 font-bold text-xs uppercase transition-all"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatBox title="My Orders" value={orders.length} color="blue" icon={<Package />} />
          <StatBox title="Pending" value={pendingOrders.length} color="yellow" icon={<Clock />} />
          <StatBox title="Delivered" value={completedOrders.length} color="green" icon={<CheckCircle />} />
          <StatBox title="Available Drivers" value={drivers.length} color="indigo" icon={<Truck />} />
        </div>

        {/* Search + Create */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, customer name, address, or batch ID..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>

          <button
            onClick={() => setShowCreateOrder(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg font-bold uppercase text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Create Order
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8 flex border-b overflow-x-auto scrollbar-hide font-bold uppercase">
          <TabButton
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            count={orders.length}
          >
            All Orders
          </TabButton>
          <TabButton
            active={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
            count={pendingOrders.length}
          >
            Pending
          </TabButton>
          <TabButton
            active={activeTab === 'delivered'}
            onClick={() => setActiveTab('delivered')}
            count={completedOrders.length}
          >
            Delivered
          </TabButton>
        </div>

        <div className="pb-12">
          {loading ? (
            <LoadingState />
          ) : (
            <>
              {activeTab === 'orders' && (
                <>
                  {allBatches.map((batchId) => (
                    <BatchOrderGroup key={batchId} batchId={batchId} orders={groupedOrders[batchId]} />
                  ))}

                  {allSingles.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}

                  {allBatches.length === 0 && allSingles.length === 0 && (
                    <EmptyState message={searchQuery ? 'No orders match your search' : 'No orders yet'} />
                  )}
                </>
              )}

              {activeTab === 'pending' && (
                <>
                  {pendingBatches.map((batchId) => (
                    <BatchOrderGroup key={batchId} batchId={batchId} orders={groupedOrders[batchId]} />
                  ))}

                  {pendingSingles.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}

                  {pendingBatches.length === 0 && pendingSingles.length === 0 && (
                    <EmptyState
                      message={searchQuery ? 'No pending orders match your search' : 'No pending orders'}
                    />
                  )}
                </>
              )}

              {activeTab === 'delivered' && (
                <>
                  {deliveredBatches.map((batchId) => (
                    <BatchOrderGroup key={batchId} batchId={batchId} orders={groupedOrders[batchId]} />
                  ))}

                  {deliveredSingles.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}

                  {deliveredBatches.length === 0 && deliveredSingles.length === 0 && (
                    <EmptyState
                      message={searchQuery ? 'No delivered orders match your search' : 'No delivered orders yet'}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateOrder && (
        <CreateOrder
          merchant={merchant}
          onClose={() => setShowCreateOrder(false)}
          onOrderCreated={() => loadData(false)}
        />
      )}
    </div>
  )
}

// Batch Order Group Component for Merchant
function BatchOrderGroup({ batchId, orders }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const allDelivered = orders.every((o) => o.status === 'delivered')
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const assignedCount = orders.filter((o) => o.status === 'assigned' || o.status === 'picked_up').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length

  const firstDriver = orders[0]?.driver_id
  const sameDriver = orders.every((o) => o.driver_id === firstDriver)

  return (
    <div
      className={`bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md p-6 mb-6 border-l-[8px] ${
        allDelivered ? 'border-l-green-600' : 'border-l-purple-600'
      } font-bold`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="bg-purple-600 p-3 rounded-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg uppercase tracking-tight text-gray-900">BULK ORDER</p>
              <span className="text-[10px] bg-purple-600 text-white px-2 py-1 rounded uppercase">
                {orders.length} Drops
              </span>
            </div>
            <p className="text-[10px] uppercase text-gray-400 mt-1">Batch ID: {batchId}</p>
            <p className="text-xs text-gray-600 mt-1">
              Pickup: <span className="font-bold text-gray-900">{orders[0]?.pickup_address}</span>
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
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="h-full flex">
            <div className="bg-amber-400" style={{ width: `${(pendingCount / orders.length) * 100}%` }} />
            <div className="bg-blue-500" style={{ width: `${(assignedCount / orders.length) * 100}%` }} />
            <div className="bg-green-600" style={{ width: `${(deliveredCount / orders.length) * 100}%` }} />
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
            <OrderCard key={order.id} order={order} isInBatch={true} dropNumber={index + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function TabButton({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 px-6 py-5
        text-sm font-bold transition-all whitespace-nowrap border-b-[3px]
        ${active ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-blue-500'}
      `}
    >
      <span className="flex items-center justify-center gap-2">
        {children}
        <span
          className={`
            text-[10px] px-1.5 py-0.5 rounded-full font-bold
            ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}
          `}
        >
          {count}
        </span>
      </span>
    </button>
  )
}

function OrderCard({ order, isInBatch = false, dropNumber = null }) {
  const [showLogs, setShowLogs] = useState(false)
  const formatTime = (ts) => (ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null)

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-6 ${!isInBatch && 'mb-5'} border ${
        isInBatch ? 'border-gray-200' : 'border-gray-100 border-l-[8px]'
      } ${order.status === 'delivered' ? 'border-l-green-600' : 'border-l-blue-600'} text-left font-bold`}
    >
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
        <div className="flex items-center gap-2">
          {order.status === 'delivered' && (
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase">
              Completed
            </span>
          )}
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase"
          >
            {showLogs ? 'Close History' : 'View History'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-4">
        <div className="space-y-4">
          <DetailRow label="Customer" name={order.customer_name} phone={order.customer_phone} />
          <DetailRow label="Receiver" name={order.receiver_name} phone={order.receiver_phone} />
        </div>
        <div className="space-y-4">
          <MapRow label="Pickup Address" address={order.pickup_address} color="text-emerald-600" />
          <MapRow label="Destination" address={order.dropoff_address} color="text-rose-600" />
          <div className="pt-2">
            <span className="text-blue-700 text-xl tracking-tight">GH₵ {order.price || '0.00'}</span>
          </div>
        </div>
      </div>

      {order.driver_name && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-wrap justify-between items-center gap-4 font-bold">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-blue-400 leading-none mb-1">Assigned Rider</p>
              <p className="text-sm text-blue-800 uppercase tracking-tight">{order.driver_name}</p>
            </div>
          </div>

          {order.driver_phone && (
            <a
              href={`tel:${order.driver_phone}`}
              className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            >
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
          <TimelineStep
            label="PICKED UP"
            time={formatTime(order.picked_up_at)}
            isDone={order.status === 'picked_up' || order.status === 'delivered'}
          />
          <TimelineStep label="DELIVERED" time={formatTime(order.delivered_at)} isDone={order.status === 'delivered'} />
        </div>
      )}
    </div>
  )
}

function StatBox({ title, value, color, icon }) {
  const colorMap = {
    blue: 'bg-blue-600 text-white',
    yellow: 'bg-amber-500 text-white',
    green: 'bg-emerald-600 text-white',
    indigo: 'bg-indigo-600 text-white'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-left">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
          <p className="text-4xl font-bold text-gray-900 tracking-tight leading-none">{value}</p>
        </div>
        <div className={`${colorMap[color]} p-4 rounded-2xl shadow-lg`}>
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, name, phone }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <UserCircle className="w-5 h-5 text-gray-300" />
      </div>
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
      <div className="mt-1">
        <MapPin className={`w-5 h-5 ${color} opacity-80`} />
      </div>
      <div>
        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-tighter">{label}</p>
        <p className="font-bold text-gray-800 text-sm leading-tight uppercase line-clamp-1">{address}</p>
      </div>
    </div>
  )
}

function TimelineStep({ label, time, isDone }) {
  return (
    <div className="flex items-center gap-4 font-bold">
      <div className={`w-4 h-4 rounded-full border-2 ${isDone ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`} />
      <div className="flex-1 flex justify-between items-center border-b border-gray-200 pb-1">
        <span className={`text-[10px] uppercase ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
        <span className="text-[10px] text-blue-600">{time || '--:--'}</span>
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
