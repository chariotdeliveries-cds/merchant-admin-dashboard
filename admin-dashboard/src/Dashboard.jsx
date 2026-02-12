import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Users, 
  Store, 
  LogOut,
  UserCircle,
  Phone,
  MapPin,
  Calendar,
  Bell,
  ChevronRight,
  PlusCircle,
  Smartphone,
  Truck,
  List,
  Search,
  Layers,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react'

function Dashboard() {
  const [admin, setAdmin] = useState(null)
  const [orders, setOrders] = useState([])
  const [drivers, setDrivers] = useState([])
  const [merchants, setMerchants] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')
  const [searchQuery, setSearchQuery] = useState('')
  const [orderTypeFilter, setOrderTypeFilter] = useState('all') // 'all', 'single', 'bulk'
  
  // Notification State
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    if (!adminData) {
      window.location.href = '/'
      return
    }
    setAdmin(JSON.parse(adminData))
    loadData()

    // REALTIME SUBSCRIPTION: Listen for new orders immediately
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'requests' },
        (payload) => {
          setOrders(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [
        { data: ordersData },
        { data: driversData },
        { data: merchantsData }
      ] = await Promise.all([
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('drivers').select('*'),
        supabase.from('merchants').select('*')
      ])

      setOrders(ordersData || [])
      setDrivers(driversData || [])
      setMerchants(merchantsData || [])
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const assignDriver = async (orderId, driverId) => {
    if(!driverId) return alert("Select a rider first")
    const driver = drivers.find(d => d.id === driverId)
    
    // Optimistically update UI first
    setOrders(prevOrders => 
      prevOrders.map(order => 
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

    // Then update database
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
      loadData() // Reload on error to get correct state
    }
  }

  // Assign driver to ALL orders in a batch
  const assignDriverToBatch = async (batchId, driverId) => {
    if(!driverId) return alert("Select a rider first")
    const driver = drivers.find(d => d.id === driverId)
    
    // Optimistically update UI first
    const affectedOrders = orders.filter(o => o.batch_id === batchId)
    setOrders(prevOrders => 
      prevOrders.map(order => 
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

    // Then update database
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
      loadData() // Reload on error
    } else {
      alert(`✓ Rider assigned to all ${affectedOrders.length} orders in this batch!`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    window.location.href = '/'
  }

  const handleNotificationClick = (orderId) => {
    setActiveTab('orders')
    setSearchQuery(orderId.toString())
    setShowNotifications(false)
    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: 'smooth' })
    }, 100)
  }

  if (!admin) return null

  // Group orders by batch_id - FIXED VERSION
  const groupedOrders = {}
  const singleOrders = []

  orders.forEach(order => {
    // Only group if batch_id exists AND is not null AND is not empty string
    if (order.batch_id && order.batch_id !== null && order.batch_id !== '') {
      if (!groupedOrders[order.batch_id]) {
        groupedOrders[order.batch_id] = []
      }
      groupedOrders[order.batch_id].push(order)
    } else {
      singleOrders.push(order)
    }
  })

  // --- FILTERING LOGIC ---
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toString().includes(searchQuery.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.receiver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.batch_id && o.batch_id.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    // Tab Logic
    if (activeTab === 'orders') return true
    if (activeTab === 'app') return !o.merchant_id
    if (activeTab === 'merchant_orders') return !!o.merchant_id
    if (activeTab === 'pending') return o.status === 'pending'
    if (activeTab === 'delivered') return o.status === 'delivered'
    
    return true
  })

  // Apply order type filter
  const filteredBatchIds = Object.keys(groupedOrders).filter(batchId => {
    if (orderTypeFilter === 'single') return false // Hide batches when showing only singles
    const batchOrders = groupedOrders[batchId]
    return batchOrders.some(o => filteredOrders.includes(o))
  })

  const filteredSingleOrders = singleOrders.filter(o => {
    if (orderTypeFilter === 'bulk') return false // Hide singles when showing only bulk
    return filteredOrders.includes(o)
  })

  // Counts for badges
  const bulkOrdersCount = Object.keys(groupedOrders).length
  const singleOrdersCount = singleOrders.length

  const appOrdersCount = orders.filter(o => !o.merchant_id).length
  const merchantOrdersCount = orders.filter(o => o.merchant_id !== null).length
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length
  const completedOrdersCount = orders.filter(o => o.status === 'delivered').length

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-blue-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-white font-bold uppercase tracking-tight">
          <div className="flex items-center gap-3">
            <Package className="w-7 h-7" />
            <h1 className="text-lg">Admin Control</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }} 
                className="relative p-2 hover:bg-blue-500 rounded-full transition-all"
              >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black ring-2 ring-blue-600 shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border text-gray-800 overflow-hidden z-50 normal-case font-sans">
                  <div className="p-4 bg-gray-50 border-b font-bold text-xs uppercase tracking-widest text-gray-400 flex justify-between">
                    <span>Recent Orders</span>
                    {unreadCount > 0 && <span className="text-blue-600 animate-pulse">New</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {orders.length > 0 ? (
                      orders.slice(0, 8).map(o => (
                        <div 
                          key={o.id} 
                          onClick={() => handleNotificationClick(o.id)}
                          className="p-4 border-b hover:bg-blue-50 text-left text-xs cursor-pointer transition-colors"
                        >
                          <p className="font-bold text-blue-600">Order #{o.id}</p>
                          <p className="font-semibold text-gray-700 truncate">{o.customer_name} → {o.receiver_name}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(o.created_at).toLocaleTimeString()}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400 text-xs">No recent activity</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/30 text-xs transition-all font-bold">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-left">
          <StatBox title="All Orders" value={orders.length} color="blue" icon={<Package />} />
          <StatBox title="App Orders" value={appOrdersCount} color="indigo" icon={<Smartphone />} />
          <StatBox title="Merchant Orders" value={merchantOrdersCount} color="green" icon={<Store />} />
          <StatBox title="Pending" value={pendingOrdersCount} color="yellow" icon={<Clock />} />
        </div>

        {/* Search Bar Section */}
        <div className="mb-6 relative">
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

        {/* Order Type Filter Buttons */}
        {(activeTab === 'orders' || activeTab === 'app' || activeTab === 'merchant_orders' || activeTab === 'pending' || activeTab === 'delivered') && (
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
        )}

        <div className="bg-white rounded-xl shadow-sm mb-8 flex border-b overflow-x-auto scrollbar-hide font-bold uppercase">
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} count={orders.length} icon={<List className="w-4 h-4" />}>All Orders</TabButton>
          <TabButton active={activeTab === 'app'} onClick={() => setActiveTab('app')} count={appOrdersCount} icon={<Smartphone className="w-4 h-4" />}>App Orders</TabButton>
          <TabButton active={activeTab === 'merchant_orders'} onClick={() => setActiveTab('merchant_orders')} count={merchantOrdersCount} icon={<Store className="w-4 h-4" />}>Merchant Orders</TabButton>
          <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} count={pendingOrdersCount} icon={<Clock className="w-4 h-4" />}>Pending</TabButton>
          <TabButton active={activeTab === 'delivered'} onClick={() => setActiveTab('delivered')} count={completedOrdersCount} icon={<CheckCircle className="w-4 h-4" />}>Delivered</TabButton>
          <TabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')} count={drivers.length} icon={<Truck className="w-4 h-4" />}>Drivers</TabButton>
          <TabButton active={activeTab === 'merchants_list'} onClick={() => setActiveTab('merchants_list')} count={merchants.length} icon={<Users className="w-4 h-4" />}>Merchants</TabButton>
        </div>

        <div className="pb-12 text-left">
          {loading ? (
            <div className="animate-pulse space-y-4"><div className="bg-white h-48 rounded-xl" /></div>
          ) : (
            <>
              {(activeTab === 'orders' || activeTab === 'app' || activeTab === 'merchant_orders' || activeTab === 'pending' || activeTab === 'delivered') && (
                <>
                  {/* Render Batch Orders */}
                  {filteredBatchIds.map(batchId => (
                    <BatchOrderGroup 
                      key={batchId}
                      batchId={batchId}
                      orders={groupedOrders[batchId]}
                      drivers={drivers}
                      onAssign={assignDriver}
                      onAssignBatch={assignDriverToBatch}
                    />
                  ))}
                  
                  {/* Render Single Orders */}
                  {filteredSingleOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      drivers={drivers} 
                      onAssign={assignDriver} 
                    />
                  ))}

                  {/* Empty State */}
                  {filteredBatchIds.length === 0 && filteredSingleOrders.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        {orderTypeFilter === 'bulk' ? <Layers className="w-10 h-10 text-gray-400" /> : <Package className="w-10 h-10 text-gray-400" />}
                      </div>
                      <p className="text-gray-500 text-lg font-semibold">
                        {searchQuery 
                          ? `No ${orderTypeFilter === 'all' ? '' : orderTypeFilter} orders match your search` 
                          : `No ${orderTypeFilter === 'all' ? '' : orderTypeFilter} orders found`
                        }
                      </p>
                    </div>
                  )}
                </>
              )}
              {activeTab === 'drivers' && <DriversTable drivers={drivers} />}
              {activeTab === 'merchants_list' && <MerchantsTable merchants={merchants} orders={orders} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// UPDATED COMPONENT: Batch Order Group with Flexible Assignment
function BatchOrderGroup({ batchId, orders, drivers, onAssign, onAssignBatch }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState('')
  const [assignMode, setAssignMode] = useState('batch') // 'batch' or 'individual'

  const allDelivered = orders.every(o => o.status === 'delivered')
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const assignedCount = orders.filter(o => o.status === 'assigned' || o.status === 'picked_up').length
  const deliveredCount = orders.filter(o => o.status === 'delivered').length

  // Check if all orders have the same driver
  const firstDriver = orders[0]?.driver_id
  const sameDriver = orders.every(o => o.driver_id === firstDriver)
  
  // Get unique drivers assigned to this batch
  const assignedDrivers = [...new Set(orders.filter(o => o.driver_id).map(o => o.driver_name))]

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md p-6 mb-6 border-l-[8px] ${allDelivered ? 'border-l-green-600' : 'border-l-purple-600'} font-bold`}>
      {/* Batch Header */}
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
              Sender: <span className="font-bold text-gray-900">{orders[0]?.customer_name}</span> • 
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

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] uppercase text-gray-500 mb-2">
          <span>Pending: {pendingCount}</span>
          <span>In Progress: {assignedCount}</span>
          <span>Delivered: {deliveredCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="h-full flex">
            <div className="bg-amber-400" style={{width: `${(pendingCount / orders.length) * 100}%`}} />
            <div className="bg-blue-500" style={{width: `${(assignedCount / orders.length) * 100}%`}} />
            <div className="bg-green-600" style={{width: `${(deliveredCount / orders.length) * 100}%`}} />
          </div>
        </div>
      </div>

      {/* Assignment Mode Toggle */}
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

          {/* Batch Assignment Mode */}
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
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
                <button 
                  onClick={() => {
                    onAssignBatch(batchId, selectedDriver)
                    setSelectedDriver('') // Clear selection after assignment
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

          {/* Individual Assignment Mode - Auto expand */}
          {assignMode === 'individual' && (
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-xs uppercase text-gray-500 mb-3">
                Assign Different Riders to Each Drop
              </p>
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

      {/* Expanded Individual Orders */}
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
              showAssignment={assignMode === 'individual'} // Show assignment controls in individual mode
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StatBox({ title, value, color, icon }) {
  const colorMap = { blue: 'bg-blue-600 text-white', indigo: 'bg-indigo-600 text-white', yellow: 'bg-amber-500 text-white', green: 'bg-emerald-600 text-white' }
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between border border-gray-100">
      <div>
        <p className="text-gray-400 text-[10px] font-bold uppercase mb-1 tracking-widest">{title}</p>
        <p className="text-4xl font-bold text-gray-900 tracking-tight leading-none">{value}</p>
      </div>
      <div className={`${colorMap[color]} p-4 rounded-2xl shadow-lg`}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children, count, icon }) {
  return (
    <button onClick={onClick} className={`flex-1 px-4 py-5 text-sm transition-all border-b-[3px] whitespace-nowrap ${active ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-blue-500'}`}>
      <div className="flex items-center justify-center gap-2">
        {icon}
        <span className="font-bold">{children}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
      </div>
    </button>
  )
}

function OrderCard({ order, drivers, onAssign, isInBatch = false, dropNumber = null, showAssignment = false }) {
  const [selectedDriver, setSelectedDriver] = useState('')
  const [showLogs, setShowLogs] = useState(false)
  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null

  const handleAssign = () => {
    onAssign(order.id, selectedDriver)
    setSelectedDriver('') // Clear selection after assignment
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${!isInBatch && 'mb-5'} border ${isInBatch ? 'border-gray-200' : 'border-gray-100 border-l-[8px] border-l-blue-600'} font-bold`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-lg uppercase tracking-tight text-gray-900">
            {isInBatch && <span className="text-purple-600 mr-2">Drop #{dropNumber}</span>}
            Order #{order.id}
          </p>
          <div className="mt-1 flex gap-2 flex-wrap">
             {!isInBatch && order.merchant_id && (
               <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-purple-100 text-purple-600">
                 Merchant Source
               </span>
             )}
             {!isInBatch && !order.merchant_id && (
               <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-blue-100 text-blue-600">
                 Rider App Feed
               </span>
             )}
             <span className="text-[10px] uppercase text-gray-400">• {order.status}</span>
          </div>
        </div>
        <button onClick={() => setShowLogs(!showLogs)} className="text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg uppercase">
          {showLogs ? 'Close' : 'History'}
        </button>
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
        </div>
      )}

      {/* Show assignment for: single orders OR batch orders in individual mode */}
      {order.status !== 'delivered' && (!isInBatch || showAssignment) && (
        <div className="mt-6 flex gap-3 border-t border-gray-100 pt-6">
          <select 
            value={selectedDriver} 
            onChange={(e) => setSelectedDriver(e.target.value)} 
            className="flex-1 p-2.5 border border-gray-200 rounded-lg font-bold text-sm bg-white outline-none focus:border-blue-500"
          >
            <option value="">Select Rider...</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
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
      <table className="w-full text-left uppercase text-xs">
        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400">
          <tr><th className="px-6 py-4 tracking-wider">Rider Name</th><th className="px-6 py-4 text-center tracking-wider">Contact</th><th className="px-6 py-4 text-center tracking-wider">Status</th></tr>
        </thead>
        <tbody>
          {drivers.map(d => (
            <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 text-gray-900">{d.full_name}</td>
              <td className="px-6 py-4 text-center text-gray-600">{d.phone_number}</td>
              <td className="px-6 py-4 text-center">
                <span className={`px-2 py-1 rounded-md text-[10px] ${d.is_verified ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
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
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400">
          <tr><th className="px-6 py-4 tracking-wider">Business Name</th><th className="px-6 py-4 text-center tracking-wider">Total Volume</th></tr>
        </thead>
        <tbody>
          {merchants.map(m => (
            <tr key={m.id} className="border-b border-gray-50">
              <td className="px-6 py-4 text-gray-900">{m.business_name}</td>
              <td className="px-6 py-4 text-center text-blue-600 text-base">{orders.filter(o => o.merchant_id === m.id).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Dashboard;