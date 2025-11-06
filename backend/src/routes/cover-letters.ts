import { Router } from 'express';
import type { Request, Response } from 'express';
import OpenAI from 'openai';
import { pool } from '../db';
import { authenticateJWT } from '../authenticateToken';

const router = Router();

// Temporary debug routes (no auth) for testing
router.post('/parse-debug', async (req: Request, res: Response) => {
  logDebug('🔍 DEBUG ENDPOINT HIT', {
    headers: req.headers,
    body: req.body
  });
  return res.json({ ok: true, received: req.body });
});

// Full parse without auth for testing
router.post('/test', async (req: Request, res: Response) => {
  console.log('🔍 STARTING PARSE WITHOUT AUTH');
  try {
    console.log('Request body:', req.body);
    const { raw_job_text } = req.body;
    
    if (!raw_job_text) {
      console.log('❌ ERROR: No job description provided');
      return res.status(400).json({ error: 'No job description provided' });
    }

    // Try heuristic parsing first
    const heur = heuristicExtract(raw_job_text);
    console.log('📊 Heuristic Results', heur);

    return res.json({ 
      parsed: {
        title: "Test Job",
        company: null,
        responsibilities: heur.responsibilities,
        requirements: heur.requirements,
        keywords: [],
        confidence: 0.5,
        method: 'heuristic',
        language: 'en'
      },
      confidence: 0.5
    });
  } catch (error) {
    logDebug('❌ ERROR in parse-noauth', error);
    return res.status(500).json({ error: String(error) });
  }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Interfaces
interface ParsedJobDescription {
  title: string;
  company: string;
  responsibilities: string[];
  requirements: string[];
  keywords?: string[];
  confidence: number;
  method: 'ai' | 'heuristic';
  language: string;
}

interface AIParseResponse {
  parsed: ParsedJobDescription;
  error?: string;
}


// Debug logging function
const logDebug = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log('\n========================================');
  console.log(`=== ${timestamp}: ${message} ===`);
  console.log('========================================');
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  // Force flush stdout
  if (process && process.stdout && process.stdout.write) {
    process.stdout.write('');
  }
};

// Calculate confidence based on completeness and quality
const calculateConfidence = (parsed: any): number => {
  let score = 0;
  let total = 0;

  // Check title
  if (parsed.title) {
    score += parsed.title.length > 10 ? 1 : 0.5; // More points for detailed titles
    total += 1;
  }

  // Check company
  if (parsed.company) {
    score += 1;
    total += 1;
  }

  // Check responsibilities
  if (Array.isArray(parsed.responsibilities) && parsed.responsibilities.length > 0) {
    // More points for more detailed responsibilities
    score += Math.min(parsed.responsibilities.length / 3, 1);
    total += 1;
  }

  // Check requirements
  if (Array.isArray(parsed.requirements) && parsed.requirements.length > 0) {
    // More points for more detailed requirements
    score += Math.min(parsed.requirements.length / 3, 1);
    total += 1;
  }

  // Normalize to 0-1 range
  return total > 0 ? Math.min(score / total, 1) : 0;
};

// Heuristic extractor: fallback when AI returns empty lists
const heuristicExtract = (text: string) => {
  logDebug('🔎 Running heuristicExtract');
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.map(l => l.trim()).filter(Boolean);
  logDebug('Heuristic - raw lines count', { rawCount: rawLines.length, nonEmptyCount: lines.length });

  const result: { responsibilities: string[]; requirements: string[] } = { responsibilities: [], requirements: [] };

  const sectionHeaders = {
    responsibilities: /responsibilit|responsas?bilidades|responsibilities|duties|what you'll do|responsabilidades/i,
    requirements: /requirement|requisitos|qualifications|skills required|what we need|requisitos/i,
  };

  let current: 'responsibilities' | 'requirements' | null = null;
  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx];
    const line = raw.replace(/^[:\s]+|[:\s]+$/g, '').trim();

    // detect headers even if they end with ':' or are uppercase
    if (sectionHeaders.responsibilities.test(line)) {
      logDebug('Heuristic - found responsibilities header', { idx, line });
      current = 'responsibilities';
      continue;
    }
    if (sectionHeaders.requirements.test(line)) {
      logDebug('Heuristic - found requirements header', { idx, line });
      current = 'requirements';
      continue;
    }

    // bullets: -, •, *, numbered '1.' or '1)' or '1) ' or 'a)'
    const bulletMatch = line.match(/^[\-\u2022\*]\s+(.+)$/) || line.match(/^\d+[\.)]\s*(.+)$/) || line.match(/^[a-zA-Z][\.)]\s+(.+)$/);
    if (bulletMatch) {
      const item = bulletMatch[1].trim();
      if (current && item) {
        logDebug('Heuristic - captured bullet', { idx, item, section: current });
        result[current].push(item);
        continue;
      }
    }

    // lines that start with a dash without space (e.g. '-Do X')
    if (/^[\-]\w/.test(line)) {
      const item = line.replace(/^[\-]+/, '').trim();
      if (current && item) {
        logDebug('Heuristic - captured dash-without-space', { idx, item, section: current });
        result[current].push(item);
        continue;
      }
    }

    // If inside a detected section, take the whole line as an item (helps with pasted text)
    if (current) {
      logDebug('Heuristic - adding line inside current section', { idx, line, section: current });
      result[current].push(line);
      continue;
    }

    // Also attempt to detect inline markers like 'RESPONSIBILITIES: Do X' in the same line
    const inlineResp = line.match(/responsibilit(?:ies|ad)?[:\-]\s*(.+)/i);
    if (inlineResp) {
      const item = inlineResp[1].trim();
      if (item) {
        logDebug('Heuristic - inline responsibilities', { idx, item });
        result.responsibilities.push(item);
        continue;
      }
    }
    const inlineReq = line.match(/requirement(?:s)?[:\-]\s*(.+)/i) || line.match(/requisitos[:\-]\s*(.+)/i);
    if (inlineReq) {
      const item = inlineReq[1].trim();
      if (item) {
        logDebug('Heuristic - inline requirements', { idx, item });
        result.requirements.push(item);
        continue;
      }
    }
  }

  // Deduplicate and trim
  result.responsibilities = Array.from(new Set(result.responsibilities.map(s => s.trim()))).filter(Boolean);
  result.requirements = Array.from(new Set(result.requirements.map(s => s.trim()))).filter(Boolean);

  logDebug('Heuristic - final extract counts', { responsibilities: result.responsibilities.length, requirements: result.requirements.length });
  return result;
};

