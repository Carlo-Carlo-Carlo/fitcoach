export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { messages } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Clé API OpenAI manquante' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 1000,
        temperature: 0.88
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de la réponse' });
  }
}
