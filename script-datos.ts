import fs from 'fs';

const content = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf-8');

const startStr = `{draftSubTab === "datos" && (`;
const endStr = `  </div>
    </>
  );
};
`;

let startIndex = content.indexOf(startStr);
let endIndex = content.lastIndexOf(endStr);

if (startIndex > -1 && endIndex > -1 && endIndex > startIndex) {
  const replacement = `{draftSubTab === "datos" && (
      <DraftDatos 
        files={files}
        teamTotalPoints={teamTotalPoints}
        raceTypeByName={raceTypeByName}
        raceDateByName={raceDateByName}
      />
    )}
`;
  
  const newContent = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  fs.writeFileSync('src/components/tabs/DraftView.tsx', newContent);
  console.log("Success Datos");
} else {
  console.log("Failed to find boundaries for datos", startIndex, endIndex);
}
