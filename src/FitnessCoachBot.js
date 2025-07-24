import React, { useState, useRef, useEffect } from 'react';

const callOpenAI = async (userMessage) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Tu es un coach sportif bienveillant, motivant et intelligent. Ton style est simple, direct, accessible. Tu aides des personnes à rester motivées, corriger leur posture, éviter les blessures et adapter leur programme à leur emploi du temps.`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 800,
        temperature: 0.85,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Désolé, je n'ai pas bien compris.";
  } catch (error) {
    console.error("Erreur OpenAI :", error);
    return "Je rencontre un petit souci pour te répondre, réessaie dans un instant 💡";
  }
};


const FitnessCoachBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Salut ! 👋 Je suis FitCoach, ton assistant personnel de remise en forme ! Quel est ton prénom ?",
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [userProfile, setUserProfile] = useState({
    name: '', age: '', weight: '', height: '', gender: '', lifestyle: '', goals: [], experience: '', timeAvailable: ''
  });
  const [currentStep, setCurrentStep] = useState('name');
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('fitcoach_theme') || 'light');


  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const motivationalPhrases = [
    "Excellent choix ! 💪", "Parfait, on avance bien ! ✨", "Super, j'adore ta motivation ! 🔥", "Génial, continuons ! 🌟"
  ];
  const getRandomMotivation = () => motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];

  const addMessage = (text, type = 'user') => {
    const newMessage = { id: Date.now(), type, text, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMessage]);
  };

  const addBotMessage = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(text, 'bot');
    }, 1000);
  };
// Sauvegarde dans localStorage à chaque changement
useEffect(() => {
  localStorage.setItem('fitcoach_messages', JSON.stringify(messages));
}, [messages]);

useEffect(() => {
  localStorage.setItem('fitcoach_theme', theme);
}, [theme]);


useEffect(() => {
  localStorage.setItem('fitcoach_userProfile', JSON.stringify(userProfile));
}, [userProfile]);

useEffect(() => {
  localStorage.setItem('fitcoach_currentStep', currentStep);
}, [currentStep]);

useEffect(() => {
  const savedMessages = localStorage.getItem('fitcoach_messages');
  const savedProfile = localStorage.getItem('fitcoach_userProfile');
  const savedStep = localStorage.getItem('fitcoach_currentStep');

  if (savedMessages && savedProfile && savedStep) {
    setMessages(JSON.parse(savedMessages));
    setUserProfile(JSON.parse(savedProfile));
    setCurrentStep(savedStep);
  }
}, []);


const generateAIPersonalPlan = async () => {
  const { name, age, gender, weight, height, lifestyle } = userProfile;

  const userPrompt = `
Voici les données de l'utilisateur :
- prénom : ${name}
- âge : ${age}
- genre : ${gender}
- poids : ${weight} kg
- taille : ${height} cm
- mode de vie : ${lifestyle}

