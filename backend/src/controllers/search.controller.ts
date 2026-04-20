import type { Request, Response } from "express";
import { globalSearchService } from "../services/search.service.js";

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q || q.length < 2) {
      return res.json({ problems: [], resources: [], challenges: [] });
    }
    const results = await globalSearchService(q);
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};
