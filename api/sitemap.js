import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fnktheeuobmbnrwuvbbk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-1QJIB7cq4tsg80a13Cgbw_q1MAOqy8';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function createJobSlug(title, id) {
    const cleanTitle = (title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `${cleanTitle}-${id}`;
}

export default async function handler(req, res) {
    try {
        // Supabase se jobs table ke active records fetch karna
        const { data: jobs, error } = await supabaseClient
            .from('jobs')
            .select('id, title, created_at, status');

        if (error) throw error;

        const baseUrl = 'https://jobrit-portal.vercel.app';

        // XML sitemap header
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Main Homepage
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>1.0</priority>\n`;
        xml += `  </url>\n`;

        // Dynamic individual job URLs
        if (jobs && jobs.length > 0) {
            jobs.forEach(job => {
                const slug = createJobSlug(job.title, job.id);
                const lastMod = job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                
                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}/job/${slug}</loc>\n`;
                xml += `    <lastmod>${lastMod}</lastmod>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.8</priority>\n`;
                xml += `  </url>\n`;
            });
        }

        xml += `</urlset>`;

        res.setHeader('Content-Type', 'text/xml');
        res.status(200).send(xml);
    } catch (err) {
        res.status(500).send('Error generating sitemap');
    }
}
