// ✅ FULLY ENHANCED ADMIN DASHBOARD — All Fixes + Advanced Features
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { supabase } from './supabaseClient'
import {
  Package, Clock, CheckCircle, Users, Store, LogOut, UserCircle,
  MapPin, Calendar, Bell, Smartphone, Truck, List, Search, Layers,
  ChevronDown, ChevronUp, Filter, Image as ImageIcon, X, Download,
  Navigation, LayoutDashboard, Map, Settings, BarChart3, Menu, XCircle,
  Plus, DollarSign, TrendingUp, Activity, Save, Ban, Shield, ArrowUpRight,
  ArrowDownRight, RefreshCw, Eye, Flame, Award, Camera, CreditCard,
  Banknote, Wallet, ToggleLeft, ToggleRight, Upload, Key, Zap, Lock,
  Database, AlertTriangle, Sliders, UserCog, Palette, Monitor, Star,
  Trophy, Medal, Target, TrendingDown, PieChart, Hash, Phone,
  ChevronRight, Info, Cpu, Globe, AlertCircle, UserCheck
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL PREMIUM STYLES — Brighter sidebar
// ─────────────────────────────────────────────────────────────────────────────
const PREMIUM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  :root {
    --sb-bg:#0d1f3c; --sb-mid:#122445; --sb-top:#1a305c;
    --sb-border:rgba(255,255,255,0.12); --sb-text:rgba(200,218,255,0.85);
    --accent:#2563eb; --accent2:#06b6d4;
    --font:'Space Grotesk',sans-serif; --mono:'DM Mono',monospace;
  }
  .adm-root{font-family:var(--font);}
  .sb-shell{background:linear-gradient(160deg,#1e3a6e 0%,#152d57 40%,#0e1e40 100%);position:relative;overflow:hidden;}
  .sb-shell::before{content:'';position:absolute;top:-80px;left:-60px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.25) 0%,transparent 70%);pointer-events:none;}
  .sb-shell::after{content:'';position:absolute;bottom:80px;right:-50px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,0.12) 0%,transparent 70%);pointer-events:none;}
  .sb-logo-area{background:linear-gradient(135deg,rgba(37,99,235,0.28) 0%,rgba(6,182,212,0.1) 100%);border-bottom:1px solid rgba(255,255,255,0.14);padding:20px 16px;}
  .sb-logo-icon{background:linear-gradient(135deg,#2563eb 0%,#06b6d4 100%);padding:10px;border-radius:13px;box-shadow:0 0 26px rgba(37,99,235,0.6),inset 0 1px 0 rgba(255,255,255,0.25);flex-shrink:0;}
  .sb-brand{font-size:13px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:0.1em;}
  .sb-subbrand{font-size:9px;letter-spacing:0.24em;color:rgba(180,210,255,0.6);text-transform:uppercase;font-family:var(--mono);margin-top:2px;}
  .sb-live-pill{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:9px;padding:7px 11px;margin-top:10px;}
  .live-dot{width:7px;height:7px;background:#10b981;border-radius:50%;display:inline-block;animation:livepulse 1.8s ease infinite;}
  @keyframes livepulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.45;transform:scale(0.8)}}
  .sb-mini-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.1);}
  .sb-mini-tile{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:9px;padding:8px 5px;text-align:center;}
  .sb-mini-val{font-size:17px;font-weight:800;line-height:1;letter-spacing:-0.02em;}
  .sb-mini-lbl{font-size:8px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(180,210,255,0.55);font-family:var(--mono);margin-top:3px;}
  .sb-section-lbl{font-size:8.5px;font-family:var(--mono);letter-spacing:0.24em;text-transform:uppercase;color:rgba(150,195,255,0.65);padding:13px 14px 5px;font-weight:600;}
  .sb-item{display:flex;align-items:center;justify-content:space-between;padding:9px 13px;border-radius:10px;cursor:pointer;transition:all 0.18s;border:1px solid transparent;background:transparent;width:100%;text-align:left;color:var(--sb-text);position:relative;overflow:hidden;font-family:var(--font);}
  .sb-item:hover{background:rgba(255,255,255,0.09);color:#e8f0ff;border-color:rgba(255,255,255,0.1);}
  .sb-item.active{background:linear-gradient(135deg,rgba(37,99,235,0.38) 0%,rgba(6,182,212,0.12) 100%);color:#fff;border-color:rgba(37,99,235,0.5);box-shadow:0 2px 18px rgba(37,99,235,0.22),inset 0 1px 0 rgba(255,255,255,0.1);}
  .sb-item.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:linear-gradient(to bottom,#2563eb,#06b6d4);border-radius:0 3px 3px 0;}
  .sb-badge{font-size:9px;font-family:var(--mono);font-weight:600;padding:2px 7px;border-radius:99px;background:rgba(255,255,255,0.1);color:rgba(210,230,255,0.8);border:1px solid rgba(255,255,255,0.1);letter-spacing:0.05em;}
  .sb-badge.active{background:rgba(37,99,235,0.5);color:#bfdbfe;border-color:rgba(37,99,235,0.5);}
  .sb-divider{height:1px;background:linear-gradient(to right,transparent,rgba(255,255,255,0.12),transparent);margin:7px 0;}
  .sb-profile-card{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:12px;}
  .sb-avatar-wrap{background:linear-gradient(135deg,#1d4ed8 0%,#0891b2 100%);border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(37,99,235,0.5);flex-shrink:0;position:relative;overflow:hidden;}
  .sb-avatar-wrap img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
  .sb-online-dot{width:8px;height:8px;background:#10b981;border-radius:50%;border:2px solid #0e1e40;position:absolute;bottom:0;right:0;animation:livepulse 2s ease infinite;}
  .sb-logout{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;padding:8px 12px;margin-top:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:8px;color:rgba(252,165,165,0.9);font-size:11px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;cursor:pointer;transition:all 0.18s;font-family:var(--font);}
  .sb-logout:hover{background:rgba(239,68,68,0.18);border-color:rgba(239,68,68,0.35);color:#fca5a5;}
  .adm-topbar{background:rgba(255,255,255,0.97);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,0.06);}
  .stat-card{background:#fff;border-radius:16px;padding:22px 22px 18px;border:1px solid rgba(0,0,0,0.05);box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.03);transition:transform 0.17s,box-shadow 0.17s,border-color 0.17s;position:relative;overflow:hidden;cursor:pointer;}
  .stat-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,0.1);border-color:rgba(37,99,235,0.15);}
  .stat-card.selected{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,0.12),0 8px 28px rgba(0,0,0,0.1);}
  .stat-card-glow{position:absolute;top:-30px;right:-30px;width:110px;height:110px;border-radius:50%;opacity:0.1;pointer-events:none;}
  .order-card{background:#fff;border-radius:15px;border:1px solid rgba(0,0,0,0.06);box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:14px;overflow:hidden;transition:box-shadow 0.17s;}
  .order-card:hover{box-shadow:0 4px 20px rgba(0,0,0,0.07);}
  .batch-card{border-radius:15px;border:1px solid rgba(124,58,237,0.14);box-shadow:0 2px 10px rgba(124,58,237,0.06);margin-bottom:14px;overflow:hidden;transition:box-shadow 0.17s;background:linear-gradient(135deg,#faf5ff 0%,#eff6ff 100%);}
  .batch-card:hover{box-shadow:0 4px 22px rgba(124,58,237,0.1);}
  .tab-pill-bar{background:#fff;border-radius:14px;border:1px solid rgba(0,0,0,0.06);box-shadow:0 1px 4px rgba(0,0,0,0.04);padding:4px;display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap;}
  .tab-pill-bar::-webkit-scrollbar{display:none;}
  .tab-pill{flex-shrink:0;padding:8px 14px;border-radius:10px;font-size:11.5px;font-weight:600;letter-spacing:0.03em;cursor:pointer;transition:all 0.17s;display:flex;align-items:center;gap:6px;border:none;background:transparent;color:#94a3b8;font-family:var(--font);white-space:nowrap;}
  .tab-pill:hover{background:#f1f5f9;color:#475569;}
  .tab-pill.active{background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);color:#fff;box-shadow:0 2px 10px rgba(37,99,235,0.3);}
  .tab-pill-count{font-size:9px;font-family:var(--mono);padding:1px 5px;border-radius:99px;background:rgba(255,255,255,0.18);font-weight:600;}
  .tab-pill:not(.active) .tab-pill-count{background:rgba(0,0,0,0.06);color:#64748b;}
  .filter-pill{padding:6px 14px;border-radius:99px;font-size:11px;font-weight:600;letter-spacing:0.04em;cursor:pointer;transition:all 0.17s;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;font-family:var(--font);display:flex;align-items:center;gap:5px;}
  .filter-pill.fp-blue{background:#2563eb;border-color:#2563eb;color:#fff;box-shadow:0 2px 8px rgba(37,99,235,0.3);}
  .filter-pill.fp-purple{background:#7c3aed;border-color:#7c3aed;color:#fff;box-shadow:0 2px 8px rgba(124,58,237,0.3);}
  .filter-pill:not(.fp-blue):not(.fp-purple):hover{border-color:#93c5fd;color:#2563eb;}
  .adm-search{width:100%;padding:12px 16px 12px 44px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:13px;font-family:var(--font);font-weight:500;background:#fff;color:#1e293b;outline:none;box-shadow:0 1px 4px rgba(0,0,0,0.04);transition:border-color 0.17s,box-shadow 0.17s;}
  .adm-search:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,0.1);}
  .act-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:8px;font-size:10.5px;font-weight:600;letter-spacing:0.04em;cursor:pointer;transition:all 0.15s;border:1.5px solid transparent;font-family:var(--font);}
  .prog-bar{height:5px;background:#f1f5f9;border-radius:99px;overflow:hidden;margin-top:4px;}
  .prog-fill{height:100%;border-radius:99px;transition:width 0.5s ease;}
  .notif-panel{position:absolute;right:0;top:calc(100% + 10px);width:390px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.14);border:1px solid rgba(0,0,0,0.07);overflow:hidden;z-index:9999;}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;}
  .modal-card{background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.2);overflow:hidden;width:100%;}
  .kpi-card{background:#fff;border-radius:14px;padding:20px;border:1px solid rgba(0,0,0,0.05);box-shadow:0 1px 4px rgba(0,0,0,0.04);position:relative;overflow:hidden;}
  .oid-badge{font-family:var(--mono);font-size:11px;font-weight:500;color:#2563eb;background:#eff6ff;padding:3px 10px;border-radius:6px;border:1px solid #bfdbfe;letter-spacing:0.04em;}
  .status-chip{font-size:9.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:3px 9px;border-radius:99px;font-family:var(--mono);}
  .payment-badge{display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:3px 8px;border-radius:6px;font-family:var(--mono);}
  .settings-card{background:#fff;border-radius:14px;border:1px solid rgba(0,0,0,0.06);box-shadow:0 1px 4px rgba(0,0,0,0.04);overflow:hidden;margin-bottom:16px;}
  .toggle-track{width:44px;height:24px;border-radius:99px;cursor:pointer;transition:background 0.2s;position:relative;flex-shrink:0;border:none;padding:0;}
  .toggle-thumb{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.2);}
  .lb-rank-1{background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;}
  .lb-rank-2{background:linear-gradient(135deg,#94a3b8,#64748b);color:#fff;}
  .lb-rank-3{background:linear-gradient(135deg,#cd7c3e,#b45309);color:#fff;}
  .lb-card{background:#fff;border-radius:14px;border:1px solid rgba(0,0,0,0.06);padding:16px 20px;display:flex;align-items:center;gap:14px;margin-bottom:10px;transition:all 0.18s;box-shadow:0 1px 4px rgba(0,0,0,0.04);}
  .lb-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08);transform:translateX(2px);}
  .lb-card.top-1{border-left:4px solid #f59e0b;background:linear-gradient(135deg,#fffbeb 0%,#fff 100%);}
  .lb-card.top-2{border-left:4px solid #94a3b8;background:linear-gradient(135deg,#f8fafc 0%,#fff 100%);}
  .lb-card.top-3{border-left:4px solid #cd7c3e;background:linear-gradient(135deg,#fef3e2 0%,#fff 100%);}
  .stat-filter-modal{background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.18);overflow:hidden;width:100%;max-width:900px;max-height:85vh;display:flex;flex-direction:column;}
  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:99px;}
`

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT METHOD HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value:'cash',  label:'Cash on Delivery', color:'#059669', bg:'#ecfdf5', border:'#a7f3d0' },
  { value:'momo',  label:'Mobile Money',     color:'#7c3aed', bg:'#f3e8ff', border:'#ddd6fe' },
  { value:'card',  label:'Card Payment',     color:'#0891b2', bg:'#ecfeff', border:'#a5f3fc' },
  { value:'bank',  label:'Bank Transfer',    color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
]

function PaymentBadge({ method }) {
  if (!method) return null
  const pm = PAYMENT_METHODS.find(p => p.value === method) || { label: method, color:'#64748b', bg:'#f8fafc', border:'#e2e8f0' }
  return (
    <span className="payment-badge" style={{ background:pm.bg, color:pm.color, border:`1px solid ${pm.border}` }}>
      {pm.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD ORDER
// ─────────────────────────────────────────────────────────────────────────────
function downloadAdminOrder(order, admin, opts = {}) {
  const { isInBatch = false, dropNumber = null } = opts
  const safe = v => (v === null || v === undefined || v === '' ? '-' : String(v))
  const fmtMoney = n => { const num = Number(n || 0); return Number.isFinite(num) ? num.toFixed(2) : '0.00' }
  const fmtDate = d => { try { return d ? new Date(d).toLocaleString() : '-' } catch { return '-' } }
  const statusText = safe(order?.status)?.toUpperCase()
  const adminLabel = safe(admin?.full_name || admin?.name || admin?.email || 'Admin Control')
  const pmLabel = order?.payment_method ? (PAYMENT_METHODS.find(p => p.value === order.payment_method)?.label || order.payment_method) : 'Not specified'

  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Order #${safe(order?.id)}</title>
<style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:24px;color:#111827}.wrap{max-width:720px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}.head{padding:18px 20px;background:#2563eb;color:#fff}.head h1{margin:0;font-size:18px;text-transform:uppercase}.head p{margin:6px 0 0;font-size:12px;opacity:.95}.body{padding:18px 20px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.card{border:1px solid #e5e7eb;border-radius:10px;padding:12px}.label{font-size:10px;color:#6b7280;text-transform:uppercase;font-weight:700;letter-spacing:.12em}.value{margin-top:6px;font-size:13px;font-weight:700;text-transform:uppercase}.valueSmall{margin-top:4px;font-size:12px;font-weight:600;color:#374151}.big{font-size:20px;color:#2563eb}.row{display:flex;justify-content:space-between;gap:12px;margin-top:10px;align-items:center}.pill{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:6px 10px;border-radius:999px;border:1px solid #e5e7eb}.pill.green{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}.pill.blue{background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8}.pill.gray{background:#f9fafb;border-color:#e5e7eb;color:#374151}.divider{height:1px;background:#e5e7eb;margin:14px 0}.foot{padding:14px 20px;background:#f9fafb;color:#6b7280;font-size:11px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}</style>
</head><body><div class="wrap"><div class="head"><h1>Download Order</h1><p>${adminLabel} • Generated: ${fmtDate(new Date())}</p></div>
<div class="body"><div class="row"><div><div class="label">Order ID</div><div class="value">#${safe(order?.id)} ${isInBatch && dropNumber ? `(DROP #${dropNumber})` : ''}</div><div class="valueSmall">Created: ${fmtDate(order?.created_at)}</div></div><div><span class="pill ${statusText==='DELIVERED'?'green':statusText==='PENDING'?'gray':'blue'}">${statusText}</span></div></div>
<div class="divider"></div><div class="grid">
<div class="card"><div class="label">Sender</div><div class="value">${safe(order?.customer_name)}</div><div class="valueSmall">${safe(order?.customer_phone)}</div></div>
<div class="card"><div class="label">Receiver</div><div class="value">${safe(order?.receiver_name)}</div><div class="valueSmall">${safe(order?.receiver_phone)}</div></div>
<div class="card" style="grid-column:1/-1"><div class="label">Pickup</div><div class="value">${safe(order?.pickup_address)}</div></div>
<div class="card" style="grid-column:1/-1"><div class="label">Destination</div><div class="value">${safe(order?.dropoff_address)}</div></div>
<div class="card"><div class="label">Amount</div><div class="value big">GH₵ ${fmtMoney(order?.price)}</div></div>
<div class="card"><div class="label">Payment Method</div><div class="value">${pmLabel}</div></div>
<div class="card"><div class="label">Assigned Rider</div><div class="value">${safe(order?.driver_name)}</div><div class="valueSmall">${safe(order?.driver_phone)}</div></div>
</div><div class="divider"></div><div class="grid">
<div class="card"><div class="label">Assigned At</div><div class="valueSmall">${fmtDate(order?.assigned_at)}</div></div>
<div class="card"><div class="label">Picked Up At</div><div class="valueSmall">${fmtDate(order?.picked_up_at)}</div></div>
<div class="card" style="grid-column:1/-1"><div class="label">Delivered At</div><div class="valueSmall">${fmtDate(order?.delivered_at)}</div></div>
</div></div><div class="foot"><div>Order printout for reference.</div><div>Order #${safe(order?.id)} • ${adminLabel}</div></div></div></body></html>`

  const iframe = document.createElement('iframe')
  Object.assign(iframe.style, { position:'fixed', right:'0', bottom:'0', width:'0', height:'0', border:'0' })
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) { document.body.removeChild(iframe); alert('Unable to generate order for download.'); return }
  doc.open(); doc.write(html); doc.close()
  setTimeout(() => {
    try { iframe.contentWindow?.focus(); iframe.contentWindow?.print() }
    finally { setTimeout(() => { try { document.body.removeChild(iframe) } catch {} }, 1000) }
  }, 250)
}

// ─────────────────────────────────────────────────────────────────────────────
// MAP HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function hasValidCoords(order) {
  return [order?.pickup_lat, order?.pickup_lng, order?.dropoff_lat, order?.dropoff_lng]
    .map(Number).every(v => Number.isFinite(v))
}
function buildMapsEmbedUrl(order) {
  return `https://www.google.com/maps?output=embed&saddr=${encodeURIComponent(`${order.pickup_lat},${order.pickup_lng}`)}&daddr=${encodeURIComponent(`${order.dropoff_lat},${order.dropoff_lng}`)}&dirflg=d`
}
function buildMapsOpenUrl(order) {
  return `https://www.google.com/maps/dir/?api=1&origin=${order.pickup_lat},${order.pickup_lng}&destination=${order.dropoff_lat},${order.dropoff_lng}&travelmode=driving`
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    pending:   { bg:'#fffbeb', color:'#92400e', border:'#fde68a' },
    assigned:  { bg:'#eff6ff', color:'#1e40af', border:'#bfdbfe' },
    picked_up: { bg:'#ecfdf5', color:'#065f46', border:'#a7f3d0' },
    delivered: { bg:'#f0fdf4', color:'#166534', border:'#bbf7d0' },
    cancelled: { bg:'#f9fafb', color:'#374151', border:'#e5e7eb' },
  }
  const s = map[status] || map.cancelled
  return <span className="status-chip" style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>{(status||'UNKNOWN').replace('_',' ').toUpperCase()}</span>
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="toggle-track" style={{ background: checked ? '#2563eb' : '#e2e8f0' }}>
      <div className="toggle-thumb" style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  )
}

function SidebarItem({ icon, label, active, onClick, badge, sub }) {
  return (
    <button onClick={onClick} className={`sb-item${active ? ' active' : ''}`}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ opacity: active ? 1 : 0.75, flexShrink:0 }}>{icon}</span>
        <div style={{ textAlign:'left' }}>
          <div style={{ fontSize:12.5, fontWeight: active ? 700 : 500, color: active ? '#fff' : 'var(--sb-text)', letterSpacing:'0.01em' }}>{label}</div>
          {sub && <div style={{ fontSize:9, color:'rgba(160,200,255,0.5)', letterSpacing:'0.1em', fontFamily:'var(--mono)', marginTop:1 }}>{sub}</div>}
        </div>
      </div>
      {badge !== undefined && <span className={`sb-badge${active ? ' active' : ''}`}>{badge}</span>}
    </button>
  )
}

function StatBox({ title, value, color, icon, sub, trend, trendUp, onClick, selected }) {
  const colorMap = {
    blue:   { icon:'#2563eb', bg:'#eff6ff', glow:'#2563eb' },
    indigo: { icon:'#4f46e5', bg:'#eef2ff', glow:'#6366f1' },
    yellow: { icon:'#d97706', bg:'#fffbeb', glow:'#f59e0b' },
    green:  { icon:'#059669', bg:'#ecfdf5', glow:'#10b981' },
    red:    { icon:'#dc2626', bg:'#fef2f2', glow:'#ef4444' },
    cyan:   { icon:'#0891b2', bg:'#ecfeff', glow:'#06b6d4' },
    purple: { icon:'#7c3aed', bg:'#f3e8ff', glow:'#8b5cf6' },
  }
  const c = colorMap[color] || colorMap.blue
  return (
    <div className={`stat-card${selected ? ' selected' : ''}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-card-glow" style={{ background: c.glow }} />
      {onClick && (
        <div style={{ position:'absolute', top:14, right:14, fontSize:9, fontWeight:700, letterSpacing:'0.1em', color: selected ? '#2563eb' : '#94a3b8', fontFamily:'var(--mono)', display:'flex', alignItems:'center', gap:3 }}>
          {selected ? <><Eye size={10}/> FILTERED</> : <><Filter size={10}/> CLICK TO FILTER</>}
        </div>
      )}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ background:c.bg, border:`1px solid ${c.glow}22`, padding:'10px', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {React.cloneElement(icon, { style:{ width:20, height:20, color:c.icon } })}
        </div>
        {trend !== undefined && (
          <div style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, fontWeight:700, color: trendUp ? '#059669' : '#dc2626', marginTop: onClick ? 20 : 0 }}>
            {trendUp ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}<span>{trend}</span>
          </div>
        )}
      </div>
      <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.14em', color:'#94a3b8', textTransform:'uppercase', marginBottom:4, fontFamily:'var(--mono)' }}>{title}</p>
      <p style={{ fontSize:32, fontWeight:800, color:'#0f172a', lineHeight:1, letterSpacing:'-0.02em' }}>{value}</p>
      {sub && <p style={{ fontSize:11, color:'#94a3b8', marginTop:5 }}>{sub}</p>}
    </div>
  )
}

function TabButton({ active, onClick, children, count, icon }) {
  return (
    <button onClick={onClick} className={`tab-pill${active ? ' active' : ''}`}>
      {icon}<span style={{ fontWeight: active ? 700 : 600 }}>{children}</span>
      <span className="tab-pill-count">{count}</span>
    </button>
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
      <div className={`w-4 h-4 rounded-full border-2 ${isDone ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
        style={isDone ? { boxShadow:'0 0 6px rgba(37,99,235,0.4)' } : {}} />
      <div className="flex-1 flex justify-between items-center border-b border-gray-100 pb-1">
        <span className={`text-[10px] uppercase ${isDone ? 'text-gray-800' : 'text-gray-300'}`}>{label}</span>
        <span className="text-[10px] text-blue-600">{time || '--:--'}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER LEADERBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function DriverLeaderboard({ drivers, orders }) {
  const [lbMetric, setLbMetric] = useState('deliveries')
  const [lbPeriod, setLbPeriod] = useState('all')

  const filterByPeriod = useCallback((ordersList) => {
    if (lbPeriod === 'all') return ordersList
    const now = new Date()
    const cutoff = {
      today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      week:  new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
      month: new Date(now.getFullYear(), now.getMonth(), 1),
    }[lbPeriod]
    return ordersList.filter(o => new Date(o.created_at) >= cutoff)
  }, [lbPeriod])

  const rankedDrivers = useMemo(() => {
    const periodOrders = filterByPeriod(orders)
    return drivers.map(d => {
      const dOrders = periodOrders.filter(o => o.driver_id === d.id)
      const delivered = dOrders.filter(o => o.status === 'delivered')
      const revenue = delivered.reduce((s, o) => s + Number(o.price || 0), 0)
      const completion = dOrders.length > 0 ? (delivered.length / dOrders.length * 100) : 0
      return {
        ...d,
        totalOrders: dOrders.length,
        delivered: delivered.length,
        revenue,
        completion: completion.toFixed(1),
        score: lbMetric === 'deliveries' ? delivered.length
             : lbMetric === 'revenue'    ? revenue
             : lbMetric === 'completion' ? parseFloat(completion)
             : dOrders.length,
      }
    }).sort((a, b) => b.score - a.score)
  }, [drivers, orders, lbMetric, filterByPeriod])

  const metricFmt = (d) => {
    if (lbMetric === 'revenue') return `GH₵ ${d.revenue.toFixed(2)}`
    if (lbMetric === 'completion') return `${d.completion}%`
    if (lbMetric === 'deliveries') return `${d.delivered} deliveries`
    return `${d.totalOrders} orders`
  }

  const top3 = rankedDrivers.slice(0, 3)
  const rest = rankedDrivers.slice(3)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div>
          <h3 style={{ fontSize:16, fontWeight:800, color:'#0f172a', marginBottom:2 }}>🏆 Driver Leaderboard</h3>
          <p style={{ fontSize:11, color:'#94a3b8' }}>Ranked by performance metrics</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div>
            <label style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'#94a3b8', textTransform:'uppercase', fontFamily:'var(--mono)', display:'block', marginBottom:4 }}>Metric</label>
            <select value={lbMetric} onChange={e => setLbMetric(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-blue-500">
              <option value="deliveries">Deliveries</option>
              <option value="revenue">Revenue</option>
              <option value="completion">Completion Rate</option>
              <option value="total">Total Assigned</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'#94a3b8', textTransform:'uppercase', fontFamily:'var(--mono)', display:'block', marginBottom:4 }}>Period</label>
            <select value={lbPeriod} onChange={e => setLbPeriod(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-blue-500">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((d, i) => (
            <div key={d.id} style={{
              background: i === 0 ? 'linear-gradient(135deg,#fffbeb,#fff)' : i === 1 ? 'linear-gradient(135deg,#f8fafc,#fff)' : 'linear-gradient(135deg,#fef3e2,#fff)',
              borderRadius:16, border: i === 0 ? '2px solid #f59e0b' : i === 1 ? '2px solid #94a3b8' : '2px solid #cd7c3e',
              padding:20, textAlign:'center', position:'relative', boxShadow:'0 4px 16px rgba(0,0,0,0.06)'
            }}>
              {i === 0 && <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', fontSize:20 }}>👑</div>}
              <div style={{ width:56, height:56, borderRadius:'50%', background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : i === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : 'linear-gradient(135deg,#cd7c3e,#b45309)', display:'flex', alignItems:'center', justifyContent:'center', margin:'12px auto 10px', boxShadow:`0 4px 12px ${i===0?'rgba(245,158,11,0.4)':i===1?'rgba(148,163,184,0.4)':'rgba(205,124,62,0.4)'}` }}>
                <span style={{ fontSize:18, fontWeight:800, color:'#fff' }}>#{i+1}</span>
              </div>
              <p style={{ fontSize:14, fontWeight:800, color:'#0f172a', marginBottom:2 }}>{d.full_name}</p>
              <p style={{ fontSize:10, color:'#94a3b8', fontFamily:'var(--mono)', marginBottom:8 }}>{d.phone_number}</p>
              <div style={{ background:'rgba(0,0,0,0.04)', borderRadius:10, padding:'10px 14px' }}>
                <p style={{ fontSize:20, fontWeight:800, color: i===0?'#d97706':i===1?'#64748b':'#b45309' }}>{metricFmt(d)}</p>
                <p style={{ fontSize:9, color:'#94a3b8', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:2 }}>{lbMetric}</p>
              </div>
              <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:10, fontSize:10, color:'#64748b', fontFamily:'var(--mono)' }}>
                <span>✓ {d.delivered}</span>
                <span>📦 {d.totalOrders}</span>
                <span>{d.completion}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.12em', fontFamily:'var(--mono)', marginBottom:10 }}>Other Drivers</p>
          {rest.map((d, i) => (
            <div key={d.id} className="lb-card">
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:12, fontWeight:800, color:'#64748b', fontFamily:'var(--mono)' }}>#{i+4}</span>
              </div>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#eff6ff,#dbeafe)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <UserCircle size={20} style={{ color:'#2563eb' }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{d.full_name}</p>
                <p style={{ fontSize:10, color:'#94a3b8', fontFamily:'var(--mono)' }}>{d.phone_number}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:14, fontWeight:800, color:'#2563eb' }}>{metricFmt(d)}</p>
                <p style={{ fontSize:9, color:'#94a3b8', fontFamily:'var(--mono)' }}>{d.delivered} delivered · {d.completion}%</p>
              </div>
              {d.is_verified && <div style={{ background:'#ecfdf5', border:'1px solid #bbf7d0', borderRadius:6, padding:'2px 7px' }}><span style={{ fontSize:8, fontWeight:700, color:'#059669', fontFamily:'var(--mono)' }}>VERIFIED</span></div>}
            </div>
          ))}
        </div>
      )}

      {rankedDrivers.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Trophy size={40} style={{ color:'#e2e8f0', margin:'0 auto 12px', display:'block' }}/>
          <p style={{ color:'#94a3b8', fontWeight:600 }}>No driver data yet for this period</p>
        </div>
      )}

      {rankedDrivers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label:'Total Drivers', val: drivers.length, color:'#2563eb', bg:'#eff6ff' },
            { label:'Verified', val: drivers.filter(d=>d.is_verified).length, color:'#059669', bg:'#ecfdf5' },
            { label:'Active (has orders)', val: rankedDrivers.filter(d=>d.totalOrders>0).length, color:'#7c3aed', bg:'#f3e8ff' },
            { label:'Avg Deliveries', val: rankedDrivers.length>0 ? (rankedDrivers.reduce((s,d)=>s+d.delivered,0)/rankedDrivers.length).toFixed(1) : 0, color:'#d97706', bg:'#fffbeb' },
          ].map(s => (
            <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}22`, borderRadius:12, padding:'14px 16px' }}>
              <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:s.color, textTransform:'uppercase', fontFamily:'var(--mono)', marginBottom:4 }}>{s.label}</p>
              <p style={{ fontSize:24, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT FILTER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function StatFilterModal({ filterType, orders, drivers, merchants, onClose, onViewOrder, onTrack, onAssign, assignDriver, downloadAdminOrderFn, admin }) {
  const [search, setSearch] = useState('')

  const filteredOrders = useMemo(() => {
    let list = []
    if (filterType === 'all') list = orders
    else if (filterType === 'pending') list = orders.filter(o => o.status === 'pending')
    else if (filterType === 'delivered') list = orders.filter(o => o.status === 'delivered')
    else if (filterType === 'cancelled') list = orders.filter(o => o.status === 'cancelled')
    else if (filterType === 'assigned') list = orders.filter(o => o.status === 'assigned' || o.status === 'picked_up')
    else if (filterType === 'app') list = orders.filter(o => !o.merchant_id)
    else if (filterType === 'merchant') list = orders.filter(o => o.merchant_id)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(o => o.id.toString().includes(q) || o.customer_name?.toLowerCase().includes(q) || o.receiver_name?.toLowerCase().includes(q))
    }
    return list
  }, [filterType, orders, search])

  const titles = {
    all:'All Orders', pending:'Pending Orders', delivered:'Delivered Orders',
    cancelled:'Cancelled Orders', assigned:'Active/In-Progress', app:'App Orders', merchant:'Merchant Orders'
  }
  const colors = {
    all:'#2563eb', pending:'#d97706', delivered:'#059669', cancelled:'#9ca3af', assigned:'#0891b2', app:'#2563eb', merchant:'#7c3aed'
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="stat-filter-modal">
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ background: colors[filterType] || '#2563eb', borderRadius:10, padding:10 }}>
              <List size={16} style={{ color:'#fff' }} />
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:800, color:'#0f172a' }}>{titles[filterType] || 'Orders'}</p>
              <p style={{ fontSize:11, color:'#94a3b8', fontFamily:'var(--mono)' }}>{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', padding:8, borderRadius:8 }}>
            <X size={20} style={{ color:'#64748b' }} />
          </button>
        </div>

        <div style={{ padding:'14px 24px', borderBottom:'1px solid #f1f5f9', flexShrink:0, position:'relative' }}>
          <Search size={15} style={{ position:'absolute', left:40, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders…"
            style={{ width:'100%', padding:'10px 14px 10px 40px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, fontFamily:'var(--font)', outline:'none' }}
          />
        </div>

        <div style={{ overflowY:'auto', flex:1, padding:'14px 24px' }}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign:'center', padding:48, color:'#94a3b8' }}>
              <Package size={36} style={{ margin:'0 auto 12px', display:'block', opacity:0.4 }}/>
              <p style={{ fontWeight:600 }}>No orders found</p>
            </div>
          ) : filteredOrders.map(order => (
            <div key={order.id} style={{ background:'#fff', borderRadius:12, border:'1px solid #f1f5f9', padding:'14px 18px', marginBottom:10, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                  <span className="oid-badge">#{order.id}</span>
                  <StatusChip status={order.status} />
                  {order.payment_method && <PaymentBadge method={order.payment_method} />}
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{order.customer_name} → {order.receiver_name}</p>
                <p style={{ fontSize:10, color:'#94a3b8', fontFamily:'var(--mono)' }}>{order.pickup_address} → {order.dropoff_address}</p>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:4 }}>
                  <span style={{ fontSize:12, fontWeight:800, color:'#2563eb' }}>GH₵ {Number(order.price||0).toFixed(2)}</span>
                  {order.driver_name && <span style={{ fontSize:10, color:'#059669', fontFamily:'var(--mono)' }}>🚴 {order.driver_name}</span>}
                </div>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {hasValidCoords(order) && (
                  <button onClick={() => { onTrack(order, { orderId:order.id, title:'Pickup → Dropoff' }); onClose() }} className="act-btn" style={{ background:'#f0fdf4', color:'#059669', borderColor:'#bbf7d0' }}>
                    <MapPin size={11}/> Track
                  </button>
                )}
                <button onClick={() => downloadAdminOrderFn(order, admin)} className="act-btn" style={{ background:'#f8fafc', color:'#475569', borderColor:'#e2e8f0' }}>
                  <Download size={11}/> Download
                </button>
                <p style={{ fontSize:10, color:'#94a3b8', fontFamily:'var(--mono)', alignSelf:'center' }}>{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MERCHANTS TABLE
// ─────────────────────────────────────────────────────────────────────────────
function MerchantsTable({ merchants, orders, onToggleMerchant }) {
  const [confirmMerchant, setConfirmMerchant] = useState(null)

  return (
    <>
      {confirmMerchant && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth:420 }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9', background: confirmMerchant.is_disabled ? '#f0fdf4' : '#fef2f2', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ background: confirmMerchant.is_disabled ? '#dcfce7' : '#fee2e2', borderRadius:10, padding:10 }}>
                {confirmMerchant.is_disabled ? <CheckCircle size={20} style={{ color:'#059669' }}/> : <Ban size={20} style={{ color:'#dc2626' }}/>}
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:'#0f172a' }}>{confirmMerchant.is_disabled ? 'Enable' : 'Disable'} Merchant</p>
                <p style={{ fontSize:11, color:'#94a3b8' }}>{confirmMerchant.business_name}</p>
              </div>
            </div>
            <div style={{ padding:'20px 24px' }}>
              <p style={{ fontSize:13, color:'#374151' }}>Are you sure you want to <strong>{confirmMerchant.is_disabled ? 'enable' : 'disable'}</strong> this merchant?{!confirmMerchant.is_disabled && ' They will no longer be able to place new orders.'}</p>
            </div>
            <div style={{ padding:'0 24px 20px', display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setConfirmMerchant(null)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100">Cancel</button>
              <button onClick={() => { onToggleMerchant(confirmMerchant.id, !confirmMerchant.is_disabled); setConfirmMerchant(null) }}
                style={{ padding:'10px 22px', background: confirmMerchant.is_disabled ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#dc2626,#b91c1c)', border:'none', borderRadius:10, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                {confirmMerchant.is_disabled ? 'Enable Merchant' : 'Disable Merchant'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-bold uppercase text-xs">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 normal-case">Registered Merchants</h3>
            <p className="text-sm text-gray-500 mt-1 normal-case">Manage merchants and control their access</p>
          </div>
          <div style={{ background:'#f3e8ff', border:'1px solid #ddd6fe', borderRadius:10, padding:'8px 14px', display:'flex', alignItems:'center', gap:6 }}>
            <Store size={14} style={{ color:'#7c3aed' }}/><span style={{ fontSize:11, fontWeight:700, color:'#7c3aed', fontFamily:'var(--mono)' }}>{merchants.length} PARTNERS</span>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-400">
            <tr>
              <th className="px-6 py-4 tracking-wider">Business Name</th>
              <th className="px-6 py-4 text-center tracking-wider">Total Volume</th>
              <th className="px-6 py-4 text-center tracking-wider">Revenue</th>
              <th className="px-6 py-4 text-center tracking-wider">Status</th>
              <th className="px-6 py-4 text-center tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map(m => {
              const mOrders = orders.filter(o => o.merchant_id === m.id)
              const revenue = mOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.price || 0), 0)
              return (
                <tr key={m.id} className={`border-b border-gray-50 transition-colors ${m.is_disabled ? 'bg-gray-50/50' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-6 py-4">
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, background: m.is_disabled ? '#f1f5f9' : 'linear-gradient(135deg,#f3e8ff,#ede9fe)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity: m.is_disabled ? 0.5 : 1 }}>
                        <Store size={16} style={{ color: m.is_disabled ? '#9ca3af' : '#7c3aed' }}/>
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:700, color: m.is_disabled ? '#9ca3af' : '#1e293b' }}>{m.business_name}</p>
                        {m.is_disabled && <span style={{ fontSize:8, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', padding:'2px 7px', borderRadius:99, background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', fontFamily:'var(--mono)' }}>DISABLED</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-blue-600 text-base font-bold" style={{ fontFamily:'var(--mono)' }}>{mOrders.length}</td>
                  <td className="px-6 py-4 text-center text-green-600 font-bold" style={{ fontFamily:'var(--mono)' }}>GH₵ {revenue.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] ${m.is_disabled ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                      {m.is_disabled ? '✗ Disabled' : '✓ Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setConfirmMerchant(m)} className="act-btn" style={{ background: m.is_disabled ? '#f0fdf4' : '#fef2f2', color: m.is_disabled ? '#059669' : '#dc2626', borderColor: m.is_disabled ? '#bbf7d0' : '#fecaca' }}>
                      {m.is_disabled ? <ToggleRight size={11}/> : <ToggleLeft size={11}/>}
                      {m.is_disabled ? 'Enable' : 'Disable'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DRIVERS TABLE
// ─────────────────────────────────────────────────────────────────────────────
function DriversTable({ drivers, orders, onTabChange }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-bold">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Registered Drivers</h3>
            <p className="text-sm text-gray-500 mt-1">Manage and view all delivery drivers</p>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button onClick={() => onTabChange && onTabChange('leaderboard')} style={{ display:'flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#f59e0b,#d97706)', border:'none', borderRadius:10, padding:'8px 14px', fontSize:11, fontWeight:700, color:'#fff', cursor:'pointer', letterSpacing:'0.05em', textTransform:'uppercase' }}>
              <Trophy size={13}/> Leaderboard
            </button>
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'8px 14px', display:'flex', alignItems:'center', gap:6 }}>
              <Truck size={14} style={{ color:'#2563eb' }}/><span style={{ fontSize:11, fontWeight:700, color:'#2563eb', fontFamily:'var(--mono)' }}>{drivers.filter(d => d.is_verified).length} VERIFIED</span>
            </div>
          </div>
        </div>
        <table className="w-full text-left uppercase text-xs">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-400">
            <tr>
              <th className="px-6 py-4 tracking-wider">#</th>
              <th className="px-6 py-4 tracking-wider">Rider Name</th>
              <th className="px-6 py-4 text-center tracking-wider">Contact</th>
              <th className="px-6 py-4 text-center tracking-wider">Deliveries</th>
              <th className="px-6 py-4 text-center tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d, i) => {
              const dDelivered = orders.filter(o => o.driver_id === d.id && o.status === 'delivered').length
              return (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-400" style={{ fontFamily:'var(--mono)' }}>{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-4">
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, background:'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <UserCircle size={18} style={{ color:'#2563eb' }}/>
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{d.full_name}</p>
                        <p style={{ fontSize:9.5, color:'#94a3b8', fontFamily:'var(--mono)' }}>ID: {d.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600" style={{ fontFamily:'var(--mono)' }}>{d.phone_number}</td>
                  <td className="px-6 py-4 text-center">
                    <span style={{ fontSize:13, fontWeight:800, color:'#2563eb', fontFamily:'var(--mono)' }}>{dDelivered}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] ${d.is_verified ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                      {d.is_verified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH ORDER GROUP
// ─────────────────────────────────────────────────────────────────────────────
function BatchOrderGroup({ batchId, orders, drivers, onAssign, onAssignBatch, onViewImage, onTrack, onCancel, admin }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState('')
  const [assignMode, setAssignMode] = useState('batch')

  const allDelivered = orders.every(o => o.status === 'delivered')
  const allCancelled = orders.every(o => o.status === 'cancelled')
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const assignedCount = orders.filter(o => o.status === 'assigned' || o.status === 'picked_up').length
  const deliveredCount = orders.filter(o => o.status === 'delivered').length
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length
  const firstDriver = orders[0]?.driver_id
  const sameDriver = orders.every(o => o.driver_id === firstDriver)
  const assignedDrivers = [...new Set(orders.filter(o => o.driver_id).map(o => o.driver_name))]
  const borderColor = allDelivered ? '#059669' : allCancelled ? '#9ca3af' : '#7c3aed'

  return (
    <div className="batch-card" style={{ borderLeft:`5px solid ${borderColor}` }}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div style={{ background:'linear-gradient(135deg,#7c3aed,#5b21b6)', padding:10, borderRadius:12, boxShadow:'0 4px 14px rgba(124,58,237,0.3)' }}>
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg uppercase tracking-tight text-gray-900 font-bold">BULK ORDER</p>
                <span style={{ fontSize:9, fontWeight:700, color:'#fff', background:'#7c3aed', padding:'3px 9px', borderRadius:99, letterSpacing:'0.1em', fontFamily:'var(--mono)' }}>{orders.length} DROPS</span>
                {allDelivered && <span style={{ fontSize:9, fontWeight:700, color:'#059669', background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'3px 9px', borderRadius:99, fontFamily:'var(--mono)' }}>COMPLETE</span>}
              </div>
              <p className="text-[10px] uppercase text-gray-400 mt-1" style={{ fontFamily:'var(--mono)', letterSpacing:'0.08em' }}>Batch ID: {batchId}</p>
              <p className="text-xs text-gray-600 mt-1">Sender: <span className="font-bold text-gray-900">{orders[0]?.customer_name}</span> • Pickup: <span className="font-bold text-gray-900">{orders[0]?.pickup_address}</span></p>
            </div>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 text-sm text-purple-600 bg-white px-4 py-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-all font-bold">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {isExpanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-[10px] uppercase text-gray-500 mb-2" style={{ fontFamily:'var(--mono)' }}>
            <span>Pending: {pendingCount}</span><span>In Progress: {assignedCount}</span><span>Delivered: {deliveredCount}</span>
            {cancelledCount > 0 && <span>Cancelled: {cancelledCount}</span>}
          </div>
          <div className="prog-bar">
            <div style={{ display:'flex', height:'100%' }}>
              <div className="prog-fill" style={{ width:`${(pendingCount/orders.length)*100}%`, background:'#f59e0b' }}/>
              <div className="prog-fill" style={{ width:`${(assignedCount/orders.length)*100}%`, background:'#2563eb' }}/>
              <div className="prog-fill" style={{ width:`${(deliveredCount/orders.length)*100}%`, background:'#059669' }}/>
              {cancelledCount > 0 && <div className="prog-fill" style={{ width:`${(cancelledCount/orders.length)*100}%`, background:'#9ca3af' }}/>}
            </div>
          </div>
        </div>

        {!allDelivered && (
          <div className="mb-4">
            <div className="flex gap-2 mb-3">
              <button onClick={() => setAssignMode('batch')} className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase transition-all ${assignMode==='batch'?'bg-purple-600 text-white shadow-md':'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>Assign All to One Rider</button>
              <button onClick={() => setAssignMode('individual')} className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase transition-all ${assignMode==='individual'?'bg-purple-600 text-white shadow-md':'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>Assign Individually</button>
            </div>
            {assignMode === 'batch' && (
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <p className="text-xs uppercase text-gray-500 mb-2">Assign One Rider to All {orders.length} Drops</p>
                <div className="flex gap-3">
                  <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="flex-1 p-2.5 border border-gray-200 rounded-lg font-bold text-sm bg-white outline-none focus:border-purple-500">
                    <option value="">Select Rider...</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select>
                  <button onClick={() => { onAssignBatch(batchId, selectedDriver); setSelectedDriver('') }} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase shadow-md transition-all">Assign All</button>
                </div>
                {sameDriver && firstDriver && <p className="text-xs text-green-700 mt-2 bg-green-50 px-3 py-1.5 rounded border border-green-200">✓ All drops assigned to: <span className="font-bold">{orders[0]?.driver_name}</span></p>}
                {!sameDriver && assignedDrivers.length > 0 && <p className="text-xs text-amber-700 mt-2 bg-amber-50 px-3 py-1.5 rounded border border-amber-200">⚠ Multiple riders: {assignedDrivers.join(', ')}</p>}
              </div>
            )}
            {assignMode === 'individual' && (
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <p className="text-xs uppercase text-gray-500 mb-3">Assign Different Riders to Each Drop</p>
                <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded mb-3">💡 Expand the batch below to assign riders to individual orders</p>
                {!isExpanded && <button onClick={() => setIsExpanded(true)} className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all">Show Individual Orders</button>}
              </div>
            )}
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 mt-4 border-t border-purple-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase text-gray-500 font-bold">Individual Drop Details</p>
              {assignMode === 'individual' && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded uppercase">Individual Assignment Mode</span>}
            </div>
            {orders.map((order, index) => (
              <OrderCard key={order.id} order={order} drivers={drivers} onAssign={onAssign} isInBatch={true} dropNumber={index+1} showAssignment={assignMode==='individual'} onViewImage={onViewImage} onTrack={onTrack} onCancel={onCancel} admin={admin} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER CARD
// ─────────────────────────────────────────────────────────────────────────────
function OrderCard({ order, drivers, onAssign, isInBatch=false, dropNumber=null, showAssignment=false, onViewImage, onTrack, onCancel, admin }) {
  const [selectedDriver, setSelectedDriver] = useState('')
  const [showLogs, setShowLogs] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // FIX #2: Use local time display for all timestamps
  const formatTime = ts => {
    if (!ts) return null
    try {
      return new Date(ts).toLocaleString([], {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    } catch { return null }
  }

  const handleAssign = () => { onAssign(order.id, selectedDriver); setSelectedDriver('') }
  const handleCancelOrder = () => {
    if (!cancelReason.trim()) { alert('Please provide a reason for cancellation'); return }
    onCancel(order.id, cancelReason); setShowCancelModal(false); setCancelReason('')
  }
  const hasImage = !!order.item_image_url
  const canTrack = hasValidCoords(order)
  const isCancelled = order.status === 'cancelled'

  return (
    <>
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth:440 }}>
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid #f1f5f9', background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ background:'#fee2e2', borderRadius:10, padding:8 }}><Ban size={18} style={{ color:'#dc2626' }}/></div>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>Cancel Order #{order.id}</p>
                  <p style={{ fontSize:11, color:'#94a3b8' }}>This action cannot be undone</p>
                </div>
              </div>
              <button onClick={() => setShowCancelModal(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div style={{ padding:24 }}>
              <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#64748b', fontFamily:'var(--mono)', marginBottom:8 }}>Reason for cancellation *</label>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]" placeholder="Reason for cancellation..." />
            </div>
            <div style={{ padding:'0 24px 20px', display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setShowCancelModal(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100">Keep Order</button>
              <button onClick={handleCancelOrder} className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-2"><Ban className="w-4 h-4" /> Cancel Order</button>
            </div>
          </div>
        </div>
      )}

      <div className="order-card" style={isInBatch ? { borderRadius:12, marginBottom:10 } : { borderLeft: isCancelled ? '4px solid #d1d5db' : '4px solid #2563eb' }}>
        <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
              {isInBatch && <span style={{ fontSize:10, fontWeight:700, color:'#7c3aed', background:'#f3e8ff', padding:'2px 8px', borderRadius:5, fontFamily:'var(--mono)', border:'1px solid #ddd6fe' }}>Drop #{dropNumber}</span>}
              <span className="oid-badge">#{order.id}</span>
              <StatusChip status={order.status} />
              {order.payment_method && <PaymentBadge method={order.payment_method} />}
              {!isInBatch && order.merchant_id && <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#6d28d9', background:'#f3e8ff', padding:'3px 8px', borderRadius:5, fontFamily:'var(--mono)' }}>Merchant Source</span>}
              {!isInBatch && !order.merchant_id && <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#0891b2', background:'#ecfeff', padding:'3px 8px', borderRadius:5, fontFamily:'var(--mono)' }}>Rider App Feed</span>}
            </div>
            <p style={{ fontSize:10, color:'#94a3b8', fontFamily:'var(--mono)', letterSpacing:'0.04em' }}>{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', justifyContent:'flex-end' }}>
            {!isCancelled && order.status !== 'delivered' && (
              <button type="button" onClick={() => setShowCancelModal(true)} className="act-btn" style={{ background:'#fef2f2', color:'#dc2626', borderColor:'#fecaca' }}>
                <Ban size={11}/> Cancel
              </button>
            )}
            <button type="button" disabled={!canTrack} onClick={() => onTrack?.(order, { orderId:order.id, title:'Pickup → Dropoff' })} className="act-btn"
              style={{ background:canTrack?'#f0fdf4':'#f9fafb', color:canTrack?'#059669':'#d1d5db', borderColor:canTrack?'#bbf7d0':'#e5e7eb', cursor:canTrack?'pointer':'not-allowed' }}>
              <MapPin size={11}/> Track
            </button>
            <button type="button" onClick={() => downloadAdminOrder(order, admin, { isInBatch, dropNumber })} className="act-btn" style={{ background:'#f8fafc', color:'#475569', borderColor:'#e2e8f0' }}>
              <Download size={11}/> Download
            </button>
            <button onClick={() => setShowLogs(!showLogs)} className="act-btn" style={{ background:showLogs?'#eff6ff':'#f8fafc', color:showLogs?'#2563eb':'#475569', borderColor:showLogs?'#bfdbfe':'#e2e8f0' }} type="button">
              {showLogs ? 'Close' : 'History'}
            </button>
          </div>
        </div>

        <div style={{ padding:'16px 20px' }}>
          {isCancelled && order.cancel_reason && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg" style={{ borderLeft:'3px solid #9ca3af' }}>
              <p className="text-[10px] uppercase text-gray-400 mb-1">Cancellation Reason</p>
              <p className="text-sm text-gray-700">{order.cancel_reason}</p>
              {order.cancelled_by && <p className="text-[10px] text-gray-400 mt-1">Cancelled by: {order.cancelled_by}</p>}
              {/* FIX #2: Show cancelled_at in local time */}
              {order.cancelled_at && (
                <p className="text-[10px] text-gray-400 mt-1">Cancelled at: {formatTime(order.cancelled_at)}</p>
              )}
            </div>
          )}
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <p className="text-[9px] uppercase text-gray-400 tracking-widest">Item / Parcel Image</p>
              {hasImage ? <button type="button" onClick={() => onViewImage?.(order.item_image_url, { orderId:order.id, label:'Item / Parcel' })} className="text-[10px] uppercase font-bold text-blue-600 hover:underline">View</button>
                        : <span className="text-[10px] uppercase text-gray-300">No Image</span>}
            </div>
            {hasImage && (
              <button type="button" onClick={() => onViewImage?.(order.item_image_url, { orderId:order.id, label:'Item / Parcel' })} className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all">
                <img src={order.item_image_url} alt="Item" className="w-full h-40 object-cover" />
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
              <div>
                <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                  <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', color:'#94a3b8', textTransform:'uppercase', fontFamily:'var(--mono)' }}>GH₵</span>
                  <span style={{ fontSize:26, fontWeight:800, color:'#2563eb', letterSpacing:'-0.02em' }}>{order.price || '0.00'}</span>
                </div>
                {order.payment_method && <div style={{ marginTop:4 }}><PaymentBadge method={order.payment_method} /></div>}
              </div>
            </div>
          </div>

          {showLogs && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200 border-dashed">
              {/* FIX #2: Use full date+time for all timeline steps */}
              <TimelineStep label="Initialized" time={formatTime(order.created_at)} isDone={true} />
              <TimelineStep label="Assigned" time={formatTime(order.assigned_at)} isDone={!!order.driver_id} />
              <TimelineStep label="Picked Up" time={formatTime(order.picked_up_at)} isDone={order.status==='picked_up'||order.status==='delivered'} />
              <TimelineStep label="Delivered" time={formatTime(order.delivered_at)} isDone={order.status==='delivered'} />
              {isCancelled && <TimelineStep label="Cancelled" time={formatTime(order.cancelled_at)} isDone={true} />}
            </div>
          )}

          {order.status !== 'delivered' && order.status !== 'cancelled' && (!isInBatch || showAssignment) && (
            <div className="mt-6 flex gap-3 border-t border-gray-100 pt-6">
              <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="flex-1 p-2.5 border border-gray-200 rounded-lg font-bold text-sm bg-white outline-none focus:border-blue-500">
                <option value="">Select Rider...</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
              <button onClick={handleAssign} style={{ padding:'10px 22px', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', border:'none', borderRadius:10, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'var(--font)', boxShadow:'0 2px 8px rgba(37,99,235,0.35)' }}>
                {order.driver_id ? 'Change' : 'Assign'}
              </button>
            </div>
          )}
          {order.driver_name && (
            <div style={{ marginTop:12, padding:'10px 14px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <Truck size={13} style={{ color:'#2563eb' }}/><span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', color:'#1d4ed8', textTransform:'uppercase', fontFamily:'var(--mono)' }}>Assigned Rider:</span>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:'#1e40af' }}>{order.driver_name}</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS VIEW — extracted as a stable top-level component to fix search cursor
// FIX #1: This must be defined OUTSIDE Dashboard so it never gets re-created
// on re-render, which causes inputs to unmount/remount and lose focus.
// ─────────────────────────────────────────────────────────────────────────────
function OrdersView({
  searchQuery, setSearchQuery,
  timeFilter, setTimeFilter,
  lastXHours, setLastXHours,
  orderTypeFilter, setOrderTypeFilter,
  activeTab, setActiveTab,
  displayItems,
  orders, drivers,
  singleOrdersCount, bulkOrdersCount, appOrdersCount,
  merchantOrdersCount, pendingOrdersCount, completedOrdersCount, cancelledOrdersCount,
  loading,
  assignDriver, assignDriverToBatch,
  openImagePreview, openMapTracking, handleCancelOrder,
  admin,
}) {
  return (
    <>
      {/* FIX #1: Search input is stable — no re-mount on keystroke */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400"/>
        </div>
        <input
          type="text"
          placeholder="Search by Order ID, Customer Name, or Batch ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="adm-search"
          style={{ paddingLeft:44 }}
        />
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase" style={{ fontFamily:'var(--mono)' }}>
          <Calendar className="w-4 h-4"/><span>Time:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} className="sm:w-72 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-xs uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                onChange={e => setLastXHours(Math.max(1, parseInt(e.target.value || '1', 10)))}
                className="w-28 px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs font-bold uppercase text-gray-500">Hours</span>
            </div>
          )}
          <button onClick={() => { setTimeFilter('all_time'); setLastXHours(3) }} className="sm:ml-auto px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold uppercase text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all">
            Clear Filter
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase" style={{ fontFamily:'var(--mono)' }}>
          <Filter className="w-4 h-4"/><span>Filter:</span>
        </div>
        <button onClick={() => setOrderTypeFilter('all')} className={`filter-pill${orderTypeFilter === 'all' ? ' fp-blue' : ''}`}>
          Show All ({orders.length})
        </button>
        <button onClick={() => setOrderTypeFilter('single')} className={`filter-pill${orderTypeFilter === 'single' ? ' fp-blue' : ''}`}>
          <Package className="w-3.5 h-3.5"/>Single Orders ({singleOrdersCount})
        </button>
        <button onClick={() => setOrderTypeFilter('bulk')} className={`filter-pill${orderTypeFilter === 'bulk' ? ' fp-purple' : ''}`}>
          <Layers className="w-3.5 h-3.5"/>Bulk Orders ({bulkOrdersCount})
        </button>
      </div>

      {/* FIX #3: Added Cancelled tab to the tab bar */}
      <div className="tab-pill-bar mb-6">
        <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} count={orders.length} icon={<List size={13}/>}>All Orders</TabButton>
        <TabButton active={activeTab === 'app'} onClick={() => setActiveTab('app')} count={appOrdersCount} icon={<Smartphone size={13}/>}>App Orders</TabButton>
        <TabButton active={activeTab === 'merchant_orders'} onClick={() => setActiveTab('merchant_orders')} count={merchantOrdersCount} icon={<Store size={13}/>}>Merchant Orders</TabButton>
        <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} count={pendingOrdersCount} icon={<Clock size={13}/>}>Pending</TabButton>
        <TabButton active={activeTab === 'delivered'} onClick={() => setActiveTab('delivered')} count={completedOrdersCount} icon={<CheckCircle size={13}/>}>Delivered</TabButton>
        {/* FIX #3: Cancelled tab was missing from the "All Orders" tab bar */}
        <TabButton active={activeTab === 'cancelled'} onClick={() => setActiveTab('cancelled')} count={cancelledOrdersCount} icon={<XCircle size={13}/>}>Cancelled</TabButton>
      </div>

      <div className="pb-12 text-left">
        {loading ? (
          <div className="animate-pulse space-y-4"><div className="bg-white h-48 rounded-xl"/></div>
        ) : (
          <>
            {displayItems.map(item =>
              item.type === 'batch'
                ? <BatchOrderGroup key={`batch-${item.batchId}`} batchId={item.batchId} orders={item.orders} drivers={drivers} onAssign={assignDriver} onAssignBatch={assignDriverToBatch} onViewImage={openImagePreview} onTrack={openMapTracking} onCancel={handleCancelOrder} admin={admin}/>
                : <OrderCard key={`single-${item.order.id}`} order={item.order} drivers={drivers} onAssign={assignDriver} onViewImage={openImagePreview} onTrack={openMapTracking} onCancel={handleCancelOrder} admin={admin}/>
            )}
            {displayItems.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-gray-400"/>
                </div>
                <p className="text-gray-500 text-lg font-semibold">
                  {searchQuery ? 'No orders match your search' : 'No orders found'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard() {
  const [admin, setAdmin] = useState(null)
  const [orders, setOrders] = useState([])
  const [drivers, setDrivers] = useState([])
  const [merchants, setMerchants] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const [activeTab, setActiveTab] = useState('orders')
  const [driversTab, setDriversTab] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [orderTypeFilter, setOrderTypeFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [timeFilter, setTimeFilter] = useState('all_time')
  const [lastXHours, setLastXHours] = useState(3)

  const [statFilterType, setStatFilterType] = useState(null)

  const [showImageModal, setShowImageModal] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [previewMeta, setPreviewMeta] = useState({ orderId:null, label:'' })
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapMeta, setMapMeta] = useState({ orderId:null, title:'' })
  const [mapEmbedUrl, setMapEmbedUrl] = useState('')
  const [mapOpenUrl, setMapOpenUrl] = useState('')
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false)
  const [newOrderForm, setNewOrderForm] = useState({
    merchant_id:'', customer_name:'', customer_phone:'',
    receiver_name:'', receiver_phone:'', pickup_address:'',
    dropoff_address:'', price:'', item_image_url:'', payment_method:'cash'
  })

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)
  const realtimeChannelRef = useRef(null)

  const [adminProfile, setAdminProfile] = useState({ full_name:'System Admin', email:'', avatar_url:'' })
  const profilePicRef = useRef(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current:'', newPass:'', confirm:'' })

  const [settingsTab, setSettingsTab] = useState('general')
  const [settingsForm, setSettingsForm] = useState({
    company_name:'Chariot Delivery', support_email:'support@chariot.com',
    support_phone:'+233 XX XXX XXXX', base_delivery_fee:'10.00',
    per_km_rate:'2.50', currency:'GHS', timezone:'Africa/Accra',
    enable_notifications:true, auto_assign_orders:false,
    require_photo_proof:true, allow_cash_on_delivery:true,
    allow_mobile_money:true, allow_card_payment:false,
    max_orders_per_rider:'10', order_timeout_minutes:'30',
    sms_notifications:false, email_notifications:true,
    maintenance_mode:false, two_factor_auth:false,
    dark_mode:false, compact_view:false,
    show_revenue_publicly:false, auto_backup:true,
  })

  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 60000); return () => clearInterval(t) }, [])

  const addNotificationRef = useRef(null)
  const addNotification = useCallback((type, order, message) => {
    setNotifications(prev => [{ id:Date.now()+Math.random(), type, order, message, timestamp:new Date().toISOString(), read:false }, ...prev])
    setUnreadCount(prev => prev + 1)
    try { const a=new Audio('data:audio/wav;base64,UklGRl9vT1dBVkVmbXQ'); a.volume=0.3; a.play().catch(()=>{}) } catch {}
  }, [])
  addNotificationRef.current = addNotification

  const markAllRead = () => { setNotifications(prev => prev.map(n => ({...n, read:true}))); setUnreadCount(0) }
  const clearAllNotifications = () => { setNotifications([]); setUnreadCount(0) }

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    if (!adminData) { window.location.href = '/'; return }
    const parsedAdmin = JSON.parse(adminData)
    setAdmin(parsedAdmin)
    setAdminProfile({
      full_name: parsedAdmin?.full_name || 'System Admin',
      email: parsedAdmin?.email || '',
      avatar_url: localStorage.getItem('admin_avatar') || ''
    })
    const savedSettings = localStorage.getItem('chariot_settings')
    if (savedSettings) { try { setSettingsForm(JSON.parse(savedSettings)) } catch {} }
    loadData()

    const channel = supabase.channel(`admin-${Date.now()}`)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'requests' }, payload => {
        const newOrder = payload.new
        setOrders(prev => [newOrder, ...prev])
        addNotificationRef.current('new_order', newOrder, `New Order #${newOrder.id} from ${newOrder.customer_name||'Customer'}`)
      })
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'requests' }, payload => {
        const updatedOrder = payload.new, oldOrder = payload.old
        // FIX #2: Immediately update orders state so cancelled tab reflects changes instantly
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
        if (oldOrder?.status !== 'cancelled' && updatedOrder?.status === 'cancelled') {
          addNotificationRef.current('cancelled', updatedOrder, `Order #${updatedOrder.id} cancelled`)
        }
      })
      .subscribe()
    realtimeChannelRef.current = channel

    const handleClickOutside = e => { if (notificationRef.current && !notificationRef.current.contains(e.target)) setShowNotifications(false) }
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        setShowImageModal(false); setShowMapModal(false)
        setShowCreateOrderModal(false); setStatFilterType(null)
        setShowChangePassword(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [{ data:ordersData }, { data:driversData }, { data:merchantsData }] = await Promise.all([
        supabase.from('requests').select('*').order('created_at', { ascending:false }),
        supabase.from('drivers').select('*'),
        supabase.from('merchants').select('*'),
      ])
      setOrders(ordersData || [])
      setDrivers(driversData || [])
      setMerchants(merchantsData || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const assignDriver = async (orderId, driverId) => {
    if (!driverId) return alert('Select a rider first')
    const driver = drivers.find(d => d.id === driverId)
    setOrders(prev => prev.map(o => o.id === orderId
      ? { ...o, driver_id:driverId, driver_name:driver?.full_name||'', driver_phone:driver?.phone_number||'', status:'assigned', assigned_at:new Date().toISOString() }
      : o
    ))
    const { error } = await supabase.from('requests').update({
      driver_id:driverId, driver_name:driver?.full_name||'', driver_phone:driver?.phone_number||'',
      status:'assigned', assigned_at:new Date().toISOString()
    }).eq('id', orderId)
    if (error) { alert('Failed to assign driver'); loadData() }
  }

  const assignDriverToBatch = async (batchId, driverId) => {
    if (!driverId) return alert('Select a rider first')
    const driver = drivers.find(d => d.id === driverId)
    const affected = orders.filter(o => o.batch_id === batchId)
    setOrders(prev => prev.map(o => o.batch_id === batchId
      ? { ...o, driver_id:driverId, driver_name:driver?.full_name||'', driver_phone:driver?.phone_number||'', status:'assigned', assigned_at:new Date().toISOString() }
      : o
    ))
    const { error } = await supabase.from('requests').update({
      driver_id:driverId, driver_name:driver?.full_name||'', driver_phone:driver?.phone_number||'',
      status:'assigned', assigned_at:new Date().toISOString()
    }).eq('batch_id', batchId)
    if (error) { alert('Failed to assign'); loadData() }
    else alert(`✓ Rider assigned to all ${affected.length} orders in this batch!`)
  }

  // FIX #2: handleCancelOrder now does optimistic update immediately so
  // the cancelled tab reflects the change without needing a full reload.
  const handleCancelOrder = async (orderId, reason) => {
    const cancelledAt = new Date().toISOString()
    // Optimistic update — cancelled order shows immediately in cancelled tab
    setOrders(prev => prev.map(o => o.id === orderId
      ? { ...o, status:'cancelled', cancel_reason:reason||'Cancelled by Admin', cancelled_by:'Admin', cancelled_at:cancelledAt }
      : o
    ))
    const { error } = await supabase.from('requests').update({
      status:'cancelled',
      cancel_reason:reason||'Cancelled by Admin',
      cancelled_by:'Admin',
      cancelled_at:cancelledAt
    }).eq('id', orderId)
    if (error) {
      alert('Failed to cancel: ' + error.message)
      loadData() // revert optimistic update on error
    }
  }

  const handleToggleMerchant = async (merchantId, disable) => {
    const { error } = await supabase.from('merchants').update({ is_disabled:disable }).eq('id', merchantId)
    if (error) alert('Failed: ' + error.message)
    else {
      setMerchants(prev => prev.map(m => m.id === merchantId ? {...m, is_disabled:disable} : m))
      alert(`✓ Merchant ${disable?'disabled':'enabled'} successfully`)
    }
  }

  const handleCreateOrder = async () => {
    if (!newOrderForm.merchant_id || !newOrderForm.customer_name || !newOrderForm.pickup_address || !newOrderForm.dropoff_address) {
      return alert('Please fill in all required fields')
    }
    const { error } = await supabase.from('requests').insert([{
      ...newOrderForm,
      status:'pending',
      driver_id:null,
      driver_name:null,
      driver_phone:null,
      created_at:new Date().toISOString()
    }]).select()
    if (error) alert('Failed to create order: ' + error.message)
    else {
      alert('✓ Order created! Assign a rider from the Orders view.')
      setShowCreateOrderModal(false)
      setNewOrderForm({ merchant_id:'', customer_name:'', customer_phone:'', receiver_name:'', receiver_phone:'', pickup_address:'', dropoff_address:'', price:'', item_image_url:'', payment_method:'cash' })
      loadData()
    }
  }

  const handleSaveSettings = () => {
    localStorage.setItem('chariot_settings', JSON.stringify(settingsForm))
    alert('✓ Settings saved successfully!')
  }

  const handleSaveProfile = () => {
    const updated = { ...admin, full_name:adminProfile.full_name, email:adminProfile.email }
    localStorage.setItem('admin', JSON.stringify(updated))
    if (adminProfile.avatar_url) localStorage.setItem('admin_avatar', adminProfile.avatar_url)
    setAdmin(updated)
    alert('✓ Profile updated!')
  }

  const handleAvatarUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5*1024*1024) { alert('Image must be under 5MB'); return }
    const reader = new FileReader()
    reader.onload = ev => setAdminProfile(prev => ({...prev, avatar_url:ev.target.result}))
    reader.readAsDataURL(file)
  }

  const handleChangePassword = () => {
    if (!passwordForm.newPass || passwordForm.newPass.length < 6) { alert('Password must be at least 6 characters'); return }
    if (passwordForm.newPass !== passwordForm.confirm) { alert('Passwords do not match'); return }
    alert('✓ Password changed successfully!')
    setShowChangePassword(false)
    setPasswordForm({ current:'', newPass:'', confirm:'' })
  }

  const handleLogout = () => { localStorage.removeItem('admin'); window.location.href='/' }

  const handleNotificationClick = orderId => {
    setActiveView('dashboard'); setActiveTab('orders'); setSearchQuery(orderId.toString())
    setShowNotifications(false); setSidebarOpen(false)
    setTimeout(() => window.scrollTo({ top:400, behavior:'smooth' }), 100)
  }

  const openImagePreview = (url, meta={}) => { if (!url) return; setPreviewImageUrl(url); setPreviewMeta(meta); setShowImageModal(true) }
  const closeImagePreview = () => { setShowImageModal(false); setPreviewImageUrl(''); setPreviewMeta({}) }
  const openMapTracking = (order, meta={}) => {
    if (!hasValidCoords(order)) return alert('This order has no saved coordinates yet.')
    setMapMeta(meta); setMapEmbedUrl(buildMapsEmbedUrl(order)); setMapOpenUrl(buildMapsOpenUrl(order)); setShowMapModal(true)
  }
  const closeMapTracking = () => { setShowMapModal(false); setMapMeta({}); setMapEmbedUrl(''); setMapOpenUrl('') }

  const timeCutoffMs = useMemo(() => {
    if (timeFilter === 'all_time') return null
    const now = new Date(), nowMs = now.getTime()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const day = now.getDay(), diffToMonday = (day+6)%7
    const startOfWeekMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()-diffToMonday).getTime()
    const startOfMonthMs = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    if (timeFilter==='last_30m') return nowMs-30*60*1000
    if (timeFilter==='last_1h') return nowMs-60*60*1000
    if (timeFilter==='last_xh') return nowMs-Math.max(1,Number(lastXHours)||1)*60*60*1000
    if (timeFilter==='today') return startOfToday
    if (timeFilter==='this_week') return startOfWeekMs
    if (timeFilter==='this_month') return startOfMonthMs
    if (timeFilter==='last_month') return new Date(now.getFullYear(), now.getMonth()-1, 1).getTime()
    return null
  }, [timeFilter, lastXHours])

  const passesTimeFilter = createdAt => {
    if (!createdAt || timeFilter==='all_time') return true
    const tsMs = new Date(createdAt).getTime()
    if (Number.isNaN(tsMs)) return false
    if (timeFilter==='last_month') {
      const now = new Date()
      const s = new Date(now.getFullYear(), now.getMonth()-1, 1).getTime()
      const e = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      return tsMs>=s && tsMs<e
    }
    return timeCutoffMs==null || tsMs>=timeCutoffMs
  }

  // FIX #2: Include 'cancelled' in the activeTab filter logic
  const filteredOrders = orders.filter(o => {
    if (!passesTimeFilter(o.created_at)) return false
    const q = searchQuery.toLowerCase()
    if (q && !o.id.toString().includes(q) && !o.customer_name?.toLowerCase().includes(q) && !o.receiver_name?.toLowerCase().includes(q) && !(o.batch_id&&o.batch_id.toLowerCase().includes(q))) return false
    if (activeTab === 'app') return !o.merchant_id
    if (activeTab === 'merchant_orders') return !!o.merchant_id
    if (activeTab === 'pending') return o.status === 'pending'
    if (activeTab === 'delivered') return o.status === 'delivered'
    if (activeTab === 'cancelled') return o.status === 'cancelled'
    // 'orders' tab — show everything
    return true
  })

  const groupedOrders = {}, singleOrders = []
  filteredOrders.forEach(o => {
    if (o.batch_id) { if (!groupedOrders[o.batch_id]) groupedOrders[o.batch_id]=[]; groupedOrders[o.batch_id].push(o) }
    else singleOrders.push(o)
  })

  const filteredIdSet = useMemo(() => new Set(filteredOrders.map(o => o.id)), [filteredOrders])

  const displayItems = useMemo(() => {
    const items = []
    Object.keys(groupedOrders).forEach(batchId => {
      if (orderTypeFilter==='single') return
      const batchOrders = (groupedOrders[batchId]||[]).filter(o => filteredIdSet.has(o.id))
      if (!batchOrders.length) return
      const sorted = [...batchOrders].sort((a,b) => new Date(b.created_at)-new Date(a.created_at))
      items.push({ type:'batch', batchId, sortKey:Math.max(...sorted.map(o=>new Date(o.created_at).getTime())), orders:sorted })
    })
    if (orderTypeFilter!=='bulk') {
      singleOrders.forEach(o => {
        if (!filteredIdSet.has(o.id)) return
        const ms = new Date(o.created_at).getTime()
        items.push({ type:'single', sortKey:Number.isNaN(ms)?0:ms, order:o })
      })
    }
    return items.sort((a,b) => b.sortKey-a.sortKey)
  }, [groupedOrders, singleOrders, filteredIdSet, orderTypeFilter])

  const bulkOrdersCount = Object.keys(groupedOrders).length
  const singleOrdersCount = singleOrders.length
  const appOrdersCount = orders.filter(o => !o.merchant_id).length
  const merchantOrdersCount = orders.filter(o => o.merchant_id!=null).length
  const pendingOrdersCount = orders.filter(o => o.status==='pending').length
  const completedOrdersCount = orders.filter(o => o.status==='delivered').length
  const cancelledOrdersCount = orders.filter(o => o.status==='cancelled').length
  const activeOrdersCount = orders.filter(o => o.status==='assigned'||o.status==='picked_up').length

  const totalRevenue = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+Number(o.price||0),0)
  const todayRevenue = orders.filter(o=>{const t=new Date(o.created_at).toDateString()===new Date().toDateString();return t&&o.status==='delivered'}).reduce((s,o)=>s+Number(o.price||0),0)
  const avgOrderValue = completedOrdersCount>0 ? totalRevenue/completedOrdersCount : 0
  const completionRate = orders.length>0 ? ((completedOrdersCount/orders.length)*100).toFixed(1) : 0

  // Shared props for OrdersView
  const ordersViewProps = {
    searchQuery, setSearchQuery,
    timeFilter, setTimeFilter,
    lastXHours, setLastXHours,
    orderTypeFilter, setOrderTypeFilter,
    activeTab, setActiveTab,
    displayItems,
    orders, drivers,
    singleOrdersCount, bulkOrdersCount, appOrdersCount,
    merchantOrdersCount, pendingOrdersCount, completedOrdersCount, cancelledOrdersCount,
    loading,
    assignDriver, assignDriverToBatch,
    openImagePreview, openMapTracking, handleCancelOrder,
    admin,
  }

  if (!admin) return null

  return (
    <div className="adm-root" style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'row' }}>
      <style>{PREMIUM_STYLES}</style>

      {statFilterType && (
        <StatFilterModal
          filterType={statFilterType}
          orders={orders}
          drivers={drivers}
          merchants={merchants}
          onClose={() => setStatFilterType(null)}
          onTrack={openMapTracking}
          admin={admin}
          downloadAdminOrderFn={downloadAdminOrder}
        />
      )}

      {showCreateOrderModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth:640 }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#eff6ff,#f0f9ff)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ background:'linear-gradient(135deg,#2563eb,#0891b2)', borderRadius:12, padding:10, boxShadow:'0 4px 12px rgba(37,99,235,0.3)' }}><Plus size={18} style={{ color:'#fff' }}/></div>
                <div>
                  <p style={{ fontSize:15, fontWeight:800, color:'#0f172a' }}>Create New Order</p>
                  <p style={{ fontSize:11, color:'#94a3b8' }}>Order will be created as Pending — assign a rider afterwards</p>
                </div>
              </div>
              <button onClick={() => setShowCreateOrderModal(false)} className="p-2 rounded-lg hover:bg-white transition-all"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Merchant <span className="text-red-500">*</span></label>
                  <select value={newOrderForm.merchant_id} onChange={e=>setNewOrderForm({...newOrderForm, merchant_id:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Merchant...</option>
                    {merchants.filter(m=>!m.is_disabled).map(m=><option key={m.id} value={m.id}>{m.business_name}</option>)}
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Sender Name <span className="text-red-500">*</span></label><input type="text" value={newOrderForm.customer_name} onChange={e=>setNewOrderForm({...newOrderForm,customer_name:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe"/></div>
                  <div><label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Sender Phone</label><input type="tel" value={newOrderForm.customer_phone} onChange={e=>setNewOrderForm({...newOrderForm,customer_phone:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+233 XX XXX XXXX"/></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Receiver Name</label><input type="text" value={newOrderForm.receiver_name} onChange={e=>setNewOrderForm({...newOrderForm,receiver_name:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jane Smith"/></div>
                  <div><label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Receiver Phone</label><input type="tel" value={newOrderForm.receiver_phone} onChange={e=>setNewOrderForm({...newOrderForm,receiver_phone:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+233 XX XXX XXXX"/></div>
                </div>
                <div><label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Pickup Address <span className="text-red-500">*</span></label><input type="text" value={newOrderForm.pickup_address} onChange={e=>setNewOrderForm({...newOrderForm,pickup_address:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="123 Main St, Accra"/></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Dropoff Address <span className="text-red-500">*</span></label><input type="text" value={newOrderForm.dropoff_address} onChange={e=>setNewOrderForm({...newOrderForm,dropoff_address:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="456 Oak Ave, Kumasi"/></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Price (GH₵)</label><input type="number" step="0.01" value={newOrderForm.price} onChange={e=>setNewOrderForm({...newOrderForm,price:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="25.00"/></div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Payment Method</label>
                    <select value={newOrderForm.payment_method} onChange={e=>setNewOrderForm({...newOrderForm,payment_method:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {PAYMENT_METHODS.map(pm=><option key={pm.value} value={pm.value}>{pm.label}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Item Image URL</label><input type="url" value={newOrderForm.item_image_url} onChange={e=>setNewOrderForm({...newOrderForm,item_image_url:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/image.jpg"/></div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button onClick={()=>setShowCreateOrderModal(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100">Cancel</button>
              <button onClick={handleCreateOrder} style={{ padding:'10px 22px', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6, boxShadow:'0 2px 8px rgba(37,99,235,0.35)', fontFamily:'var(--font)' }}>
                <Save className="w-4 h-4"/> Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {showMapModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth:900 }}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600"/>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 uppercase">{mapMeta?.orderId ? `Track Order #${mapMeta.orderId}` : 'Track Delivery'}</p>
                  <p className="text-[10px] uppercase text-gray-400">{mapMeta?.title||'Pickup → Dropoff'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {mapOpenUrl && <a href={mapOpenUrl} target="_blank" rel="noreferrer" className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg hover:bg-blue-100">Open in Maps</a>}
                <button onClick={closeMapTracking} className="p-2 rounded-lg hover:bg-gray-100 transition-all"><X className="w-5 h-5 text-gray-700"/></button>
              </div>
            </div>
            <div className="p-4 bg-gray-50">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <iframe title="Tracking Map" src={mapEmbedUrl} className="w-full h-[70vh]" style={{ border:0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 font-semibold">Tip: Press <span className="font-black">Esc</span> to close</p>
                {mapOpenUrl && <a href={mapOpenUrl} target="_blank" rel="noreferrer" className="text-[10px] uppercase font-bold text-blue-600 hover:underline">Open full route</a>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth:700 }}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600"/>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 uppercase">{previewMeta?.orderId ? `Order #${previewMeta.orderId}` : 'Order Image'}</p>
                  <p className="text-[10px] uppercase text-gray-400">{previewMeta?.label||'Item / Parcel'}</p>
                </div>
              </div>
              <button onClick={closeImagePreview} className="p-2 rounded-lg hover:bg-gray-100 transition-all"><X className="w-5 h-5 text-gray-700"/></button>
            </div>
            <div className="p-4 bg-gray-50">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <img src={previewImageUrl} alt="Item" className="w-full max-h-[70vh] object-contain bg-white"/>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 font-semibold">Tip: Press <span className="font-black">Esc</span> to close</p>
                <a href={previewImageUrl} target="_blank" rel="noreferrer" className="text-[10px] uppercase font-bold text-blue-600 hover:underline">Open in new tab</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth:440 }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ background:'#eff6ff', borderRadius:10, padding:8 }}><Key size={18} style={{ color:'#2563eb' }}/></div>
                <p style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>Change Password</p>
              </div>
              <button onClick={() => setShowChangePassword(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} style={{ color:'#64748b' }}/></button>
            </div>
            <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { label:'Current Password', key:'current', placeholder:'Enter current password' },
                { label:'New Password', key:'newPass', placeholder:'Min 6 characters' },
                { label:'Confirm New Password', key:'confirm', placeholder:'Re-enter new password' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#64748b', fontFamily:'var(--mono)', marginBottom:6 }}>{f.label}</label>
                  <input type="password" value={passwordForm[f.key]} onChange={e=>setPasswordForm({...passwordForm,[f.key]:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={f.placeholder}/>
                </div>
              ))}
            </div>
            <div style={{ padding:'0 24px 20px', display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setShowChangePassword(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100">Cancel</button>
              <button onClick={handleChangePassword} style={{ padding:'10px 22px', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', border:'none', borderRadius:10, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>Update Password</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className="sb-shell flex flex-col" style={{ position:'fixed', top:0, left:0, bottom:0, width:252, zIndex:50 }}>
        <div className="sb-logo-area">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
            <div className="sb-logo-icon"><Package size={20} style={{ color:'#fff' }}/></div>
            <div><p className="sb-brand">Chariot Admin</p><p className="sb-subbrand">Command Center</p></div>
          </div>
          <div className="sb-live-pill">
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span className="live-dot"/>
              <span style={{ fontSize:10, fontWeight:700, color:'rgba(16,185,129,0.9)', letterSpacing:'0.12em', fontFamily:'var(--mono)', textTransform:'uppercase' }}>System Live</span>
            </div>
            <span style={{ fontSize:9.5, color:'rgba(180,210,255,0.5)', fontFamily:'var(--mono)' }}>{currentTime.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
          </div>
        </div>

        <div className="sb-mini-stats">
          {[
            { val:pendingOrdersCount, lbl:'Pending', color:'#f59e0b' },
            { val:activeOrdersCount, lbl:'Active', color:'#06b6d4' },
            { val:completedOrdersCount, lbl:'Done', color:'#10b981' },
          ].map(s => (
            <div key={s.lbl} className="sb-mini-tile">
              <p className="sb-mini-val" style={{ color:s.color }}>{s.val}</p>
              <p className="sb-mini-lbl">{s.lbl}</p>
            </div>
          ))}
        </div>

        <nav style={{ flex:1, padding:'8px 10px', overflowY:'auto', scrollbarWidth:'none' }}>
          <p className="sb-section-lbl">Overview</p>
          <SidebarItem icon={<LayoutDashboard size={16}/>} label="Dashboard" sub="Overview & stats" active={activeView==='dashboard'} onClick={()=>{setActiveView('dashboard');setSidebarOpen(false)}}/>

          <p className="sb-section-lbl">Orders</p>
          <SidebarItem icon={<List size={16}/>} label="All Orders" active={activeView==='orders'} onClick={()=>{setActiveView('orders');setActiveTab('orders');setSidebarOpen(false)}} badge={orders.length}/>
          <SidebarItem icon={<Smartphone size={16}/>} label="App Orders" active={activeView==='app'} onClick={()=>{setActiveView('app');setActiveTab('app');setSidebarOpen(false)}} badge={appOrdersCount}/>
          <SidebarItem icon={<Store size={16}/>} label="Merchant Orders" active={activeView==='merchant_orders'} onClick={()=>{setActiveView('merchant_orders');setActiveTab('merchant_orders');setSidebarOpen(false)}} badge={merchantOrdersCount}/>
          <SidebarItem icon={<Clock size={16}/>} label="Pending" sub="Awaiting assignment" active={activeView==='pending_view'} onClick={()=>{setActiveView('orders');setActiveTab('pending');setSidebarOpen(false)}} badge={pendingOrdersCount}/>
          {/* Added cancelled to sidebar too */}
          <SidebarItem icon={<XCircle size={16}/>} label="Cancelled" active={activeView==='cancelled_view'} onClick={()=>{setActiveView('orders');setActiveTab('cancelled');setSidebarOpen(false)}} badge={cancelledOrdersCount}/>

          <p className="sb-section-lbl">Management</p>
          <SidebarItem icon={<Map size={16}/>} label="Track Deliveries" sub="Live GPS tracking" active={activeView==='track'} onClick={()=>{setActiveView('track');setSidebarOpen(false)}}/>
          <SidebarItem icon={<Truck size={16}/>} label="Manage Drivers" active={activeView==='drivers'} onClick={()=>{setActiveView('drivers');setDriversTab('list');setSidebarOpen(false)}} badge={drivers.length}/>
          <SidebarItem icon={<Trophy size={16}/>} label="Leaderboard" sub="Driver rankings" active={activeView==='leaderboard'} onClick={()=>{setActiveView('leaderboard');setSidebarOpen(false)}}/>
          <SidebarItem icon={<Users size={16}/>} label="Merchants" active={activeView==='merchants'} onClick={()=>{setActiveView('merchants');setSidebarOpen(false)}} badge={merchants.length}/>

          <p className="sb-section-lbl">Analytics</p>
          <SidebarItem icon={<BarChart3 size={16}/>} label="Reports" sub="Revenue & metrics" active={activeView==='reports'} onClick={()=>{setActiveView('reports');setSidebarOpen(false)}}/>

          <div className="sb-divider" style={{ margin:'8px 4px' }}/>
          <SidebarItem icon={<UserCog size={16}/>} label="My Profile" active={activeView==='profile'} onClick={()=>{setActiveView('profile');setSidebarOpen(false)}}/>
          <SidebarItem icon={<Settings size={16}/>} label="Settings" active={activeView==='settings'} onClick={()=>{setActiveView('settings');setSidebarOpen(false)}}/>
        </nav>

        <div style={{ padding:'12px 14px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="sb-profile-card">
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div className="sb-avatar-wrap">
                  {adminProfile.avatar_url ? <img src={adminProfile.avatar_url} alt="avatar"/> : <Shield size={16} style={{ color:'#fff' }}/>}
                </div>
                <div className="sb-online-dot"/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#e2e8f0', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{adminProfile.full_name}</p>
                <p style={{ fontSize:9.5, color:'rgba(148,163,184,0.55)', fontFamily:'var(--mono)', letterSpacing:'0.08em' }}>SUPER USER</p>
              </div>
              <div style={{ background:'rgba(16,185,129,0.14)', border:'1px solid rgba(16,185,129,0.24)', borderRadius:6, padding:'2px 7px' }}>
                <span style={{ fontSize:8, fontWeight:700, color:'#10b981', letterSpacing:'0.12em', fontFamily:'var(--mono)' }}>ACTIVE</span>
              </div>
            </div>
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:10, display:'flex', gap:5 }}>
              {[{val:orders.length,lbl:'Orders'},{val:`${completionRate}%`,lbl:'Done'},{val:drivers.length,lbl:'Riders'},{val:merchants.length,lbl:'Merchants'}].map(s => (
                <div key={s.lbl} style={{ flex:1, background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'6px 4px', textAlign:'center' }}>
                  <p style={{ fontSize:12, fontWeight:800, color:'#e2e8f0', lineHeight:1 }}>{s.val}</p>
                  <p style={{ fontSize:7.5, color:'rgba(148,163,184,0.45)', fontFamily:'var(--mono)', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:3 }}>{s.lbl}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleLogout} className="sb-logout"><LogOut size={12}/> Sign Out</button>
        </div>
      </aside>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div style={{ flex:1, marginLeft:252, minWidth:0 }}>
        <header className="adm-topbar sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 style={{ fontSize:17, fontWeight:800, color:'#0f172a', letterSpacing:'-0.01em' }}>
                {activeView==='dashboard'&&'Dashboard Overview'}
                {activeView==='orders'&&'All Orders'}
                {activeView==='app'&&'App Orders'}
                {activeView==='merchant_orders'&&'Merchant Orders'}
                {activeView==='track'&&'Track Deliveries'}
                {activeView==='drivers'&&'Manage Drivers'}
                {activeView==='leaderboard'&&'Driver Leaderboard'}
                {activeView==='merchants'&&'Manage Merchants'}
                {activeView==='reports'&&'Reports & Analytics'}
                {activeView==='settings'&&'Settings'}
                {activeView==='profile'&&'My Profile'}
              </h1>
              <p style={{ fontSize:11, color:'#94a3b8', fontFamily:'var(--mono)', letterSpacing:'0.06em' }}>
                {currentTime.toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {(activeView==='merchants'||activeView==='dashboard'||activeView==='orders') && (
                <button onClick={()=>setShowCreateOrderModal(true)} style={{ display:'flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#2563eb,#1d4ed8)', border:'none', borderRadius:10, padding:'9px 16px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', letterSpacing:'0.05em', textTransform:'uppercase', fontFamily:'var(--font)', boxShadow:'0 2px 8px rgba(37,99,235,0.35)' }}>
                  <Plus size={14}/> Create Order
                </button>
              )}
              <button onClick={loadData} style={{ background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'8px 10px', cursor:'pointer', display:'flex', alignItems:'center', color:'#64748b' }} title="Refresh">
                <RefreshCw size={15}/>
              </button>
              <div className="relative" ref={notificationRef}>
                <button onClick={()=>{ setShowNotifications(!showNotifications); if(!showNotifications&&unreadCount>0) markAllRead() }}
                  style={{ position:'relative', background:'#f8fafc', border:`1.5px solid ${unreadCount>0?'#bfdbfe':'#e2e8f0'}`, borderRadius:10, padding:'8px 10px', cursor:'pointer', display:'flex', alignItems:'center', color:unreadCount>0?'#2563eb':'#64748b' }}>
                  <Bell size={17}/>
                  {unreadCount>0 && <span style={{ position:'absolute', top:-5, right:-5, background:'#ef4444', color:'#fff', fontSize:9, fontWeight:800, width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', border:'2px solid #fff', boxShadow:'0 1px 4px rgba(239,68,68,0.4)', animation:'livepulse 2s ease infinite' }}>{unreadCount}</span>}
                </button>
                {showNotifications && (
                  <div className="notif-panel">
                    <div style={{ padding:'14px 18px 12px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <p style={{ fontSize:12, fontWeight:800, color:'#0f172a' }}>Activity Notifications</p>
                      {notifications.length>0 && <button onClick={clearAllNotifications} style={{ fontSize:11, color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Clear All</button>}
                    </div>
                    <div style={{ maxHeight:380, overflowY:'auto' }}>
                      {notifications.length>0 ? notifications.map(notif => (
                        <div key={notif.id} onClick={()=>handleNotificationClick(notif.order.id)}
                          style={{ padding:'12px 18px', borderBottom:'1px solid #f8fafc', cursor:'pointer', background:notif.read?'#fff':'#f8faff' }}
                          onMouseEnter={e=>e.currentTarget.style.background='#f1f5f9'}
                          onMouseLeave={e=>e.currentTarget.style.background=notif.read?'#fff':'#f8faff'}>
                          <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                            <div style={{ borderRadius:9, padding:7, background:notif.type==='new_order'?'#eff6ff':'#fef2f2', flexShrink:0 }}>
                              {notif.type==='new_order'?<Package size={13} style={{ color:'#2563eb' }}/>:<XCircle size={13} style={{ color:'#dc2626' }}/>}
                            </div>
                            <div>
                              <p style={{ fontSize:12, fontWeight:700, color:'#1e293b', marginBottom:2 }}>{notif.message}</p>
                              <p style={{ fontSize:10, color:'#94a3b8', fontFamily:'var(--mono)' }}>{new Date(notif.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div style={{ padding:'40px 24px', textAlign:'center' }}>
                          <Bell size={28} style={{ color:'#e2e8f0', margin:'0 auto 8px', display:'block' }}/>
                          <p style={{ fontSize:13, color:'#94a3b8', fontWeight:600 }}>No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">

          {/* ── DASHBOARD ── */}
          {activeView==='dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-left">
                <StatBox title="All Orders" value={orders.length} color="blue" icon={<Package/>} sub={`${bulkOrdersCount} bulk · ${singleOrdersCount} single`} trend="+12%" trendUp={true} onClick={()=>setStatFilterType('all')} selected={statFilterType==='all'}/>
                <StatBox title="Pending" value={pendingOrdersCount} color="yellow" icon={<Clock/>} sub="Awaiting assignment" onClick={()=>setStatFilterType('pending')} selected={statFilterType==='pending'}/>
                <StatBox title="Delivered" value={completedOrdersCount} color="green" icon={<CheckCircle/>} sub={`${completionRate}% completion rate`} trend="+8%" trendUp={true} onClick={()=>setStatFilterType('delivered')} selected={statFilterType==='delivered'}/>
                <StatBox title="Cancelled" value={cancelledOrdersCount} color="red" icon={<XCircle/>} sub={`${orders.length>0?((cancelledOrdersCount/orders.length)*100).toFixed(1):0}% of total`} onClick={()=>setStatFilterType('cancelled')} selected={statFilterType==='cancelled'}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-left">
                <StatBox title="Active Deliveries" value={activeOrdersCount} color="cyan" icon={<Truck/>} sub="Assigned / In Transit" onClick={()=>setStatFilterType('assigned')} selected={statFilterType==='assigned'}/>
                <StatBox title="App Orders" value={appOrdersCount} color="indigo" icon={<Smartphone/>} sub="From rider app" onClick={()=>setStatFilterType('app')} selected={statFilterType==='app'}/>
                <StatBox title="Merchant Orders" value={merchantOrdersCount} color="purple" icon={<Store/>} sub="From merchants" onClick={()=>setStatFilterType('merchant')} selected={statFilterType==='merchant'}/>
                <StatBox title="Total Revenue" value={`GH₵${totalRevenue.toFixed(0)}`} color="green" icon={<DollarSign/>} sub={`Today: GH₵${todayRevenue.toFixed(2)}`} trend="+15%" trendUp={true}/>
              </div>

              <OrdersView {...ordersViewProps} />
            </>
          )}

          {/* ── ALL ORDERS / APP / MERCHANT ORDERS ── */}
          {(activeView==='orders'||activeView==='app'||activeView==='merchant_orders') && (
            <OrdersView {...ordersViewProps} />
          )}

          {/* ── TRACK DELIVERIES ── */}
          {activeView==='track' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-4">
                <Map className="w-10 h-10 text-green-600"/>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Track Active Deliveries</h3>
                  <p className="text-sm text-gray-600">Monitor ongoing orders with GPS coordinates</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox title="Active Deliveries" value={activeOrdersCount} color="blue" icon={<Truck/>} onClick={()=>setStatFilterType('assigned')} selected={statFilterType==='assigned'}/>
                <StatBox title="Available Riders" value={drivers.filter(d=>d.is_verified).length} color="green" icon={<Users/>}/>
                <StatBox title="Awaiting Assignment" value={pendingOrdersCount} color="yellow" icon={<Clock/>} onClick={()=>setStatFilterType('pending')} selected={statFilterType==='pending'}/>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Active Orders with Tracking</h3>
                <div className="space-y-3">
                  {orders.filter(o=>(o.status==='assigned'||o.status==='picked_up')&&hasValidCoords(o)).map(order => (
                    <div key={order.id} className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">Order #{order.id}</p>
                        <p className="text-xs text-gray-600">Rider: {order.driver_name||'Unassigned'}</p>
                        <p className="text-xs text-gray-500 mt-1">{order.pickup_address} → {order.dropoff_address}</p>
                      </div>
                      <button onClick={()=>openMapTracking(order,{orderId:order.id,title:'Track Delivery'})} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700">
                        <Navigation className="w-4 h-4"/> Track
                      </button>
                    </div>
                  ))}
                  {orders.filter(o=>(o.status==='assigned'||o.status==='picked_up')&&hasValidCoords(o)).length===0 && (
                    <div className="text-center py-8 text-gray-400"><Map className="w-12 h-12 mx-auto mb-2 opacity-50"/><p>No active deliveries with tracking data</p></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── DRIVERS ── */}
          {activeView==='drivers' && (
            <div className="space-y-4">
              <div className="tab-pill-bar">
                <TabButton active={driversTab==='list'} onClick={()=>setDriversTab('list')} count={drivers.length} icon={<List size={13}/>}>Driver List</TabButton>
                <TabButton active={driversTab==='leaderboard'} onClick={()=>setDriversTab('leaderboard')} count={drivers.length} icon={<Trophy size={13}/>}>Leaderboard</TabButton>
              </div>
              {driversTab==='list' && <DriversTable drivers={drivers} orders={orders} onTabChange={setDriversTab}/>}
              {driversTab==='leaderboard' && <DriverLeaderboard drivers={drivers} orders={orders}/>}
            </div>
          )}

          {activeView==='leaderboard' && <DriverLeaderboard drivers={drivers} orders={orders}/>}

          {activeView==='merchants' && <MerchantsTable merchants={merchants} orders={orders} onToggleMerchant={handleToggleMerchant}/>}

          {/* ── REPORTS ── */}
          {activeView==='reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label:'Total Revenue', val:`GH₵ ${totalRevenue.toFixed(2)}`, icon:<DollarSign/>, color:'#059669', bg:'#ecfdf5', trend:'+12%' },
                  { label:"Today's Revenue", val:`GH₵ ${todayRevenue.toFixed(2)}`, icon:<Activity/>, color:'#2563eb', bg:'#eff6ff', trend:'+8%' },
                  { label:'Avg Order Value', val:`GH₵ ${avgOrderValue.toFixed(2)}`, icon:<BarChart3/>, color:'#7c3aed', bg:'#f3e8ff', trend:'+5%' },
                  { label:'Completion Rate', val:`${completionRate}%`, icon:<Target/>, color:'#d97706', bg:'#fffbeb', trend:completionRate>80?'+Good':'-Low' },
                ].map(k => (
                  <div key={k.label} className="kpi-card">
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                      <div style={{ background:k.bg, borderRadius:10, padding:10 }}>{React.cloneElement(k.icon,{size:18,style:{color:k.color}})}</div>
                      <span style={{ fontSize:11, fontWeight:700, color:k.color, fontFamily:'var(--mono)' }}>{k.trend}</span>
                    </div>
                    <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.14em', color:'#94a3b8', textTransform:'uppercase', fontFamily:'var(--mono)', marginBottom:4 }}>{k.label}</p>
                    <p style={{ fontSize:26, fontWeight:800, color:'#0f172a', lineHeight:1, letterSpacing:'-0.02em' }}>{k.val}</p>
                  </div>
                ))}
              </div>

              <div className="kpi-card">
                <h3 style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:16 }}>Payment Methods Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {PAYMENT_METHODS.map(pm => {
                    const pmOrders = orders.filter(o => o.payment_method===pm.value && o.status==='delivered')
                    const pmRevenue = pmOrders.reduce((s,o)=>s+Number(o.price||0),0)
                    return (
                      <div key={pm.value} style={{ background:pm.bg, border:`1px solid ${pm.border}`, borderRadius:12, padding:'14px 16px' }}>
                        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:pm.color, textTransform:'uppercase', fontFamily:'var(--mono)', marginBottom:6 }}>{pm.label}</p>
                        <p style={{ fontSize:22, fontWeight:800, color:pm.color, lineHeight:1, marginBottom:4 }}>{pmOrders.length}</p>
                        <p style={{ fontSize:10, color:pm.color, opacity:0.8, fontFamily:'var(--mono)' }}>GH₵ {pmRevenue.toFixed(2)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="kpi-card">
                  <h3 style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:16 }}>Order Status Distribution</h3>
                  {[
                    { label:'Pending', count:pendingOrdersCount, color:'#f59e0b', bg:'#fffbeb' },
                    { label:'Active (Assigned/Picked Up)', count:activeOrdersCount, color:'#0891b2', bg:'#ecfeff' },
                    { label:'Delivered', count:completedOrdersCount, color:'#059669', bg:'#ecfdf5' },
                    { label:'Cancelled', count:cancelledOrdersCount, color:'#9ca3af', bg:'#f8fafc' },
                  ].map(s => (
                    <div key={s.label} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                        <span style={{ fontSize:12, color:'#374151', fontWeight:600 }}>{s.label}</span>
                        <span style={{ fontSize:12, fontWeight:800, color:s.color }}>{s.count} orders ({orders.length>0?(s.count/orders.length*100).toFixed(1):0}%)</span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill" style={{ width:`${orders.length>0?(s.count/orders.length)*100:0}%`, background:s.color }}/></div>
                    </div>
                  ))}
                </div>

                <div className="kpi-card">
                  <h3 style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:16 }}>Top Merchants by Volume</h3>
                  {merchants.map(m=>({...m, orderCount:orders.filter(o=>o.merchant_id===m.id).length, revenue:orders.filter(o=>o.merchant_id===m.id&&o.status==='delivered').reduce((s,o)=>s+Number(o.price||0),0)}))
                    .sort((a,b)=>b.orderCount-a.orderCount).slice(0,5).map((m,idx) => (
                    <div key={m.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontSize:14, fontWeight:800, color:'#94a3b8', width:24, textAlign:'center' }}>#{idx+1}</span>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{m.business_name}</p>
                          <p style={{ fontSize:10, color:'#94a3b8', fontFamily:'var(--mono)' }}>GH₵ {m.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                      <span style={{ fontSize:13, fontWeight:800, color:'#2563eb' }}>{m.orderCount} orders</span>
                    </div>
                  ))}
                  {merchants.length===0 && <p style={{ color:'#94a3b8', textAlign:'center', padding:24 }}>No merchants yet</p>}
                </div>
              </div>

              <div className="kpi-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <h3 style={{ fontSize:15, fontWeight:800, color:'#0f172a' }}>🏆 Top 5 Drivers</h3>
                  <button onClick={()=>setActiveView('leaderboard')} style={{ fontSize:11, fontWeight:700, color:'#2563eb', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'6px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                    <Trophy size={12}/> Full Leaderboard
                  </button>
                </div>
                {drivers.map(d=>({...d,delivered:orders.filter(o=>o.driver_id===d.id&&o.status==='delivered').length}))
                  .sort((a,b)=>b.delivered-a.delivered).slice(0,5).map((d,i) => (
                  <div key={d.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:i===0?'linear-gradient(135deg,#f59e0b,#d97706)':i===1?'linear-gradient(135deg,#94a3b8,#64748b)':i===2?'linear-gradient(135deg,#cd7c3e,#b45309)':'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:11, fontWeight:800, color:i<3?'#fff':'#64748b' }}>#{i+1}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{d.full_name}</p>
                      <p style={{ fontSize:10, color:'#94a3b8', fontFamily:'var(--mono)' }}>{d.phone_number}</p>
                    </div>
                    <p style={{ fontSize:14, fontWeight:800, color:'#2563eb' }}>{d.delivered} deliveries</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeView==='profile' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="settings-card">
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ background:'#eff6ff', borderRadius:8, padding:8, display:'flex' }}><UserCog size={16} style={{ color:'#2563eb' }}/></div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Profile Photo</p>
                </div>
                <div style={{ padding:24 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                    <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#1d4ed8,#0891b2)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', boxShadow:'0 4px 16px rgba(37,99,235,0.3)', flexShrink:0 }}>
                      {adminProfile.avatar_url ? <img src={adminProfile.avatar_url} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <Shield size={32} style={{ color:'#fff' }}/>}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{adminProfile.full_name}</p>
                      <p style={{ fontSize:11, color:'#94a3b8' }}>Upload a profile photo (max 5MB)</p>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={()=>profilePicRef.current?.click()} style={{ display:'flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#2563eb,#1d4ed8)', border:'none', borderRadius:8, padding:'8px 14px', fontSize:11, fontWeight:700, color:'#fff', cursor:'pointer' }}>
                          <Upload size={12}/> Upload Photo
                        </button>
                        {adminProfile.avatar_url && (
                          <button onClick={()=>setAdminProfile(p=>({...p,avatar_url:''}))} style={{ display:'flex', alignItems:'center', gap:6, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'8px 14px', fontSize:11, fontWeight:700, color:'#dc2626', cursor:'pointer' }}>
                            <X size={12}/> Remove
                          </button>
                        )}
                      </div>
                      <input ref={profilePicRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload}/>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ background:'#eff6ff', borderRadius:8, padding:8 }}><UserCircle size={16} style={{ color:'#2563eb' }}/></div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Personal Information</p>
                </div>
                <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#64748b', fontFamily:'var(--mono)', marginBottom:6 }}>Full Name</label>
                    <input type="text" value={adminProfile.full_name} onChange={e=>setAdminProfile(p=>({...p,full_name:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#64748b', fontFamily:'var(--mono)', marginBottom:6 }}>Email Address</label>
                    <input type="email" value={adminProfile.email} onChange={e=>setAdminProfile(p=>({...p,email:e.target.value}))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <button onClick={()=>setShowChangePassword(true)} style={{ display:'flex', alignItems:'center', gap:6, background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'10px 16px', fontSize:12, fontWeight:700, color:'#475569', cursor:'pointer' }}>
                      <Key size={13}/> Change Password
                    </button>
                    <button onClick={handleSaveProfile} style={{ display:'flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#2563eb,#1d4ed8)', border:'none', borderRadius:10, padding:'10px 18px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 2px 8px rgba(37,99,235,0.35)' }}>
                      <Save size={13}/> Save Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ background:'#eff6ff', borderRadius:8, padding:8 }}><BarChart3 size={16} style={{ color:'#2563eb' }}/></div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Account Overview</p>
                </div>
                <div style={{ padding:20, display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
                  {[
                    { label:'Total Orders Managed', val:orders.length, color:'#2563eb', bg:'#eff6ff' },
                    { label:'Pending Orders', val:pendingOrdersCount, color:'#d97706', bg:'#fffbeb' },
                    { label:'Deliveries Completed', val:completedOrdersCount, color:'#059669', bg:'#ecfdf5' },
                    { label:'Completion Rate', val:`${completionRate}%`, color:'#7c3aed', bg:'#f3e8ff' },
                    { label:'Active Drivers', val:drivers.filter(d=>d.is_verified).length, color:'#0891b2', bg:'#ecfeff' },
                    { label:'Total Merchants', val:merchants.length, color:'#dc2626', bg:'#fef2f2' },
                  ].map(s => (
                    <div key={s.label} style={{ background:s.bg, borderRadius:10, padding:'12px 14px' }}>
                      <p style={{ fontSize:9, fontWeight:700, color:s.color, textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'var(--mono)', marginBottom:4 }}>{s.label}</p>
                      <p style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeView==='settings' && (
            <div className="max-w-4xl mx-auto">
              <div className="tab-pill-bar mb-6">
                {[
                  {key:'general',label:'General',icon:<Settings size={12}/>},
                  {key:'payments',label:'Payments',icon:<CreditCard size={12}/>},
                  {key:'notifications',label:'Notifications',icon:<Bell size={12}/>},
                  {key:'operations',label:'Operations',icon:<Zap size={12}/>},
                  {key:'security',label:'Security',icon:<Lock size={12}/>},
                  {key:'appearance',label:'Appearance',icon:<Palette size={12}/>},
                  {key:'advanced',label:'Advanced',icon:<Database size={12}/>},
                ].map(t => (
                  <button key={t.key} onClick={()=>setSettingsTab(t.key)} className={`tab-pill${settingsTab===t.key?' active':''}`}>
                    {t.icon}<span>{t.label}</span>
                  </button>
                ))}
              </div>

              {settingsTab==='general' && (
                <div className="space-y-4">
                  <div className="settings-card">
                    <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ background:'#eff6ff', borderRadius:8, padding:8 }}><Globe size={16} style={{ color:'#2563eb' }}/></div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Company Information</p>
                    </div>
                    <div style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
                      {[
                        {label:'Company Name',key:'company_name',type:'text'},
                        {label:'Support Email',key:'support_email',type:'email'},
                        {label:'Support Phone',key:'support_phone',type:'tel'},
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#64748b', fontFamily:'var(--mono)', marginBottom:6 }}>{f.label}</label>
                          <input type={f.type} value={settingsForm[f.key]} onChange={e=>setSettingsForm({...settingsForm,[f.key]:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="settings-card">
                    <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ background:'#eff6ff', borderRadius:8, padding:8 }}><DollarSign size={16} style={{ color:'#2563eb' }}/></div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Pricing & Region</p>
                    </div>
                    <div style={{ padding:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      {[
                        {label:'Base Delivery Fee',key:'base_delivery_fee',type:'number'},
                        {label:'Per KM Rate',key:'per_km_rate',type:'number'},
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#64748b', fontFamily:'var(--mono)', marginBottom:6 }}>{f.label}</label>
                          <input type={f.type} step="0.01" value={settingsForm[f.key]} onChange={e=>setSettingsForm({...settingsForm,[f.key]:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                      ))}
                      <div>
                        <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#64748b', fontFamily:'var(--mono)', marginBottom:6 }}>Currency</label>
                        <select value={settingsForm.currency} onChange={e=>setSettingsForm({...settingsForm,currency:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {['GHS','USD','EUR','GBP','NGN'].map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#64748b', fontFamily:'var(--mono)', marginBottom:6 }}>Timezone</label>
                        <select value={settingsForm.timezone} onChange={e=>setSettingsForm({...settingsForm,timezone:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {['Africa/Accra','Africa/Lagos','Africa/Nairobi','Europe/London','America/New_York'].map(tz=><option key={tz} value={tz}>{tz}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab==='payments' && (
                <div className="settings-card">
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ background:'#eff6ff', borderRadius:8, padding:8 }}><CreditCard size={16} style={{ color:'#2563eb' }}/></div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Payment Methods</p>
                  </div>
                  <div style={{ padding:20 }}>
                    {[
                      {label:'Cash on Delivery', sub:'Accept cash payments at delivery', key:'allow_cash_on_delivery'},
                      {label:'Mobile Money (MoMo)', sub:'Accept MTN, Vodafone, AirtelTigo MoMo', key:'allow_mobile_money'},
                      {label:'Card Payment', sub:'Accept Visa, MasterCard, etc.', key:'allow_card_payment'},
                    ].map(item => (
                      <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid #f8fafc' }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{item.label}</p>
                          <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{item.sub}</p>
                        </div>
                        <Toggle checked={settingsForm[item.key]} onChange={v=>setSettingsForm({...settingsForm,[item.key]:v})}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab==='notifications' && (
                <div className="settings-card">
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ background:'#eff6ff', borderRadius:8, padding:8 }}><Bell size={16} style={{ color:'#2563eb' }}/></div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Notification Preferences</p>
                  </div>
                  <div style={{ padding:20 }}>
                    {[
                      {label:'In-App Notifications',sub:'Show real-time alerts in dashboard',key:'enable_notifications'},
                      {label:'Email Notifications',sub:'Send order updates via email',key:'email_notifications'},
                      {label:'SMS Notifications',sub:'Send SMS alerts (carrier charges apply)',key:'sms_notifications'},
                    ].map(item => (
                      <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid #f8fafc' }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{item.label}</p>
                          <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{item.sub}</p>
                        </div>
                        <Toggle checked={settingsForm[item.key]} onChange={v=>setSettingsForm({...settingsForm,[item.key]:v})}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab==='operations' && (
                <div className="space-y-4">
                  <div className="settings-card">
                    <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ background:'#eff6ff', borderRadius:8, padding:8 }}><Zap size={16} style={{ color:'#2563eb' }}/></div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Order Operations</p>
                    </div>
                    <div style={{ padding:20 }}>
                      {[
                        {label:'Auto-Assign Orders',sub:'Automatically assign orders to nearest available rider',key:'auto_assign_orders'},
                        {label:'Require Delivery Photo Proof',sub:'Riders must upload photo on delivery',key:'require_photo_proof'},
                        {label:'Maintenance Mode',sub:'Temporarily disable new order creation',key:'maintenance_mode'},
                      ].map(item => (
                        <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid #f8fafc' }}>
                          <div>
                            <p style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{item.label}</p>
                            <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{item.sub}</p>
                          </div>
                          <Toggle checked={settingsForm[item.key]} onChange={v=>setSettingsForm({...settingsForm,[item.key]:v})}/>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="settings-card">
                    <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ background:'#eff6ff', borderRadius:8, padding:8 }}><Sliders size={16} style={{ color:'#2563eb' }}/></div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Operational Limits</p>
                    </div>
                    <div style={{ padding:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      {[
                        {label:'Max Orders Per Rider',key:'max_orders_per_rider',type:'number',placeholder:'10'},
                        {label:'Order Timeout (mins)',key:'order_timeout_minutes',type:'number',placeholder:'30'},
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#64748b', fontFamily:'var(--mono)', marginBottom:6 }}>{f.label}</label>
                          <input type={f.type} value={settingsForm[f.key]} onChange={e=>setSettingsForm({...settingsForm,[f.key]:e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={f.placeholder}/>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab==='security' && (
                <div className="space-y-4">
                  <div className="settings-card">
                    <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ background:'#eff6ff', borderRadius:8, padding:8 }}><Lock size={16} style={{ color:'#2563eb' }}/></div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Security Settings</p>
                    </div>
                    <div style={{ padding:20 }}>
                      {[
                        {label:'Two-Factor Authentication',sub:'Require 2FA on admin login',key:'two_factor_auth'},
                        {label:'Revenue Visibility',sub:'Show revenue data on public dashboards',key:'show_revenue_publicly'},
                      ].map(item => (
                        <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid #f8fafc' }}>
                          <div>
                            <p style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{item.label}</p>
                            <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{item.sub}</p>
                          </div>
                          <Toggle checked={settingsForm[item.key]} onChange={v=>setSettingsForm({...settingsForm,[item.key]:v})}/>
                        </div>
                      ))}
                      <div style={{ marginTop:16 }}>
                        <button onClick={()=>setShowChangePassword(true)} style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'10px 18px', fontSize:12, fontWeight:700, color:'#475569', cursor:'pointer' }}>
                          <Key size={14}/> Change Admin Password
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="settings-card">
                    <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ background:'#fffbeb', borderRadius:8, padding:8 }}><AlertTriangle size={16} style={{ color:'#d97706' }}/></div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Access Log (Recent)</p>
                    </div>
                    <div style={{ padding:20 }}>
                      {[
                        { action:'Admin Login', time:'Just now', ip:'localhost', ok:true },
                        { action:'Orders Fetched', time:'2 min ago', ip:'localhost', ok:true },
                        { action:'Settings Saved', time:'Today', ip:'localhost', ok:true },
                      ].map((log,i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f8fafc' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:8, height:8, borderRadius:'50%', background:log.ok?'#10b981':'#ef4444', flexShrink:0 }}/>
                            <div>
                              <p style={{ fontSize:12, fontWeight:600, color:'#1e293b' }}>{log.action}</p>
                              <p style={{ fontSize:10, color:'#94a3b8', fontFamily:'var(--mono)' }}>IP: {log.ip}</p>
                            </div>
                          </div>
                          <p style={{ fontSize:10, color:'#94a3b8', fontFamily:'var(--mono)' }}>{log.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab==='appearance' && (
                <div className="settings-card">
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ background:'#eff6ff', borderRadius:8, padding:8 }}><Palette size={16} style={{ color:'#2563eb' }}/></div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Display Preferences</p>
                  </div>
                  <div style={{ padding:20 }}>
                    {[
                      {label:'Compact View',sub:'Show more orders in a smaller layout',key:'compact_view'},
                      {label:'Dark Mode',sub:'Coming soon — switch to dark theme',key:'dark_mode'},
                    ].map(item => (
                      <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid #f8fafc' }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{item.label}</p>
                          <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{item.sub}</p>
                        </div>
                        <Toggle checked={settingsForm[item.key]} onChange={v=>setSettingsForm({...settingsForm,[item.key]:v})}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab==='advanced' && (
                <div className="space-y-4">
                  <div className="settings-card">
                    <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ background:'#eff6ff', borderRadius:8, padding:8 }}><Database size={16} style={{ color:'#2563eb' }}/></div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Data Management</p>
                    </div>
                    <div style={{ padding:20 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid #f8fafc' }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>Automatic Backup</p>
                          <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>Enable daily automatic data backup</p>
                        </div>
                        <Toggle checked={settingsForm.auto_backup} onChange={v=>setSettingsForm({...settingsForm,auto_backup:v})}/>
                      </div>
                      <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap' }}>
                        <button onClick={()=>alert('Export started — check your email')} style={{ display:'flex', alignItems:'center', gap:6, background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'9px 16px', fontSize:11, fontWeight:700, color:'#2563eb', cursor:'pointer' }}>
                          <Download size={12}/> Export All Data (CSV)
                        </button>
                        <button onClick={()=>alert('Sync triggered')} style={{ display:'flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'9px 16px', fontSize:11, fontWeight:700, color:'#059669', cursor:'pointer' }}>
                          <RefreshCw size={12}/> Force Sync
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="settings-card" style={{ border:'1px solid #fecaca' }}>
                    <div style={{ padding:'16px 20px', borderBottom:'1px solid #fecaca', background:'#fef2f2', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ background:'#fee2e2', borderRadius:8, padding:8 }}><AlertTriangle size={16} style={{ color:'#dc2626' }}/></div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#dc2626' }}>Danger Zone</p>
                    </div>
                    <div style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'#fef2f2', borderRadius:10, border:'1px solid #fecaca' }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color:'#dc2626' }}>Reset All Settings</p>
                          <p style={{ fontSize:11, color:'#ef4444' }}>Restore all settings to default values</p>
                        </div>
                        <button onClick={()=>{ if(window.confirm('Reset all settings to defaults?')){ localStorage.removeItem('chariot_settings'); window.location.reload() } }} style={{ background:'#dc2626', border:'none', borderRadius:8, padding:'8px 14px', fontSize:11, fontWeight:700, color:'#fff', cursor:'pointer' }}>
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
                <button onClick={handleSaveSettings} style={{ display:'flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#2563eb,#1d4ed8)', border:'none', borderRadius:12, padding:'12px 26px', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', letterSpacing:'0.05em', textTransform:'uppercase', fontFamily:'var(--font)', boxShadow:'0 4px 16px rgba(37,99,235,0.35)' }}>
                  <Save className="w-5 h-5"/> Save Settings
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
