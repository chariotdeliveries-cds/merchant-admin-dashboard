import { useState, useRef, useEffect, useMemo } from 'react'
import { supabase } from './supabaseClient'
import { PlusCircle, Trash2, Package, User, Users, CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react'
import MapPicker from './components/MapPicker'

// ============================================================
// ✅ PAYMENT METHOD CONFIG
// ============================================================
const PAYMENT_METHODS = [
  {
    id: 'cash_on_delivery',
    label: 'Cash on Delivery',
    description: 'Paid in cash upon delivery',
    icon: <Banknote className="w-4 h-4" />,
    color: 'border-emerald-400 bg-emerald-50 text-emerald-700',
    activeRing: 'ring-2 ring-emerald-400',
  },
  {
    id: 'mobile_money',
    label: 'Mobile Money',
    description: 'MTN MoMo, Telecel Cash, AirtelTigo',
    icon: <Smartphone className="w-4 h-4" />,
    color: 'border-amber-400 bg-amber-50 text-amber-700',
    activeRing: 'ring-2 ring-amber-400',
  },
  {
    id: 'card',
    label: 'Card Payment',
    description: 'Visa / Mastercard',
    icon: <CreditCard className="w-4 h-4" />,
    color: 'border-blue-400 bg-blue-50 text-blue-700',
    activeRing: 'ring-2 ring-blue-400',
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Direct bank deposit',
    icon: <Building2 className="w-4 h-4" />,
    color: 'border-purple-400 bg-purple-50 text-purple-700',
    activeRing: 'ring-2 ring-purple-400',
  },
]

// ============================================================
// ✅ PAYMENT METHOD SELECTOR COMPONENT
// ============================================================
function PaymentMethodSelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Payment Method <span className="text-gray-400 font-normal">(optional)</span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = value === method.id
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(isSelected ? '' : method.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? `${method.color} ${method.activeRing} shadow-sm`
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`shrink-0 ${isSelected ? '' : 'text-gray-400'}`}>
                {method.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight truncate">{method.label}</p>
                <p className="text-[10px] opacity-70 truncate">{method.description}</p>
              </div>
            </button>
          )
        })}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="mt-2 text-[10px] text-gray-400 hover:text-gray-600 underline"
        >
          Clear selection
        </button>
      )}
    </div>
  )
}

