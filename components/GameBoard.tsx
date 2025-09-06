import React, { useState } from 'react';
import { BoardSquare, Player, SquareType } from '../types';
import PlayerToken from './PlayerToken';
import SquareTooltip from './SquareTooltip';

// SVG Icons for special squares
const GoIcon = () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />;
const JailIcon = () => <g><path d="M4 6v12h16V6H4zm2 2h12v8H6V8z"/><path d="M10 8v8m4-8v8M6 12h12"/></g>;
const ParkingIcon = () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3.5v17M9 3.5h5.5a5.5 5.5 0 010 11H9" />;
const GoToJailIcon = () => <path strokeLinecap="round" strokeLinejoin="round"strokeWidth="2" d="M16 8v.01M12 12v.01M12 16v.01M12 8v.01M16 12v.01M20 12v.01M8 12v.01M4 12v.01M12 4v.01M16 16v.01M8 16v.01M8 8v.01M20 16v.01M20 8v.01M4 16v.01M4 8v.01" />;
const ChanceIcon = () => <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="60" fill="#f59e0b" className="font-bebas">?</text>;
const ChestIcon = () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />;
const RailroadIcon = () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />;
const UtilityIcon = () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />;
const TaxIcon = () => <path d="M12.5,2.68L12,2.52l-0.5,0.16C11.1,2.84,10.7,3,10.3,3.15L10,3.22L9.7,3.15C9.3,3,8.9,2.84,8.5,2.68L8,2.52L7.5,2.68C6.34,3.2,5.29,3.93,4.5,4.95l-0.34,0.45l-0.45-0.34C2.2,3.56,1,2.44,1,2.44s0,0.44,0,1.25c0,1,0.08,1.5,0.08,1.5l0.38,1.12L1.08,6.69C0.4,7.5,0,8.3,0,9.19c0,1.5,0.62,2.5,1.5,3.31l0.38,0.38l-0.38,0.38C0.62,13.94,0,15,0,16.5c0,0.89,0.4,1.69,1.08,2.5l0.38,0.38L1.08,19.75c0,0-0.08,0.5-0.08,1.5s0,1.25,0,1.25,1.2-1.12,2.71-2.62l0.45-0.34,0.34,0.45c0.79,1.02,1.84,1.75,3,2.27L7.5,21.48,8,21.64l0.5-0.16c0.4-0.16,0.8-0.32,1.2-0.47l0.3-0.07,0.3,0.07c0.4,0.16,0.8,0.32,1.2,0.47l0.5,0.16,0.5-0.16c1.16-0.52,2.21-1.25,3-2.27l0.34-0.45,0.45,0.34c1.5,1.5,2.71,2.62,2.71,2.62s0-0.44,0-1.25c0-1-0.08-1.5-0.08-1.5l-0.38-1.12,0.38-0.38c0.68-0.81,1.08-1.62,1.08-2.5c0-1.5-0.62-2.56-1.5-3.31L22.5,12.5l0.38-0.38c0.88-0.75,1.5-1.81,1.5-3.31c0-0.89-0.4-1.69-1.08-2.5l-0.38-0.38,0.38-0.38c0,0,0.08-0.5,0.08-1.5s0-1.25,0-1.25-1.2,1.12-2.71,2.62l-0.45,0.34-0.34-0.45C18.89,3.93,17.84,3.2,16.68,2.68L16.18,2.52,15.68,2.68C15.28,2.84,14.88,3,14.48,3.15L14.18,3.22L13.88,3.15C13.48,3,13.08,2.84,12.68,2.68z M12,6.12c3.31,0,6,2.69,6,6s-2.69,6-6,6s-6-2.69-6-6S8.69,6.12,12,6.12z" />;

