import React from 'react';
import { Skull, X, Ship, Crosshair } from 'lucide-react';
import { ShipInstance } from '@/context/GameContext';

interface BattleGridProps {
  type: 'enemy' | 'player';
  fleet: ShipInstance[];
  revealedShips?: ShipInstance[];
  shots?: Map<string, 'hit' | 'miss' | 'sunk'>;
  onCellClick?: (r: number, c: number) => void;
}

export default function BattleGrid({ type, fleet, revealedShips = [], shots = new Map(), onCellClick }: BattleGridProps) {
  const getCellStatus = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const shotResult = shots.get(key);
    
    // Tìm chiến hạm tại tọa độ này (ưu tiên hạm đội đã bị lộ diện đối với bản đồ địch)
    // Find ship at this cell (prioritize revealed ships for enemy grid)
    const activeFleet = type === 'player' ? fleet : [...revealedShips, ...fleet];
    
    const ship = activeFleet.find(s => {
      for (let i = 0; i < s.size; i++) {
        const sr = s.orientation === 'horizontal' ? s.row : s.row + i;
        const sc = s.orientation === 'horizontal' ? s.col + i : s.col;
        if (sr === r && sc === c) return true;
      }
      return false;
    });

    // Xác định xem tàu này đã bị chìm hoàn toàn chưa
    // Determine if this ship is completely sunk
    let isSunk = false;
    if (ship) {
      // Nếu là tàu địch và nằm trong danh sách revealedShips -> Chắc chắn đã chìm
      // If it's an enemy ship and in revealedShips -> It is definitely sunk
      const isRevealed = type === 'enemy' && revealedShips.some(rs => rs.name === ship.name);
      
      if (isRevealed) {
        isSunk = true;
      } else {
        // Kiểm tra tất cả các ô của tàu đã bị bắn trúng chưa
        // Check if all cells of the ship have been hit
        isSunk = true;
        for (let i = 0; i < ship.size; i++) {
          const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
          const sc = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
          const sKey = `${sr}-${sc}`;
          const currentShot = shots.get(sKey);
          if (currentShot !== 'hit' && currentShot !== 'sunk') {
            isSunk = false;
            break;
          }
        }
      }
    }
    
    return { 
      type: ship ? 'ship' : 'empty', 
      ship,
      shot: shotResult,
      isSunk,
      // Đảm bảo lấy được màu ngay cả khi shipBgColor bị thiếu (dùng ship.color từ server)
      // Ensure color is retrieved even if shipBgColor is missing (use ship.color from server)
      shipBgColor: ship?.shipBgColor || (ship as any)?.color || 'bg-slate-500', 
      shipTextColor: ship?.shipTextColor || (ship as any)?.text || 'text-white'
    };
  };

  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="grid grid-cols-[30px_repeat(10,1fr)] grid-rows-[30px_repeat(10,1fr)] bg-slate-800/20 w-full h-full rounded-sm overflow-hidden border border-slate-800/30">
      {/* Top Header Labels */}
      <div className="w-[30px] h-[30px] bg-slate-950/80 border-b border-r border-slate-900"></div>
      {labels.map(l => (
        <div key={l} className="flex items-center justify-center bg-slate-950/80 font-mono text-[11px] font-black text-slate-500 border-b border-r border-slate-900">
          {l}
        </div>
      ))}

      {Array.from({ length: 10 }).map((_, r) => (
        <React.Fragment key={r}>
          {/* Side Number Label */}
          <div className="w-[30px] h-full flex items-center justify-center bg-slate-950/80 font-mono text-[11px] font-black text-slate-500 border-r border-b border-slate-900">
            {r + 1}
          </div>
          
          {Array.from({ length: 10 }).map((_, c) => {
            const status = getCellStatus(r, c);
            const isMini = type === 'player';
            const isSunk = status.isSunk;
            
            return (
              <div 
                key={`${r}-${c}`}
                onClick={() => onCellClick?.(r, c)}
                className={`relative group transition-all duration-300 border-b border-r border-slate-900/50 flex items-center justify-center aspect-square
                  ${type === 'enemy' ? 'cursor-crosshair' : 'cursor-default'}
                  ${(status.shot === 'hit' || status.shot === 'sunk') ? 
                    // Nếu đã bị chìm và là lưới địch -> Hiện màu nền của tàu đó
                    // If sunk and enemy grid -> Show the ship's background color
                    (isSunk && type === 'enemy' ? `${status.shipBgColor} bg-opacity-60 border-error/50` : 'bg-error/20') 
                    : status.shot === 'miss' ? 'bg-slate-800/40' : 
                    // Hiện tàu của mình trên lưới phe ta
                    // Show our own ships on our grid
                    (status.type === 'ship' && type === 'player') ? `${status.shipBgColor} bg-opacity-40` : 'bg-slate-950 hover:bg-white/[0.03]'}
                `}
              >
                {/* HIỂN THỊ ĐẠN BẮN (SHOTS) */}
                {status.shot === 'hit' || status.shot === 'sunk' ? (
                    <div className="relative flex items-center justify-center">
                      {/* Nếu tàu đã chìm, hiện icon tàu mờ ở dưới đầu lâu */}
                      {/* If ship is sunk, show a faint ship icon under the skull */}
                      {isSunk && type === 'enemy' && (
                        <Ship className="absolute w-4 h-4 text-white/20 -translate-y-1" />
                      )}
                      
                      <div className={`${isSunk || status.shot === 'sunk' ? 'text-white' : 'text-error'} animate-bounce relative z-10`}>
                        {isSunk || status.shot === 'sunk' ? (
                          <Skull className={`${isMini ? 'w-3 h-3' : 'w-5 h-5'} drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]`} />
                        ) : (
                          <X className={`${isMini ? 'w-3 h-3' : 'w-5 h-5'} drop-shadow-[0_0_8px_currentColor]`} />
                        )}
                      </div>
                    </div>
                ) : status.shot === 'miss' ? (
                    <div className={`${isMini ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-slate-700`}></div>
                ) : (status.type === 'ship' && type === 'player') ? (
                  // Tàu của người chơi (Player's ships)
                  <div className={`opacity-80 ${status.shipTextColor}`}>
                      <Ship className={`${isMini ? 'w-3 h-3' : 'w-4 h-4'} drop-shadow-[0_0_5px_currentColor]`} />
                  </div>
                ) : type === 'enemy' && (
                    <Crosshair className="w-5 h-5 text-primary opacity-0 group-hover:opacity-40 transition-opacity" />
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
