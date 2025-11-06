
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// use global fetch available in modern Node.js; dotenv already configured in index.ts

// Extiende el tipo Request para permitir req.user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const router = Router();

// ====== ENDPOINTS PARA HABILIDADES ======
// Obtener habilidades del usuario
router.get('/skills', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  try {
    const result = await pool.query(
      `SELECT id, name, category, level, years_experience, description, created_at FROM skills WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting skills:', err);
    res.status(500).json({ error: 'Error obteniendo habilidades' });
  }
});

// Crear habilidad
router.post('/skills', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { name, category, level, years_experience, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO skills (user_id, name, category, level, years_experience, description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [userId, name, category || null, level, years_experience || null, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating skill:', err);
    res.status(500).json({ error: 'Error creando habilidad' });
  }
});

// Actualizar habilidad
router.put('/skills/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id;
  const { name, category, level, years_experience, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE skills SET name=$1, category=$2, level=$3, years_experience=$4, description=$5 WHERE id=$6 AND user_id=$7 RETURNING *`,
      [name, category || null, level, years_experience || null, description || null, id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Habilidad no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating skill:', err);
    res.status(500).json({ error: 'Error actualizando habilidad' });
  }
});

// Eliminar habilidad
router.delete('/skills/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM skills WHERE id=$1 AND user_id=$2 RETURNING *', [id, userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Habilidad no encontrada' });
    res.json({ message: 'Habilidad eliminada' });
  } catch (err) {
    console.error('Error deleting skill:', err);
    res.status(500).json({ error: 'Error eliminando habilidad' });
  }
});

