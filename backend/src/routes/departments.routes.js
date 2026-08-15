const express = require('express');
const Department = require('../models/Department');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.clinicId) filter.clinic = req.query.clinicId;
    const departments = await Department.find(filter).populate('clinic', 'name').lean();
    res.json({ departments });
  })
);

module.exports = router;
