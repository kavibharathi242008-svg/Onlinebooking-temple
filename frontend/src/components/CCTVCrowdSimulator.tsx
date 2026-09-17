import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';
import { Video, Users, Clock, AlertTriangle, ShieldCheck, Eye, RefreshCw, Cpu, Layers } from 'lucide-react';

export const CCTVCrowdSimulator: React.FC<{ templeId?: string }> = ({ templeId = 'temple-palani' }) => {
  const { t, language } = useLanguage();
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCam, setSelectedCam] = useState<string>('cam-prakaram');
  const [telemetry, setTelemetry] = useState<any>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showDetections, setShowDetections] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'architecture'>('feed');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch cameras list
  useEffect(() => {
    api.getCameras().then(data => setCameras(data)).catch(console.error);
  }, []);

  // Poll live telemetry periodically
  useEffect(() => {
    const fetchTelemetry = () => {
      api.getLiveCrowd(templeId, selectedCam)
        .then(data => setTelemetry(data))
        .catch(console.error);
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3500);
    return () => clearInterval(interval);
  }, [templeId, selectedCam]);

  // Render animated canvas simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !telemetry) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background simulated queue hallway
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw perspective queue railings
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1.5;
      for (let y = 100; y < canvas.height; y += 70) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(canvas.width - 30, y);
        ctx.stroke();
      }

      // Draw simulated heatmap if enabled
      if (showHeatmap) {
        const heatGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 40, canvas.width / 2, canvas.height / 2, 280);
        heatGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        heatGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.35)');
        heatGrad.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
        ctx.fillStyle = heatGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw detection bounding boxes
      if (showDetections && telemetry.simulated_detections) {
        telemetry.simulated_detections.forEach((det: any) => {
          // Subtle movement jitter
          const jx = Math.sin(Date.now() / 800 + det.id) * 3;
          const jy = Math.cos(Date.now() / 800 + det.id) * 2;
          const x = det.x + jx;
          const y = det.y + jy;

          // Box
          ctx.strokeStyle = '#10b981'; // Green detection border
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, det.w, det.h);

          // Header tag
          ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
          ctx.fillRect(x, y - 18, det.w + 14, 18);

          ctx.fillStyle = '#ffffff';
          ctx.font = '10px monospace';
          ctx.fillText(`person ${det.confidence}`, x + 3, y - 5);

          // Head landmark dot
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(x + det.w / 2, y + 14, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Live CCTV HUD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(12, 12, 280, 52);

      // Red blinking recording dot
      const isBlink = Math.floor(Date.now() / 600) % 2 === 0;
      ctx.fillStyle = isBlink ? '#ef4444' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(28, 28, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`LIVE AI FEED • ${telemetry.camera_id?.toUpperCase()}`, 42, 32);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`${new Date().toISOString()} | FPS: 29.8`, 24, 52);

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [telemetry, showHeatmap, showDetections]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 my-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-300">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>LIVE AI CROWD VISION</span>
            </span>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
              YOLOv8 Real-time Inference
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {t.cctvTitle}
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            {t.cctvSubtitle}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'feed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-amber-600" />
            <span>Camera Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'architecture'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Architecture</span>
          </button>
        </div>
      </div>

      {activeTab === 'feed' && (
        <div className="mt-5 space-y-6">
          {/* Camera Selector Buttons */}
          <div className="flex flex-wrap gap-2">
            {cameras.map(cam => (
              <button
                key={cam.id}
                onClick={() => setSelectedCam(cam.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                  selectedCam === cam.id
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{cam.name}</span>
              </button>
            ))}
          </div>

          {/* Main Visual Simulator Screen */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl">
            <canvas
              ref={canvasRef}
              width={760}
              height={400}
              className="w-full h-[320px] sm:h-[400px] object-cover block"
            />

            {/* Video Canvas Controls Overlay */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs text-white">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showDetections}
                  onChange={e => setShowDetections(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>YOLO Boxes</span>
              </label>
              <span className="text-slate-500">|</span>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={e => setShowHeatmap(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Density Heatmap</span>
              </label>
            </div>
          </div>

          {/* Telemetry Metrics Cards */}
          {telemetry && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Count */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Current Crowd</span>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {telemetry.current_count} <span className="text-xs font-normal text-slate-500">/ {telemetry.max_safe_capacity}</span>
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      telemetry.occupancy_percent > 85 ? 'bg-red-500' : telemetry.occupancy_percent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, telemetry.occupancy_percent)}%` }}
                  />
                </div>
              </div>

              {/* Metric 2: Occupancy */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Occupancy</span>
                  <Layers className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {telemetry.occupancy_percent}%
                </p>
                <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                  Safe Threshold: 90%
                </p>
              </div>

              {/* Metric 3: Crowd Level */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Crowd Level</span>
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                    telemetry.crowd_level === 'VERY HIGH'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : telemetry.crowd_level === 'HIGH'
                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                      : telemetry.crowd_level === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {telemetry.crowd_level}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Dynamic classification</p>
              </div>

              {/* Metric 4: Estimated Waiting Time */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Estimated Wait</span>
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-black text-amber-900">
                  ~{telemetry.estimated_waiting_time_mins} <span className="text-xs font-normal text-slate-500">mins</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Flow: 12 pilgrims/min
                </p>
              </div>
            </div>
          )}

          {/* AI Automated Recommended Action Banner */}
          {telemetry && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  AI Dynamic Crowd Recommendation:
                </h4>
                <p className="text-sm font-semibold text-amber-900 mt-0.5">
                  "{telemetry.recommended_action}"
                </p>
                <p className="text-[11px] text-amber-800/80 mt-1">
                  Action forwarded to Temple Administration Dashboard for slot capacity rebalancing.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="mt-5 space-y-6 text-slate-700 text-xs leading-relaxed">
          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              YOLOv8 Computer Vision Pipeline Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-amber-400 font-bold block mb-1">Step 1</span>
                <p className="font-semibold text-white">RTSP CCTV Feed</p>
                <p className="text-[10px] text-slate-400">1080p 30fps IP Camera</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-amber-400 font-bold block mb-1">Step 2</span>
                <p className="font-semibold text-white">Frame Sampling</p>
                <p className="text-[10px] text-slate-400">640x640 preprocessing</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-amber-400 font-bold block mb-1">Step 3</span>
                <p className="font-semibold text-white">YOLOv8 Detection</p>
                <p className="text-[10px] text-slate-400">Class 0: Person inference</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-amber-400 font-bold block mb-1">Step 4</span>
                <p className="font-semibold text-white">DeepSORT Tracker</p>
                <p className="text-[10px] text-slate-400">Unique pilgrim ID & flow</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-amber-400 font-bold block mb-1">Step 5</span>
                <p className="font-semibold text-white">Slot Optimizer</p>
                <p className="text-[10px] text-slate-400">Adaptive slot capacity</p>
              </div>
            </div>
          </div>

          {/* Python Code Snippet for Project Presentation */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-700">
            <div className="text-slate-400 mb-2">// Python Production Integration with Ultralytics YOLOv8</div>
            <pre className="text-emerald-400">{`from ultralytics import YOLO
import cv2, requests

model = YOLO("yolov8n.pt") # Lightweight edge model
cap = cv2.VideoCapture("rtsp://temple_entrance_cam_01/stream")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret: break
    
    # Run person detection
    results = model(frame, classes=[0]) # 0 is person class in COCO
    person_count = len(results[0].boxes)
    
    # Transmit live telemetry to Dharisanam Management API
    requests.post("http://localhost:5000/api/crowd/live", json={
        "temple_id": "temple-palani",
        "camera_id": "cam-prakaram",
        "detected_count": person_count
    })`}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
