import { useState } from 'react'
import { supabase } from './supabaseClient'
import { PlusCircle, Trash2, Package, User, Users } from 'lucide-react'

function CreateOrder({ merchant, onClose, onOrderCreated }) {
  const [orderMode, setOrderMode] = useState('single') // 'single' or 'bulk'
  const [pickupNote, setPickupNote] = useState('')

  // Single order mode
  const [singleOrder, setSingleOrder] = useState({
    receiver_name: '',
    receiver_phone: '',
    dropoff_address: '',
    dropoff_note: '',
    item: ''
  })

  // Bulk order mode
  const [recipients, setRecipients] = useState([
    {
      id: 1,
      receiver_name: '',
      receiver_phone: '',
      dropoff_address: '',
      dropoff_note: '',
      item: ''
    }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSingleOrderChange = (e) => {
    setSingleOrder({
      ...singleOrder,
      [e.target.name]: e.target.value
    })
  }

  const handleRecipientChange = (id, field, value) => {
    setRecipients(
      recipients.map((recipient) => (recipient.id === id ? { ...recipient, [field]: value } : recipient))
    )
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
        item: ''
      }
    ])
  }

  const removeRecipient = (id) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((r) => r.id !== id))
    }
  }

  // ✅ Small helpers
  const cleanText = (v) => (v ?? '').toString().trim()
  const cleanPhone = (v) => (v ?? '').toString().trim()
  const makeBatchId = () => {
    // Prefer crypto.randomUUID when available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return `BATCH-${crypto.randomUUID()}`
    return `BATCH-${Date.now()}-${Math.random().toString(16).slice(2)}`
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
      // ✅ Validate first
      const validationError = orderMode === 'single' ? validateSingle() : validateBulk()
      if (validationError) {
        setError(validationError)
        setLoading(false)
        return
      }

      let orders = []

      // ✅ Make sure this is ALWAYS the merchant table row id
      const merchantId = merchant.id

      // ✅ Handle phone field safely (your DB expects customer_phone)
      const customerPhone = merchant.phone || merchant.phone_number || ''

      // ✅ Shared fields
      const base = {
        merchant_id: merchantId,
        customer_name: cleanText(merchant.business_name),
        customer_phone: cleanPhone(customerPhone),
        pickup_address: cleanText(merchant.business_address),
        pickup_note: cleanText(pickupNote) || null,
        status: 'pending',
        price: 15.0
      }

      if (orderMode === 'single') {
        // ✅ Single order MUST have batch_id = null (not undefined)
        orders = [
          {
            ...base,
            receiver_name: cleanText(singleOrder.receiver_name),
            receiver_phone: cleanPhone(singleOrder.receiver_phone),
            dropoff_address: cleanText(singleOrder.dropoff_address),
            dropoff_note: cleanText(singleOrder.dropoff_note) || null,

            // IMPORTANT:
            // If your DB column "item" is text[] then keep as array.
            // If your DB column "item" is text then change to: item: cleanText(singleOrder.item)
            item: [cleanText(singleOrder.item)],

            batch_id: null
          }
        ]
      } else {
        // ✅ Bulk order MUST share same batch_id across all rows
        const batchId = makeBatchId()

        orders = recipients.map((recipient) => ({
          ...base,
          receiver_name: cleanText(recipient.receiver_name),
          receiver_phone: cleanPhone(recipient.receiver_phone),
          dropoff_address: cleanText(recipient.dropoff_address),
          dropoff_note: cleanText(recipient.dropoff_note) || null,

          // If DB is text[] keep array, otherwise change to string
          item: [cleanText(recipient.item)],

          batch_id: batchId
        }))
      }

      // ✅ INSERT with full error reporting
      const { data, error: insertError } = await supabase.from('requests').insert(orders).select()

      if (insertError) {
        console.error('Supabase insertError:', insertError)
        // Show the real message
        throw new Error(insertError.message)
      }

      // ✅ Success message
      if (orderMode === 'bulk') {
        alert(`Bulk order created! ${recipients.length} deliveries linked together.`)
      } else {
        alert('Order created successfully!')
      }

      // ✅ Reset forms (optional but helpful)
      setPickupNote('')
      setSingleOrder({
        receiver_name: '',
        receiver_phone: '',
        dropoff_address: '',
        dropoff_note: '',
        item: ''
      })
      setRecipients([
        {
          id: 1,
          receiver_name: '',
          receiver_phone: '',
          dropoff_address: '',
          dropoff_note: '',
          item: ''
        }
      ])
      setOrderMode('single')

      onOrderCreated?.()
      onClose?.()
    } catch (err) {
      console.error('Error creating order:', err)

      // ✅ Show real error message
      const msg = err?.message || 'Failed to create order. Please try again.'
      setError(msg)

      // Optional: helpful hint for RLS
      if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('permission')) {
        console.warn('RLS/permission issue detected. Check INSERT policy for requests table.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Create Order</h2>
              <p className="text-sm text-gray-500 mt-1">Choose single or bulk delivery</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
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
                  <p className={`font-bold ${orderMode === 'single' ? 'text-blue-600' : 'text-gray-700'}`}>
                    Single Order
                  </p>
                  <p className="text-xs text-gray-500">One recipient</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setOrderMode('bulk')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                orderMode === 'bulk'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Users className={`w-6 h-6 ${orderMode === 'bulk' ? 'text-purple-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className={`font-bold ${orderMode === 'bulk' ? 'text-purple-600' : 'text-gray-700'}`}>
                    Bulk Order
                  </p>
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
                    value={merchant.business_address}
                    className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                    disabled
                  />
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

            {/* SINGLE ORDER MODE */}
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
                </div>
              </div>
            )}

            {/* BULK ORDER MODE */}
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
                  <p className="text-sm text-gray-600 font-semibold">Delivery Fee</p>
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
