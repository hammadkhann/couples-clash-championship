import React from 'react';

export const RulesPanel: React.FC = () => {
  return (
    <section className="w-full bg-gradient-to-br from-white/10 to-white/5 border-2 border-gold/30 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 text-white shadow-2xl">
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
        <div className="text-3xl sm:text-4xl md:text-5xl">🏆</div>
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold">
            How To Play
          </h2>
        </div>
        <div className="text-3xl sm:text-4xl md:text-5xl">🏆</div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
        {/* Format Section */}
        <div className="bg-royal-blue/40 rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl md:text-4xl">🎯</span>
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-gold uppercase tracking-wide">Format</h3>
          </div>
          <ul className="space-y-3 sm:space-y-4 md:space-y-5">
            <li className="flex items-start gap-3 sm:gap-4">
              <span className="text-gold text-lg sm:text-xl md:text-2xl">•</span>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">8 couples compete in single elimination</span>
            </li>
            <li className="flex items-start gap-3 sm:gap-4">
              <span className="text-gold text-lg sm:text-xl md:text-2xl">•</span>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">Best-of-5 questions per matchup</span>
            </li>
            <li className="flex items-start gap-3 sm:gap-4">
              <span className="text-gold text-lg sm:text-xl md:text-2xl">•</span>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">Random themes each round</span>
            </li>
            <li className="flex items-start gap-3 sm:gap-4">
              <span className="text-gold text-lg sm:text-xl md:text-2xl">•</span>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">Winners advance to next round</span>
            </li>
          </ul>
        </div>

        {/* Scoring Section */}
        <div className="bg-royal-blue/40 rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl md:text-4xl">⭐</span>
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-gold uppercase tracking-wide">Scoring</h3>
          </div>
          <ul className="space-y-3 sm:space-y-4 md:space-y-5">
            <li className="flex items-start gap-3 sm:gap-4">
              <span className="text-green-400 text-lg sm:text-xl md:text-2xl font-bold">+1</span>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">Point for each correct answer</span>
            </li>
            <li className="flex items-start gap-3 sm:gap-4">
              <span className="text-green-400 text-lg sm:text-xl md:text-2xl font-bold">+2</span>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">Bonus points for winning match</span>
            </li>
            <li className="flex items-start gap-3 sm:gap-4">
              <span className="text-red-400 text-lg sm:text-xl md:text-2xl">⏱</span>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">Timeout counts as wrong answer</span>
            </li>
            <li className="flex items-start gap-3 sm:gap-4">
              <span className="text-gold text-lg sm:text-xl md:text-2xl">🎉</span>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">No negative points!</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
