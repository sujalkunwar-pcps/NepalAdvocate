const AiChat = require('../models/AiChat');
const LawyerProfile = require('../models/LawyerProfile');
const User = require('../models/User');
const LegalDocument = require('../models/LegalDocument');
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

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
      if (['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '[', ']', '\\', '|'].includes(char)) {
        regexStr += '\\' + char;
      } else {
        regexStr += char;
      }
    }
  }
  return new RegExp(regexStr, 'i');
}

// Function to find relevant legal context & Supreme Court precedents from DB based on query
async function getLegalContext(query) {
  const q = query.toLowerCase();
  const terms = q.trim().split(/\s+/).filter(t => t.length > 0);
  if (terms.length === 0) return '';
  
  const conditions = terms.map(term => {
    const fuzzyRegex = buildFuzzyRegex(term);
    return {
      $or: [
        { title: { $regex: fuzzyRegex } },
        { keywords: { $regex: fuzzyRegex } },
        { category: { $regex: fuzzyRegex } },
        { content: { $regex: fuzzyRegex } }
      ]
    };
  });

  try {
    const docs = await LegalDocument.find({ $or: conditions }).limit(5);
    let context = '';
    
    for (const doc of docs) {
      if (doc.docType === 'LAW') {
        context += `\n\n[कानुन] Reference: ${doc.title}\n${doc.content}\n`;
      } else if (doc.docType === 'PRECEDENT') {
        context += `\n\n[सर्वोच्च अदालतको नजिर] ${doc.caseNo} - ${doc.title}\nनजिर सिद्धान्त: ${doc.precedentRule}\nसार: ${doc.summary}\n`;
      }
    }
    return context;
  } catch (error) {
    console.error('Error fetching legal context from DB:', error);
    return '';
  }
}

// Helper to classify legal query to a specialization category
function classifyQuery(query) {
  const q = query.toLowerCase();
  
  if (q.includes('divorce') || q.includes('marriage') || q.includes('wife') || q.includes('husband') || q.includes('child') || q.includes('custody') || q.includes('alimony') || q.includes('spouse')) {
    return 'Family Law';
  }
  if (q.includes('company') || q.includes('register') || q.includes('business') || q.includes('corporate') || q.includes('firm') || q.includes('startup') || q.includes('share') || q.includes('incorporate')) {
    return 'Corporate Law';
  }
  if (q.includes('labor') || q.includes('work') || q.includes('overtime') || q.includes('salary') || q.includes('employee') || q.includes('employer') || q.includes('firing') || q.includes('wage') || q.includes('job')) {
    return 'Labor Law';
  }
  if (q.includes('land') || q.includes('property') || q.includes('house') || q.includes('inheritance') || q.includes('tenant') || q.includes('rent') || q.includes('partition') || q.includes('landlord')) {
    return 'Property Law';
  }
  if (q.includes('crime') || q.includes('criminal') || q.includes('theft') || q.includes('police') || q.includes('jail') || q.includes('fraud') || q.includes('assault') || q.includes('murder') || q.includes('arrest')) {
    return 'Criminal Law';
  }
  if (q.includes('tax') || q.includes('vat') || q.includes('customs') || q.includes('revenue')) {
    return 'Tax Law';
  }
  if (q.includes('visa') || q.includes('passport') || q.includes('citizenship') || q.includes('immigration') || q.includes('refugee')) {
    return 'Immigration Law';
  }
  if (q.includes('patent') || q.includes('copyright') || q.includes('trademark') || q.includes('intellectual')) {
    return 'Intellectual Property';
  }
  if (q.includes('constitution') || q.includes('fundamental rights') || q.includes('government')) {
    return 'Constitutional Law';
  }
  return null;
}

// Helper to decide if we should recommend lawyers based on user query
function shouldRecommendLawyers(query) {
  const q = query.toLowerCase();
  
  // Explicit request for lawyers
  const explicitKeywords = [
    'lawyer', 'lawyers', 'attorney', 'advocate', 'advocates', 
    'represent', 'representation', 'hire', 'consult', 'booking', 
    'appointment', 'recommend', 'suggest', 'find a', 'good lawyer', 'best lawyer'
  ];
  const hasExplicitRequest = explicitKeywords.some(kw => q.includes(kw));
  if (hasExplicitRequest) return true;

  // Case/action-oriented queries
  const caseKeywords = [
    'divorce', 'sue', 'sued', 'court', 'arrest', 'police', 
    'jail', 'prison', 'dispute', 'litigation', 'fight', 'accused', 
    'charge', 'charges', 'illegal', 'crime', 'murder', 'theft', 
    'fraud', 'cheating', 'contract breach', 'agreement', 'registration', 
    'register', 'incorporate', 'company', 'property dispute', 'inheritance'
  ];
  const isCaseQuery = caseKeywords.some(kw => q.includes(kw));
  if (isCaseQuery) return true;

  return false;
}


