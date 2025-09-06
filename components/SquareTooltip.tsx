import React from 'react';
import { BoardSquare, Player, SquareType, PropertySquare, RailroadSquare, UtilitySquare } from '../types';

interface SquareTooltipProps {
  square: BoardSquare;
  owner?: Player;
  style: React.CSSProperties;
}

const getHouseCost = (color: string): number => {
  switch(color) {
    case '#9f582a': // brown
    case '#aadef8': // light blue
      return 50;
    case '#d946ef': // pink
    case '#fb923c': // orange
      return 100;
    case '#ef4444': // red
    case '#facc15': // yellow
      return 150;
    case '#22c55e': // green
    case '#3b82f6': // dark blue
      return 200;
    default:
      return 0;
  }
}

const getHousesText = (count: number) => {
    if (count === 0) return "Нет построек";
    if (count === 5) return "Построен ОТЕЛЬ";
    if (count === 1) return `Построен ${count} дом`;
    if (count > 1 && count < 5) return `Построено ${count} дома`;
    return "";
}

const SquareTooltip: React.FC<SquareTooltipProps> = ({ square, owner, style }) => {
  const renderContent = () => {
    switch (square.type) {
      case SquareType.PROPERTY: {
        const prop = square as PropertySquare;
        const houseCost = getHouseCost(prop.color);
        const houses = owner ? prop.houses : -1; // -1 for unowned to not highlight anything

        return (
          <>
            <div className="p-3">
              <div className={`flex justify-between items-center text-lg ${houses === 0 ? 'text-yellow-400 font-bold' : ''}`}>
                <span>АРЕНДА</span>
                <span className="font-bold">${prop.rent[0]}</span>
              </div>
              <div className="border-t border-slate-600 my-2"></div>
              <div className="space-y-1 text-sm">
                <div className={`flex justify-between ${houses === 1 ? 'text-yellow-400 font-bold' : ''}`}><span>С 1 домом</span> <span className="font-semibold">${prop.rent[1]}</span></div>
                <div className={`flex justify-between ${houses === 2 ? 'text-yellow-400 font-bold' : ''}`}><span>С 2 домами</span> <span className="font-semibold">${prop.rent[2]}</span></div>
                <div className={`flex justify-between ${houses === 3 ? 'text-yellow-400 font-bold' : ''}`}><span>С 3 домами</span> <span className="font-semibold">${prop.rent[3]}</span></div>
                <div className={`flex justify-between ${houses === 4 ? 'text-yellow-400 font-bold' : ''}`}><span>С 4 домами</span> <span className="font-semibold">${prop.rent[4]}</span></div>
                <div className={`flex justify-between mt-1 pt-1 border-t border-slate-700 ${houses === 5 ? 'text-yellow-400' : ''}`}>
                  <span className="font-bold">С ОТЕЛЕМ</span> 
                  <span className="font-bold text-base">${prop.rent[5]}</span>
                </div>
              </div>
              <div className="border-t border-slate-600 my-2"></div>
              {owner && (
                <div className="text-center text-sm my-2 p-1 bg-slate-900/50 rounded">
                    <p className="font-semibold">{getHousesText(prop.houses)}</p>
                </div>
              )}
               <div className="flex justify-between text-sm"><span>Стоимость дома</span> <span className="font-semibold">${houseCost}</span></div>
               <div className="flex justify-between text-sm"><span>Стоимость отеля</span> <span className="font-semibold">${houseCost} (и 4 дома)</span></div>
            </div>
            <div className="bg-slate-900/50 px-3 py-2 text-center text-sm font-semibold rounded-b-md">
                <span>Цена покупки: ${prop.price}</span>
            </div>
          </>
        );
      }
      case SquareType.RAILROAD: {
        const rail = square as RailroadSquare;
        return (
          <>
            <div className="p-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Аренда</span> <span className="font-semibold">${rail.rent[0]}</span></div>
              <div className="flex justify-between"><span>Если 2 линии</span> <span className="font-semibold">${rail.rent[1]}</span></div>
              <div className="flex justify-between"><span>Если 3 линии</span> <span className="font-semibold">${rail.rent[2]}</span></div>
              <div className="flex justify-between"><span>Если 4 линии</span> <span className="font-semibold">${rail.rent[3]}</span></div>
            </div>
            <div className="bg-slate-900/50 px-3 py-2 text-center text-sm font-semibold rounded-b-md">
                <span>Цена покупки: ${rail.price}</span>
            </div>
          </>
        );
      }
      case SquareType.UTILITY: {
        const util = square as UtilitySquare;
        return (
          <>
            <div className="p-3 text-sm text-center">
              <p className="mb-2">Если у вас 1 предприятие, аренда равна <strong>4х</strong> суммы на кубиках.</p>
              <p>Если у вас 2 предприятия, аренда равна <strong>10х</strong> суммы на кубиках.</p>
            </div>
            <div className="bg-slate-900/50 px-3 py-2 text-center text-sm font-semibold rounded-b-md">
                <span>Цена покупки: ${util.price}</span>
            </div>
          </>
        );
      }
      case SquareType.CHANCE:
          return <div className="p-3 text-sm text-center">Возьмите карту "Шанс".</div>;
      case SquareType.COMMUNITY_CHEST:
          return <div className="p-3 text-sm text-center">Возьмите карту "Общественная казна".</div>;
      case SquareType.TAX:
          return <div className="p-3 text-sm text-center">Заплатите налог в размере ${square.amount}.</div>;
       default:
        return <div className="p-3 text-sm text-center">{square.name}</div>;
    }
  };

  const headerColor = square.type === SquareType.PROPERTY ? square.color : '#475569';

  return (
    <div
      style={style}
      className="fixed w-60 bg-slate-900 rounded-lg shadow-2xl border border-slate-600 text-white font-roboto-condensed z-50 pointer-events-none transform -translate-y-1/2"
    >
      <div
        className="h-10 flex items-center justify-center text-center font-bebas text-xl tracking-wider rounded-t-md px-2"
        style={{ backgroundColor: headerColor }}
      >
        {square.name}
      </div>
      {owner && (
        <div className="bg-slate-700 py-1 text-center text-xs">
          Владелец: <span style={{ color: owner.color }} className="font-bold">{owner.name}</span>
        </div>
      )}
      {renderContent()}
    </div>
  );
};

export default SquareTooltip;