Propose un programme de remise en forme simple et adapté, avec des conseils de nutrition, sans jargon technique. Tu peux donner des encouragements aussi.
`;

  const aiResponse = await callOpenAI(userPrompt);
  addBotMessage(aiResponse);
};


  const handleStepResponse = async (message) => {
    const lowerMessage = message.toLowerCase();
if (/bitch|pute|enculé|merde|fuck/i.test(lowerMessage)) {
  addBotMessage("Je suis là pour t’aider avec bienveillance. Merci de rester respectueux 🙏");
  return;
}


    switch (currentStep) {
    case 'name':
      if (message.length < 2 || /\d/.test(message)) {
        addBotMessage("Ton prénom me semble bizarre 😅 Peux-tu le reformuler ?");
        return;
      }
      setUserProfile(prev => ({ ...prev, name: message }));
      setCurrentStep('age');
      addBotMessage(`Enchanté ${message} ! ${getRandomMotivation()} Quel âge as-tu ?`);
      break;

    case 'age':
      const ageValue = parseInt(message);
      if (isNaN(ageValue) || ageValue < 18 || ageValue > 80) {
        addBotMessage("Donne-moi un âge réaliste entre 18 et 80 ans stp.");
        return;
      }
      setUserProfile(prev => ({ ...prev, age: ageValue }));
      setCurrentStep('gender');
      addBotMessage("Tu es un homme ou une femme ?");
      break;

    case 'gender':
      if (!['homme', 'femme'].includes(lowerMessage)) {
        addBotMessage("Merci de répondre par 'homme' ou 'femme' uniquement 🙏");
        return;
      }
      setUserProfile(prev => ({ ...prev, gender: lowerMessage }));
      setCurrentStep('weight');
      addBotMessage("Quel est ton poids (en kg) ?");
      break;

    case 'weight':
      const weightValue = parseInt(message);
      if (isNaN(weightValue) || weightValue < 50 || weightValue > 150) {
        addBotMessage("Merci de m'indiquer un poids entre 50 et 150 kg.");
        return;
      }
      setUserProfile(prev => ({ ...prev, weight: weightValue }));
      setCurrentStep('height');
      addBotMessage("Et ta taille (en cm) ?");
      break;

    case 'height':
      const heightValue = parseInt(message);
      if (isNaN(heightValue) || heightValue < 140 || heightValue > 220) {
        addBotMessage("Merci de m’indiquer une taille entre 140 et 220 cm.");
        return;
      }
      setUserProfile(prev => ({ ...prev, height: heightValue }));
      setCurrentStep('lifestyle');
      addBotMessage("Quel est ton mode de vie : sédentaire, actif ou très actif ?");
      break;

    case 'lifestyle':
      if (!['sédentaire', 'actif', 'très actif'].includes(lowerMessage)) {
        addBotMessage("Merci de choisir parmi : sédentaire, actif ou très actif.");
        return;
      }
      setUserProfile(prev => ({ ...prev, lifestyle: lowerMessage }));
      setCurrentStep('experience');
      addBotMessage("Quel est ton niveau en fitness ? Débutant, intermédiaire ou avancé ?");
      break;

    case 'experience':
      if (!['débutant', 'intermédiaire', 'avancé'].includes(lowerMessage)) {
        addBotMessage("Merci de répondre : débutant, intermédiaire ou avancé.");
        return;
      }
      setUserProfile(prev => ({ ...prev, experience: lowerMessage }));
      setCurrentStep('timeAvailable');
      addBotMessage("Combien de temps peux-tu consacrer par séance ? (15, 30, 45 minutes ou plus)");
      break;

    case 'timeAvailable':
      if (!lowerMessage.includes('15') && !lowerMessage.includes('30') && !lowerMessage.includes('45') && !lowerMessage.includes('plus')) {
        addBotMessage("Merci de me dire : 15, 30, 45 minutes ou plus.");
        return;
      }
      setUserProfile(prev => ({ ...prev, timeAvailable: message }));
      setCurrentStep('goals');
      addBotMessage("Quels sont tes objectifs ? (perte de poids, prise de muscle, cardio, etc. — sépare-les par des virgules)");
      break;

    case 'goals':
      const goals = message.split(',').map(g => g.trim().toLowerCase()).filter(Boolean);
      if (goals.length === 0) {
        addBotMessage("Tu peux lister un ou plusieurs objectifs, séparés par des virgules.");
        return;
      }
      setUserProfile(prev => ({ ...prev, goals }));
      setCurrentStep('completed');

      generateAIPersonalPlan(); // GPT gère toute la réponse
      break;

case 'completed':
  if (lowerMessage.includes('motivation')) {
    addBotMessage(`💪 ${userProfile.name}, tu es plus fort que tu ne le penses !`);
  } else if (lowerMessage.includes('programme') || lowerMessage.includes('recommence')) {
    setCurrentStep('name');
    setUserProfile({
      name: '', age: '', weight: '', height: '', gender: '', lifestyle: '', goals: [], experience: '', timeAvailable: ''
    });
    addBotMessage("Très bien, recommençons ton programme. Quel est ton prénom ?");
  } else {
    const userInfo = `
L'utilisateur s'appelle ${userProfile.name}, a ${userProfile.age} ans, est ${userProfile.gender}, mesure ${userProfile.height} cm, pèse ${userProfile.weight} kg, a un mode de vie ${userProfile.lifestyle}, un niveau ${userProfile.experience}, et des objectifs : ${userProfile.goals.join(', ')}. 
Il vient de dire : "${message}".
    
