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

// ====== CRUD ENDPOINTS FOR COVER LETTERS ======

// List all cover letters for authenticated user
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  try {
    const result = await pool.query(
      'SELECT id, title, company, status, created_at, updated_at FROM cover_letters WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting cover letters:', err);
    res.status(500).json({ error: 'Error obteniendo cover letters' });
  }
});

// Create new cover letter (draft)
router.post('/', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { title, company, raw_job_text, parsed, config } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO cover_letters (user_id, title, company, raw_job_text, parsed, config, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'draft') RETURNING *`,
      [userId, title || null, company || null, raw_job_text || null, parsed || null, config || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating cover letter:', err);
    res.status(500).json({ error: 'Error creando cover letter' });
  }
});

// Get single cover letter by ID
router.get('/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id;
  try {
    const result = await pool.query(
      'SELECT * FROM cover_letters WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cover letter no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting cover letter:', err);
    res.status(500).json({ error: 'Error obteniendo cover letter' });
  }
});

// Update cover letter
router.put('/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id;
  const { title, company, raw_job_text, parsed, config, generated_draft, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cover_letters 
       SET title = $1, company = $2, raw_job_text = $3, parsed = $4, config = $5, 
           generated_draft = $6, status = $7, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [title || null, company || null, raw_job_text || null, parsed || null, config || null, 
       generated_draft || null, status || 'draft', id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cover letter no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating cover letter:', err);
    res.status(500).json({ error: 'Error actualizando cover letter' });
  }
});

// Delete cover letter
router.delete('/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM cover_letters WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cover letter no encontrada' });
    }
    res.json({ message: 'Cover letter eliminada' });
  } catch (err) {
    console.error('Error deleting cover letter:', err);
    res.status(500).json({ error: 'Error eliminando cover letter' });
  }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Light retry wrapper for OpenAI with exponential backoff
async function chatWithOpenAI(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[], 
  temperature = 0,
  useJsonFormat = false
) {
  const maxAttempts = 3;
  let attempt = 0;
  let lastError: any = null;
  
  while (attempt < maxAttempts) {
    try {
      const params: any = {
        model: OPENAI_MODEL,
        temperature,
        messages,
      };
      
      // Only add response_format if explicitly requested
      if (useJsonFormat) {
        params.response_format = { type: 'json_object' };
      }
      
      return await openai.chat.completions.create(params);
    } catch (e: any) {
      lastError = e;
      const code = e?.code || e?.status;
      const msg = e?.message || String(e);
      
      // Don't retry insufficient_quota (billing issue)
      const isQuota = code === 'insufficient_quota' || /insufficient_quota/i.test(msg);
      const isRate = code === 429 || /rate limit|too many requests/i.test(msg);
      const isServer = (typeof code === 'number' && code >= 500) || /server error/i.test(msg);
      
      if (isQuota) break;
      if (!(isRate || isServer)) break;
      
      // Exponential backoff: 300ms, 900ms
      const delay = 300 * Math.pow(3, attempt);
      await new Promise(r => setTimeout(r, delay));
      attempt += 1;
    }
  }
  throw lastError;
}

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


// Logging helpers: minimal by default, verbose if COVER_LETTERS_VERBOSE=1
const isVerbose = process.env.COVER_LETTERS_VERBOSE === '1';

const logInfo = (message: string, data?: any) => {
  const ts = new Date().toISOString();
  if (data !== undefined) {
    console.log(`[cover-letters][${ts}] ${message} ${JSON.stringify(data)}`);
  } else {
    console.log(`[cover-letters][${ts}] ${message}`);
  }
};

const logDebug = (message: string, data?: any) => {
  if (!isVerbose) return;
  const ts = new Date().toISOString();
  console.log(`[cover-letters:verbose][${ts}] ${message}`);
  if (data !== undefined) console.log(JSON.stringify(data, null, 2));
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
    // Minimal start log
    logInfo('Nueva consulta iniciada /parse');
    
    const { raw_job_text } = req.body;

    if (!raw_job_text) {
      logInfo('Solicitud inválida: raw_job_text faltante');
      return res.status(400).json({ error: 'No job description provided' });
    }

    logDebug('Texto a procesar (snippet)', { snippet: String(raw_job_text).slice(0, 200) });

    // Detect language using AI (graceful fallback on errors)
    logDebug('Iniciando detección de idioma');
    let detectedLanguage = 'en';
    try {
      const languageResponse = await chatWithOpenAI(
        [
          {
            role: "system",
            content: "You are a language detector. Respond with only the ISO 639-1 language code of the text."
          },
          {
            role: "user",
            content: raw_job_text
          }
        ],
        0,
        false // Language detection doesn't need JSON format
      );
      detectedLanguage = languageResponse.choices[0]?.message?.content?.trim() || 'en';
      logDebug('Idioma detectado', { language: detectedLanguage });
    } catch (e: any) {
      // If OpenAI fails (rate limit, quota, network), fall back to default language and continue
      logDebug('⚠️ OpenAI language detection failed, falling back to default', { error: e?.message ?? e });
      detectedLanguage = 'en';
    }

  // Remove artificial delays

  logDebug('🤖 Iniciando análisis con OpenAI');

  // Parse job description using AI with graceful fallback to heuristic when OpenAI fails
  let parsedContent: any = null;
  let usedMethod: 'ai' | 'heuristic' = 'ai';
  let aiAvailable = true;
  let aiErrorMessage: string | null = null;
    try {
      const parseResponse = await chatWithOpenAI(
        [
          {
            role: "system",
            content: `You are a job description parser. Extract information from job postings and return it as JSON.

IMPORTANT RULES:
1. ONLY extract information that is EXPLICITLY in the text
2. DO NOT make assumptions or inferences
3. If you can't find information for a field, use null
4. ALWAYS respond with this exact JSON format:
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
        ],
        0, // Temperature 0 for consistent parsing
        true // Use JSON format
      );

  // Verbose-only logs for OpenAI output
  logDebug('OpenAI response received');
  const rawContent = parseResponse.choices[0]?.message?.content;
  logDebug('Raw content from OpenAI', rawContent);
  parsedContent = JSON.parse(rawContent || '{}');
  logDebug('Parsed content', parsedContent);
    } catch (e: any) {
      // If OpenAI fails (rate limit, quota, etc.), log and fall back to heuristic parsing
      aiAvailable = false;
      aiErrorMessage = e?.message ?? String(e);
  logInfo('OpenAI no disponible, usando heurística');
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
      logInfo('Listas vacías detectadas, aplicando heurística complementaria');
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

    // Minimal result summary
    logInfo('Resultados parse', {
      language: detectedLanguage,
      method: usedMethod,
      ai_available: aiAvailable,
      title: result.title,
      company: result.company,
      responsibilities: result.responsibilities?.length || 0,
      requirements: result.requirements?.length || 0,
      confidence: result.confidence
    });

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
    const userId = req.user?.userId;
    const { parsed, config, cover_letter_id } = req.body;

    if (!parsed) {
      return res.status(400).json({ error: 'No parsed job data provided' });
    }

    console.log('[cover-letters] Generating cover letter for user', userId);

    // Get complete user profile from database
    const [userResult, workExpResult, educationResult, skillsResult] = await Promise.all([
      pool.query('SELECT nombres, apellidos, email, telefono FROM users WHERE id = $1', [userId]),
      pool.query('SELECT empresa, puesto, fecha_inicio, fecha_fin, descripcion FROM work_experiences WHERE user_id = $1 ORDER BY fecha_inicio DESC LIMIT 5', [userId]),
      pool.query('SELECT institution, degree, field_of_study, end_date FROM education WHERE user_id = $1 ORDER BY start_date DESC LIMIT 3', [userId]),
      pool.query('SELECT name, level FROM skills WHERE user_id = $1 AND category = \'technical\' LIMIT 10', [userId])
    ]);

    const userProfile = {
      name: `${userResult.rows[0]?.nombres} ${userResult.rows[0]?.apellidos}`,
      email: userResult.rows[0]?.email,
      phone: userResult.rows[0]?.telefono,
      work_experience: workExpResult.rows.map(exp => ({
        company: exp.empresa,
        position: exp.puesto,
        duration: `${exp.fecha_inicio} to ${exp.fecha_fin || 'Present'}`,
        description: exp.descripcion
      })),
      education: educationResult.rows.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field_of_study,
        graduation: edu.end_date
      })),
      skills: skillsResult.rows.map(s => s.name)
    };

    console.log('[cover-letters] Profile loaded, calling OpenAI');

    // Build detailed prompt for cover letter generation
    const systemPrompt = `You are an expert cover letter writer. Write a professional, compelling cover letter that:
- Is written in ${parsed.language === 'es' ? 'Spanish' : 'English'}
- Has a ${config?.tone || 'professional'} tone
- Is ${config?.length === 'short' ? '200-250' : config?.length === 'long' ? '400-500' : '300-350'} words
- Directly addresses the job requirements and responsibilities
- Highlights the candidate's most relevant experience and skills
- Shows genuine interest and enthusiasm for the role
- Uses specific examples when possible
- Avoids clichés and generic statements

Format:
[Greeting]
Dear Hiring Manager,

[Opening paragraph - Hook their interest]
[Body paragraph 1 - Address key requirements with your experience]
[Body paragraph 2 - Highlight relevant achievements and skills]
[Closing paragraph - Call to action and enthusiasm]

Sincerely,
${userProfile.name}`;

    const userPrompt = `Job Position: ${parsed.title || 'Position'}
Company: ${parsed.company || 'the company'}

Key Responsibilities:
${parsed.responsibilities?.slice(0, 5).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n') || 'Not specified'}

Key Requirements:
${parsed.requirements?.slice(0, 5).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n') || 'Not specified'}

Candidate Profile:
Name: ${userProfile.name}
Email: ${userProfile.email}

Recent Work Experience:
${userProfile.work_experience.slice(0, 3).map((exp: any, i: number) => 
  `${i + 1}. ${exp.position} at ${exp.company} (${exp.duration})\n   ${exp.description || ''}`
).join('\n\n') || 'No work experience listed'}

Education:
${userProfile.education.map((edu: any) => 
  `- ${edu.degree} in ${edu.field} from ${edu.institution}`
).join('\n') || 'No education listed'}

Technical Skills: ${userProfile.skills.join(', ') || 'Not specified'}

Write a cover letter that connects this candidate's background to this specific job opportunity.`;

    // Generate cover letter with OpenAI
    const response = await chatWithOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], 0.7, false); // Don't use JSON format - we want plain text

    const coverLetter = response.choices[0]?.message?.content || '';

    if (!coverLetter) {
      return res.status(500).json({ 
        error: 'Failed to generate cover letter',
        details: 'The AI response was empty'
      });
    }

    console.log('[cover-letters] Cover letter generated successfully');

    // If cover_letter_id provided, update the database record
    if (cover_letter_id) {
      await pool.query(
        `UPDATE cover_letters 
         SET generated_draft = $1, status = 'generated', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND user_id = $3`,
        [coverLetter, cover_letter_id, userId]
      );
      console.log('[cover-letters] Updated cover letter record', cover_letter_id);
    }

    return res.json({ 
      variants: [coverLetter],
      generated_draft: coverLetter,
      metadata: {
        model: OPENAI_MODEL,
        language: parsed.language,
        word_count: coverLetter.split(/\s+/).length,
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