function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ error: 'Token inválido' });
    }
  }

  // Obtener datos personales del usuario autenticado
  router.get('/user', authenticateJWT, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    try {
      // Obtener datos básicos del usuario
      const userResult = await pool.query(
        'SELECT username, nombres, apellidos, fecha_nacimiento, telefono, direccion, email FROM users WHERE id = $1',
        [userId]
      );
      if (userResult.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      
      // Obtener todas las redes sociales de user_links
      const socialLinksResult = await pool.query(
        'SELECT type, title, url FROM user_links WHERE user_id = $1',
        [userId]
      );
      
      // Combinar los datos
      const userData = userResult.rows[0];
      
      // Procesar redes sociales
      const socialLinks: { [key: string]: string } = {};
      socialLinksResult.rows.forEach(row => {
        const platformName = row.type === 'linkedin' ? 'LinkedIn' : 
                            row.type.charAt(0).toUpperCase() + row.type.slice(1);
        socialLinks[platformName] = row.url;
      });
      
      // Agregar LinkedIn para compatibilidad con el código existente
      userData.linkedin = socialLinks.LinkedIn || null;
      userData.socialLinks = socialLinks;
      
      res.json(userData);
    } catch (err: any) {
      res.status(500).json({ error: 'Error al obtener datos', details: err.message });
    }
  });

  // Actualizar datos personales opcionales
  router.put('/profile', authenticateJWT, async (req: Request, res: Response) => {
    const { telefono, direccion, linkedin } = req.body;
    const userId = req.user?.userId;
    try {
      // Actualizar datos básicos en users
      await pool.query(
        `UPDATE users SET telefono = $1, direccion = $2 WHERE id = $3`,
        [telefono || null, direccion || null, userId]
      );
      
      // Manejar LinkedIn en user_links
      if (linkedin) {
        // Verificar si ya existe un registro de LinkedIn
        const existingLinkedin = await pool.query(
          'SELECT id FROM user_links WHERE user_id = $1 AND type = $2',
          [userId, 'linkedin']
        );
        
        if (existingLinkedin.rows.length > 0) {
          // Actualizar LinkedIn existente
          await pool.query(
            'UPDATE user_links SET url = $1 WHERE user_id = $2 AND type = $3',
            [linkedin, userId, 'linkedin']
          );
        } else {
          // Crear nuevo registro de LinkedIn
          await pool.query(
            'INSERT INTO user_links (user_id, type, title, url) VALUES ($1, $2, $3, $4)',
            [userId, 'linkedin', 'LinkedIn', linkedin]
          );
        }
      } else {
        // Si linkedin está vacío, eliminar el registro existente
        await pool.query(
          'DELETE FROM user_links WHERE user_id = $1 AND type = $2',
          [userId, 'linkedin']
        );
      }
      res.json({ message: 'Datos actualizados correctamente' });
    } catch (err) {
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      res.status(500).json({ error: 'Error al actualizar datos', details: message });
    }
  });

  // Manejar redes sociales del usuario
  router.put('/social-links', authenticateJWT, async (req: Request, res: Response) => {
    const { socialLinks } = req.body; // { platform: url, platform2: url2, ... }
    const userId = req.user?.userId;
    
    try {
      // Obtener todas las redes sociales existentes (excepto LinkedIn)
      const existingLinks = await pool.query(
        'SELECT id, type, url FROM user_links WHERE user_id = $1 AND type != $2',
        [userId, 'linkedin']
      );
      
      // Crear un mapa de los links existentes
      const existingMap = new Map();
      existingLinks.rows.forEach(row => {
        const platformName = row.type.charAt(0).toUpperCase() + row.type.slice(1);
        existingMap.set(platformName, { id: row.id, url: row.url });
      });
      
      // Procesar cada red social del frontend
      for (const [platform, url] of Object.entries(socialLinks)) {
        if (platform !== 'LinkedIn' && url && typeof url === 'string' && url.trim() !== '') {
          const cleanUrl = url.trim();
          const existing = existingMap.get(platform);
          
          if (existing) {
            // Si existe pero la URL cambió, actualizar
            if (existing.url !== cleanUrl) {
              await pool.query(
                'UPDATE user_links SET url = $1 WHERE id = $2',
                [cleanUrl, existing.id]
              );
            }
            // Marcar como procesado
            existingMap.delete(platform);
          } else {
            // No existe, crear nuevo
            await pool.query(
              'INSERT INTO user_links (user_id, type, title, url) VALUES ($1, $2, $3, $4)',
              [userId, platform.toLowerCase(), platform, cleanUrl]
            );
          }
        }
      }
      
      // Eliminar las redes sociales que ya no están en el frontend
      for (const [platform, data] of existingMap.entries()) {
        await pool.query('DELETE FROM user_links WHERE id = $1', [data.id]);
      }
      
      res.json({ message: 'Redes sociales actualizadas correctamente' });
    } catch (err) {
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      res.status(500).json({ error: 'Error al actualizar redes sociales', details: message });
    }
  });

  // Obtener redes sociales del usuario
  router.get('/social-links', authenticateJWT, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    
    try {
      const result = await pool.query(
        'SELECT type, title, url FROM user_links WHERE user_id = $1',
        [userId]
      );
      
      // Convertir a objeto { platform: url }
      const socialLinks: { [key: string]: string } = {};
      result.rows.forEach(row => {
        // Capitalizar el nombre de la plataforma para consistencia con el frontend
        const platformName = row.type === 'linkedin' ? 'LinkedIn' : 
                            row.type.charAt(0).toUpperCase() + row.type.slice(1);
        socialLinks[platformName] = row.url;
      });
      
      res.json(socialLinks);
    } catch (err) {
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      res.status(500).json({ error: 'Error al obtener redes sociales', details: message });
    }
  });

  // Endpoint unificado para guardar toda la información de contacto
  router.put('/contact-info', authenticateJWT, async (req: Request, res: Response) => {
    const { telefono, direccion, socialLinks } = req.body;
    const userId = req.user?.userId;
    
    try {
      // 1. Actualizar datos básicos en users
      await pool.query(
        `UPDATE users SET telefono = $1, direccion = $2 WHERE id = $3`,
        [telefono || null, direccion || null, userId]
      );
      
      // 2. Manejar LinkedIn específicamente (para compatibilidad)
      const linkedin = socialLinks?.LinkedIn;
      if (linkedin) {
        const existingLinkedin = await pool.query(
          'SELECT id FROM user_links WHERE user_id = $1 AND type = $2',
          [userId, 'linkedin']
        );
        
        if (existingLinkedin.rows.length > 0) {
          await pool.query(
            'UPDATE user_links SET url = $1 WHERE user_id = $2 AND type = $3',
            [linkedin, userId, 'linkedin']
          );
        } else {
          await pool.query(
            'INSERT INTO user_links (user_id, type, title, url) VALUES ($1, $2, $3, $4)',
            [userId, 'linkedin', 'LinkedIn', linkedin]
          );
        }
      } else {
        await pool.query(
          'DELETE FROM user_links WHERE user_id = $1 AND type = $2',
          [userId, 'linkedin']
        );
      }
      
      // 3. Manejar otras redes sociales
      if (socialLinks) {
        const existingLinks = await pool.query(
          'SELECT id, type, url FROM user_links WHERE user_id = $1 AND type != $2',
          [userId, 'linkedin']
        );
        
        const existingMap = new Map();
        existingLinks.rows.forEach(row => {
          const platformName = row.type.charAt(0).toUpperCase() + row.type.slice(1);
          existingMap.set(platformName, { id: row.id, url: row.url });
        });
        
        for (const [platform, url] of Object.entries(socialLinks)) {
          if (platform !== 'LinkedIn' && url && typeof url === 'string' && url.trim() !== '') {
            const cleanUrl = url.trim();
            const existing = existingMap.get(platform);
            
            if (existing) {
              if (existing.url !== cleanUrl) {
                await pool.query('UPDATE user_links SET url = $1 WHERE id = $2', [cleanUrl, existing.id]);
              }
              existingMap.delete(platform);
            } else {
              await pool.query(
                'INSERT INTO user_links (user_id, type, title, url) VALUES ($1, $2, $3, $4)',
                [userId, platform.toLowerCase(), platform, cleanUrl]
              );
            }
          }
        }
        
        // Eliminar redes sociales que ya no están
        for (const [platform, data] of existingMap.entries()) {
          await pool.query('DELETE FROM user_links WHERE id = $1', [data.id]);
        }
      }
      
      res.json({ message: 'Información de contacto actualizada correctamente' });
    } catch (err) {
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      res.status(500).json({ error: 'Error al actualizar información de contacto', details: message });
    }
  });

  // Registro de usuario
  router.post('/signup', async (req: Request, res: Response) => {
    try {
      const { username, nombres, apellidos, fecha_nacimiento, telefono, email, password } = req.body;
      // Validación básica
      if (!username || !nombres || !apellidos || !fecha_nacimiento || !email || !password) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }
      // Verifica unicidad de username y email
      const userExists = await pool.query('SELECT 1 FROM users WHERE username = $1 OR email = $2', [username, email]);
      if (userExists.rows.length > 0) {
        return res.status(409).json({ error: 'El usuario o email ya existe' });
      }
      // Hash de contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      // Insertar usuario
      const result = await pool.query(
        `INSERT INTO users (username, nombres, apellidos, fecha_nacimiento, telefono, email, password)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, fecha_registro`,
        [username, nombres, apellidos, fecha_nacimiento, telefono, email, hashedPassword]
      );
      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: result.rows[0]
      });
    } catch (err) {
      console.error('Error en /signup:', err);
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      return res.status(500).json({ error: 'Error en el servidor', details: message });
    }
  });

  router.post('/signin', async (req: Request, res: Response) => {
    console.log("/signin called");
    try {
      const { username, password } = req.body;
      console.log("Body received", { username });
      // Verifica conexión a la base de datos
      console.log("Testing DB connection...");
      await pool.query('SELECT 1');
      console.log("DB connection OK");
      console.log("Querying user...");
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      console.log("Query result:", result.rows);
      const user = result.rows[0];
      if (!user) {
        console.log("User not found", { username });
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      // Verifica contraseña con bcrypt
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        console.log("Password mismatch", { username });
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET not set");
        return res.status(500).json({ error: 'JWT secret not set' });
      }
      console.log("User nombres:", user.nombres);
      console.log("Signing JWT...");
      const token = jwt.sign({
        userId: user.id,
        username: user.username,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email
      }, process.env.JWT_SECRET);
      console.log("Login success for", username);
      res.json({ token });
    } catch (err) {
      console.error("Server error in /signin:", err);
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      res.status(500).json({ error: 'Server error', details: message });
    }
  });