// Enrich a list of User objects with their corresponding LawyerProfiles
const enrichLawyersWithProfiles = async (users) => {
  if (!users || users.length === 0) return [];
  
  const lawyerIds = users.map(user => user._id.toString());
  const profiles = await LawyerProfile.find({ user: { $in: lawyerIds } });
  
  const profileMap = new Map();
  profiles.forEach(profile => {
    profileMap.set(profile.user.toString(), profile);
  });
  
  return users.map(user => {
    const userObj = user.toObject ? user.toObject() : user;
    const profile = profileMap.get(userObj._id.toString());
    
    if (profile) {
      return {
        ...userObj,
        specialization: profile.specialization,
        rating: profile.rating,
        experience: profile.experience,
        hourlyRate: profile.hourlyRate,
        bio: profile.bio,
        isVerified: profile.isVerified,
      };
    }
    return userObj;
  });
};

// Get AI chat history for user
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await AiChat.find({ user: userId })
      .populate('recommendedLawyers')
      .sort({ createdAt: 1 });
    
    // Enrich recommended lawyers in chat history
    const enrichedHistory = await Promise.all(history.map(async (msg) => {
      const msgObj = msg.toObject();
      if (msgObj.recommendedLawyers && msgObj.recommendedLawyers.length > 0) {
        msgObj.recommendedLawyers = await enrichLawyersWithProfiles(msgObj.recommendedLawyers);
      }
      return msgObj;
    }));
    
    res.status(200).json({
      success: true,
      data: enrichedHistory,
    });
  } catch (error) {
    console.error('Error in getChatHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
      error: error.message,
    });
  }
};

// Clear AI chat history for user
exports.clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    await AiChat.deleteMany({ user: userId });
    
    res.status(200).json({
      success: true,
      message: 'AI chat history cleared successfully',
    });
  } catch (error) {
    console.error('Error in clearChatHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
      error: error.message,
    });
  }
};

