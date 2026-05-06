import fs from 'fs';

const content = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf-8');

// The original `{draftSubTab === "elecciones" && (` is around line 329
// The `{draftSubTab === "datos" && (` is around line 1157

const startStr = `{draftSubTab === "elecciones" && (`;
const endStr = `{draftSubTab === "datos" && (`

let startIndex = content.indexOf(startStr);
let endIndex = content.lastIndexOf(endStr); // find the last one because my previous edit added a second one!

if (startIndex > -1 && endIndex > -1 && endIndex > startIndex) {
  const replacement = `    {draftSubTab === "elecciones" && (
      <DraftElections 
        files={files}
        cyclistMetadata={cyclistMetadata}
        leaderboard={leaderboard}
        getFlagEmoji={getFlagEmoji}
        teamTotalPoints={teamTotalPoints}
        draftCyclistStats={draftCyclistStats}
        draftComputedData={draftComputedData}
      />
    )}

    `;
  
  const newContent = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  fs.writeFileSync('src/components/tabs/DraftView.tsx', newContent);
  console.log("Success");
} else {
  console.log("Failed to find boundaries", startIndex, endIndex);
}
