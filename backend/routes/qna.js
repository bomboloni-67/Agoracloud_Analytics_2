const express = require('express');

const router = express.Router();

const sampleData = require('../data/sampleDataset.json');

router.post('/qna', (req, res) => {
  const { question } = req.body;
  // Mock response - replace with actual AWS Quicksight integration
  const response = {
    answer: `Mock generative answer for: "${question}". This is a placeholder for AWS Quicksight/Quicksuite Q&A response.`,
    visualization: sampleData,
  };
  res.json(response);
});

module.exports = router;