const getBorders = (squareId: number, propertyColor: string | undefined, ownerColor: string | undefined): React.CSSProperties => {
    const style: React.CSSProperties = {};
    const innerBorderWidth = '4px';
    const outerBorderWidth = '8px';

    // When a property is owned, the owner's color becomes the prominent outer border.
    // The property's group color (or gray for railroads/utilities) is shown as a thinner inner border.
    // When unowned, only the property's group color is shown as an outer border.

    const outerOwnerBorder = ownerColor ? `${outerBorderWidth} solid ${ownerColor}` : 'none';
    const outerPropertyBorder = propertyColor ? `${outerBorderWidth} solid ${propertyColor}` : 'none';

    // Determine the inner border. It's the property color, or gray for items without a group color (like railroads).
    // It should only appear when the item is owned.
    const innerColor = propertyColor || '#475569';
    const innerBorder = ownerColor ? `${innerBorderWidth} solid ${innerColor}` : 'none';

    if (squareId % 10 === 0) return {}; // No borders for corner squares

    // Bottom row
    if (squareId > 0 && squareId < 10) {
        style.borderBottom = ownerColor ? outerOwnerBorder : outerPropertyBorder;
        style.borderTop = innerBorder;
    }
    // Left row
    else if (squareId > 10 && squareId < 20) {
        style.borderLeft = ownerColor ? outerOwnerBorder : outerPropertyBorder;
        style.borderRight = innerBorder;
    }
    // Top row
    else if (squareId > 20 && squareId < 30) {
        style.borderTop = ownerColor ? outerOwnerBorder : outerPropertyBorder;
        style.borderBottom = innerBorder;
    }
    // Right row
    else if (squareId > 30 && squareId < 40) {
        style.borderRight = ownerColor ? outerOwnerBorder : outerPropertyBorder;
        style.borderLeft = innerBorder;
    }
    return style;
};


interface GameBoardProps {
  board: BoardSquare[];
  players: Player[];
}

const getGridPosition = (index: number) => {
  if (index >= 0 && index <= 10) return { gridRow: '11', gridColumn: `${11 - index}` };
  if (index > 10 && index <= 20) return { gridRow: `${21 - index}`, gridColumn: '1' };
  if (index > 20 && index <= 30) return { gridRow: '1', gridColumn: `${index - 19}` };
  if (index > 30 && index <= 39) return { gridRow: `${index - 29}`, gridColumn: '11' };
  return {};
};

const getOwner = (square: BoardSquare, players: Player[]): Player | undefined => {
    if ('ownerId' in square && square.ownerId) {
        return players.find(p => p.id === square.ownerId);
    }
    return undefined;
}

