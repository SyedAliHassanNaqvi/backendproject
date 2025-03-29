import express from "express";
import { getSearchResults, logSearchQuery, trackResultClick, getPopularSearchTerms } from "../controllers/searchController.controller.js";

const router = express.Router();

router.get("/", getSearchResults); // ← This is the main search endpoint
router.get("/popular-searches", getPopularSearchTerms);
router.post("/track-click", trackResultClick);

export default router;