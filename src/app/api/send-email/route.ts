import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html, text, apiKey } = body;

    const resendKey = apiKey || process.env.RESEND_API_KEY;

    if (!resendKey) {
      // Simulation mode if key is not yet configured
      return NextResponse.json({
        success: true,
        simulated: true,
        message: 'Email simulé avec succès (Ajoutez votre clé RESEND_API_KEY dans Paramètres pour l\'envoi réel).'
      });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'GestionLocative Pro <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html || `<p>${text}</p>`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, error: data }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