function CreateOrder({ merchant, onClose, onOrderCreated }) {
  const [orderMode, setOrderMode] = useState('single') // 'single' or 'bulk'
  const [pickupNote, setPickupNote] = useState('')

  // ✅ Pickup map state (shared)
  const [pickupAddress, setPickupAddress] = useState(merchant?.business_address || '')
  const [pickupCoords, setPickupCoords] = useState(null) // { lat, lng }

  // ✅ Optional image (single mode)
  const [singleImageFile, setSingleImageFile] = useState(null)
  const [singlePreviewUrl, setSinglePreviewUrl] = useState(null)
  const singleFileInputRef = useRef(null)

  // ✅ Payment method (single mode)
  const [paymentMethod, setPaymentMethod] = useState('')

  // Single order mode
  const [singleOrder, setSingleOrder] = useState({
    receiver_name: '',
    receiver_phone: '',
    dropoff_address: '',
    dropoff_note: '',
    item: '',
    dropoff_coords: null // { lat, lng }
  })

  // Bulk order mode
  const [recipients, setRecipients] = useState([
    {
      id: 1,
      receiver_name: '',
      receiver_phone: '',
      dropoff_address: '',
      dropoff_note: '',
      item: '',
      dropoff_coords: null,
      item_image_file: null,
      item_image_preview: null,
      payment_method: '' // ✅ per-drop payment method
    }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ✅ keep pickup address synced with merchant address on open
  useEffect(() => {
    setPickupAddress(merchant?.business_address || '')
  }, [merchant?.business_address])

  // ✅ cleanup preview URLs
  useEffect(() => {
    return () => {
      if (singlePreviewUrl) URL.revokeObjectURL(singlePreviewUrl)
      recipients.forEach((r) => {
        if (r.item_image_preview) URL.revokeObjectURL(r.item_image_preview)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ✅ Small helpers
  const cleanText = (v) => (v ?? '').toString().trim()
  const cleanPhone = (v) => (v ?? '').toString().trim()

  const makeBatchId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return `BATCH-${crypto.randomUUID()}`
    return `BATCH-${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  const getFileExt = (name = '') => {
    const parts = name.split('.')
    return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg'
  }

  // ✅ Upload helper (returns public URL)
  const uploadOrderImage = async (file, merchantId, prefix = 'single') => {
    if (!file) return null

    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed.')
    }
    const maxMB = 5
    if (file.size > maxMB * 1024 * 1024) {
      throw new Error(`Image too large. Max ${maxMB}MB.`)
    }

    const ext = getFileExt(file.name) || 'jpg'
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`
    const path = `${merchantId}/${fileName}`

    const { error: uploadError } = await supabase.storage.from('order-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(uploadError.message || 'Failed to upload image.')
    }

    const { data } = supabase.storage.from('order-images').getPublicUrl(path)
    return data?.publicUrl || null
  }

  // ✅ Geocode helper (fallback if user did not click map)
  const geocodeAddress = async (address) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const a = cleanText(address)
    if (!apiKey || !a) return null

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(a)}&key=${apiKey}`
      const res = await fetch(url)
      const json = await res.json()

      if (json.status !== 'OK' || !json.results?.length) return null

      const loc = json.results[0]?.geometry?.location
      if (!loc || !Number.isFinite(loc.lat) || !Number.isFinite(loc.lng)) return null

      return { lat: loc.lat, lng: loc.lng }
    } catch (e) {
      console.error('Geocode failed:', e)
      return null
    }
  }

  const handleSingleOrderChange = (e) => {
    setSingleOrder({
      ...singleOrder,
      [e.target.name]: e.target.value
    })
  }

  const handleRecipientChange = (id, field, value) => {
    setRecipients(recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const handleRecipientFileChange = (id, file) => {
    setRecipients((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        if (r.item_image_preview) URL.revokeObjectURL(r.item_image_preview)
        return {
          ...r,
          item_image_file: file || null,
          item_image_preview: file ? URL.createObjectURL(file) : null
        }
      })
    )
  }

  const handleRemoveRecipientImage = (id) => {
    const input = document.getElementById(`bulk-image-${id}`)
    if (input) input.value = ''

    setRecipients((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        if (r.item_image_preview) URL.revokeObjectURL(r.item_image_preview)
        return { ...r, item_image_file: null, item_image_preview: null }
      })
    )
  }

  const handleSingleFileChange = (file) => {
    if (singlePreviewUrl) URL.revokeObjectURL(singlePreviewUrl)
    setSingleImageFile(file || null)
    setSinglePreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  const handleRemoveSingleImage = () => {
    if (singlePreviewUrl) URL.revokeObjectURL(singlePreviewUrl)
    setSinglePreviewUrl(null)
    setSingleImageFile(null)
    if (singleFileInputRef.current) singleFileInputRef.current.value = ''
  }

  const addRecipient = () => {
    const newId = recipients.length ? Math.max(...recipients.map((r) => r.id)) + 1 : 1
    setRecipients([
      ...recipients,
      {
        id: newId,
        receiver_name: '',
        receiver_phone: '',
        dropoff_address: '',
        dropoff_note: '',
        item: '',
        dropoff_coords: null,
        item_image_file: null,
        item_image_preview: null,
        payment_method: ''
      }
    ])
  }

  const removeRecipient = (id) => {
    if (recipients.length > 1) {
      const rec = recipients.find((r) => r.id === id)
      if (rec?.item_image_preview) URL.revokeObjectURL(rec.item_image_preview)
      setRecipients(recipients.filter((r) => r.id !== id))
    }
  }

  // ✅ Map callbacks
  const handlePickupSelected = ({ address, lat, lng }) => {
    if (address) setPickupAddress(address)
    if (Number.isFinite(lat) && Number.isFinite(lng)) setPickupCoords({ lat, lng })
  }

  const handleSingleDropoffSelected = ({ address, lat, lng }) => {
    if (address) {
      setSingleOrder((prev) => ({ ...prev, dropoff_address: address }))
    }
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setSingleOrder((prev) => ({ ...prev, dropoff_coords: { lat, lng } }))
    }
  }

  const handleBulkDropoffSelected = (id, { address, lat, lng }) => {
    setRecipients((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        return {
          ...r,
          dropoff_address: address ? address : r.dropoff_address,
          dropoff_coords: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : r.dropoff_coords
        }
      })
    )
  }

  const validateSingle = () => {
    if (!merchant?.id) return 'Merchant ID missing. Please log in again.'
    if (!cleanText(merchant.business_name)) return 'Business name is missing.'
    if (!cleanText(merchant.business_address)) return 'Business address is missing.'
    if (!cleanText(singleOrder.receiver_name)) return 'Receiver name is required.'
    if (!cleanPhone(singleOrder.receiver_phone)) return 'Receiver phone is required.'
    if (!cleanText(singleOrder.dropoff_address)) return 'Delivery address is required.'
    if (!cleanText(singleOrder.item)) return 'Item description is required.'
    return ''
  }

  const validateBulk = () => {
    if (!merchant?.id) return 'Merchant ID missing. Please log in again.'
    if (!cleanText(merchant.business_name)) return 'Business name is missing.'
    if (!cleanText(merchant.business_address)) return 'Business address is missing.'
    if (!recipients.length) return 'Add at least one recipient.'

    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i]
      if (!cleanText(r.receiver_name)) return `Receiver name is required for Drop #${i + 1}.`
      if (!cleanPhone(r.receiver_phone)) return `Receiver phone is required for Drop #${i + 1}.`
      if (!cleanText(r.dropoff_address)) return `Delivery address is required for Drop #${i + 1}.`
      if (!cleanText(r.item)) return `Item description is required for Drop #${i + 1}.`
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const validationError = orderMode === 'single' ? validateSingle() : validateBulk()
      if (validationError) {
        setError(validationError)
        setLoading(false)
        return
      }

      const merchantId = merchant.id
      const customerPhone = merchant.phone || merchant.phone_number || ''

      // ✅ fallback pickup geocode if not set
      let finalPickupCoords = pickupCoords
      if (!finalPickupCoords && cleanText(pickupAddress)) {
        finalPickupCoords = await geocodeAddress(pickupAddress)
        if (finalPickupCoords) setPickupCoords(finalPickupCoords)
      }

      const base = {
        merchant_id: merchantId,
        customer_name: cleanText(merchant.business_name),
        customer_phone: cleanPhone(customerPhone),

        pickup_address: cleanText(pickupAddress || merchant.business_address),
        pickup_note: cleanText(pickupNote) || null,

        pickup_lat: finalPickupCoords?.lat ?? null,
        pickup_lng: finalPickupCoords?.lng ?? null,

        status: 'pending',
        price: 15.0
      }

      let orders = []

      if (orderMode === 'single') {
        // ✅ fallback dropoff geocode if not set
        let finalDrop = singleOrder.dropoff_coords
        if (!finalDrop && cleanText(singleOrder.dropoff_address)) {
          finalDrop = await geocodeAddress(singleOrder.dropoff_address)
        }

        const imageUrl = await uploadOrderImage(singleImageFile, merchantId, 'single')

        orders = [
          {
            ...base,
            receiver_name: cleanText(singleOrder.receiver_name),
            receiver_phone: cleanPhone(singleOrder.receiver_phone),
            dropoff_address: cleanText(singleOrder.dropoff_address),
            dropoff_note: cleanText(singleOrder.dropoff_note) || null,
            item: [cleanText(singleOrder.item)],
            batch_id: null,
            item_image_url: imageUrl,
            // ✅ payment method
            payment_method: paymentMethod || null,

            dropoff_lat: finalDrop?.lat ?? null,
            dropoff_lng: finalDrop?.lng ?? null
          }
        ]
      } else {
        const batchId = makeBatchId()

        const imageUrlsByRecipientId = {}
        for (const r of recipients) {
          if (r.item_image_file) {
            imageUrlsByRecipientId[r.id] = await uploadOrderImage(r.item_image_file, merchantId, `bulk-${batchId}-drop${r.id}`)
          } else {
            imageUrlsByRecipientId[r.id] = null
          }
        }

        // ✅ fallback geocode each dropoff if coords missing
        const enrichedRecipients = []
        for (const r of recipients) {
          let finalDrop = r.dropoff_coords
          if (!finalDrop && cleanText(r.dropoff_address)) {
            finalDrop = await geocodeAddress(r.dropoff_address)
          }
          enrichedRecipients.push({ ...r, _finalDrop: finalDrop })
        }

        orders = enrichedRecipients.map((recipient) => ({
          ...base,
          receiver_name: cleanText(recipient.receiver_name),
          receiver_phone: cleanPhone(recipient.receiver_phone),
          dropoff_address: cleanText(recipient.dropoff_address),
          dropoff_note: cleanText(recipient.dropoff_note) || null,
          item: [cleanText(recipient.item)],
          batch_id: batchId,
          item_image_url: imageUrlsByRecipientId[recipient.id],
          // ✅ per-drop payment method
          payment_method: recipient.payment_method || null,

          dropoff_lat: recipient._finalDrop?.lat ?? null,
          dropoff_lng: recipient._finalDrop?.lng ?? null
        }))
      }

      const { error: insertError } = await supabase.from('requests').insert(orders).select()

      if (insertError) {
        console.error('Supabase insertError:', insertError)
        throw new Error(insertError.message)
      }

      if (orderMode === 'bulk') {
        alert(`Bulk order created! ${recipients.length} deliveries linked together.`)
      } else {
        alert('Order created successfully!')
      }

      // ✅ Reset forms
      setPickupNote('')
      setPickupAddress(merchant?.business_address || '')
      setPickupCoords(null)
      setPaymentMethod('')

      setSingleOrder({
        receiver_name: '',
        receiver_phone: '',
        dropoff_address: '',
        dropoff_note: '',
        item: '',
        dropoff_coords: null
      })

      if (singlePreviewUrl) URL.revokeObjectURL(singlePreviewUrl)
      setSinglePreviewUrl(null)
      setSingleImageFile(null)
      if (singleFileInputRef.current) singleFileInputRef.current.value = ''

      recipients.forEach((r) => {
        if (r.item_image_preview) URL.revokeObjectURL(r.item_image_preview)
      })
      setRecipients([
        {
          id: 1,
          receiver_name: '',
          receiver_phone: '',
          dropoff_address: '',
          dropoff_note: '',
          item: '',
          dropoff_coords: null,
          item_image_file: null,
          item_image_preview: null,
          payment_method: ''
        }
      ])
      setOrderMode('single')

      onOrderCreated?.()
      onClose?.()
    } catch (err) {
      console.error('Error creating order:', err)
      const msg = err?.message || 'Failed to create order. Please try again.'
      setError(msg)

      if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('permission')) {
        console.warn('RLS/permission issue detected. Check policies for requests and storage bucket.')
      }
    } finally {
      setLoading(false)
    }
  }

  // 🧠 Map center defaults (Ghana-ish)
  const defaultCenter = useMemo(() => ({ lat: 5.6037, lng: -0.187 }), [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Create Order</h2>
              <p className="text-sm text-gray-500 mt-1">Choose single or bulk delivery</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl" type="button">
              ×
            </button>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

          {/* Order Mode Selector */}
          <div className="mb-6 flex gap-3">
            <button
              type="button"
              onClick={() => setOrderMode('single')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                orderMode === 'single' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <User className={`w-6 h-6 ${orderMode === 'single' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className={`font-bold ${orderMode === 'single' ? 'text-blue-600' : 'text-gray-700'}`}>Single Order</p>
                  <p className="text-xs text-gray-500">One recipient</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setOrderMode('bulk')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                orderMode === 'bulk' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Users className={`w-6 h-6 ${orderMode === 'bulk' ? 'text-purple-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className={`font-bold ${orderMode === 'bulk' ? 'text-purple-600' : 'text-gray-700'}`}>Bulk Order</p>
                  <p className="text-xs text-gray-500">Multiple recipients</p>
                </div>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pickup Information */}
            <div
              className={`${
                orderMode === 'bulk' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
              } rounded-lg p-4`}
            >
              <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Pickup Information
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={merchant.business_name}
                      className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      value={merchant.phone || merchant.phone_number || 'N/A'}
                      className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Pickup Address</label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Pickup Map */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">
                    Tip: Search / select pickup on the map to save coordinates (recommended for tracking).
                  </p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <MapPicker
                      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                      label="Pickup location"
                      initialAddress={pickupAddress}
                      initialCenter={pickupCoords || defaultCenter}
                      onSelect={handlePickupSelected}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Pickup Note (Optional)</label>
                  <input
                    type="text"
                    value={pickupNote}
                    onChange={(e) => setPickupNote(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="e.g., Ring the bell, use back entrance"
                  />
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                SINGLE ORDER MODE
            ═══════════════════════════════════════════════════════ */}
            {orderMode === 'single' && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h3 className="font-semibold mb-3 text-gray-900">Recipient Details</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Receiver Name *</label>
                    <input
                      type="text"
                      name="receiver_name"
                      value={singleOrder.receiver_name}
                      onChange={handleSingleOrderChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Receiver Phone *</label>
                    <input
                      type="tel"
                      name="receiver_phone"
                      value={singleOrder.receiver_phone}
                      onChange={handleSingleOrderChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0201234567"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Delivery Address *</label>
                    <input
                      type="text"
                      name="dropoff_address"
                      value={singleOrder.dropoff_address}
                      onChange={handleSingleOrderChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Dropoff Map */}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-2">Select dropoff on the map to save coordinates.</p>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <MapPicker
                        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                        label="Dropoff location"
                        initialAddress={singleOrder.dropoff_address}
                        initialCenter={singleOrder.dropoff_coords || defaultCenter}
                        onSelect={handleSingleDropoffSelected}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Item Description *</label>
                    <input
                      type="text"
                      name="item"
                      value={singleOrder.item}
                      onChange={handleSingleOrderChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2 large pizzas"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Delivery Note</label>
                    <input
                      type="text"
                      name="dropoff_note"
                      value={singleOrder.dropoff_note}
                      onChange={handleSingleOrderChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Leave at the gate"
                    />
                  </div>

                  {/* ✅ PAYMENT METHOD — SINGLE */}
                  <div className="col-span-2">
                    <div className="border-t border-gray-100 pt-3 mt-1">
                      <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                    </div>
                  </div>

                  {/* Optional Image Upload */}
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Item/Parcel Image (Optional)</label>
                    <input
                      ref={singleFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSingleFileChange(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border rounded bg-white"
                    />

                    {singleImageFile && (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {singlePreviewUrl && (
                            <img src={singlePreviewUrl} alt="Selected" className="w-16 h-16 rounded border object-cover" />
                          )}
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">Selected: {singleImageFile.name}</p>
                            <p className="text-[11px] text-gray-400">You can remove it before submitting</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveSingleImage}
                          className="px-3 py-2 text-xs font-bold rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                BULK ORDER MODE
            ═══════════════════════════════════════════════════════ */}
            {orderMode === 'bulk' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Recipients ({recipients.length})</h3>
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all text-sm font-semibold"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Recipient
                  </button>
                </div>

                <div className="space-y-4">
                  {recipients.map((recipient, index) => (
                    <div key={recipient.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-700">Drop #{index + 1}</h4>
                        {recipients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRecipient(recipient.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove recipient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Receiver Name *</label>
                          <input
                            type="text"
                            value={recipient.receiver_name}
                            onChange={(e) => handleRecipientChange(recipient.id, 'receiver_name', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Receiver Phone *</label>
                          <input
                            type="tel"
                            value={recipient.receiver_phone}
                            onChange={(e) => handleRecipientChange(recipient.id, 'receiver_phone', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="0201234567"
                            required
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm text-gray-700 mb-1">Delivery Address *</label>
                          <input
                            type="text"
                            value={recipient.dropoff_address}
                            onChange={(e) => handleRecipientChange(recipient.id, 'dropoff_address', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                          />
                        </div>

                        {/* Dropoff Map per drop */}
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 mb-2">Select dropoff on the map (saves coordinates).</p>
                          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <MapPicker
                              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                              label={`Dropoff location (Drop #${index + 1})`}
                              initialAddress={recipient.dropoff_address}
                              initialCenter={recipient.dropoff_coords || defaultCenter}
                              onSelect={(payload) => handleBulkDropoffSelected(recipient.id, payload)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Item Description *</label>
                          <input
                            type="text"
                            value={recipient.item}
                            onChange={(e) => handleRecipientChange(recipient.id, 'item', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g., 2 large pizzas"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Delivery Note</label>
                          <input
                            type="text"
                            value={recipient.dropoff_note}
                            onChange={(e) => handleRecipientChange(recipient.id, 'dropoff_note', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g., Leave at the gate"
                          />
                        </div>

                        {/* ✅ PAYMENT METHOD — PER DROP */}
                        <div className="col-span-2">
                          <div className="border-t border-gray-100 pt-3 mt-1">
                            <PaymentMethodSelector
                              value={recipient.payment_method}
                              onChange={(val) => handleRecipientChange(recipient.id, 'payment_method', val)}
                            />
                          </div>
                        </div>

                        {/* Optional Image Upload (Bulk per drop) */}
                        <div className="col-span-2">
                          <label className="block text-sm text-gray-700 mb-1">Item/Parcel Image (Optional)</label>
                          <input
                            id={`bulk-image-${recipient.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleRecipientFileChange(recipient.id, e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border rounded bg-white"
                          />

                          {recipient.item_image_file && (
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {recipient.item_image_preview && (
                                  <img
                                    src={recipient.item_image_preview}
                                    alt="Selected"
                                    className="w-16 h-16 rounded border object-cover"
                                  />
                                )}
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold">Selected: {recipient.item_image_file.name}</p>
                                  <p className="text-[11px] text-gray-400">Optional — remove if not needed</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveRecipientImage(recipient.id)}
                                className="px-3 py-2 text-xs font-bold rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                              >
                                Remove Image
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Total Deliveries</p>
                      <p className="text-2xl font-bold text-gray-900">{recipients.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Estimated Total</p>
                      <p className="text-2xl font-bold text-purple-600">GH₵ {(recipients.length * 15).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary for single */}
            {orderMode === 'single' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Delivery Fee</p>
                    {paymentMethod && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || paymentMethod}
                      </p>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-blue-600">GH₵ 15.00</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 ${
                  orderMode === 'bulk' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                } text-white px-4 py-2 rounded disabled:bg-gray-400 font-semibold`}
              >
                {loading ? 'Creating...' : orderMode === 'bulk' ? `Create ${recipients.length} Orders` : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateOrder
