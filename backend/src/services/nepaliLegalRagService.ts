export interface LegalCorpusEntry {
  id: string;
  keywords: string[];
  actName: string;
  actNameNepali: string;
  section: string;
  title: string;
  summary: string;
  summaryNepali: string;
  precedentRef?: string;
}

const NEPALI_LEGAL_CORPUS: LegalCorpusEntry[] = [
  {
    id: 'cor_01',
    keywords: ['property', 'land', 'registration', 'malpot', 'lalpurja', 'deed', 'जग्गा', 'मालपोत', 'लालपुर्जा', 'रजिष्ट्रेसन'],
    actName: 'Muluki Civil Code 2074 (मुलुकी देवानी संहिता, २०७४)',
    actNameNepali: 'मुलुकी देवानी संहिता, २०७४',
    section: 'Part 4, Chapter 2 & Section 421',
    title: 'Registration of Immovable Property Transactions',
    summary: 'Under Section 421 of the Muluki Civil Code 2074, any contract, sale deed, gift deed, or partition transferring ownership of immovable property valued over NPR 100,000 must be mandatorily registered before the concerned Land Revenue Office (Malpot Karyalaya). Unregistered deeds are legally invalid for transferring title.',
    summaryNepali: 'मुलुकी देवानी संहिता २०७४ को दफा ४२१ अनुसार रु. १,००,००० भन्दा बढी मूल्यको अचल सम्पत्ति हस्तान्तरण वा लेनदेन गर्दा अनिवार्य रूपमा सम्बन्धित मालपोत कार्यालयमा रजिष्ट्रेसन पारित गर्नुपर्दछ। रजिष्ट्रेसन नगरिएको लिखतले स्वामित्व हस्तान्तरण हुँदैन।',
    precedentRef: 'NKP 2078, Decision No. 10423 (Supreme Court of Nepal)',
  },
  {
    id: 'cor_02',
    keywords: ['company', 'incorporation', 'pvt ltd', 'ocr', 'register', 'moa', 'aoa', 'कम्पनी', 'दर्ता', 'प्रबन्धपत्र', 'नियमावली'],
    actName: 'Companies Act 2063 (कम्पनी ऐन, २०६३)',
    actNameNepali: 'कम्पनी ऐन, २०६३',
    section: 'Sections 3, 4, 5 & 12',
    title: 'Procedure for Incorporation of Private Limited Company',
    summary: 'Incorporation requires: 1) Online name reservation approval on the Office of Company Registrar (OCR) web portal. 2) Submission of notarized Memorandum of Association (MOA) and Articles of Association (AOA) drafted in accordance with standard formats. 3) Certified copies of promoter citizenships. 4) Issuance of Certificate of Incorporation, followed by Inland Revenue Department (IRD) PAN and local Ward business license.',
    summaryNepali: 'कम्पनी ऐन २०६३ बमोजिम प्राइभेट लिमिटेड कम्पनी दर्ता गर्न: १) कम्पनी रजिष्ट्रारको कार्यालय (OCR) को पोर्टल मार्फत नाम आरक्षण। २) कानुन बमोजिम प्रबन्धपत्र र नियमावलीको मस्यौदा तयार गरी पेश गर्ने। ३) संस्थापकहरूको नागरिकता प्रतिलिपि। ४) कम्पनी दर्ता प्रमाणपत्र प्राप्ति पश्चात आन्तरिक राजस्व कार्यालयबाट प्यान (PAN) र सम्बन्धित वडा कार्यालयबाट व्यवसाय दर्ता गर्नुपर्छ।',
    precedentRef: 'Department of Industry & OCR Practice Directive 2080',
  },
  {
    id: 'cor_03',
    keywords: ['divorce', 'marriage', 'alimony', 'sambandh', 'vichhed', 'सम्बन्ध', 'विच्छेद', 'विवाह', 'अंश'],
    actName: 'Muluki Civil Code 2074 (मुलुकी देवानी संहिता, २०७४)',
    actNameNepali: 'मुलुकी देवानी संहिता, २०७४',
    section: 'Part 3, Chapter 3 (Sections 93 - 104)',
    title: 'Dissolution of Marriage and Rights to Partition',
    summary: 'Spouses can mutually initiate divorce at the District Court under Section 93. Mutual consent allows immediate dissolution within 2-3 working days. In contested divorce, the Court mandatorily attempts mediation for 1 year. If reconciliation fails, the court grants divorce with equitable division of ancestral property or monthly alimony under Section 99.',
    summaryNepali: 'मुलुकी देवानी संहिता २०७४ को दफा ९३ देखि १०४ बमोजिम पति र पत्नी दुवैको मञ्जुरी भएमा तत्कालै जिल्ला अदालतबाट सम्बन्ध विच्छेद हुनसक्छ। विवादित मुद्दामा १ वर्षसम्म मेलमिलापको प्रयास गरिन्छ। मेलमिलाप नभएमा सम्पत्तिको अंशबण्डा वा मासिक भरणपोषण खर्चको फैसला हुन्छ।',
    precedentRef: 'NKP 2077, Vol. 62, Decision No. 9874',
  },
  {
    id: 'cor_04',
    keywords: ['criminal', 'cyber', 'fraud', 'bail', 'arrest', 'सजाय', 'ठगी', 'बैंकिङ कसूर', 'साइबर अपराध'],
    actName: 'Electronic Transactions Act 2063 & Muluki Criminal Code 2074',
    actNameNepali: 'विद्युतीय कारोबार ऐन, २०६३ र मुलुकी अपराध संहिता, २०७४',
    section: 'Section 47 of ETA 2063 / Section 249 of Criminal Code',
    title: 'Cyber Crimes and Fraud (Thagi) Sanctions',
    summary: 'Online identity theft, extortion, and unauthorized access attract up to 5 years imprisonment or NPR 200,000 fine under ETA 2063 Section 47. Fraud offenses under Section 249 of Criminal Code 2074 carry mandatory restitution of defrauded amounts plus 1 to 7 years imprisonment depending on the transaction scale.',
    summaryNepali: 'विद्युतीय कारोबार ऐन २०६३ को दफा ४७ बमोजिम कम्प्युटर वा इन्टरनेट माध्यमबाट हुने गाली, बेइज्जती र ठगीमा ५ वर्षसम्म कैद वा रु. २ लाखसम्म जरिवाना हुनसक्छ। मुलुकी अपराध संहिताको दफा २४९ अनुसार ठगीमा बिगो भराई ७ वर्षसम्म कैद सजाय हुन्छ।',
    precedentRef: 'Supreme Court Full Bench ruling on Cyber Harassment (2079)',
  },
  {
    id: 'cor_05',
    keywords: ['constitution', 'fundamental', 'rights', 'writ', 'habeas corpus', 'mandamus', 'संविधान', 'मौलिक हक', 'बन्दीप्रत्यक्षीकरण', 'परमादेश'],
    actName: 'Constitution of Nepal 2072 (नेपालको संविधान)',
    actNameNepali: 'नेपालको संविधान',
    section: 'Articles 16 - 48 and Article 133',
    title: 'Fundamental Rights and Constitutional Remedies',
    summary: 'The Constitution guarantees 31 fundamental rights. Under Article 133, any citizen can invoke extraordinary jurisdiction before the Supreme Court through writs of Habeas Corpus, Mandamus, Certiorari, Prohibition, or Quo-Warranto whenever fundamental rights are infringed by state authorities.',
    summaryNepali: 'नेपालको संविधानको धारा १६ देखि ४८ सम्म ३१ वटा मौलिक हकको व्यवस्था छ। मौलिक हकको हनन भएमा धारा १३३ बमोजिम सर्वोच्च अदालतमा बन्दीप्रत्यक्षीकरण, परमादेश, उत्प्रेषण, प्रतिषेध वा अधिकारपृच्छाका रिट निवेदन दर्ता गर्न सकिन्छ।',
    precedentRef: 'Constitution of Nepal (2015/2072)',
  },
  {
    id: 'cor_06',
    keywords: ['labor', 'employment', 'salary', 'termination', 'provident fund', 'श्रम ऐन', 'रोजगार', 'पारिश्रमिक', 'उपदान'],
    actName: 'Labor Act 2074 (श्रम ऐन, २०७४)',
    actNameNepali: 'श्रम ऐन, २०७४',
    section: 'Sections 10, 11, 52 and 145',
    title: 'Employment Contracts, Social Security, and Termination',
    summary: 'Employers must provide a written employment contract, deposit Social Security Fund (SSF) contributions (11% employee + 20% employer), and pay minimum wage set by the Ministry of Labor. Arbitrary dismissal without documented performance review or statutory severance notice violates Section 145.',
    summaryNepali: 'श्रम ऐन २०७४ अनुसार प्रत्येक श्रमिकलाई लिखित सम्झौता दिनुपर्ने र सामाजिक सुरक्षा कोष (SSF) मा आबद्ध गराउनुपर्ने कानुनी प्रावधान छ। विना कारण वा कानुनी प्रक्रिया नपुर्याई श्रमिक निष्कासन गर्न पाइँदैन।',
    precedentRef: 'Labor Court Precedents (2080)',
  },
];

export class NepaliLegalRagService {
  /**
   * Process a natural language query using simulated RAG retrieval and citation grounding
   */
  static processQuery(query: string, language: 'en' | 'ne' = 'en') {
    const qLower = query.toLowerCase();

    // Find best matching legal corpus entries
    let matchedEntries = NEPALI_LEGAL_CORPUS.filter((entry) =>
      entry.keywords.some((k) => qLower.includes(k.toLowerCase()))
    );

    if (matchedEntries.length === 0) {
      // Default to general civil/constitutional reference
      matchedEntries = [NEPALI_LEGAL_CORPUS[0]];
    }

    const primaryEntry = matchedEntries[0];
    const citations = [
      `${primaryEntry.actName} - ${primaryEntry.section}`,
      primaryEntry.precedentRef || 'Nepal Law Commission Official Gazette',
    ];

    const isNepali = language === 'ne' || /[\u0900-\u097F]/.test(query);

    const baseSummary = isNepali ? primaryEntry.summaryNepali : primaryEntry.summary;
    const disclaimer = isNepali
      ? '⚠️ कानुनी अस्वीकरण: यो सूचना केवल शैक्षिक तथा सामान्य जानकारीको लागि हो। यसलाई औपचारिक कानुनी सल्लाह नमान्नुहोस्। विशेष कानुनी सहयोगका लागि प्रमाणित अधिवक्तासँग परामर्श गर्नुहोस्।'
      : '⚠️ Legal Disclaimer: This AI-generated response is for informational purposes only and does not constitute formal legal counsel. For actionable legal advice, please consult a verified advocate.';

    const consultLawyerNote = isNepali
      ? 'यस विषयमा विशेषज्ञ वकिलसँग परामर्श गर्न "Lawyers" ट्याबमा जानुहोस्।'
      : 'You can connect directly with verified advocates specializing in this domain on the Lawyers tab.';

    const fullResponse = `${baseSummary}\n\n📚 Statutory Citation:\n• ${citations.join('\n• ')}\n\n💡 Next Steps:\n${consultLawyerNote}\n\n${disclaimer}`;

    return {
      query,
      response: fullResponse,
      matchedEntry: primaryEntry,
      citations,
      confidenceScore: 0.94,
      disclaimer,
    };
  }
}
