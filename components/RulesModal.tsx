import React from 'react';

interface RulesModalProps {
  onClose: () => void;
}

const RuleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="font-bebas text-2xl text-slate-200 tracking-wide border-b-2 border-slate-700 pb-1 mb-2">{title}</h3>
        <div className="space-y-2 text-base">{children}</div>
    </div>
);

const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h2 className="font-bebas text-4xl text-amber-400 mb-4 tracking-wider text-center" style={{ textShadow: '0 0 10px #facc15' }}>
          Правила Игры
        </h2>

        <div className="flex-grow overflow-y-auto pr-4 space-y-4 text-slate-300 font-roboto-condensed">
          <RuleSection title="Цель игры">
            <p>Стать последним игроком, который не обанкротился. Захватите промышленность, собирайте арендную плату со своих конкурентов и доведите их до финансового краха, чтобы стать главой Металлургической Империи!</p>
          </RuleSection>

          <RuleSection title="Ход игры">
            <p>В свой ход вы бросаете два кубика и перемещаете свою фишку по доске на выпавшее количество клеток. Клетка, на которой вы остановились, определяет ваши дальнейшие действия.</p>
          </RuleSection>
          
          <RuleSection title="Покупка и Аренда">
            <p><strong>Покупка:</strong> Если вы попадаете на никем не занятую собственность (компанию, транспортную линию или предприятие), вы можете купить ее по указанной цене. Если вы отказываетесь, она остается ничьей.</p>
            <p><strong>Аренда:</strong> Если вы попадаете на собственность, принадлежащую другому игроку, вы должны заплатить ему арендную плату. Размер платы зависит от типа собственности и наличия на ней построек.</p>
          </RuleSection>
          
          <RuleSection title="Монополии и Застройка">
             <p>Собрав все компании одного цвета, вы создаете монополию. Это позволяет вам взимать двойную арендную плату за пустые участки этого цвета и дает право строить дома и отели, что значительно увеличивает доход.</p>
          </RuleSection>

          <RuleSection title="Особая Собственность">
            <p><strong>Транспортные линии:</strong> Аренда за них зависит от того, сколькими линиями владеет игрок (1, 2, 3 или 4).</p>
            <p><strong>Предприятия ('Энергоузел', 'Логистика'):</strong> Аренда зависит от суммы на кубиках. Если игрок владеет обоими предприятиями, множитель увеличивается с x4 до x10.</p>
          </RuleSection>

          <RuleSection title="Тюрьма">
            <p>Вы попадаете в тюрьму, если останавливаетесь на клетке 'Отправляйтесь в тюрьму'. Находясь в тюрьме, вы не можете передвигаться по доске, но можете собирать арендную плату. Чтобы выйти, нужно заплатить штраф, использовать карту "Выйти из тюрьмы" или выбросить дубль в течение трех ходов.</p>
          </RuleSection>

          <RuleSection title="Банкротство">
             <p>Если вы должны больше денег, чем у вас есть, вы объявляетесь банкротом и выбываете из игры. Ваша собственность переходит кредитору (другому игроку или банку, после чего становится свободной).</p>
          </RuleSection>
        </div>

        <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-amber-500 to-orange-700 text-white font-bebas text-2xl tracking-wider py-2 px-12 rounded-lg shadow-lg hover:shadow-orange-500/50 transition-all transform hover:scale-105 border-b-4 border-orange-800 hover:border-orange-700"
            >
              Закрыть
            </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;