const SquareContent: React.FC<{ square: BoardSquare, owner?: Player }> = ({ square, owner }) => {
  const cardClasses = "w-full h-full flex flex-col items-center bg-slate-800/90 rounded-[1px] overflow-hidden p-1";
  
  const NamePlate: React.FC<{name: string}> = ({name}) => (
    <div className="h-12 w-full flex items-center justify-center text-center px-1">
      <span className="font-bebas text-xs leading-tight tracking-wide uppercase">{name}</span>
    </div>
  );
  
  const PricePlate: React.FC<{price?: number}> = ({price}) => (
     <div className="h-5 flex items-center justify-center">
        {price && <span className="font-roboto-condensed text-xs font-bold">${price}</span>}
     </div>
  );

  switch (square.type) {
    case SquareType.PROPERTY:
      return (
        <div className={cardClasses} style={getBorders(square.id, square.color, owner?.color)}>
          <NamePlate name={square.name} />
          <div className="flex-grow"></div>
          <PricePlate price={square.price} />
        </div>
      );
    case SquareType.RAILROAD:
      return (
        <div className={cardClasses} style={getBorders(square.id, undefined, owner?.color)}>
          <NamePlate name={square.name} />
          <div className="flex-grow flex items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><RailroadIcon/></svg>
          </div>
          <PricePlate price={square.price} />
        </div>
      );
    case SquareType.UTILITY:
       return (
        <div className={cardClasses} style={getBorders(square.id, undefined, owner?.color)}>
          <NamePlate name={square.name} />
           <div className="flex-grow flex items-center justify-center text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><UtilityIcon /></svg>
          </div>
          <PricePlate price={square.price} />
        </div>
       );
    case SquareType.GO:
      return <div className={`relative w-full h-full flex justify-center items-center bg-slate-800`}>
        <div className="transform -rotate-45 flex flex-col items-center">
            <div className="font-roboto-condensed text-xs whitespace-nowrap">Получите $200</div>
            <div className="font-bebas text-3xl text-amber-500 my-1">СТАРТ</div>
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><GoIcon/></svg>
        </div>
      </div>
    case SquareType.JAIL:
      return <div className={`relative w-full h-full bg-slate-800/80 flex items-center justify-center`}>
          <div className="w-full h-1/2 absolute top-0 left-0 flex items-center justify-center">
             <span className="font-bebas text-2xl transform -rotate-45">ТЮРЬМА</span>
          </div>
          <div className="w-full h-1/2 absolute bottom-0 right-0 flex items-center justify-center">
             <span className="font-bebas text-sm transform -rotate-45">ПОСЕЩЕНИЕ</span>
          </div>
          <div className="w-3/4 h-3/4 border-4 border-orange-600/50 flex items-center justify-center">
            <svg className="w-16 h-16 text-orange-600 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><JailIcon/></svg>
          </div>
      </div>
    case SquareType.FREE_PARKING:
       return <div className={`relative w-full h-full justify-center items-center flex flex-col bg-slate-800/80`}>
         <div className="transform -rotate-45 flex flex-col items-center">
            <div className="font-bebas text-xl text-slate-400">БЕСПЛАТНАЯ</div>
            <svg className="w-12 h-12 text-slate-400 my-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><ParkingIcon/></svg>
            <div className="font-bebas text-xl text-slate-400">ПАРКОВКА</div>
         </div>
      </div>;
    case SquareType.GO_TO_JAIL:
        return <div className={`relative w-full h-full justify-center items-center flex flex-col bg-slate-800/80`}>
             <div className="transform -rotate-45 flex flex-col items-center">
                <div className="font-bebas text-xl text-cyan-400">ОТПРАВЛЯЙТЕСЬ</div>
                <svg className="w-12 h-12 text-cyan-500 my-1 opacity-80" fill="currentColor" viewBox="0 0 24 24"><GoToJailIcon/></svg>
                <div className="font-bebas text-xl text-cyan-400">В ТЮРЬМУ</div>
            </div>
      </div>;
    case SquareType.CHANCE:
        return <div className={cardClasses}><NamePlate name={square.name}/><div className="flex-grow flex items-center justify-center"><svg viewBox="0 0 100 100" className="w-12 h-12"><ChanceIcon/></svg></div><PricePlate/></div>;
    case SquareType.COMMUNITY_CHEST:
        return <div className={cardClasses}><NamePlate name={square.name}/><div className="flex-grow flex items-center justify-center text-cyan-400"><svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><ChestIcon/></svg></div><PricePlate/></div>;
    case SquareType.TAX:
        return <div className={cardClasses}><NamePlate name={square.name}/><div className="flex-grow flex items-center justify-center text-red-500"><svg className="w-10 h-10" fill="currentColor" viewBox="0 0 25 25"><TaxIcon/></svg></div><PricePlate price={square.amount}/></div>;
    default:
      return <div className={`w-full h-full flex justify-center items-center bg-slate-700/50 font-semibold`}>{(square as BoardSquare).name}</div>;
  }
};

const GameBoard: React.FC<GameBoardProps> = ({ board, players }) => {
  const [tooltip, setTooltip] = useState<{
    square: BoardSquare;
    top: number;
    left: number;
  } | null>(null);

  const handleMouseEnter = (square: BoardSquare, e: React.MouseEvent) => {
    setTooltip({ square, top: e.clientY, left: e.clientX + 20 });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip) {
      setTooltip(prev => prev ? { ...prev, top: e.clientY, left: e.clientX + 20 } : null);
    }
  };


  return (
    <>
      <div
        className="grid w-full h-full bg-slate-900 border-4 border-slate-700 shadow-2xl rounded-md p-1.5"
        style={{
          gridTemplateRows: '1.7fr repeat(9, 1.1fr) 1.7fr',
          gridTemplateColumns: '1.7fr repeat(9, 1.1fr) 1.7fr',
          gap: '3px',
        }}
      >
        {board.map((square, index) => (
          <div
            key={square.id}
            className="relative bg-gray-900 text-white overflow-hidden"
            style={getGridPosition(index)}
            onMouseEnter={(e) => handleMouseEnter(square, e)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            <SquareContent square={square} owner={getOwner(square, players)} />
            <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-1 p-1 pointer-events-none">
              {players.filter(p => p.position === index).map((p) => (
                <PlayerToken key={p.id} player={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {tooltip && (
        <SquareTooltip
          square={tooltip.square}
          owner={getOwner(tooltip.square, players)}
          style={{ top: tooltip.top, left: tooltip.left }}
        />
      )}
    </>
  );
};

export default GameBoard;