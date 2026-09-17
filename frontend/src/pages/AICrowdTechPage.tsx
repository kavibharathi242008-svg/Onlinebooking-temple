import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BrainCircuit, Cpu, Camera, Eye, Layers, BarChart3, Clock, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const AICrowdTechPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold">
            <BrainCircuit className="w-4 h-4 text-amber-600" />
            <span>AI Architecture & Technical Methodology</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How Artificial Intelligence Powers Smart Dharisanam Management
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Our multi-modal AI stack combines Computer Vision (YOLOv8 Head Detection), Time-Series Demand Forecasting, and Dynamic Queue Scheduling to prevent stampedes and ensure seamless pilgrim flow.
          </p>
        </div>

        {/* 3 Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-amber-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">1. Vision-Based Density</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              CCTV streams run lightweight neural networks that track real-time pedestrian density without storing PII or facial biometric markers.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Head & torso bounding box inference</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 10-15 FPS edge processing</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Heatmap congestion mapping</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-amber-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">2. Little’s Law Queue Model</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Queue wait times are calculated dynamically using stochastic queueing theory: <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-bold">W = L / λ</code> adjusted for sanctum throughput.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Inflow rate monitoring (people/min)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Sanctum Dharisanam transit velocity</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Real-time bottleneck alert triggers</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-amber-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">3. Dynamic Slot Auto-Tuning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When peak spikes occur, the AI engine proposes compensatory slot adjustments to temple administrators for human-in-the-loop review.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Weekend & festival demand scaling</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Admin approval workflow</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Prevents hazardous overcrowding</li>
            </ul>
          </div>
        </div>

        {/* Technical Pipeline Flowchart */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            End-to-End Processing Pipeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-amber-800 bg-amber-100 py-1 px-2 rounded-full inline-block">STAGE 1</div>
              <p className="font-extrabold text-sm text-slate-800">CCTV Ingestion</p>
              <p className="text-[11px] text-slate-500">RTSP camera feed captured at high-density choke points (Rajagopuram, Deepa Mandapam).</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-blue-800 bg-blue-100 py-1 px-2 rounded-full inline-block">STAGE 2</div>
              <p className="font-extrabold text-sm text-slate-800">Density Estimation</p>
              <p className="text-[11px] text-slate-500">YOLO deep network generates bounding boxes and coordinates for crowd counting.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-purple-800 bg-purple-100 py-1 px-2 rounded-full inline-block">STAGE 3</div>
              <p className="font-extrabold text-sm text-slate-800">Queue Metrics</p>
              <p className="text-[11px] text-slate-500">Wait times and throughput metrics recalculated continuously and pushed via REST.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-emerald-800 bg-emerald-100 py-1 px-2 rounded-full inline-block">STAGE 4</div>
              <p className="font-extrabold text-sm text-slate-800">Slot Level Balancing</p>
              <p className="text-[11px] text-slate-500">Online pilgrims are nudged towards non-peak slots with transparent green badges.</p>
            </div>
          </div>
        </div>

        {/* Python Architecture Snippet */}
        <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 sm:p-8 font-mono text-xs shadow-xl space-y-4">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-3">
            <span className="flex items-center gap-2 font-bold text-amber-400">
              <Cpu className="w-4 h-4" /> edge_crowd_inference.py
            </span>
            <span className="text-[11px]">YOLOv8 + Little's Law Simulation Core</span>
          </div>

          <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
{`import cv2
import numpy as np
from ultralytics import YOLO

class TempleCrowdAnalyzer:
    def __init__(self, weights_path="yolov8n.pt", max_safe_capacity=500):
        self.model = YOLO(weights_path)
        self.max_safe_capacity = max_safe_capacity
        self.transit_rate_per_min = 18.5  # average pilgrims cleared through sanctum

    def process_frame(self, frame):
        results = self.model(frame, classes=[0], verbose=False) # class 0: person
        boxes = results[0].boxes.xyxy.cpu().numpy()
        count = len(boxes)
        
        occupancy_ratio = (count / self.max_safe_capacity) * 100
        # Wait time via Little's Law: W = L / lambda
        est_wait_minutes = round(count / self.transit_rate_per_min)

        level = "LOW"
        if occupancy_ratio > 90: level = "VERY HIGH"
        elif occupancy_ratio > 70: level = "HIGH"
        elif occupancy_ratio > 40: level = "MEDIUM"

        return {
            "head_count": count,
            "occupancy_percent": round(occupancy_ratio, 1),
            "crowd_level": level,
            "est_wait_minutes": est_wait_minutes
        }`}
          </pre>
        </div>
      </div>
    </div>
  );
};
