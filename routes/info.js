import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.render("info.ejs");
});

export default router;
