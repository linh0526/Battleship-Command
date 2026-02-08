const fs = require('fs');
const path = 'c:\\Users\\Admin\\OneDrive\\Code\\WEB with anti\\battleship\\client\\app\\battle\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the tactical layout grid (around line 628)
// Matches the specific BattleGrid within the p-6 div
const tacticalGridRegex = /<div className="h-full aspect-square max-h-full">\s+<BattleGrid type="enemy" fleet=\{aiFleet\} revealedShips=\{revealedEnemyShips\} shots=\{playerShots\} onCellClick=\{handleEnemyCellClick\} \/>\s+<\/div>/;
const tacticalReplacement = `<div className="h-full aspect-square max-h-full">
                    {gameState.currentTurn === 'player' ? (
                      <BattleGrid type="enemy" fleet={aiFleet} revealedShips={revealedEnemyShips} shots={playerShots} onCellClick={handleEnemyCellClick} />
                    ) : (
                      <BattleGrid type="player" fleet={gameState.playerFleet} shots={enemyShots} />
                    )}
                  </div>`;
content = content.replace(tacticalGridRegex, tacticalReplacement);

// Fix the broken parallel layout grid (around line 708)
// This regex specifically targets the nested/duplicated patterns
const parallelGridRegex = /<div className="h-full aspect-square max-h-full">\s+\{gameState\.currentTurn === 'player' \? \(\s+\{gameState\.currentTurn === 'player' \? \([\s\S]+?\s+\)\s+:/;
// Let's use a simpler approach for the parallel fix since it's quite broken
const brokenSectionStart = '<div className="h-full aspect-square max-h-full">';
const brokenSectionEnd = '</div>\r?\n\s+</div>\r?\n\s+</section>';
// We'll replace the entire contents of that div
const parallelReplacement = `<div className="h-full aspect-square max-h-full">
                     {gameState.currentTurn === 'player' ? (
                       <BattleGrid type="enemy" fleet={aiFleet} revealedShips={revealedEnemyShips} shots={playerShots} onCellClick={handleEnemyCellClick} />
                     ) : (
                       <BattleGrid type="player" fleet={gameState.playerFleet} shots={enemyShots} />
                     )}
                   </div>`;

// Find the position of the parallel grid (the second occurrence of the aspect-square div)
const positions = [];
let pos = content.indexOf(brokenSectionStart);
while (pos !== -1) {
    positions.push(pos);
    pos = content.indexOf(brokenSectionStart, pos + 1);
}

if (positions.length >= 2) {
    const startPos = positions[1];
    const endPos = content.indexOf('</div>', startPos + brokenSectionStart.length);
    // Find the ultimate closing div for that specific container
    // Based on the structure, we want to replace until the closing div of the 'h-full aspect-square' container
    // We'll replace the block that contains the mess
    const messEnd = content.indexOf('</div>', content.indexOf(')}', startPos) + 2);
    content = content.substring(0, startPos) + parallelReplacement + content.substring(messEnd + 6);
}

fs.writeFileSync(path, content, 'utf8');
console.log('File successfully repaired.');
