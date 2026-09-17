import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';
import {
  Landmark, Users, CalendarCheck, Ticket, Wifi, WifiOff,
  CheckCircle2, AlertCircle, TrendingUp, Clock, BrainCircuit,
  Loader2, ChevronDown, ChevronUp, RefreshCw, ShieldCheck
} from 'lucide-react';

const COLORS = ['#f59e0b', '#d97706', '#10b981', '#6366f1', '#ef4444'];

export const AdminDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [dashData, setDashData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [specialDays, setSpecialDays] = useState<any[]>([]);
  const [temples, setTemples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTempleForRec, setSelectedTempleForRec] = useState('temple-palani');
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'ai' | 'festivals' | 'support'>('overview');
  const [supportInfo, setSupportInfo] = useState<any>(null);
  const [supportForm, setSupportForm] = useState({ helpline_phone: '', toll_free: '', email: '', support_hours: '', emergency_phone: '' });
  const [supportSaved, setSupportSaved] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const loadDashboard = () => {
    setLoading(true);
    Promise.all([
      api.getAdminDashboard(),
      api.getAllBookings(),
      api.getSpecialDays(),
      api.getTemples(),
      api.getSupportInfo()
    ]).then(([dash, bk, sd, tmp, sup]) => {
      setDashData(dash);
      setBookings(bk);
      setSpecialDays(sd);
      setTemples(tmp);
      setSupportInfo(sup);
      setSupportForm({
        helpline_phone: sup?.helpline_phone || '',
        toll_free: sup?.toll_free || '',
        email: sup?.email || '',
        support_hours: sup?.support_hours || '',
        emergency_phone: sup?.emergency_phone || ''
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadDashboard(); }, []);

  const loadRecommendations = (templeId: string) => {
    setLoadingRecs(true);
    api.getAIRecommendations(templeId, today).then(data => {
      setRecommendations(data);
      setLoadingRecs(false);
    }).catch(() => setLoadingRecs(false));
  };

  useEffect(() => {
    if (activeTab === 'ai') loadRecommendations(selectedTempleForRec);
  }, [activeTab, selectedTempleForRec]);

  const handleApprove = async (rec: any) => {
    setApprovingId(rec.id);
    try {
      await api.approveRecommendation(rec.id);
      setRecommendations(prev => prev.map(r => r.id === rec.id ? { ...r, status: 'APPROVED' } : r));
    } catch (e) {}
    setApprovingId(null);
  };

  const handleReject = async (rec: any) => {
    setRejectingId(rec.id);
    try {
      await api.rejectRecommendation(rec.id);
      setRecommendations(prev => prev.map(r => r.id === rec.id ? { ...r, status: 'REJECTED' } : r));
    } catch (e) {}
    setRejectingId(null);
  };

  const handleSupportSave = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportForm)
      });
      if (res.ok) { setSupportSaved(true); setTimeout(() => setSupportSaved(false), 2500); }
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
          <p className="text-slate-600 font-semibold">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const kpis = dashData?.kpis;
  const hourlyData = dashData?.hourly_visitors || [];
  const templeDistribution = dashData?.temple_distribution || [];

  const KPICard = ({ icon: Icon, label, value, sub, color }: any) => (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-900">{value?.toLocaleString() ?? '—'}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-amber-600" />
              Admin Portal
            </h1>
            <p className="text-sm text-slate-500">AI Temple Dharisanam & Crowd Management System</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-full">
              <Wifi className="w-3.5 h-3.5" /> Backend Connected
            </span>
            <button onClick={loadDashboard} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
          {[
            { key: 'overview', label: 'Overview & Analytics', icon: TrendingUp },
            { key: 'bookings', label: 'All Bookings', icon: Ticket },
            { key: 'ai', label: 'AI Recommendations', icon: BrainCircuit },
            { key: 'festivals', label: 'Festival Days', icon: CalendarCheck },
            { key: 'support', label: 'Helpline Settings', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB: OVERVIEW ── */}
        {activeTab === 'overview' && kpis && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <KPICard icon={Landmark} label="Temples" value={kpis.total_temples} color="bg-amber-500" />
              <KPICard icon={Ticket} label="Confirmed Bookings" value={kpis.total_bookings} color="bg-blue-500" />
              <KPICard icon={Users} label="Total Pilgrims" value={kpis.total_visitors} color="bg-indigo-500" />
              <KPICard icon={CheckCircle2} label="Free Dharisanam" value={kpis.free_bookings} sub="Bookings" color="bg-emerald-500" />
              <KPICard icon={TrendingUp} label="Paid Dharisanam" value={kpis.paid_bookings} sub="Bookings" color="bg-amber-600" />
              <KPICard icon={Clock} label="Avg. Wait Time" value={`${kpis.avg_wait_minutes}m`} sub="Across all temples" color="bg-slate-500" />
            </div>

            {/* Sub KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-green-700">{kpis.online_bookings}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Online Bookings</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-purple-700">{kpis.offline_bookings}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Offline Counter</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-emerald-700">{kpis.slots_summary?.available}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Available Slots</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-red-600">{kpis.slots_summary?.full}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Full Slots</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Hourly Visitors Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Pilgrim Distribution by Hour</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(val, name) => [val, name === 'visitors' ? 'Visitors' : 'Capacity']}
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    />
                    <Bar dataKey="capacity" fill="#fef3c7" name="capacity" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="visitors" fill="#f59e0b" name="visitors" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Wait Time Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Estimated Wait Time by Hour (mins)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="waitMinutes" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} name="Wait (mins)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Temple Distribution Chart */}
              {templeDistribution.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 lg:col-span-2">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Bookings by Temple</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={templeDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={180} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="bookings" fill="#f59e0b" name="Bookings" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: BOOKINGS ── */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">All Bookings ({bookings.length})</h3>
              <div className="flex gap-2 text-xs">
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold border border-green-300">
                  Online: {bookings.filter(b => b.channel === 'ONLINE').length}
                </span>
                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold border border-purple-300">
                  Counter: {bookings.filter(b => b.channel === 'OFFLINE_COUNTER').length}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-3 font-bold text-slate-600">Booking Ref</th>
                    <th className="text-left p-3 font-bold text-slate-600">Temple</th>
                    <th className="text-left p-3 font-bold text-slate-600">Devotee</th>
                    <th className="text-left p-3 font-bold text-slate-600">Date & Slot</th>
                    <th className="text-left p-3 font-bold text-slate-600">Type</th>
                    <th className="text-left p-3 font-bold text-slate-600">Channel</th>
                    <th className="text-left p-3 font-bold text-slate-600">Pilgrims</th>
                    <th className="text-left p-3 font-bold text-slate-600">Amount</th>
                    <th className="text-left p-3 font-bold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.slice(0, 50).map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-800">{b.booking_ref}</td>
                      <td className="p-3 text-slate-700 max-w-[140px] truncate">{b.temple_name}</td>
                      <td className="p-3 text-slate-700">{b.primary_visitor_name}</td>
                      <td className="p-3 text-slate-600">{b.slot_date} {b.start_time}–{b.end_time}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${
                          b.darshan_type === 'PAID'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {b.darshan_type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${
                          b.channel === 'OFFLINE_COUNTER'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}>
                          {b.channel === 'OFFLINE_COUNTER' ? 'COUNTER' : 'ONLINE'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{b.total_visitors}</td>
                      <td className="p-3 font-bold text-slate-800">₹{b.amount_paid}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${
                          b.booking_status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : b.booking_status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}>
                          {b.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">No bookings found.</div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: AI RECOMMENDATIONS ── */}
        {activeTab === 'ai' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800">AI Slot Capacity Recommendations</h3>
                <p className="text-xs text-slate-500">Review AI-generated capacity adjustments. Approve or reject each recommendation below.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTempleForRec}
                  onChange={e => setSelectedTempleForRec(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  {temples.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => loadRecommendations(selectedTempleForRec)}
                  className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {loadingRecs ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
            ) : (
              <div className="space-y-3">
                {recommendations.map(rec => (
                  <div
                    key={rec.id}
                    className={`bg-white rounded-2xl border shadow-sm p-5 ${
                      rec.status === 'APPROVED' ? 'border-emerald-300 bg-emerald-50/30' :
                      rec.status === 'REJECTED' ? 'border-slate-200 opacity-60' :
                      'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {rec.time_range}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            rec.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            rec.status === 'REJECTED' ? 'bg-slate-100 text-slate-600 border-slate-300' :
                            'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 font-semibold">{rec.recommendation_text}</p>
                        <p className="text-xs text-slate-500 mt-1">{rec.reasoning}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                          <span>Current Bookings: <strong className="text-slate-800">{rec.current_demand}</strong></span>
                          <span>Predicted Demand: <strong className="text-slate-800">{rec.predicted_demand}</strong></span>
                          <span>Recommended Capacity: <strong className="text-amber-700">{rec.recommended_capacity}</strong></span>
                        </div>
                      </div>
                      {rec.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReject(rec)}
                            disabled={rejectingId === rec.id}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                          >
                            {rejectingId === rec.id ? '...' : t.rejectRec}
                          </button>
                          <button
                            onClick={() => handleApprove(rec)}
                            disabled={approvingId === rec.id}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {approvingId === rec.id ? <><Loader2 className="w-3 h-3 animate-spin" /> Applying...</> : <><CheckCircle2 className="w-3 h-3" /> {t.approveRec}</>}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: FESTIVAL DAYS ── */}
        {activeTab === 'festivals' && (
          <div className="space-y-5">
            <h3 className="font-bold text-slate-800">Special Festival & Event Days</h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-3 font-bold text-slate-600">Date</th>
                    <th className="text-left p-3 font-bold text-slate-600">Event Name</th>
                    <th className="text-left p-3 font-bold text-slate-600">Temple</th>
                    <th className="text-left p-3 font-bold text-slate-600">Expected Crowd</th>
                    <th className="text-left p-3 font-bold text-slate-600">Capacity Modifier</th>
                    <th className="text-left p-3 font-bold text-slate-600">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {specialDays.map((sd, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-800 font-semibold">{sd.date}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{sd.event_name}</p>
                        <p className="text-slate-500">{sd.event_name_tamil}</p>
                      </td>
                      <td className="p-3 text-slate-700 truncate max-w-[150px]">{sd.temple_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                          sd.expected_crowd_level === 'VERY HIGH' ? 'bg-red-100 text-red-800 border-red-300' :
                          sd.expected_crowd_level === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {sd.expected_crowd_level}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-amber-700">×{sd.slot_capacity_modifier}</td>
                      <td className="p-3 text-slate-600 max-w-[200px]">{sd.booking_notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {specialDays.length === 0 && (
                <p className="text-center py-10 text-slate-400 text-sm">No special festival days configured yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: SUPPORT SETTINGS ── */}
        {activeTab === 'support' && (
          <div className="max-w-xl space-y-5">
            <h3 className="font-bold text-slate-800">Pilgrim Helpline Configuration</h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              {[
                { key: 'helpline_phone', label: 'Helpline Phone Number', placeholder: '+91 44 2833 9999' },
                { key: 'toll_free', label: 'Toll-Free Number', placeholder: '1800-425-4555' },
                { key: 'email', label: 'Support Email', placeholder: 'support@temple.tn.gov.in' },
                { key: 'support_hours', label: 'Support Hours', placeholder: '05:00 AM – 10:00 PM (All 7 Days)' },
                { key: 'emergency_phone', label: 'Emergency Medical Contact', placeholder: '+91 94440 12345' }
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={(supportForm as any)[field.key]}
                    onChange={e => setSupportForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              ))}
              <button
                onClick={handleSupportSave}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {supportSaved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : 'Save Helpline Settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