Réponds comme un coach sportif bienveillant. Pose une question de suivi, donne un conseil utile ou encourage-le pour la suite.
    `.trim();

    const gptReply = await callOpenAI(userInfo);
    addBotMessage(gptReply);
  }
  break;
  }
};
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    addMessage(inputMessage);
    handleStepResponse(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

   const renderProfileCard = () => {
    return (
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        padding: '16px',
        marginTop: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '18px' }}>👤 Ton Profil</h3>
        <ul style={{ lineHeight: '1.8', fontSize: '14px' }}>
          <li><strong>Prénom :</strong> {userProfile.name}</li>
          <li><strong>Âge :</strong> {userProfile.age} ans</li>
          <li><strong>Sexe :</strong> {userProfile.gender}</li>
          <li><strong>Taille :</strong> {userProfile.height} cm</li>
          <li><strong>Poids :</strong> {userProfile.weight} kg</li>
          <li><strong>Mode de vie :</strong> {userProfile.lifestyle}</li>
          <li><strong>Niveau :</strong> {userProfile.experience}</li>
          <li><strong>Temps dispo :</strong> {userProfile.timeAvailable}</li>
          <li><strong>Objectifs :</strong> {userProfile.goals.join(', ')}</li>
        </ul>
      </div>
    );
  };


  return (
<div
  className={`fitcoach-container ${theme === 'dark' ? 'dark' : 'light'}`}
  style={{
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px',
    borderRadius: '10px',
    minHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    background: theme === 'dark' ? '#1f2937' : 'white',
    color: theme === 'dark' ? '#f3f4f6' : '#000'
  }}
>
      <h1 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '24px', marginBottom: '10px' }}>🤖 FitCoach – Ton coach IA personnel</h1>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
  <button
    onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
    style={{
      backgroundColor: theme === 'dark' ? '#f3f4f6' : '#111827',
      color: theme === 'dark' ? '#111827' : '#f3f4f6',
      border: 'none',
      borderRadius: '20px',
      padding: '6px 14px',
      fontSize: '14px',
      cursor: 'pointer'
    }}
  >
    {theme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre'}
  </button>
</div>


      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '8px'
          }}>
            <div style={{
              backgroundColor: msg.type === 'user' ? '#4f46e5' : '#f3f4f6',
              color: msg.type === 'user' ? 'white' : 'black',
              padding: '10px 15px',
              borderRadius: '20px',
              maxWidth: '70%',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
              <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6 }}>{msg.time}</div>
            </div>
          </div>
        ))}
        {isTyping && <div style={{ fontStyle: 'italic', color: 'gray' }}>FitCoach écrit...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Écris un message..."
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '20px',
            border: '1px solid #ccc'
          }}
        />
        <button onClick={handleSendMessage} style={{
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '10px 20px',
          cursor: 'pointer'
        }}>
          Envoyer
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
  <button
  onClick={() => {
  localStorage.clear();
  setUserProfile({
    name: '', age: '', weight: '', height: '', gender: '', lifestyle: '', goals: [], experience: '', timeAvailable: ''
  });
  setMessages([
    {
      id: Date.now(),
      type: 'bot',
      text: "Très bien, recommençons ton programme. Quel est ton prénom ?",
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  setCurrentStep('name');
  setInputMessage('');
}}

    style={{
      backgroundColor: '#e5e7eb',
      color: '#111827',
      border: 'none',
      borderRadius: '20px',
      padding: '8px 16px',
      fontSize: '14px',
      cursor: 'pointer'
    }}
  >
    🔄 Recommencer
  </button>
</div>
<div style={{ textAlign: 'center', marginTop: '10px' }}>
  <button
    onClick={async () => {
      const messageMotiv = `Donne un message très motivant et personnalisé à ${userProfile.name} pour l'encourager à continuer son programme.`;
      const gptReply = await callOpenAI(messageMotiv);
      addBotMessage(gptReply);
    }}
    style={{
      backgroundColor: '#dbeafe',
      color: '#1e3a8a',
      border: 'none',
      borderRadius: '20px',
      padding: '8px 16px',
      fontSize: '14px',
      cursor: 'pointer',
      marginLeft: '10px'
    }}
  >
    💬 Motivation
  </button>
</div>
<div style={{ textAlign: 'center', marginTop: '10px' }}>
  <button
    onClick={() => {
      if (currentStep !== 'completed') {
        addBotMessage("Tu dois d’abord compléter ton profil avant de voir ton programme 💡");
        return;
      }
      generateAIPersonalPlan();
    }}
    style={{
      backgroundColor: '#dcfce7',
      color: '#166534',
      border: 'none',
      borderRadius: '20px',
      padding: '8px 16px',
      fontSize: '14px',
      cursor: 'pointer',
      marginLeft: '10px'
    }}
  >
    📋 Voir mon programme
  </button>
</div>

{currentStep === 'completed' && renderProfileCard()}
    </div>
    
  );
};

export default FitnessCoachBot;
