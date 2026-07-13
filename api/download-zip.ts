import type { VercelRequest, VercelResponse } from "@vercel/node";
import path from "path";
import fs from "fs";
import JSZip from "jszip";

// Helper to recursively add files to zip
async function addDirectoryToZip(zip: JSZip, dirPath: string, relativePath = "") {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    // Exclude node_modules, dist, .git, and other unnecessary folders/files
    if (
      file === "node_modules" ||
      file === "dist" ||
      file === ".git" ||
      file === ".cursor" ||
      file === ".github" ||
      file === ".cache" ||
      file === ".npm" ||
      file === ".vercel"
    ) {
      continue;
    }
    const fullPath = path.join(dirPath, file);
    const fileRelativePath = relativePath ? `${relativePath}/${file}` : file;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const folder = zip.folder(fileRelativePath);
      if (folder) {
        await addDirectoryToZip(zip, fullPath, fileRelativePath);
      }
    } else {
      const content = fs.readFileSync(fullPath);
      zip.file(fileRelativePath, content);
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const zip = new JSZip();
    await addDirectoryToZip(zip, process.cwd());
    const content = await zip.generateAsync({ type: "nodebuffer" });
    
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=it_asset_manager_website.zip");
    res.status(200).send(content);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create zip" });
  }
}