// ====== ENDPOINTS PARA EXPERIENCIA LABORAL ======

// Obtener todas las experiencias del usuario
router.get('/work-experiences', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  try {
    const result = await pool.query(
      `SELECT id, category, time_type, empresa, puesto, fecha_inicio, fecha_fin, 
              descripcion, ubicacion, created_at 
       FROM work_experiences 
       WHERE user_id = $1 
       ORDER BY fecha_inicio DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error getting work experiences:", err);
    res.status(500).json({ error: 'Error obteniendo experiencias laborales' });
  }
});

// Cover letters endpoints have been moved to `routes/cover-letters.ts`
// to keep routing modular and avoid duplication.
// See: backend/src/routes/cover-letters.ts

// Crear nueva experiencia laboral
router.post('/work-experiences', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { category, time_type, empresa, puesto, fecha_inicio, fecha_fin, descripcion, ubicacion } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO work_experiences (user_id, category, time_type, empresa, puesto, 
                                   fecha_inicio, fecha_fin, descripcion, ubicacion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [userId, category, time_type, empresa, puesto, fecha_inicio, fecha_fin || null, descripcion, ubicacion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating work experience:", err);
    res.status(500).json({ error: 'Error creando experiencia laboral' });
  }
});

// Actualizar experiencia laboral
router.put('/work-experiences/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const experienceId = req.params.id;
  const { category, time_type, empresa, puesto, fecha_inicio, fecha_fin, descripcion, ubicacion } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE work_experiences 
       SET category = $1, time_type = $2, empresa = $3, puesto = $4, 
           fecha_inicio = $5, fecha_fin = $6, descripcion = $7, ubicacion = $8
       WHERE id = $9 AND user_id = $10 
       RETURNING *`,
      [category, time_type, empresa, puesto, fecha_inicio, fecha_fin || null, descripcion, ubicacion, experienceId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Experiencia no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating work experience:", err);
    res.status(500).json({ error: 'Error actualizando experiencia laboral' });
  }
});

// Eliminar experiencia laboral
router.delete('/work-experiences/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const experienceId = req.params.id;
  
  try {
    const result = await pool.query(
      'DELETE FROM work_experiences WHERE id = $1 AND user_id = $2 RETURNING *',
      [experienceId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Experiencia no encontrada' });
    }
    
    res.json({ message: 'Experiencia eliminada exitosamente' });
  } catch (err) {
    console.error("Error deleting work experience:", err);
    res.status(500).json({ error: 'Error eliminando experiencia laboral' });
  }
});

// ====== ENDPOINTS PARA EDUCACIÓN ======
// Obtener todas las educaciones del usuario
router.get('/education', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  try {
    const result = await pool.query(
      `SELECT id, institution, degree, field_of_study, start_date, end_date, is_current, grade, description, created_at
       FROM education WHERE user_id = $1 ORDER BY start_date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting education records:', err);
    res.status(500).json({ error: 'Error obteniendo educación' });
  }
});

// Crear nuevo registro de educación
router.post('/education', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { institution, degree, field_of_study, start_date, end_date, is_current, grade, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO education (user_id, institution, degree, field_of_study, start_date, end_date, is_current, grade, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [userId, institution, degree, field_of_study, start_date, end_date || null, is_current || false, grade || null, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating education record:', err);
    res.status(500).json({ error: 'Error creando educación' });
  }
});

// Actualizar registro de educación
router.put('/education/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id;
  const { institution, degree, field_of_study, start_date, end_date, is_current, grade, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE education SET institution=$1, degree=$2, field_of_study=$3, start_date=$4, end_date=$5, is_current=$6, grade=$7, description=$8
       WHERE id=$9 AND user_id=$10 RETURNING *`,
      [institution, degree, field_of_study, start_date, end_date || null, is_current || false, grade || null, description || null, id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Registro de educación no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating education record:', err);
    res.status(500).json({ error: 'Error actualizando educación' });
  }
});

// Eliminar registro de educación
router.delete('/education/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM education WHERE id=$1 AND user_id=$2 RETURNING *', [id, userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Registro de educación no encontrado' });
    res.json({ message: 'Registro de educación eliminado' });
  } catch (err) {
    console.error('Error deleting education record:', err);
    res.status(500).json({ error: 'Error eliminando educación' });
  }
});

// ====== ENDPOINTS PARA CERTIFICACIONES ======
// Obtener certificaciones del usuario
router.get('/certifications', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  try {
    const result = await pool.query(
      `SELECT id, name, issuing_organization, issue_date, expiration_date, credential_id, credential_url, description, created_at
       FROM certifications WHERE user_id=$1 ORDER BY issue_date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting certifications:', err);
    res.status(500).json({ error: 'Error obteniendo certificaciones' });
  }
});

// Crear certificación
router.post('/certifications', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { name, issuing_organization, issue_date, expiration_date, credential_id, credential_url, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO certifications (user_id, name, issuing_organization, issue_date, expiration_date, credential_id, credential_url, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [userId, name, issuing_organization, issue_date || null, expiration_date || null, credential_id || null, credential_url || null, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating certification:', err);
    res.status(500).json({ error: 'Error creando certificación' });
  }
});

// Actualizar certificación
router.put('/certifications/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id;
  const { name, issuing_organization, issue_date, expiration_date, credential_id, credential_url, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE certifications SET name=$1, issuing_organization=$2, issue_date=$3, expiration_date=$4, credential_id=$5, credential_url=$6, description=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [name, issuing_organization, issue_date || null, expiration_date || null, credential_id || null, credential_url || null, description || null, id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Certificación no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating certification:', err);
    res.status(500).json({ error: 'Error actualizando certificación' });
  }
});

// Eliminar certificación
router.delete('/certifications/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM certifications WHERE id=$1 AND user_id=$2 RETURNING *', [id, userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Certificación no encontrada' });
    res.json({ message: 'Certificación eliminada' });
  } catch (err) {
    console.error('Error deleting certification:', err);
    res.status(500).json({ error: 'Error eliminando certificación' });
  }
});

// ====== ENDPOINTS PARA USER_LINKS (PORTAFOLIO) ======
// Obtener links del usuario
router.get('/user-links', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  try {
    const result = await pool.query('SELECT id, type, title, url, is_public, display_order, created_at FROM user_links WHERE user_id=$1 ORDER BY display_order ASC', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting user links:', err);
    res.status(500).json({ error: 'Error obteniendo enlaces de usuario' });
  }
});

// Crear link de usuario
router.post('/user-links', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { type, title, url, is_public, display_order } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO user_links (user_id, type, title, url, is_public, display_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [userId, type, title || null, url, is_public ?? true, display_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user link:', err);
    res.status(500).json({ error: 'Error creando enlace' });
  }
});

// Actualizar link de usuario
router.put('/user-links/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id;
  const { type, title, url, is_public, display_order } = req.body;
  try {
    const result = await pool.query(
      `UPDATE user_links SET type=$1, title=$2, url=$3, is_public=$4, display_order=$5 WHERE id=$6 AND user_id=$7 RETURNING *`,
      [type, title || null, url, is_public ?? true, display_order || 0, id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Enlace no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user link:', err);
    res.status(500).json({ error: 'Error actualizando enlace' });
  }
});

// Eliminar link de usuario
router.delete('/user-links/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM user_links WHERE id=$1 AND user_id=$2 RETURNING *', [id, userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Enlace no encontrado' });
    res.json({ message: 'Enlace eliminado' });
  } catch (err) {
    console.error('Error deleting user link:', err);
    res.status(500).json({ error: 'Error eliminando enlace' });
  }
});

export default router;
