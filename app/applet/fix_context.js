import fs from "fs";
import path from "path";

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith(".tsx")) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir(path.join(process.cwd(), "src/components/tabs/season/"));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("if (!context) return null;")) {
    content = content.replace(
      /const context = useContext\(SeasonViewContext\);\s*if \(!context\) return null;/g,
      "const context = useContext(SeasonViewContext)!;"
    );
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
