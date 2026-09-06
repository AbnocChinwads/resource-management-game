import express from "express";
import fs from "fs/promises";
import path from "path";
import { marked } from "marked";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const readmePath = path.join(process.cwd(), "readme.md");
    const markdown = await fs.readFile(readmePath, "utf8");
    const sections = markdown.split(/^# /m).slice(1);

    const infoSections = [
        "Current Features",
        "Recent Updates",
        "Development Roadmap"
    ].map(title => sections.find(section => section.startsWith(`${title}\n`))).filter(Boolean).map(section => `# ${section}`).join("\n\n");

    const content = marked.parse(infoSections);

    res.render("info.ejs", { content });
  } catch (err) {
    console.error("Error loading infopage:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
