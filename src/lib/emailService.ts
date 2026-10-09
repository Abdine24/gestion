export async function sendReceiptEmail({
  to,
  subject,
  html,
  text,
  apiKey,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  apiKey?: string;
}) {
  if (!apiKey) {
    // Mode simulation sans clé API
    return {
      success: true,
      simulated: true,
      message: 'Email simulé avec succès (Renseignez votre clé Resend dans Paramètres pour l\'envoi réel).'
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GestionLocative <onboarding@resend.dev>',
        to: [to],
        subject,
        html: html || `<p>${text}</p>`,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data };
    }
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
