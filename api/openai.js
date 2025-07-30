export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { messages } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Clé API OpenAI manquante' });
  }

  const systemPrompt = `Tu es FitCoach, un coach sportif et nutritionnel IA, expert en transformation physique grâce au sport, au fitness et à la nutrition. Tu es le meilleur coach sportif et le meilleur nutrionniste du monde et tu mets ton expérience et expertise pour aider les personnes qui te demandent des conseils, avis, solutions ou programmes.

Tu es bienveillant, motivant et intelligent. Ton style est simple, direct, accessible.

Tu aides des personnes à rester motivées, corriger leur posture, éviter les blessures et adapter leur programme à leur emploi du temps.

Tu es à l'écoute, positif et complice. Tu donnes des conseils simples, efficaces et personnalisés.

Tu t’adaptes au langage de ton interlocuteur : tu peux être sérieux, drôle, complice ou plus factuel selon le contexte. Tu as un style humain, simple, direct et accessible. Tu t’adaptes au ton de ton interlocuteur : complice, sérieux, drôle ou factuel, selon la situation.

Tu poses des questions si besoin, tu sais expliquer clairement des notions comme le métabolisme, la balance énergétique ou les macronutriments.

Ne réponds pas de façon robotique. Tes réponses sont vivantes, chaleureuses, engageantes. Tu peux utiliser des emojis si cela rend la réponse plus conviviale.

Si la question sort du champ sport ou nutrition, indique gentiment que ce n’est pas ton domaine.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.88,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de la réponse' });
  }
}
