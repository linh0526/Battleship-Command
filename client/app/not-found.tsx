'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Compass, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6 overflow-hidden z-[200]">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Radar Pulse Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20">
        <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping"></div>
        <div className="absolute inset-12 border border-primary/50 rounded-full animate-pulse"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-error/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-error" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-bounce">
                <Compass className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-7xl font-black text-white mb-4 tracking-tighter">
              404
            </h1>
            <h2 className="text-2xl font-black text-slate-400 uppercase tracking-wider mb-2">
              Khu Vực Không Xác Định
            </h2>
            <p className="text-slate-500 font-medium">
              Tọa độ bạn đang tìm kiếm không tồn tại trong hệ thống.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8"></div>

          {/* Error Details */}
          <div className="bg-slate-950/50 rounded-xl p-6 mb-8 border border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-error mt-2 animate-pulse"></div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">
                  Thông Báo Hệ Thống
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Đường dẫn bạn truy cập không hợp lệ hoặc đã bị di chuyển. Vui lòng kiểm tra lại URL hoặc quay về trang chủ để tiếp tục.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex-1 flex items-center justify-center gap-3 bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-primary/50"
            >
              <Home className="w-5 h-5" />
              Về Trang Chủ
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest py-4 px-6 rounded-xl transition-all border border-slate-700"
            >
              <Compass className="w-5 h-5" />
              Quay Lại
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-center text-xs text-slate-600 uppercase tracking-widest">
              Battleship Command Center • Error Code: 404
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