// Parse job description using AI
router.post('/parse', authenticateJWT, async (req: Request, res: Response) => {
  try {
    logDebug('NUEVA PETICIÓN DE PARSING');
    
    // Log request details
    logDebug('Request Headers', req.headers);
    logDebug('Request Body', req.body);
    
    // Add small delay to ensure logs are visible
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { raw_job_text } = req.body;

    if (!raw_job_text) {
      logDebug('ERROR: No job description provided');
      return res.status(400).json({ error: 'No job description provided' });
    }

    logDebug('Texto a procesar', { text: raw_job_text });
    
    // Add small delay to ensure logs are visible
    await new Promise(resolve => setTimeout(resolve, 100));

    // Detect language using AI (graceful fallback on errors)
    logDebug('Iniciando detección de idioma');
    let detectedLanguage = 'en';
    try {
      const languageResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a language detector. Respond with only the ISO 639-1 language code of the text."
          },
          {
            role: "user",
            content: raw_job_text
          }
        ]
      });
      detectedLanguage = languageResponse.choices[0]?.message?.content?.trim() || 'en';
      logDebug('Idioma detectado', { language: detectedLanguage });
    } catch (e: any) {
      // If OpenAI fails (rate limit, quota, network), fall back to default language and continue
      logDebug('⚠️ OpenAI language detection failed, falling back to default', { error: e?.message ?? e });
      detectedLanguage = 'en';
    }

    // Add small delay
    await new Promise(resolve => setTimeout(resolve, 100));

    logDebug('🤖 Iniciando análisis con OpenAI');

  // Parse job description using AI with graceful fallback to heuristic when OpenAI fails
  let parsedContent: any = null;
  let usedMethod: 'ai' | 'heuristic' = 'ai';
  let aiAvailable = true;
  let aiErrorMessage: string | null = null;
    try {
      const parseResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0, // Set to 0 for most consistent parsing
        messages: [
          {
            role: "system",
            content: `Eres un analizador de descripciones de trabajo. Tu tarea es extraer información clave del texto proporcionado y devolverla EN UN FORMATO JSON VÁLIDO.

REGLAS IMPORTANTES:
1. SOLO extrae información que esté EXPLÍCITAMENTE en el texto
2. NO hagas suposiciones ni inferencias
3. Si no encuentras información para un campo, usa null
4. SIEMPRE responde con este formato JSON exacto:
{
  "title": "Título completo del trabajo exactamente como aparece",
  "company": "Nombre de la empresa o null si no se menciona",
  "responsibilities": [
    "Cada responsabilidad en un elemento separado",
    "Usa el texto exacto del original"
  ],
  "requirements": [
    "Cada requisito en un elemento separado",
    "Incluye requisitos obligatorios y deseables"
  ]
}

NO incluyas ningún otro texto en tu respuesta, SOLO el JSON.

Required fields to extract:
{
  "title": "Full job title exactly as written",
  "company": "Company name if explicitly mentioned",
  "responsibilities": [
    "Each main responsibility as a separate item",
    "Keep the original wording when possible",
    "Only include clearly stated responsibilities"
  ],
  "requirements": [
    "Each requirement/qualification as a separate item",
    "Include both required and preferred qualifications",
    "Maintain original phrasing when possible"
  ]
}

Examples of good extraction:
- Title: "Senior Software Engineer (Remote)" NOT just "Software Engineer"
- Company: "Microsoft Corporation" or null if not mentioned
- Responsibilities: ["Design and implement RESTful APIs", "Lead code reviews"]
- Requirements: ["5+ years Java experience", "Bachelor's in Computer Science or equivalent"]

Focus on accuracy over completeness. If unsure about any piece of information, use null.`
          },
          {
            role: "user",
            content: raw_job_text
          }
        ]
      });

      // Log the complete OpenAI response
      console.log('Complete OpenAI response:', JSON.stringify(parseResponse, null, 2));

      const rawContent = parseResponse.choices[0]?.message?.content;
      console.log('Raw content from OpenAI:', rawContent);

      parsedContent = JSON.parse(rawContent || '{}');
      console.log('Parsed content:', JSON.stringify(parsedContent, null, 2));
    } catch (e: any) {
      // If OpenAI fails (rate limit, quota, etc.), log and fall back to heuristic parsing
      aiAvailable = false;
      aiErrorMessage = e?.message ?? String(e);
      logDebug('⚠️ OpenAI parsing failed, using heuristic fallback', { error: aiErrorMessage, code: e?.code ?? null });
      const heur = heuristicExtract(raw_job_text);
      parsedContent = {
        title: null,
        company: null,
        responsibilities: heur.responsibilities,
        requirements: heur.requirements,
        keywords: []
      };
      usedMethod = 'heuristic';
    }

    // Ensure arrays exist
    parsedContent.responsibilities = parsedContent.responsibilities ?? [];
    parsedContent.requirements = parsedContent.requirements ?? [];
    parsedContent.keywords = parsedContent.keywords ?? [];

    // If AI returned empty lists, try a heuristic fallback
    if ((parsedContent.responsibilities.length === 0 || parsedContent.requirements.length === 0)) {
      logDebug('AI returned empty lists, running heuristic fallback');
      const heur = heuristicExtract(raw_job_text);
      if (parsedContent.responsibilities.length === 0 && heur.responsibilities.length > 0) {
        parsedContent.responsibilities = heur.responsibilities;
      }
      if (parsedContent.requirements.length === 0 && heur.requirements.length > 0) {
        parsedContent.requirements = heur.requirements;
      }
      usedMethod = 'heuristic';
    }

    const result: ParsedJobDescription = {
      title: parsedContent.title ?? null,
      company: parsedContent.company ?? null,
      responsibilities: parsedContent.responsibilities,
      requirements: parsedContent.requirements,
      keywords: parsedContent.keywords ?? [],
      confidence: calculateConfidence(parsedContent),
      method: usedMethod,
      language: detectedLanguage
    };

  // Return both parsed object and top-level confidence for the frontend
  return res.json({ parsed: result, confidence: result.confidence, ai_available: aiAvailable, ai_error: aiErrorMessage });
  } catch (error) {
    console.error('Error parsing job description:', error);
    return res.status(500).json({ 
      error: 'Failed to parse job description',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate cover letter
router.post('/generate', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { parsed, config, user_profile } = req.body;

    if (!parsed) {
      return res.status(400).json({ error: 'No parsed job data provided' });
    }

    // Generate cover letter using AI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7, // Allow some creativity in generation
      messages: [
        {
          role: "system",
          content: "You are a professional cover letter writer.\n" +
            `Write a cover letter in the specified language: ${parsed.language || 'en'}.\n` +
            "Use this format:\n" +
            `- Professional and ${config.tone || 'formal'} tone\n` +
            `- ${config.length || 'medium'} length\n` +
            `- Match the template style: ${config.template || 'standard'}`
        },
        {
          role: "user",
          content: `Write a cover letter for a ${parsed.title} position at ${parsed.company}.\n\n` +
            "Job Responsibilities:\n" +
            `${parsed.responsibilities?.join("\n")}\n\n` +
            "Job Requirements:\n" +
            `${parsed.requirements?.join("\n")}\n\n` +
            "User Profile:\n" +
            `${JSON.stringify(user_profile, null, 2)}`
        }
      ]
    });

    const coverLetter = response.choices[0]?.message?.content || '';

    if (!coverLetter) {
      return res.status(500).json({ 
        error: 'Failed to generate cover letter',
        details: 'The AI response was empty'
      });
    }

    return res.json({ 
      variants: [coverLetter],
      metadata: {
        model: "gpt-3.5-turbo",
        language: parsed.language,
        confidence: calculateConfidence(parsed)
      }
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return res.status(500).json({ 
      error: 'Failed to generate cover letter',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;