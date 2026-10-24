export default async function handler(req, res) {
    try {
        const SUPABASE_URL = 'https://fnktheeuobmbnrwuvbbk.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_-1QJIB7cq4tsg80a13Cgbw_q1MAOqy8';

        // Direct Supabase REST API call (bina kisi external package ke)
        const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs?select=id,title,created_at,status`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch jobs from Supabase');
        }

        const jobs = await response.json();
        const baseUrl = 'https://jobrit-portal.vercel.app';

        // XML sitemap start
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Homepage entry
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>1.0</priority>\n`;
        xml += `  </url>\n`;

        // Dynamic individual job entries
        if (jobs && jobs.length > 0) {
            jobs.forEach(job => {
                const cleanTitle = (job.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const slug = `${cleanTitle}-${job.id}`;
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
