import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Versions | THE HATCH',
}

export default function VersionsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Game Versions</h1>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Version 1 Rules</h2>
        <p>
          Version 1 of THE HATCH is the foundational release that introduced the
          core push‑your‑luck gameplay and chaotic social interactions. This
          version is used by default in the online service. Below are the
          complete rules so you can print and play offline.
        </p>
        <h3 className="text-xl font-semibold mt-4">Setup</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Players: 2–10</li>
          <li>Each player starts with 3 hearts (life). The maximum is 5.</li>
          <li>Each player receives 2 action cards from the shuffled deck (20 cards total).</li>
          <li>The remaining deck and discard pile are placed face down.</li>
        </ul>
        <h3 className="text-xl font-semibold mt-4">Turn Sequence</h3>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Optional: play an action card (timing rules apply; reaction window is 8 seconds).</li>
          <li>Choose SAFE or OPEN:</li>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>SAFE:</strong> Gain 1 coward token and draw 1 card (hand limit 5). Does not trigger the die.</li>
            <li><strong>OPEN:</strong> Reset your coward tokens to 0, roll the die and resolve its effect.</li>
          </ul>
          <li>Resolve consequences (see dice table).</li>
          <li>End turn; pass to the next alive player.</li>
        </ol>
        <h3 className="text-xl font-semibold mt-4">Anti‑Stall Mechanics</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Coward Tokens:</strong> Earned by choosing SAFE. If all alive players have ≥1 coward token at the end of a full round, Backlash occurs.</li>
          <li><strong>Backlash:</strong> All players lose 1 heart. Players with 2 or more coward tokens lose 2 hearts. All coward tokens reset.</li>
          <li><strong>Bravery Bonus:</strong> If exactly one player opened during the round, they choose one: +1 heart, draw 1 card, or remove 1 heart from a player with ≥2 coward tokens.</li>
          <li><strong>Hatch Addict:</strong> If you open three consecutive turns, you must open on the following turn or lose 1 heart.</li>
        </ul>
        <h3 className="text-xl font-semibold mt-4">Acceleration System</h3>
        <p>
          Pressure begins at 0. Each time a 6 is rolled the pressure increases by 1. At various thresholds the die results become more punishing:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Pressure 2:</strong> A roll of 2 causes the player to lose 1 heart instead of doing nothing.</li>
          <li><strong>Pressure 4:</strong> A roll of 3 causes everyone to lose 1 heart instead of the roller gaining 1.</li>
          <li><strong>Pressure 6:</strong> A roll of 4 causes everyone to lose 2 hearts instead of 1.</li>
          <li><strong>Pressure 8:</strong> Openers suffer +1 extra heart loss on all die results.</li>
          <li><strong>Pressure 10:</strong> Sudden Death: at the start of each turn every player loses 1 heart and the SAFE option is disabled.</li>
        </ul>
        <h3 className="text-xl font-semibold mt-4">Dice Outcomes</h3>
        <table className="min-w-full table-auto text-sm border border-gray-700">
          <thead>
            <tr className="bg-gray-800 text-gray-200">
              <th className="border border-gray-700 px-2 py-1">Roll</th>
              <th className="border border-gray-700 px-2 py-1">Base Effect</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-700 px-2 py-1">1</td>
              <td className="border border-gray-700 px-2 py-1">Lose 1 heart.</td>
            </tr>
            <tr>
              <td className="border border-gray-700 px-2 py-1">2</td>
              <td className="border border-gray-700 px-2 py-1">Nothing happens (modified by pressure).</td>
            </tr>
            <tr>
              <td className="border border-gray-700 px-2 py-1">3</td>
              <td className="border border-gray-700 px-2 py-1">Gain 1 heart (modified by pressure).</td>
            </tr>
            <tr>
              <td className="border border-gray-700 px-2 py-1">4</td>
              <td className="border border-gray-700 px-2 py-1">Everyone loses 1 heart (modified by pressure).</td>
            </tr>
            <tr>
              <td className="border border-gray-700 px-2 py-1">5</td>
              <td className="border border-gray-700 px-2 py-1">FORCE: Choose another player to lose 1 heart.</td>
            </tr>
            <tr>
              <td className="border border-gray-700 px-2 py-1">6</td>
              <td className="border border-gray-700 px-2 py-1">CHAOS: Trigger a Chaos Event and increase pressure.</td>
            </tr>
          </tbody>
        </table>
        <h3 className="text-xl font-semibold mt-4">Chaos Events (12)</h3>
        <p>When a 6 is rolled you draw a chaos event. Implement the following exact list:</p>
        <ol className="list-decimal pl-6 space-y-1 text-sm">
          <li><strong>Rapid Growth:</strong> Every player draws 1 card.</li>
          <li><strong>Sudden Storm:</strong> Discard the top 5 cards of the deck; pressure increases by 1.</li>
          <li><strong>Gift of Life:</strong> The roller gains 2 hearts (up to the maximum).</li>
          <li><strong>Forced Trade:</strong> Each player passes a random card from their hand to the left.</li>
          <li><strong>Double Trouble:</strong> Roll the die again and apply the result twice.</li>
          <li><strong>Reverse Backlash:</strong> All coward tokens become bravery tokens; treat Backlash as Bravery Bonus this round.</li>
          <li><strong>Mass Panic:</strong> All players lose 1 heart and discard a random card.</li>
          <li><strong>Lucky Break:</strong> The roller draws 3 cards.</li>
          <li><strong>Steal Life:</strong> Choose a player; steal 1 heart from them.</li>
          <li><strong>Shared Pain:</strong> Every loss/gain this round is shared with the player to your right.</li>
          <li><strong>Time Warp:</strong> Undo the last turn’s effects.</li>
          <li><strong>Ultimate Chaos:</strong> Reset pressure to 0 and shuffle the discard pile back into the deck.</li>
        </ol>
        <h3 className="text-xl font-semibold mt-4">Action Cards (20)</h3>
        <p>Players start with 2 action cards and may play exactly one per turn. Each card has an 8‑second reaction window. The server validates ownership and timing. Implement the following actions:</p>
        <ol className="list-decimal pl-6 space-y-1 text-sm">
          <li><strong>Shield:</strong> Negate all damage targeting you this turn.</li>
          <li><strong>Sabotage:</strong> Force a player to re‑roll their die.</li>
          <li><strong>Swap:</strong> Swap hands with another player of your choice.</li>
          <li><strong>Peek:</strong> Look at the top 3 cards of the deck and reorder them.</li>
          <li><strong>Heal:</strong> Gain 2 hearts.</li>
          <li><strong>Steal:</strong> Take a random card from another player’s hand.</li>
          <li><strong>Reflect:</strong> Redirect an effect targeting you to another player.</li>
          <li><strong>Double Down:</strong> Draw 2 cards and lose 1 heart.</li>
          <li><strong>Sacrifice:</strong> Lose 1 heart to force everyone else to lose 1 heart.</li>
          <li><strong>Inspire:</strong> Remove all coward tokens from all players.</li>
          <li><strong>Counterspell:</strong> Cancel another player’s action card.</li>
          <li><strong>Redistribute:</strong> Evenly distribute hearts among all players (rounded down).</li>
          <li><strong>Vengeance:</strong> The next damage you take is dealt to the source instead.</li>
          <li><strong>Expose:</strong> Reveal every player’s hand to all players for the rest of the round.</li>
          <li><strong>Clone:</strong> Copy the effect of the last action card played.</li>
          <li><strong>Sprint:</strong> Take another immediate turn after this one.</li>
          <li><strong>Silence:</strong> Target player cannot play action cards on their next turn.</li>
          <li><strong>Donate:</strong> Give 2 cards to another player; gain 1 heart.</li>
          <li><strong>Disarm:</strong> Force all players to discard their hands and draw 1 card.</li>
          <li><strong>Targeted Chaos:</strong> Trigger a Chaos Event but choose the outcome.</li>
        </ol>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Version 2: Escalation Edition</h2>
        <p>
          Escalation Edition builds upon Version 1 by dramatically increasing the
          stakes as the game progresses. New mechanics encourage faster play and
          harsher punishment for hesitation. Use this ruleset once you’re
          comfortable with the base game.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Escalating Deck:</strong> Shuffle 10 escalation cards into the bottom half of the action deck. When drawn, an escalation card immediately increases pressure by 1 and has a powerful one‑off effect.</li>
          <li><strong>Permanent Coward:</strong> Coward tokens no longer reset on Backlash. They persist until a player opens. Players with 3 coward tokens lose 1 heart at the start of their turn.</li>
          <li><strong>Double Backlash:</strong> If all players have at least 2 coward tokens, Backlash triggers twice.</li>
          <li><strong>Extreme Pressure:</strong> Pressure continues beyond 10. At 12 pressure, all dice results deal double damage. At 14 pressure, SAFE is permanently disabled and all players lose 1 heart at the start of every turn.</li>
          <li><strong>New Chaos Events:</strong> Four new chaos events are added: Meteor Shower (each player loses 3 hearts), Bountiful Harvest (all players gain 2 hearts and draw 2 cards), Civil War (players split into two teams and attack), and Revival (one eliminated player returns with 3 hearts).</li>
          <li><strong>Team Play:</strong> Players may form temporary alliances. Action cards can target teams and hearts can be shared within a team.</li>
        </ul>
        <p>
          These changes create an intense and unpredictable endgame. Make sure to
          communicate clearly with your friends and adapt your strategy as the
          pressure mounts!
        </p>
      </section>
    </div>
  )
}