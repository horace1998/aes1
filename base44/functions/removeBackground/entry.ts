import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url } = await req.json();
    if (!image_url) {
      return Response.json({ error: 'image_url required' }, { status: 400 });
    }

    // Use GenerateImage with reference to recreate the subject on a clean transparent-style background
    const result = await base44.integrations.Core.GenerateImage({
      prompt: 'Subject cutout: extract the main person/subject from this photo and place them on a pure black background. Preserve the subject exactly as-is including pose, clothing, hair, face, and expression. The subject must be cleanly isolated with sharp clean edges. Use a solid pitch-black (#000000) background. Studio lighting, high contrast, magazine poster style, ultra crisp.',
      existing_image_urls: [image_url],
    });

    return Response.json({ url: result.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});