// Send message to local Ollama (sujal model)
exports.chatWithAi = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, lang } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    // Save User message to DB
    const userMsg = await AiChat.create({
      user: userId,
      sender: 'USER',
      content: content,
    });

    // 1. Classify query for lawyer recommendation and check if we should recommend
    const specialization = classifyQuery(content);
    let recommendedLawyerIds = [];
    let matchingProfiles = [];
    
    if (shouldRecommendLawyers(content)) {
      if (specialization) {
        matchingProfiles = await LawyerProfile.find({ specialization: specialization })
          .populate('user')
          .limit(3);
      }
      
      // If no matching profile for this category, get top-rated profiles as fallback
      if (matchingProfiles.length === 0) {
        matchingProfiles = await LawyerProfile.find({})
          .populate('user')
          .sort({ rating: -1 })
          .limit(3);
      }
      
      // Filter profiles with null users
      matchingProfiles = matchingProfiles.filter(p => p.user !== null);
      recommendedLawyerIds = matchingProfiles.map(p => p.user._id);
    }

    // 2. Fetch past conversation context (last 3 messages to keep context fresh)
    const history = await AiChat.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3);
    
    // Reverse to chronological order
    history.reverse();

    // Map history (excluding the latest message) to Ollama chat format, sanitizing any contaminated items
    const ollamaMessages = [];
    
    // Check if user requests reply in Nepali
    const isNepaliRequired = lang === 'ne' || /nepali|नेपाली|nepal language/i.test(content);

    // 3. Inject legal context (RAG) and lawyer recommendation notice
    const legalContext = await getLegalContext(content);
    let systemInstruction = `You are Sujal, a warm, professional, and friendly AI legal advisor specialized in Nepalese Law. The user is a 15-year-old student.
 
CRITICAL TONE & EXPLANATION RULES (YOU MUST COMPLY):
1. ELABORATE IN FULL DETAIL: Do NOT give short, direct, or brief answers. Always go into extreme, multi-paragraph detail, explaining the legal background, what the law says, the exact step-by-step steps to take, required documents, timelines, and options.
2. EXPLAIN LIKE I'M 15 YEARS OLD: Use a warm, clear, and very simple explanation style. Break down complex legal jargon and terms (like "voidable", "adultery", "coparceners", "jurisdiction", "check bounce") into extremely simple, easy-to-understand words. Treat the user like a curious 15-year-old student.
3. NEVER ECHO DIRECTIVES OR PLACEHOLDERS: Under no circumstances should you copy, output, repeat, or print any instruction templates, bracketed guide words, or directive labels (such as "[DIRECTIVE: ...]" or "[Explain...]") from the conversation history. Write only the actual, clean legal answers.
4. CITATIONS & CORE FACTS: Cite the exact Nepalese laws (e.g. Muluki Civil Code 2074). You MUST explicitly write down the exact answer to the user's question (e.g. if the user asks for the legal age, write "the legal age of marriage is 20 years old") inside the Applicable Law section.
5. ${isNepaliRequired ? 'LANGUAGE REQUIREMENT: You MUST translate and write your entire response in the Nepali language (नेपाली भाषा) only.' : 'Language: Answer in the language requested.'}
6. FORMAT YOUR RESPONSE EXACTLY USING THESE SECTIONS:

**⚖️ Applicable Law (कानुनी व्यवस्था)**
(Detail the governing law, sections, and the core answer/numbers simply)

**📋 Step-by-Step Procedure (कानुनी प्रक्रिया)**
(Provide a detailed step-by-step numbered guide under Nepalese administration/courts)

**📂 Required Documents (आवश्यक कागजातहरू)**
(Provide a complete bulleted checklist of documents/evidence needed)

**⚖️ Win Probability & Risks (जित्ने सम्भावना र जोखिम)**
(Analyze success chances and key risks simply)

**💡 Warm Takeaway (सुझाव र निष्कर्ष)**
(Provide simple, encouraging next steps)

EXAMPLE OF THE EXACT CORRECT FORMAT TO GENERATE:
**⚖️ Applicable Law (कानुनी व्यवस्था)**
The governing law for marriage in Nepal is the Muluki Civil Code, 2074. Under Section 70, the legal age of marriage for both men and women is 20 years old.

**📋 Step-by-Step Procedure (कानुनी प्रक्रिया)**
1. Obtain a marriage registration form from the local Ward Office.
2. Submit the completed form along with witness details and photographs.

**📂 Required Documents (आवश्यक कागजातहरू)**
- Citizenship Certificate (Nagarikta) of both parties.
- Passport-sized photographs.

**⚖️ Win Probability & Risks (जित्ने सम्भावना र जोखिम)**
The registration is straightforward with 100% success chance if citizenship papers are valid.

**💡 Warm Takeaway (सुझाव र निष्कर्ष)**
Make sure to check that both parties are at least 20 years old to avoid legal voidability.`;
    
    if (legalContext) {
      systemInstruction += `\n\nUse the following verified Nepalese legal context to formulate your response. Cite the specific sections when appropriate:\n${legalContext}`;
    }

    // Add base system instruction first
    ollamaMessages.push({
      role: 'system',
      content: systemInstruction
    });

    // Add historical messages (all except the last one, which is the latest query)
    // Cleanse history of brackets to prevent Ollama from echoing directives
    for (let i = 0; i < history.length - 1; i++) {
      const msg = history[i];
      let cleanContent = msg.content;
      
      if (cleanContent.includes('[') && cleanContent.includes(']')) {
        cleanContent = cleanContent.replace(/\[[^\]]+\]/g, '').trim();
      }
      
      if (!cleanContent) continue;

      ollamaMessages.push({
        role: msg.sender === 'USER' ? 'user' : 'assistant',
        content: cleanContent
      });
    }

    // Add latest user message
    const latestUserMsg = history[history.length - 1];
    let latestContent = latestUserMsg.content;

    if (recommendedLawyerIds.length > 0 && matchingProfiles.length > 0) {
      const lawyerNames = matchingProfiles.map(p => `${p.user.firstName} ${p.user.lastName}`).join(', ');
      latestContent += `\n\n(System recommendation: Invite the user to book a consultation with the matching platform lawyers: ${lawyerNames} shown below)`;
    }

    ollamaMessages.push({
      role: 'user',
      content: latestContent
    });

    // Call local Ollama instance
    const hostUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const ollamaUrl = hostUrl.endsWith('/') ? `${hostUrl}api/chat` : `${hostUrl}/api/chat`;
    const modelName = process.env.OLLAMA_MODEL_NAME || 'sujal';
    
    let aiResponseText = '';
    try {
      const response = await fetch(ollamaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: ollamaMessages,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama responded with status: ${response.status}`);
      }

      const responseData = await response.json();
      aiResponseText = responseData.message?.content || 'I could not generate a response.';
    } catch (ollamaError) {
      console.error('Error calling Ollama:', ollamaError);
      aiResponseText = `⚠️ Local AI assistant (Ollama) is not running or model "${modelName}" is not loaded. Please make sure Ollama is active on your host machine.`;
    }

    // Save AI response to DB
    const aiMsg = await AiChat.create({
      user: userId,
      sender: 'AI',
      content: aiResponseText,
      recommendedLawyers: recommendedLawyerIds,
    });

    // Populate and enrich recommended lawyers for the immediate response
    const populatedAiMsg = await AiChat.findById(aiMsg._id).populate('recommendedLawyers');
    const aiMsgObj = populatedAiMsg.toObject();
    aiMsgObj.recommendedLawyers = await enrichLawyersWithProfiles(aiMsgObj.recommendedLawyers);

    res.status(200).json({
      success: true,
      data: {
        userMessage: userMsg,
        aiMessage: aiMsgObj,
      },
    });
  } catch (error) {
    console.error('Error in chatWithAi:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during AI consultation',
      error: error.message,
    });
  }
};

/**
 * Analyze court case PDF using sujal Ollama model
 * POST /api/ai/analyze-case
 * expects req.file (PDF file)
 */
exports.analyzeCasePdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded.',
      });
    }

    console.log('Extracting text from PDF...');
    const fileBuffer = fs.readFileSync(req.file.path);
    const parser = new PDFParse(new Uint8Array(fileBuffer));
    const parsedPdf = await parser.getText();
    let extractedText = parsedPdf.text || '';

    // Clean up temporary file
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupErr) {
      console.error('Failed to delete temporary PDF file:', cleanupErr);
    }
    
    if (extractedText.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'The uploaded PDF is empty or contains no extractable text (e.g. scanned image without OCR).',
      });
    }

    // Truncate text to avoid context token overflow
    // Llama 3.2 3B context set to 8192, we limit to first 25000 chars
    const maxChars = 25000;
    if (extractedText.length > maxChars) {
      console.log(`Truncating PDF text from ${extractedText.length} to ${maxChars} characters.`);
      extractedText = extractedText.substring(0, maxChars) + '\n[Text truncated due to document length limit...]';
    }

    // Query similar Supreme Court precedents from DB RAG
    console.log('Querying matching precedents from database...');
    const allPrecedents = await LegalDocument.find({ docType: 'PRECEDENT' });
    const matchedPrecedents = allPrecedents.filter(p => {
      // Check if text matches any keyword of precedent
      return p.keywords.some(kw => extractedText.toLowerCase().includes(kw.toLowerCase())) ||
             p.title.toLowerCase().split(/\s+/).some(word => word.length > 3 && extractedText.toLowerCase().includes(word));
    }).slice(0, 3);

    const similarPrecedents = matchedPrecedents.length > 0 ? matchedPrecedents : allPrecedents.slice(0, 3);

    // Call Ollama model
    console.log('Calling Ollama for case analysis...');
    const systemPrompt = `You are a professional legal case analyzer specializing in Nepalese Law.
Analyze the provided court case text and extract a structured, highly accurate summary.
Write your entire summary in the Nepali language (नेपाली भाषा).
You MUST format your response exactly under these specific headings:
### १. मुद्दाको पृष्ठभूमि (Facts)
[Provide a clear, detailed summary of the facts of the case]

### २. विवादित कानुनी प्रश्नहरू (Issues)
[List the disputed legal questions and issues evaluated by the court]

### ३. अदालतको निर्णय र व्याख्या (Judgment)
[Detail the court's final decision, legal logic, and precedent set]

### ४. सम्बन्धित ऐन तथा दफाहरू (Relevant Acts)
[List the specific acts, codes, and sections cited in the case]`;

    const hostUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const ollamaUrl = hostUrl.endsWith('/') ? `${hostUrl}api/chat` : `${hostUrl}/api/chat`;
    const modelName = process.env.OLLAMA_MODEL_NAME || 'sujal';

    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze this court case document:\n\n${extractedText}` }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with status: ${response.status}`);
    }

    const responseData = await response.json();
    const aiResponseText = responseData.message?.content || '';

    // Heuristically parse sections based on headings
    const parts = aiResponseText.split(/###/);
    let facts = '';
    let issues = '';
    let judgment = '';
    let relevantActs = '';

    for (const part of parts) {
      if (part.includes('पृष्ठभूमि') || part.includes('तथ्य') || part.includes('Facts') || part.includes('१.')) {
        facts = part.replace(/^[^\n]*\n/, '').trim();
      } else if (part.includes('विवादित') || part.includes('प्रश्न') || part.includes('Issues') || part.includes('२.')) {
        issues = part.replace(/^[^\n]*\n/, '').trim();
      } else if (part.includes('निर्णय') || part.includes('फैसला') || part.includes('Judgment') || part.includes('३.')) {
        judgment = part.replace(/^[^\n]*\n/, '').trim();
      } else if (part.includes('सम्बन्धित') || part.includes('ऐन') || part.includes('Acts') || part.includes('४.')) {
        relevantActs = part.replace(/^[^\n]*\n/, '').trim();
      }
    }

    // Fallback if formatting was ignored
    if (!facts && !issues && !judgment && !relevantActs) {
      facts = aiResponseText;
    }

    res.status(200).json({
      success: true,
      data: {
        facts,
        issues,
        judgment,
        relevantActs,
        similarPrecedents,
        fullOutput: aiResponseText
      }
    });
  } catch (error) {
    console.error('Error in analyzeCasePdf:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze case PDF document.',
      error: error.message,
    });
  }
};
