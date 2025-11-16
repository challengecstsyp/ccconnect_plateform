import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    Bot, Settings, MonitorCheck, X, ArrowLeft, BarChart3, 
    Mic, MessageSquare, Send, Zap, Video, Volume2, Music
} from 'lucide-react'; 
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import CircularScore from '../../../components/ui/CircularScore'; 
import { UTOPHIA_COLOR } from '../../../config/constants';
const Input = ({ id, label, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <input 
            type="text" 
            id={id} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
    </div>
);


const AIInterviewer = () => {
    const [simulationStep, setSimulationStep] = useState('config');
    const [mode, setMode] = useState('video'); 
    const [role, setRole] = useState('Développeur Web Junior');
    const [duration, setDuration] = useState('15 minutes');
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [chatLog, setChatLog] = useState([]);
    const [userResponse, setUserResponse] = useState('');
    const [isRecording, setIsRecording] = useState(false); 
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatLog]);

    const startSimulation = () => {
        if (!role || !duration) return;
        setReportData(null);
        setChatLog([]);
        setSimulationStep('recording');
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const firstQuestion = "Bienvenue ! Pour commencer, parlez-moi un peu de vous et de votre parcours professionnel.";
            setCurrentQuestion(firstQuestion);
            setChatLog([{ speaker: 'AI', text: firstQuestion }]);
            console.log(`Démarrage de la simulation en mode ${mode}.`);
        }, 1500);
    };

    const endSimulation = () => {
        setLoading(true);
        setSimulationStep('loading');
        const analysisTime = mode === 'video' ? 4000 : (mode === 'audio' ? 3000 : 2500); // L'audio est entre les deux.

        setTimeout(() => {
            setLoading(false);
            const score = Math.floor(Math.random() * 20) + 75; 
            setReportData({
                role: role,
                score: score,
                mode: mode,
                speed: mode === 'video' || mode === 'audio' ? "Optimale (150 mots/min)" : "Non applicable",
                tone: mode === 'video' || mode === 'audio' ? "Confiant et professionnel" : "Clair et concis",
                gestures: mode === 'video' ? "Contact visuel maintenu. Quelques gestes de distraction." : "Non applicable",
                feedback: [
                    { skill: "Compétences Techniques", score: 90, comment: "Excellente explication des concepts de React et du state management." },
                    { skill: "Communication", score: 80, comment: `Des hésitations (en ${mode}) lors de l'explication des projets complexes.` },
                    { skill: "Résolution de Problèmes", score: 85, comment: "Approche méthodique, mais gagnerait à structurer les réponses (méthode STAR)." },
                ]
            });
            setSimulationStep('report');
        }, analysisTime);
    };

    const sendChatResponse = (e) => {
        e.preventDefault();
        if (!userResponse.trim() || loading) return;

        const responseText = userResponse.trim();
        setUserResponse('');
        setChatLog(prev => [...prev, { speaker: 'User', text: responseText, type: 'text' }]);
        generateNextQuestion();
    };
    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            setLoading(true);
            setTimeout(() => {
                const audioText = `[Audio Transcrit: J'ai géré un projet de refonte complète du site web de l'entreprise, utilisant React. J'ai aussi implémenté des tests unitaires, ce qui a réduit les bugs de 20%.]`;
                setChatLog(prev => [...prev, { speaker: 'User', text: audioText, type: 'audio' }]);
                generateNextQuestion();
            }, 2000);
        } else {
            setIsRecording(true);
        }
    };
    const generateNextQuestion = () => {
        setLoading(true);
        setTimeout(() => {
            const nextQuestion = "C'est une bonne réponse. Pouvez-vous me donner un exemple concret où vous avez fait preuve de leadership dans un projet de ce type ?";
            setCurrentQuestion(nextQuestion);
            setChatLog(prev => [...prev, { speaker: 'AI', text: nextQuestion, type: 'text' }]);
            setLoading(false);
        }, 3000);
    };

    const InterviewConfig = () => (
        <Card title="Paramétrer votre Simulation d'Entretien IA" icon={Settings}>
            <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Choisir le Mode de Simulation</h3>
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border">
                    {/* Option 1 : Vidéo/Audio (Existant) */}
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name="mode" 
                            value="video" 
                            checked={mode === 'video'}
                            onChange={() => setMode('video')}
                            className={`form-radio text-${UTOPHIA_COLOR}-600 h-4 w-4`}
                        />
                        <span className="ml-2 text-gray-700 font-medium flex items-center"><Video className="w-4 h-4 mr-1" /> Vidéo (Complet)</span>
                    </label>
                    {/* Option 2 : Chat (Texte) (Existant) */}
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name="mode" 
                            value="chat" 
                            checked={mode === 'chat'}
                            onChange={() => setMode('chat')}
                            className={`form-radio text-${UTOPHIA_COLOR}-600 h-4 w-4`}
                        />
                        <span className="ml-2 text-gray-700 font-medium flex items-center"><MessageSquare className="w-4 h-4 mr-1" /> Chat (Texte Rapide)</span>
                    </label>
                    {/* NOUVELLE OPTION : Chat + Audio Vocal */}
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name="mode" 
                            value="audio" 
                            checked={mode === 'audio'}
                            onChange={() => setMode('audio')}
                            className={`form-radio text-${UTOPHIA_COLOR}-600 h-4 w-4`}
                        />
                        <span className="ml-2 text-gray-700 font-medium flex items-center"><Mic className="w-4 h-4 mr-1" /> Chat (Audio Vocal)</span>
                    </label>
                </div>
            </div>

            <div className="space-y-4">
                <Input
                    id="role"
                    label="Rôle Simulé"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ex: Data Scientist, Chef de Projet..."
                />
                <Input
                    id="duration"
                    label="Durée Prévue"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Ex: 15 minutes, 30 minutes"
                />
                <p className="text-sm text-gray-500">L'IA posera des questions adaptées au rôle et au mode sélectionné.</p>
            </div>
            <div className="mt-6 flex justify-end">
                <Button onClick={startSimulation} disabled={!role || !duration}>
                    <Bot className="w-4 h-4 mr-2 inline-block" /> Commencer la Simulation
                </Button>
            </div>
        </Card>
    );

    const InterviewVideo = () => (
        // Code de InterviewVideo inchangé (Mode Vidéo/Audio complet)
        <Card title={`Simulation Vidéo en cours: ${role}`}>
            {/* Zone de simulation visuelle */}
            <div className="w-full h-64 bg-gray-900 flex flex-col items-center justify-center rounded-lg mb-4 relative">
                <div className="absolute top-3 left-3 flex items-center space-x-2 p-1 bg-red-600 text-white rounded-md">
                    <span className="h-2 w-2 bg-white rounded-full animate-ping"></span>
                    <span className="text-xs font-semibold">REC</span>
                </div>
                <div className="text-center text-gray-300">
                    <Video className="w-8 h-8 mx-auto mb-2" />
                    <p>Interface Vidéo/Audio (Webcam et Micro actifs)</p>
                </div>
            </div>
            
            {/* Question IA */}
            <div className="bg-indigo-50 p-4 rounded-lg shadow-inner border border-indigo-200 mb-6">
                <h3 className={`text-lg font-semibold text-indigo-700 mb-2 flex items-center`}>
                    <Volume2 className="w-5 h-5 mr-2" /> Question:
                </h3>
                <p className="text-gray-700 italic">
                    {currentQuestion || "L'entretien va commencer. Préparez-vous à répondre !"}
                </p>
            </div>
            
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm text-green-600 font-semibold">
                    <Mic className="w-4 h-4" />
                    <span>Enregistrement en cours...</span>
                </div>
                <Button primary={false} onClick={endSimulation}>
                    <X className="w-4 h-4 mr-2 inline-block" /> Terminer l'Entretien
                </Button>
            </div>
        </Card>
    );

    const InterviewChat = () => (
        <Card title={`Simulation ${mode === 'audio' ? 'Vocale' : 'Chat'} en cours: ${role}`} icon={mode === 'audio' ? Mic : MessageSquare}>
            <div className="h-96 overflow-y-auto p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4 space-y-4">
                {chatLog.map((log, index) => (
                    <div key={index} className={`flex ${log.speaker === 'User' ? 'justify-end' : 'justify-start'}`}>
                        <div 
                            className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-md ${
                                log.speaker === 'AI' 
                                    ? `bg-${UTOPHIA_COLOR}-100 text-${UTOPHIA_COLOR}-800 rounded-bl-none` 
                                    : (log.type === 'audio' 
                                        ? 'bg-green-100 text-green-800 border border-green-200 rounded-br-none' // Style pour l'audio
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-br-none') // Style pour le texte
                                }`}
                        >
                            <p className="font-semibold text-xs mb-1">{log.speaker === 'AI' ? 'Utopia AI' : 'Moi'}</p>
                            {log.type === 'audio' && (
                                <div className="flex items-center space-x-2">
                                    <Music className="w-4 h-4 text-green-600" /> 
                                    <span className="italic text-sm">{log.text}</span>
                                </div>
                            )}
                            {log.type === 'text' && log.text}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            
            {/* NOUVELLE LOGIQUE DE SAISIE */}
            <form onSubmit={sendChatResponse} className="flex space-x-3">
                {mode === 'chat' ? (
                    <>
                        <input
                            type="text"
                            value={userResponse}
                            onChange={(e) => setUserResponse(e.target.value)}
                            placeholder="Tapez votre réponse ici..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                            disabled={loading}
                        />
                        <Button type="submit" disabled={loading || !userResponse.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </>
                ) : (
                    // Mode Audio Vocal
                    <>
                        <Button 
                            type="button" 
                            onClick={toggleRecording} 
                            primary={isRecording} 
                            className="flex-1 justify-center"
                            disabled={loading}
                        >
                            {isRecording ? (
                                <>
                                    <div className="h-4 w-4 bg-white rounded-sm animate-pulse mr-2"></div>
                                    Stop & Analyser la Voix
                                </>
                            ) : (
                                <>
                                    <Mic className="w-4 h-4 mr-2" />
                                    Cliquer pour Enregistrer ma Réponse
                                </>
                            )}
                        </Button>
                    </>
                )}
                <Button primary={false} onClick={endSimulation} disabled={loading}>
                    <X className="w-4 h-4 mr-2 inline-block" /> Terminer
                </Button>
            </form>
        </Card>
    );

    const InterviewReport = () => (
        // Code du Rapport inchangé, mais les données s'adaptent au mode
        <Card title={`Rapport d'Entretien IA pour ${reportData.role}`} icon={BarChart3}>
            <p className={`text-sm font-semibold mb-4 p-2 rounded-lg bg-${UTOPHIA_COLOR}-50 text-${UTOPHIA_COLOR}-700`}>
                Mode de simulation : **{reportData.mode === 'video' ? 'Vidéo/Audio' : (reportData.mode === 'audio' ? 'Chat (Audio Vocal)' : 'Chat (Texte)')}**
            </p>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-6">
                {/* Score Global */}
                <div className="flex-shrink-0 flex flex-col items-center">
                    <p className="text-gray-600 font-medium mb-3">Score de Performance</p>
                    <CircularScore score={reportData.score} size={150} strokeWidth={12} />
                </div>

                {/* Synthèse Rapide */}
                <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold text-gray-800">Analyse du Style</h3>
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Vitesse de Parole:</p>
                        <p className="font-semibold text-right">{reportData.speed}</p>
                        <p className="text-sm text-gray-500">Ton de Voix:</p>
                        <p className="font-semibold text-right">{reportData.tone}</p>
                        {reportData.mode === 'video' && (
                            <>
                                <p className="text-sm text-gray-500">Geste & Posture:</p>
                                <p className="font-semibold text-right">{reportData.gestures.split('.')[0]}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <h3 className={`text-xl font-bold text-${UTOPHIA_COLOR}-600 mb-3 pt-4 border-t border-gray-100`}>Profilage des Compétences</h3>
            <div className="space-y-4">
                {reportData.feedback.map((item, index) => (
                    <div key={index} className={`border-l-4 pl-4 py-2 hover:bg-gray-50 rounded-r-lg transition-colors ${item.score < 80 ? 'border-orange-400' : 'border-green-400'}`}>
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-gray-900">{item.skill}</p>
                            <span className={`font-bold ${item.score > 85 ? 'text-green-600' : 'text-orange-600'}`}>{item.score}%</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 italic">{item.comment}</p>
                    </div>
                ))}
            </div>
            
            <div className="mt-6 flex justify-end">
                <Button onClick={() => setSimulationStep('config')}>
                    <ArrowLeft className="w-4 h-4 mr-2 inline-block" /> Nouvelle Simulation
                </Button>
            </div>
        </Card>
    );

    const RenderContent = useMemo(() => {
        switch (simulationStep) {
            case 'config': return <InterviewConfig />;
            case 'recording': return mode === 'video' ? <InterviewVideo /> : <InterviewChat />; 
            case 'loading': return (
                <Card>
                    <div className="flex items-center space-x-3 text-lg font-medium text-gray-700">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <p>Analyse de la performance et génération du rapport IA...</p>
                    </div>
                </Card>
            );
            case 'report': return <InterviewReport />;
            default: return <InterviewConfig />;
        }
    }, [simulationStep, mode, role, duration, reportData, loading, chatLog, userResponse, isRecording]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bot className="w-7 h-7 mr-3 text-indigo-600" /> IA Interviewer : Simulation d'Entretien
            </h1>
            {RenderContent}
        </div>
    );
};

export default AIInterviewer;