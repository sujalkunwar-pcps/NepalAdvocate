const mongoose = require('mongoose');
const LegalDocument = require('../models/LegalDocument');
const SearchLog = require('../models/SearchLog');

// Helper to build a fuzzy regex matching interchangeable Devanagari characters (typo-tolerance)
function buildFuzzyRegex(term) {
  let regexStr = '';
  for (let i = 0; i < term.length; i++) {
    const char = term[i];
    if (char === 'ब' || char === 'व') {
      regexStr += '[बव]';
    } else if (char === 'श' || char === 'ष' || char === 'स') {
      regexStr += '[शषस]';
    } else if (char === 'ि' || char === 'ी') {
      regexStr += '[िी]';
    } else if (char === 'ु' || char === 'ू') {
      regexStr += '[ुू]';
    } else {
      // Escape special regex characters if any
      if (['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '[', ']', '\\', '|'].includes(char)) {
        regexStr += '\\' + char;
      } else {
        regexStr += char;
      }
    }
  }
  return new RegExp(regexStr, 'i');
}

/**
 * Search Supreme Court Landmark Precedents (ने.का.प. नजिरहरू)
 * GET /api/legal-search?q=query&category=category
 */
exports.searchPrecedents = async (req, res) => {
  try {
    const { q, category } = req.query;
    const userId = req.user ? req.user.id : null;

    // 1. Log search query in background
    if (q && q.trim() !== '') {
      SearchLog.create({
        query: q.trim(),
        user: userId,
      }).catch(err => console.error('Failed to log search query:', err));
    }

    // Build DB query
    let queryConditions = { docType: 'PRECEDENT' };

    if (category) {
      queryConditions.category = { $regex: new RegExp(category, 'i') };
    }

    let results = [];

    if (q && q.trim() !== '') {
      const terms = q.trim().split(/\s+/).filter(t => t.length > 0);
      
      // If we have search terms, search using fuzzy regexes
      const termConditions = terms.map(term => {
        const fuzzyRegex = buildFuzzyRegex(term);
        return {
          $or: [
            { title: { $regex: fuzzyRegex } },
            { summary: { $regex: fuzzyRegex } },
            { precedentRule: { $regex: fuzzyRegex } },
            { keywords: { $regex: fuzzyRegex } },
            { caseNo: { $regex: fuzzyRegex } }
          ]
        };
      });

      queryConditions.$and = termConditions;
      results = await LegalDocument.find(queryConditions);
    } else {
      results = await LegalDocument.find(queryConditions);
    }

    // If no results and search query was provided, return top 3 default precedents as fallback
    if (results.length === 0) {
      results = await LegalDocument.find({ docType: 'PRECEDENT' }).limit(3);
    }

    return res.json({
      success: true,
      query: q,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Legal Search Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to execute legal search query.',
      error: error.message,
    });
  }
};

/**
 * Get Case by ID
 * GET /api/legal-search/:id
 */
exports.getPrecedentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find by either MongoDB _id or externalId (e.g. nkp-2078-01)
    let caseItem = await LegalDocument.findOne({
      $and: [
        { docType: 'PRECEDENT' },
        {
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
            { externalId: id }
          ]
        }
      ]
    });

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Supreme court precedent not found.',
      });
    }

    // If logged in user, log the click event
    const userId = req.user ? req.user.id : null;
    if (userId && req.query.searchQuery) {
      // Find the last search log by this user and update clickedResult
      SearchLog.findOne({ user: userId, query: req.query.searchQuery })
        .sort({ createdAt: -1 })
        .then(log => {
          if (log) {
            log.clickedResult = caseItem._id;
            log.save();
          }
        }).catch(err => console.error('Error updating click log:', err));
    }

    return res.json({
      success: true,
      data: caseItem,
    });
  } catch (error) {
    console.error('Error in getPrecedentById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve precedent details.',
    });
  }
};
