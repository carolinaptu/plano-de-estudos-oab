import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, collection, addDoc, getDocs, query, limit, orderBy, startAfter, getDoc, arrayUnion, writeBatch, setLogLevel, documentId, where, deleteDoc } from 'firebase/firestore';
import { Calendar, CheckCircle, BarChart2, Target, Clock, TrendingUp, Lightbulb, Home, FileText, BrainCircuit, Loader2, ArrowLeft, ArrowRight, Flag, XCircle, Sparkles, BookOpen, Bookmark, Send, ChevronsRight, List, Eye, EyeOff, PlusCircle, ThumbsDown, Star, AlertTriangle, History, LogOut, Mail, Lock, User, Archive, RotateCcw, Trash2, CheckSquare } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, DoughnutController, BarController, BarElement, CategoryScale, LinearScale, RadarController, PointElement, LineElement, Filler } from 'chart.js';

// Registra os componentes necessários para o Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title, DoughnutController, BarController, BarElement, CategoryScale, LinearScale, RadarController, PointElement, LineElement, Filler);

// --- INÍCIO: Configuração do Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyBH3gRvgFYPs6OQDwiXdH78DwqtXwZiZ5A",
    authDomain: "plano-oab-carol.firebaseapp.com",
    projectId: "plano-oab-carol",
    storageBucket: "plano-oab-carol.firebasestorage.app",
    messagingSenderId: "390136540424",
    appId: "1:390136540424:web:308fe8ab165a88610950bd"
};

const appId = 'plano-carol-simulador-pro';
// --- FIM: Configuração do Firebase ---

const isFirebaseConfigValid = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId;

let app, auth, db;
if (isFirebaseConfigValid) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    setLogLevel('debug');
}

// --- DADOS DO CRONOGRAMA ---
const EXAM_DATE = new Date('2025-12-21T13:00:00');
const TOTAL_WEEKS = 24;
const DISCIPLINES = ['Ética', 'Civil', 'Proc. Civil', 'Constitucional', 'Penal', 'Proc. Penal', 'Administrativo', 'Trabalho', 'Proc. do Trabalho', 'Tributário', 'Empresarial', 'Direitos Humanos', 'Consumidor', 'ECA', 'Ambiental', 'Internacional', 'Filosofia', 'Financeiro', 'Previdenciário', 'Eleitoral'];
const DISCIPLINE_GROUPS = {
    A: ['Ética', 'Civil', 'Proc. Civil', 'Constitucional', 'Penal', 'Proc. Penal'],
    B: ['Administrativo', 'Trabalho', 'Proc. do Trabalho', 'Tributário'],
    C: ['Empresarial', 'Direitos Humanos', 'Consumidor', 'ECA', 'Ambiental', 'Internacional', 'Filosofia', 'Financeiro', 'Previdenciário', 'Eleitoral']
};
const motivationalQuotes = [ "Acredite em você, Carol. A jornada é longa, mas a sua capacidade é maior.", "Cada questão resolvida hoje é um passo a mais rumo à sua aprovação.", "A disciplina é a ponte entre metas e realizações. Continue firme!", "Lembre-se do seu 'porquê'. A motivação mora nele.", "O sucesso nasce do querer, da determinação e persistência em se chegar a um objetivo." ];
const getScheduleData = () => { const data = []; const startDate = new Date('2025-07-07T12:00:00'); for (let i = 0; i < TOTAL_WEEKS; i++) { const weekStartDate = new Date(startDate); weekStartDate.setDate(startDate.getDate() + (i * 7)); const weekEndDate = new Date(weekStartDate); weekEndDate.setDate(weekStartDate.getDate() + 6); let phase; if (i < 5) phase = 1; else if (i < 21) phase = 2; else phase = 3; data.push({ week: i + 1, phase: phase, startDate: weekStartDate, endDate: weekEndDate, daily: getDailyPlan(i + 1), weekend: getWeekendPlan(i + 1) }); } return data; };
const getDailyPlan = (week) => { const plans = [ { 1: "Ética Profissional: Estatuto e Regulamento", 2: "Ética Profissional: Código de Ética", 3: "Direito Civil: Parte Geral e LINDB", 4: "Direito Civil: Parte Geral e LINDB", 5: "Revisão: Ética e Civil" }, { 1: "Direito Constitucional: Direitos Fundamentais", 2: "Direito Constitucional: Remédios Constitucionais", 3: "Processo Civil: Teoria Geral e Princípios", 4: "Processo Civil: Jurisdição e Competência", 5: "Revisão: Constitucional e Processo Civil" }, { 1: "Direito Penal: Teoria do Crime e Tipicidade", 2: "Direito Penal: Teoria do Crime e Tipicidade", 3: "Processo Penal: Inquérito e Ação Penal", 4: "Processo Penal: Competência", 5: "Revisão: Penal e Processo Penal" }, { 1: "Direito Civil: Obrigações", 2: "Direito Civil: Contratos", 3: "Direito Constitucional: Organização dos Poderes", 4: "Direito Constitucional: Controle de Constitucionalidade", 5: "Revisão: Civil e Constitucional" }, { 1: "Processo Civil: Procedimento Comum", 2: "Processo Civil: Recursos", 3: "Direito Penal: Teoria da Pena", 4: "Direito Penal: Extinção da Punibilidade", 5: "Revisão: Processo Civil e Penal" }, { 1: "Revisão: Ética", 2: "Revisão: Direito Civil", 3: "Questões: Ética", 4: "Questões: Direito Civil", 5: "Revisão Mista" }, { 1: "Revisão: Constitucional", 2: "Revisão: Processo Civil", 3: "Questões: Constitucional", 4: "Questões: Processo Civil", 5: "Revisão Mista" }, { 1: "Revisão: Penal", 2: "Revisão: Processo Penal", 3: "Questões: Penal", 4: "Questões: Processo Penal", 5: "Revisão Mista" }, { 1: "Revisão: Administrativo", 2: "Revisão: Tributário", 3: "Questões: Administrativo", 4: "Questões: Tributário", 5: "Revisão Mista" }, { 1: "Revisão: Trabalho", 2: "Revisão: Processo do Trabalho", 3: "Questões: Trabalho", 4: "Questões: Processo do Trabalho", 5: "Revisão Mista" }, { 1: "Revisão: Empresarial", 2: "Revisão: Direitos Humanos", 3: "Questões: Empresarial", 4: "Questões: Direitos Humanos", 5: "Revisão Mista" }, { 1: "Revisão: Consumidor", 2: "Revisão: ECA", 3: "Questões: Consumidor", 4: "Questões: ECA", 5: "Revisão Mista" }, { 1: "Revisão: Ambiental", 2: "Revisão: Internacional", 3: "Questões: Ambiental", 4: "Questões: Internacional", 5: "Revisão Mista" }, { 1: "Revisão: Filosofia", 2: "Revisão: Financeiro", 3: "Questões: Filosofia", 4: "Questões: Financeiro", 5: "Revisão Mista" }, { 1: "Revisão: Previdenciário", 2: "Revisão: Eleitoral", 3: "Questões: Previdenciário", 4: "Questões: Eleitoral", 5: "Revisão Mista" }, { 1: "Revisão focada em erros: Ética", 2: "Revisão focada em erros: Direito Civil", 3: "Questões: Ética", 4: "Questões: Direito Civil", 5: "Revisão Mista" }, { 1: "Revisão focada em erros: Constitucional", 2: "Revisão focada em erros: Processo Civil", 3: "Questões: Constitucional", 4: "Questões: Processo Civil", 5: "Revisão Mista" }, { 1: "Revisão focada em erros: Penal", 2: "Revisão focada em erros: Processo Penal", 3: "Questões: Penal", 4: "Questões: Processo Penal", 5: "Revisão Mista" }, { 1: "Revisão focada em erros: Administrativo", 2: "Revisão focada em erros: Tributário", 3: "Questões: Administrativo", 4: "Questões: Tributário", 5: "Revisão Mista" }, { 1: "Revisão focada em erros: Trabalho", 2: "Revisão focada em erros: Processo do Trabalho", 3: "Questões: Trabalho", 4: "Questões: Processo do Trabalho", 5: "Revisão Mista" }, { 1: "Revisão focada em erros: Empresarial", 2: "Revisão Geral Grupo C", 3: "Questões: Empresarial", 4: "Questões: Grupo C", 5: "Revisão Mista" }, { 1: "INTENSIVÃO: Prova Anterior (Manhã)", 2: "Revisão de Erros (Tarde)", 3: "INTENSIVÃO: Prova Anterior (Manhã)", 4: "Revisão de Erros (Tarde)", 5: "INTENSIVÃO: Prova Anterior (Manhã)" }, { 1: "INTENSIVÃO: Prova Anterior (Manhã)", 2: "Revisão de Erros (Tarde)", 3: "INTENSIVÃO: Prova Anterior (Manhã)", 4: "Revisão de Erros (Tarde)", 5: "INTENSIVÃO: Prova Anterior (Manhã)" }, { 1: "Revisão Final: Ética e Constitucional", 2: "Revisão Final: Civil e Processo Civil", 3: "Revisão Final: Penal e Processo Penal", 4: "Revisão Final: Administrativo e Trabalho", 5: "Revisão Final: Matérias restantes" }, ]; return plans[week - 1]; };
const getWeekendPlan = (week) => { const plans = [ { 6: "Simulado Diagnóstico + Revisão de Erros", 0: "Direito Administrativo (Princípios, Atos) + Direito Tributário (Sistema Tributário)" }, { 6: "Questões (Ética, Civil, Constitucional) + Direitos Humanos", 0: "Direito do Consumidor + ECA" }, { 6: "Simulado 1ª Fase + Revisão de Erros", 0: "Direito do Trabalho (Relação de Emprego) + Proc. do Trabalho (Princípios)" }, { 6: "Questões (Penal, Proc. Penal, Trabalho) + Direito Ambiental", 0: "Direito Internacional + Filosofia do Direito" }, { 6: "Simulado 1ª Fase + Revisão de Erros", 0: "Direito Financeiro + Direito Previdenciário" }, { 6: "Simulado 1ª Fase + Análise", 0: "Direito Eleitoral + Revisão geral" }, { 6: "Aprofundamento em Contratos (Civil) + Lei Seca", 0: "Aprofundamento em Procedimento Comum (Proc. Civil) + Questões" }, { 6: "Simulado 1ª Fase + Análise", 0: "Aprofundamento em Crimes em Espécie (Penal) + Revisão" }, { 6: "Aprofundamento em Atos Administrativos + Lei Seca", 0: "Aprofundamento em Obrigação Tributária + Questões" }, { 6: "Simulado 1ª Fase + Análise", 0: "Aprofundamento em Contrato de Trabalho + Lei Seca" }, { 6: "Aprofundamento em Sociedades (Empresarial)", 0: "Aprofundamento em Remédios Constitucionais + Revisão" }, { 6: "Simulado 1ª Fase + Análise", 0: "Aprofundamento em Pessoas Naturais/Jurídicas (Civil) + Lei Seca" }, { 6: "Aprofundamento em Inquérito e Provas (Proc. Penal)", 0: "Aprofundamento em Extinção da Punibilidade (Penal)" }, { 6: "Simulado 1ª Fase + Análise", 0: "Aprofundamento em Organização da OAB (Ética) + Lei Seca" }, { 6: "Aprofundamento em Recursos (Proc. Trabalho)", 0: "Aprofundamento em Licitações (Admin.)" }, { 6: "Simulado 1ª Fase + Análise", 0: "Aprofundamento em Família e Sucessões (Civil) + Lei Seca" }, { 6: "Aprofundamento em Execução (Proc. Civil)", 0: "Aprofundamento em Direitos Sociais (Constitucional)" }, { 6: "Simulado 1ª Fase + Análise", 0: "Aprofundamento em Prisões (Proc. Penal) + Lei Seca" }, { 6: "Aprofundamento em Crédito Tributário", 0: "Aprofundamento em Responsabilidade do Estado (Admin.)" }, { 6: "Simulado 1ª Fase + Análise", 0: "Aprofundamento em Salário e Remuneração (Trabalho)" }, { 6: "Aprofundamento em Títulos de Crédito (Empresarial)", 0: "Revisão dos tópicos mais críticos" }, { 6: "Simulado completo + Análise minuciosa dos erros", 0: "Simulado completo + Análise minuciosa dos erros" }, { 6: "Simulado completo + Análise minuciosa dos erros", 0: "Simulado completo + Análise minuciosa dos erros" }, { 6: "Revisão Final Ativa", 0: "Descanso e Preparação Mental" }, ]; return plans[week - 1]; };
const scheduleData = getScheduleData();

// --- FUNÇÕES AUXILIARES ---
const findTopicForDate = (dateString) => { 
    const selected = new Date(dateString + 'T12:00:00'); 
    const dayOfWeek = selected.getDay(); 
    for (const weekData of scheduleData) { 
        const start = new Date(weekData.startDate); 
        const end = new Date(weekData.endDate); 
        if (selected >= start && selected <= end) { 
            if (dayOfWeek >= 1 && dayOfWeek <= 5) { 
                return weekData.daily[dayOfWeek] || "Dia de revisão ou questões."; 
            } else { 
                return weekData.weekend[dayOfWeek] || "Dia de simulado ou descanso."; 
            } 
        } 
    } 
    return "Nenhum tópico de estudo agendado para esta data."; 
}; 

const getDisciplinesFromTopic = (topic) => {
    if (!topic) return [];
    const found = [];
    DISCIPLINES.forEach(d => {
        if (topic.includes(d)) {
            found.push(d);
        }
    });
    if (found.length > 0) return found;
    if (topic.includes('Revisão Mista') || topic.includes('Grupo C')) return [...DISCIPLINE_GROUPS.C];
    return [];
};

// --- COMPONENTES DA UI ---
const StatCard = ({ icon, label, value, subValue, colorClass }) => ( <div className="bg-white p-4 rounded-lg shadow-md flex items-center"> <div className={`p-3 rounded-full mr-4 ${colorClass}`}> {icon} </div> <div> <p className="text-sm text-gray-500">{label}</p> <p className="text-2xl font-bold text-gray-800">{value}</p> {subValue && <p className="text-xs text-gray-400">{subValue}</p>} </div> </div> );
const TimelineEvent = ({ date, event, isPast, daysLeft }) => ( <div className={`flex items-start space-x-3 ${isPast ? 'text-gray-400' : 'text-gray-700'}`}> <CheckCircle className={`w-5 h-5 mt-1 flex-shrink-0 ${isPast ? 'text-green-500' : 'text-blue-500'}`} /> <div> <p className={`font-semibold ${isPast ? 'line-through' : ''}`}>{event}</p> <div className="flex items-center space-x-2"> <p className="text-sm">{date}</p> {!isPast && daysLeft > 0 && ( <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full"> {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} </span> )} </div> </div> </div> );
const PhaseCard = ({ phase, weeks, load, description, color }) => ( <div className={`p-6 rounded-lg border-t-4 ${color.border}`}> <h3 className={`text-xl font-bold ${color.text} mb-2`}>Fase {phase.number}: {phase.title}</h3> <p className="font-semibold text-gray-600 mb-2">{weeks}</p> <p className="text-gray-700 text-sm mb-4">{description}</p> <p className="font-bold text-sm text-gray-800">Carga: <span className="font-normal">{load}</span></p> </div> );
const DistributionChart = () => { const chartRef = useRef(null); const chartInstance = useRef(null); useEffect(() => { if (chartInstance.current) { chartInstance.current.destroy(); } if (chartRef.current) { const ctx = chartRef.current.getContext('2d'); chartInstance.current = new ChartJS(ctx, { type: 'doughnut', data: { labels: ['Grupo A (40 questões)', 'Grupo B (22 questões)', 'Grupo C (18 questões)'], datasets: [{ label: 'Nº de Questões', data: [40, 22, 18], backgroundColor: ['#2563eb', '#0d9488', '#f59e0b'], borderColor: ['#ffffff', '#ffffff', '#ffffff'], borderWidth: 2, hoverOffset: 8 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 15, padding: 15 } }, title: { display: false }, tooltip: { callbacks: { label: function(context) { let label = context.label || ''; if (label) { label += ': '; } if (context.raw) { label += context.raw + ' questões'; } return label; } } } } } }); } return () => { if (chartInstance.current) { chartInstance.current.destroy(); } }; }, []); return ( <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col justify-between"> <h3 className="text-xl font-bold mb-2 text-gray-800">Distribuição Estratégica</h3> <p className="text-sm text-gray-600 mb-4">A prova da OAB tem uma distribuição de questões bem definida. Entender quais matérias têm maior peso é crucial para direcionar seu tempo de estudo.</p> <div className="relative h-48 md:h-56"> <canvas ref={chartRef}></canvas> </div> <div className="mt-4 text-xs text-gray-600 space-y-2 pt-2 border-t"> <p><strong>Grupo A:</strong> Ética (8), Civil (7), Proc. Civil (7), Constitucional (6), Penal (6), Proc. Penal (6).</p> <p><strong>Grupo B:</strong> Administrativo (6), Trabalho (6), Proc. do Trabalho (5), Tributário (5).</p> <p><strong>Grupo C:</strong> Empresarial (5), Direitos Humanos (2), Consumidor (2), ECA (2), Ambiental (2), Internacional (2), Filosofia (2).</p> </div> </div> ); };

// --- COMPONENTES PRINCIPAIS DAS ABAS ---
function Dashboard({ today, completedWeeksCount, simulations, userData, overallManualPerformance }) {
    const timeDiff = EXAM_DATE.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    const timelineEvents = [
        { date: "01/10/2025", event: "Publicação do Edital", rawDate: new Date('2025-10-01T12:00:00') },
        { date: "06/10 a 13/10/2025", event: "Período de Inscrição", rawDate: new Date('2025-10-06T12:00:00') },
        { date: "21/12/2025", event: "Prova Objetiva - 1ª Fase", rawDate: new Date('2025-12-21T12:00:00') },
        { date: "22/02/2026", event: "Prova Prático-Profissional - 2ª Fase", rawDate: new Date('2026-02-22T12:00:00') },
    ];
    const getDaysLeft = (eventDate) => {
        const diff = eventDate.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };
    
    const simulationPerformance = useMemo(() => {
        if (!simulations || simulations.length === 0) {
            return { average: 0, count: 0 };
        }
        let totalCorrect = 0;
        let totalQuestions = 0;
        simulations.forEach(sim => {
            totalQuestions += sim.questions.length;
            totalCorrect += Object.keys(sim.userAnswers).reduce((acc, qId) => {
                const question = sim.questions.find(q => q.firestoreId === qId);
                const correctAnswer = question?.respostaCorreta || question?.gabarito;
                return (question && sim.userAnswers[qId] === correctAnswer) ? acc + 1 : acc;
            }, 0);
        });
        return {
            average: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
            count: simulations.length,
        };
    }, [simulations]);

    const overdueTasksCount = useMemo(() => {
        if (!userData || !userData.tasks) {
            return 0;
        }
        const todayNormalized = new Date(today);
        todayNormalized.setHours(0, 0, 0, 0);

        return userData.tasks.filter(task => {
            if (task.completed || !task.dueDate) {
                return false;
            }
            const taskDueDate = new Date(task.dueDate + 'T23:59:59');
            return taskDueDate < todayNormalized;
        }).length;
    }, [userData.tasks, today]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
                    <StatCard icon={<Clock size={24} className="text-white"/>} label="Contagem Regressiva" value={`${daysRemaining} dias`} subValue="para a 1ª Fase" colorClass="bg-red-500" />
                    <StatCard icon={<Calendar size={24} className="text-white"/>} label="Semanas Concluídas" value={`${completedWeeksCount} / ${TOTAL_WEEKS}`} subValue="do cronograma" colorClass="bg-blue-500" />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
                    <StatCard icon={<BarChart2 size={24} className="text-white"/>} label="Média nos Simulados" value={simulationPerformance.count > 0 ? `${simulationPerformance.average.toFixed(1)}%` : 'N/A'} subValue={simulationPerformance.count > 0 ? `em ${simulationPerformance.count} simulado(s)` : 'Realize um simulado'} colorClass="bg-purple-500" />
                    <StatCard icon={<BrainCircuit size={24} className="text-white"/>} label="Média nas Questões" value={overallManualPerformance.questions > 0 ? `${overallManualPerformance.percentage.toFixed(1)}%` : 'N/A'} subValue={overallManualPerformance.questions > 0 ? `em ${overallManualPerformance.questions} questões` : 'Registre seus estudos'} colorClass="bg-teal-500" />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
                     <StatCard icon={<Sparkles size={24} className="text-white"/>} label="Dias Consecutivos" value={`${userData.loginStreak || 0} dias`} subValue="de estudo" colorClass="bg-orange-500" />
                     <StatCard
                        icon={<AlertTriangle size={24} className="text-white"/>}
                        label="Pendências Atrasadas"
                        value={overdueTasksCount}
                        subValue={overdueTasksCount > 0 ? `Total de ${overdueTasksCount} tarefa(s)` : "Nenhuma tarefa em atraso"}
                        colorClass={overdueTasksCount > 0 ? "bg-red-500" : "bg-green-500"}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Entendendo a 1ª Fase</h3>
                    <p className="text-sm text-gray-600 mb-4">A primeira fase é o seu primeiro grande passo. Compreender a estrutura da prova é fundamental para um planejamento estratégico e eficaz.</p>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Datas Importantes</h3>
                    <div className="space-y-4">
                        {timelineEvents.map((item, index) => (
                            <TimelineEvent key={index} date={item.date} event={item.event} isPast={today > item.rawDate} daysLeft={getDaysLeft(item.rawDate)} />
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-4">*Datas sujeitas a alterações pela banca.</p>
                </div>
                <div className="lg:col-span-2">
                    <DistributionChart />
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Dicas Essenciais para o Sucesso</h2>
                <p className="text-center text-gray-600 mb-6">Além de seguir o cronograma, certas estratégias podem fazer toda a diferença na sua aprovação. Incorpore estas práticas na sua rotina para um estudo mais inteligente e eficaz.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
                        <h3 className="font-bold text-lg mb-2 text-blue-800">1. Flexibilidade é Chave</h3>
                        <p className="text-gray-700">Este cronograma é seu guia. Sinta-se à vontade para ajustá-lo à sua realidade, focando mais tempo nos seus pontos fracos.</p>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-teal-500">
                        <h3 className="font-bold text-lg mb-2 text-teal-800">2. Lei Seca é Ouro</h3>
                        <p className="text-gray-700">A FGV adora a literalidade da lei. Crie o hábito de ler a lei seca e as súmulas todos os dias, mesmo que por pouco tempo.</p>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-amber-500">
                        <h3 className="font-bold text-lg mb-2 text-amber-800">3. Questões sem Moderação</h3>
                        <p className="text-gray-700">Resolver questões de provas anteriores é a melhor forma de entender a banca e fixar o conteúdo. Pratique até cansar!</p>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500">
                        <h3 className="font-bold text-lg mb-2 text-purple-800">4. Revisões Ativas</h3>
                        <p className="text-gray-700">Não apenas releia. Crie mapas mentais, flashcards, e explique a matéria em voz alta para si mesma. O cérebro aprende fazendo.</p>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-red-500">
                        <h3 className="font-bold text-lg mb-2 text-red-800">5. Cuide de Você</h3>
                        <p className="text-gray-700">Uma mente cansada não aprende. Priorize o sono, a boa alimentação e pausas para não esgotar. Sua saúde vem primeiro.</p>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
                        <h3 className="font-bold text-lg mb-2 text-green-800">6. Acompanhe seu Voo</h3>
                        <p className="text-gray-700">Use a aba "Meu Progresso". Analisar seus acertos e erros mostra exatamente onde você precisa melhorar.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Cronograma({ userData, updateUserData, today }) {
    const [selectedWeek, setSelectedWeek] = useState(1);

    useEffect(() => {
        const currentWeekData = scheduleData.find(w => today >= w.startDate && today <= w.endDate);
        if (currentWeekData) {
            setSelectedWeek(currentWeekData.week);
        }
    }, [today]);

    const handleWeekSelection = (week) => {
        setSelectedWeek(week);
    };

    const handleWeekCompletion = (week) => {
        const currentCompleted = userData.completedWeeks || [];
        const newCompleted = currentCompleted.includes(week)
            ? currentCompleted.filter(w => w !== week)
            : [...currentCompleted, week];
        updateUserData({ completedWeeks: newCompleted });
    };
    
    const handleDayCompletion = (week, day) => {
        const dayId = `${week}-${day}`;
        const currentCompleted = userData.completedDays || [];
        const newCompleted = currentCompleted.includes(dayId)
            ? currentCompleted.filter(d => d !== dayId)
            : [...currentCompleted, dayId];
        updateUserData({ completedDays: newCompleted });
    };

    const selectedWeekData = scheduleData.find(w => w.week === selectedWeek);
    const formatDate = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    const getPhaseInfo = (phaseNumber) => {
        switch(phaseNumber) {
            case 1: return { title: "Base Sólida", color: "text-blue-800" };
            case 2: return { title: "Consolidação", color: "text-teal-800" };
            case 3: return { title: "Reta Final", color: "text-amber-800" };
            default: return { title: "", color: "" };
        }
    };

    const renderPlan = (plan, weekStartDate, isWeekend = false) => {
        if (!plan) return null;
        
        let entries = Object.entries(plan);

        if (isWeekend) {
            // Sort to ensure Saturday (6) comes before Sunday (0)
            entries.sort(([dayA], [dayB]) => {
                const dayNumA = parseInt(dayA);
                const dayNumB = parseInt(dayB);
                const sortA = dayNumA === 0 ? 7 : dayNumA;
                const sortB = dayNumB === 0 ? 7 : dayNumB;
                return sortA - sortB;
            });
        }

        return entries.map(([day, topic]) => {
            const dayNum = parseInt(day);
            const dayId = `${selectedWeekData.week}-${dayNum}`;
            const isCompleted = userData?.completedDays?.includes(dayId);
            
            let dayName;
            const currentDate = new Date(weekStartDate);

            if (!isWeekend) {
                dayName = `Dia ${dayNum}`;
                currentDate.setDate(currentDate.getDate() + (dayNum - 1));
            } else {
                dayName = dayNum === 6 ? 'Sábado' : 'Domingo';
                currentDate.setDate(currentDate.getDate() + (dayNum === 6 ? 5 : 6));
            }
            
            const formattedDate = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            return (
                <div key={dayId} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
                    <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleDayCompletion(selectedWeekData.week, dayNum)}
                        id={dayId}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor={dayId} className={`flex-1 cursor-pointer ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        <strong className="font-semibold">{dayName} ({formattedDate}):</strong> {topic}
                    </label>
                </div>
            );
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">As 3 Fases do Estudo</h2>
                <p className="text-center text-gray-600 mb-6 max-w-3xl mx-auto">Sua preparação está dividida em três fases estratégicas, entender o propósito de cada fase otimizará seu aprendizado e o deixará mais confiante para o dia da prova.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-md">
                    <PhaseCard phase={{number: 1, title: "Base Sólida"}} weeks="Semanas 1 a 5" load="4h/noite (semana) + 8h/dia (fds)" description="O objetivo é construir um alicerce forte. Você irá aprofundar na teoria das disciplinas mais importantes e fazer um diagnóstico inicial com simulados. A carga horária é intensa para criar um bom ritmo." color={{border: "border-blue-500", text: "text-blue-800"}} />
                    <PhaseCard phase={{number: 2, title: "Consolidação"}} weeks="Semanas 6 a 21" load="2h/noite (semana) + 8h/dia (fds)" description="Aqui, o foco muda para a revisão e prática massiva. A carga horária noturna é reduzida para permitir a consolidação do conhecimento através de questões, leitura de lei seca e súmulas, sem esgotamento." color={{border: "border-teal-500", text: "text-teal-800"}} />
                    <PhaseCard phase={{number: 3, title: "Reta Final"}} weeks="Semanas 22 a 24" load="8h/dia (todos os dias)" description="É o 'sprint' final. A carga horária aumenta drasticamente para uma imersão total em simulados, resolução de provas antigas e revisão dos pontos mais críticos. O objetivo é lapidar o conhecimento e ganhar velocidade." color={{border: "border-amber-500", text: "text-amber-800"}} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Cronograma Semanal Detalhado</h2>
                <p className="text-center text-gray-600 mb-8">Navegue pelas 24 semanas do seu plano. Clique em uma semana para ver o plano detalhado e marque-as como concluídas para acompanhar seu progresso.</p>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {scheduleData.map(weekData => {
                        const isSelected = weekData.week === selectedWeek;
                        const isCompleted = userData?.completedWeeks?.includes(weekData.week);
                        const isCurrent = today >= weekData.startDate && today <= weekData.endDate;
                        let buttonClass = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
                        if (isCurrent && !isSelected) buttonClass = 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-500';
                        if (isCompleted) buttonClass = 'bg-green-600 text-white hover:bg-green-700';
                        if (isSelected) buttonClass = 'bg-blue-600 text-white transform scale-110 ring-2 ring-blue-700';
                        return (
                            <button
                                key={weekData.week}
                                onClick={() => handleWeekSelection(weekData.week)}
                                className={`w-10 h-10 rounded-full font-semibold transition-all duration-200 flex items-center justify-center ${buttonClass}`}
                            >
                                {weekData.week}
                            </button>
                        );
                    })}
                </div>

                {selectedWeekData && (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Semana {selectedWeekData.week} <span className={`text-base font-medium ${getPhaseInfo(selectedWeekData.phase).color}`}>- Fase {selectedWeekData.phase}: {getPhaseInfo(selectedWeekData.phase).title}</span></h3>
                                <p className="text-sm text-gray-500">{formatDate(selectedWeekData.startDate)} - {formatDate(selectedWeekData.endDate)}</p>
                            </div>
                            <button
                                onClick={() => handleWeekCompletion(selectedWeekData.week)}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    userData?.completedWeeks?.includes(selectedWeekData.week)
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                <CheckCircle size={16} />
                                <span>{userData?.completedWeeks?.includes(selectedWeekData.week) ? 'Concluída' : 'Marcar como Concluída'}</span>
                            </button>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Plano (Segunda a Sexta):</h4>
                                <div className="pl-4 space-y-1">{renderPlan(selectedWeekData.daily, selectedWeekData.startDate)}</div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mt-4 mb-2">Plano (Fim de Semana):</h4>
                                <div className="pl-4 space-y-1">{renderPlan(selectedWeekData.weekend, selectedWeekData.startDate, true)}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MeuProgresso({ userData, updateUserData, userId }) { 
    const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
    const [studyTopic, setStudyTopic] = useState('');
    const [availableDisciplines, setAvailableDisciplines] = useState([]);
    const [selectedDiscipline, setSelectedDiscipline] = useState('');
    const [questions, setQuestions] = useState(''); 
    const [correct, setCorrect] = useState(''); 
    const [error, setError] = useState(''); 

    useEffect(() => {
        const topic = findTopicForDate(studyDate);
        setStudyTopic(topic);
        const disciplines = getDisciplinesFromTopic(topic);
        setAvailableDisciplines(disciplines);
        setSelectedDiscipline(disciplines[0] || '');
    }, [studyDate]);

    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        if (!userId) {
            setError("Erro de autenticação. Por favor, recarregue a página.");
            return;
        }
        const numQuestions = parseInt(questions); 
        const numCorrect = parseInt(correct); 
        if (isNaN(numQuestions) || isNaN(numCorrect) || numQuestions <= 0 || numCorrect < 0 || numCorrect > numQuestions) { 
            setError('Por favor, insira valores válidos. O número de acertos não pode ser maior que o de questões.'); 
            return; 
        } 
        if (!selectedDiscipline) {
            setError('Por favor, selecione uma disciplina.');
            return;
        }
        setError(''); 
        const newHistoryEntry = { 
            id: new Date().toISOString(), // ID único para cada registro
            studyDate: studyDate,
            topic: studyTopic,
            discipline: selectedDiscipline,
            questions: numQuestions, 
            correct: numCorrect, 
        }; 
        const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'studyPlan', 'progress'); 
        await updateDoc(userDocRef, { history: arrayUnion(newHistoryEntry) }).catch(async (err) => { 
            if (err.code === 'not-found') { 
                await setDoc(userDocRef, { history: [newHistoryEntry] }); 
            } else { 
                console.error("Erro ao adicionar histórico:", err); 
            } 
        }); 
        setQuestions(''); 
        setCorrect(''); 
    }; 
    
    const handleDeleteHistoryEntry = async (entryID) => {
        if (!userId) return;
        const currentHistory = userData.history || [];
        const newHistory = currentHistory.filter(entry => entry.id !== entryID);
        const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'studyPlan', 'progress');
        await updateDoc(userDocRef, { history: newHistory });
    };

    const performanceStats = useMemo(() => {
        const history = userData?.history || [];
        const stats = {
            byDiscipline: {},
            byGroup: { A: { correct: 0, total: 0 }, B: { correct: 0, total: 0 }, C: { correct: 0, total: 0 } }
        };

        DISCIPLINES.forEach(d => { stats.byDiscipline[d] = { correct: 0, total: 0 }; });

        history.forEach(entry => {
            if (stats.byDiscipline[entry.discipline]) {
                stats.byDiscipline[entry.discipline].correct += entry.correct;
                stats.byDiscipline[entry.discipline].total += entry.questions;
            }
        });

        let best = { name: 'N/A', perc: -1 };
        let worst = { name: 'N/A', perc: 101 };

        for (const discipline in stats.byDiscipline) {
            const item = stats.byDiscipline[discipline];
            if (item.total > 0) {
                const perc = (item.correct / item.total) * 100;
                if (perc > best.perc) best = { name: discipline, perc };
                if (perc < worst.perc) worst = { name: discipline, perc };
            }
            
            if (DISCIPLINE_GROUPS.A.includes(discipline)) {
                stats.byGroup.A.correct += item.correct;
                stats.byGroup.A.total += item.total;
            } else if (DISCIPLINE_GROUPS.B.includes(discipline)) {
                stats.byGroup.B.correct += item.correct;
                stats.byGroup.B.total += item.total;
            } else if (DISCIPLINE_GROUPS.C.includes(discipline)) {
                stats.byGroup.C.correct += item.correct;
                stats.byGroup.C.total += item.total;
            }
        }
        
        return { ...stats, bestDiscipline: best, worstDiscipline: worst };
    }, [userData?.history]);

    return ( 
        <div className="space-y-8"> 
            <div className="bg-white p-6 rounded-lg shadow-md"> 
                <h3 className="text-xl font-bold mb-1 text-gray-800">Registrar Questões da Trilha Diária</h3> 
                <p className="text-sm text-gray-600 mb-4">Selecione o dia do seu cronograma para registrar o desempenho nas questões.</p>
                <form onSubmit={handleSubmit} className="space-y-4"> 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="studyDate" className="block text-sm font-medium text-gray-700">Data do Estudo</label>
                            <input 
                                type="date" 
                                id="studyDate" 
                                value={studyDate} 
                                onChange={(e) => setStudyDate(e.target.value)}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="discipline" className="block text-sm font-medium text-gray-700">Disciplina</label>
                            <select 
                                id="discipline" 
                                value={selectedDiscipline} 
                                onChange={(e) => setSelectedDiscipline(e.target.value)} 
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                disabled={availableDisciplines.length <= 1}
                            >
                                {availableDisciplines.length > 0 ? 
                                    availableDisciplines.map(d => <option key={d} value={d}>{d}</option>) : 
                                    <option value="">Selecione uma disciplina</option>
                                }
                            </select>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        <strong>Tópico do dia:</strong> {studyTopic}
                    </p>
                    <div className="grid grid-cols-2 gap-4"> 
                        <div> 
                            <label htmlFor="questions" className="block text-sm font-medium text-gray-700">Questões Feitas</label> 
                            <input type="number" id="questions" min="1" value={questions} onChange={(e) => setQuestions(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /> 
                        </div> 
                        <div> 
                            <label htmlFor="correct" className="block text-sm font-medium text-gray-700">Acertos</label> 
                            <input type="number" id="correct" min="0" value={correct} onChange={(e) => setCorrect(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /> 
                        </div> 
                    </div> 
                    {error && <p className="text-sm text-red-600">{error}</p>} 
                    <button type="submit" className="w-full md:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"> 
                        <PlusCircle size={20} className="mr-2"/> Adicionar Progresso 
                    </button> 
                </form> 
            </div> 
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">Resumo do Desempenho por Disciplina</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard icon={<Star size={24} className="text-white"/>} label="Melhor Disciplina" value={performanceStats.bestDiscipline.name} subValue={performanceStats.bestDiscipline.perc !== -1 ? `${performanceStats.bestDiscipline.perc.toFixed(1)}% de acerto` : 'N/A'} colorClass="bg-green-500" /> 
                    <StatCard icon={<ThumbsDown size={24} className="text-white"/>} label="Ponto de Atenção" value={performanceStats.worstDiscipline.name} subValue={performanceStats.worstDiscipline.perc !== 101 ? `${performanceStats.worstDiscipline.perc.toFixed(1)}% de acerto` : 'N/A'} colorClass="bg-red-500" /> 
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">Desempenho por Grupo Estratégico</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={<BarChart2 size={24} className="text-white"/>} label="Grupo A (Prioridade Alta)" value={performanceStats.byGroup.A.total > 0 ? `${((performanceStats.byGroup.A.correct / performanceStats.byGroup.A.total) * 100).toFixed(1)}%` : 'N/A'} subValue={`${performanceStats.byGroup.A.correct} de ${performanceStats.byGroup.A.total}`} colorClass="bg-blue-600" /> 
                    <StatCard icon={<BarChart2 size={24} className="text-white"/>} label="Grupo B (Prioridade Média)" value={performanceStats.byGroup.B.total > 0 ? `${((performanceStats.byGroup.B.correct / performanceStats.byGroup.B.total) * 100).toFixed(1)}%` : 'N/A'} subValue={`${performanceStats.byGroup.B.correct} de ${performanceStats.byGroup.B.total}`} colorClass="bg-teal-600" /> 
                    <StatCard icon={<BarChart2 size={24} className="text-white"/>} label="Grupo C (Prioridade Baixa)" value={performanceStats.byGroup.C.total > 0 ? `${((performanceStats.byGroup.C.correct / performanceStats.byGroup.C.total) * 100).toFixed(1)}%` : 'N/A'} subValue={`${performanceStats.byGroup.C.correct} de ${performanceStats.byGroup.C.total}`} colorClass="bg-amber-600" /> 
                </div>
            </div>
             
            <div className="bg-white p-6 rounded-lg shadow-md mt-8"> 
                <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">Histórico de Questões</h3> 
                <div className="overflow-x-auto"> 
                    <table className="min-w-full bg-white"> 
                        <thead className="bg-gray-100"> 
                            <tr className="text-gray-600 uppercase text-sm leading-normal"> 
                                <th className="py-3 px-6 text-left">Data do Estudo</th> 
                                <th className="py-3 px-6 text-left">Disciplina</th> 
                                <th className="py-3 px-6 text-center">Questões</th> 
                                <th className="py-3 px-6 text-center">Acertos</th> 
                                <th className="py-3 px-6 text-center">%</th> 
                                <th className="py-3 px-6 text-center">Ações</th>
                            </tr> 
                        </thead> 
                        <tbody className="text-gray-600 text-sm font-light"> 
                            {userData.history && userData.history.length > 0 ? ( 
                                [...userData.history].sort((a, b) => new Date(b.studyDate) - new Date(a.studyDate)).map((entry) => ( 
                                    <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50"> 
                                        <td className="py-3 px-6 text-left whitespace-nowrap">{new Date(entry.studyDate + 'T12:00:00').toLocaleDateString('pt-BR')}</td> 
                                        <td className="py-3 px-6 text-left">{entry.discipline}</td> 
                                        <td className="py-3 px-6 text-center">{entry.questions}</td> 
                                        <td className="py-3 px-6 text-center">{entry.correct}</td> 
                                        <td className="py-3 px-6 text-center font-semibold">{((entry.correct / entry.questions) * 100).toFixed(0)}%</td> 
                                        <td className="py-3 px-6 text-center">
                                            <button onClick={() => handleDeleteHistoryEntry(entry.id)} className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200" title="Apagar Registro">
                                                <Trash2 size={16}/>
                                            </button>
                                        </td>
                                    </tr> 
                                )) 
                            ) : ( 
                                <tr><td colSpan="6" className="py-8 px-6 text-center text-gray-500">Nenhum estudo registrado ainda.</td></tr> 
                            )} 
                        </tbody> 
                    </table> 
                </div> 
            </div> 
        </div> 
    ); 
}

function TrilhaDiaria({userData, updateUserData, userId}) { 
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
    const [isLoading, setIsLoading] = useState(false); 
    const [studyContent, setStudyContent] = useState(''); 
    const [gabarito, setGabarito] = useState(''); 
    const [isGabaritoVisible, setIsGabaritoVisible] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(''); 
    const [genOptions, setGenOptions] = useState({ resumo: true, conceitos: true, legislacao: true, questoes: true, }); 
    const [numQuestoes, setNumQuestoes] = useState(5); 
    const [historyTrails, setHistoryTrails] = useState([]); 
    const [loadingHistory, setLoadingHistory] = useState(true); 

    const callGeminiAPI = async (prompt) => {
        try { 
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }]; 
            const payload = { contents: chatHistory }; 
            const apiKey = "AIzaSyC4zeMkEEvYKXeqTq9_IJvkhc8Ua3gFU7k"; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`; 
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); 
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`); 
            const result = await response.json(); 
            if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) { 
                let text = result.candidates[0].content.parts[0].text; 
                const gabaritoSplit = text.split('### Gabarito Comentado'); 
                let mainContent = gabaritoSplit[0]; 
                let gabaritoContent = gabaritoSplit.length > 1 ? gabaritoSplit[1] : ''; 
                const formatSection = (content) => content .replace(/### (.*?)\n/g, '<h3 class="text-xl font-bold text-blue-800 mt-6 mb-3">$1</h3>') .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') .replace(/https?:\/\/[^\s<]+/g, '<a href="$&" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$&</a>') .replace(/\n/g, '<br />'); 
                setStudyContent(formatSection(mainContent)); 
                setGabarito(formatSection(gabaritoContent)); 
                await saveTrailToHistory(selectedDate, findTopicForDate(selectedDate), formatSection(mainContent), formatSection(gabaritoContent)); 
            } else { 
                throw new Error("A resposta da API está vazia ou em formato inesperado."); 
            } 
        } catch (error) { 
            console.error("Erro ao gerar trilha diária:", error); 
            setErrorMessage("Desculpe, não foi possível gerar o conteúdo. Tente novamente mais tarde."); 
        } finally { 
            setIsLoading(false); 
        } 
    };

    const handleGenerateStudy = async () => { 
        setIsLoading(true); 
        setErrorMessage(''); 
        setStudyContent(''); 
        setGabarito(''); 
        setIsGabaritoVisible(false); 
        
        const topic = findTopicForDate(selectedDate); 
        let prompt;

        if (topic.toLowerCase().includes("revisão")) {
            const disciplinesToReview = getDisciplinesFromTopic(topic);
            if (disciplinesToReview.length === 0) {
                setStudyContent(`<p class="text-center text-gray-500">Não foi possível identificar as disciplinas para a revisão. Tente um dia com um tópico de estudo específico.</p>`);
                setIsLoading(false);
                return;
            }

            const pastTopics = [];
            const selectedD = new Date(selectedDate + 'T12:00:00');

            scheduleData.forEach(weekData => {
                const weekEndDate = new Date(weekData.endDate);
                weekEndDate.setHours(23, 59, 59, 999);

                if (weekEndDate < selectedD) {
                    const allTopics = {...weekData.daily, ...weekData.weekend};
                    for (const day in allTopics) {
                        const dayTopic = allTopics[day];
                        disciplinesToReview.forEach(discipline => {
                            if (dayTopic.includes(discipline) && !dayTopic.toLowerCase().includes("revisão")) {
                                if (!pastTopics.includes(dayTopic)) {
                                    pastTopics.push(dayTopic);
                                }
                            }
                        });
                    }
                }
            });

            if (pastTopics.length === 0) {
                setStudyContent(`<p class="text-center text-gray-500">Nenhum tópico de estudo anterior encontrado para: ${disciplinesToReview.join(', ')}. A revisão inteligente funciona melhor após você ter estudado alguns tópicos.</p>`);
                setIsLoading(false);
                return;
            }

            prompt = `Aja como um tutor experiente para o Exame da OAB. Crie um material de revisão consolidado e inteligente para a estudante Carolina. O objetivo é revisar os seguintes tópicos, que já foram estudados, para as disciplinas de ${disciplinesToReview.join(' e ')}:\n\n- ${pastTopics.join('\n- ')}\n\nEstruture a resposta EXATAMENTE da seguinte forma:\n\n### Resumo Consolidado\n[Faça um resumo que conecte os principais pontos dos tópicos listados, destacando os conceitos mais importantes e como eles se relacionam.]\n\n### Pontos de Atenção (Súmulas e Leis)\n[Liste os artigos de lei e súmulas mais relevantes e frequentemente cobrados na OAB relacionados a estes tópicos.]\n\n### Questões de Revisão Integrada\n[Crie ${numQuestoes} questões de múltipla escolha (A, B, C, D) no estilo da banca FGV/OAB que integrem os conceitos dos diferentes tópicos revisados.]\n\n### Gabarito Comentado\n[Apresente o gabarito das questões e, para cada uma, forneça um comentário explicando a resposta correta com base nos tópicos revisados.]`;
        
        } else if (!topic || topic.includes("Nenhum tópico") || topic.includes("Simulado")) { 
            setStudyContent(`<p class="text-center text-gray-500">O dia selecionado é para um simulado ou descanso. Selecione um dia com tópico de estudo ou revisão para gerar o material.</p>`); 
            setIsLoading(false); 
            return; 
        } else {
            prompt = `Para o Exame da OAB, gere um material de estudo detalhado sobre o seguinte tópico: "${topic}". O material deve ser em português e formatado para um estudante de direito no Brasil. Estruture a resposta EXATAMENTE da seguinte forma, usando os marcadores indicados e incluindo apenas as seções selecionadas:\n\n`;
            if (genOptions.resumo) {
                prompt += `### Resumo Aprofundado\n[Faça um resumo completo e didático sobre o tópico, explicando os principais pontos.]\n\n`;
            }
            if (genOptions.conceitos) {
                prompt += `### Conceitos-Chave\n[Liste de 3 a 5 conceitos essenciais relacionados ao tópico, com uma breve explicação para cada um.]\n\n`;
            }
            if (genOptions.legislacao) {
                prompt += `### Legislação Pertinente\n[Indique os principais diplomas legais sobre o tema e forneça links diretos para as leis no site do Planalto (https://www.planalto.gov.br/ccivil_03/...). Exemplo: \\"Estatuto da OAB - Lei nº 8.906/94: https://www.planalto.gov.br/ccivil_03/leis/l8906.htm\\"]\n\n`;
            }
            if (genOptions.questoes) {
                prompt += `### Questões de Fixação\n[Crie ${numQuestoes} questões de múltipla escolha (A, B, C, D) no estilo da banca FGV/OAB sobre o tópico. Numere as questões.]\n\n`;
                prompt += `### Gabarito Comentado\n[Apresente o gabarito das questões e, para cada questão, forneça um comentário explicando por que a alternativa correta está certa e as outras erradas.]`;
            }
        }

        await callGeminiAPI(prompt);
    }; 

    const saveTrailToHistory = async (date, topic, content, answerKey) => { 
        if (!userId) return; 
        const trailDocRef = doc(db, 'artifacts', appId, 'users', userId, 'daily_trails', date); 
        await setDoc(trailDocRef, { topic, content, answerKey, generatedAt: new Date().toISOString() }); 
    }; 

    const loadTrailFromHistory = (trail) => { 
        setStudyContent(trail.content); 
        setGabarito(trail.answerKey); 
        setSelectedDate(trail.id); 
        setIsGabaritoVisible(false); 
    }; 

    const handleToggleTrailCompletion = (trailId) => { 
        const currentCompleted = userData.completedTrails || []; 
        const newCompleted = currentCompleted.includes(trailId) ? currentCompleted.filter(id => id !== trailId) : [...currentCompleted, trailId]; 
        updateUserData({ completedTrails: newCompleted }); 
    }; 

    useEffect(() => { 
        if (!userId) return; 
        setLoadingHistory(true); 
        const historyCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'daily_trails'); 
        const q = query(historyCollectionRef, orderBy('generatedAt', 'desc')); 
        const unsubscribe = onSnapshot(q, (querySnapshot) => { 
            const trails = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
            setHistoryTrails(trails); 
            setLoadingHistory(false); 
        }, (error) => { 
            console.error("Error fetching history: ", error); 
            setLoadingHistory(false); 
        }); 
        return () => unsubscribe(); 
    }, [userId]);

    return ( 
        <div className="flex flex-col lg:flex-row gap-6"> 
            <div className="w-full lg:flex-1"> 
                <div className="bg-white p-6 rounded-lg shadow-md"> 
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">✨ Trilha Diária de Estudos</h2> 
                    <p className="text-gray-600 mb-6">Personalize seu estudo diário. Selecione os conteúdos que deseja gerar com a IA e a quantidade de questões para praticar.</p> 
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4"> 
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4"> 
                            <label htmlFor="dailyStudyDate" className="block text-sm font-medium text-gray-700 whitespace-nowrap">Selecione o Dia:</label> 
                            <input type="date" id="dailyStudyDate" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="block w-full md:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required /> 
                        </div> 
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center"> 
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={genOptions.resumo} onChange={(e) => setGenOptions({...genOptions, resumo: e.target.checked})} className="rounded"/><span>Resumo</span></label> 
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={genOptions.conceitos} onChange={(e) => setGenOptions({...genOptions, conceitos: e.target.checked})} className="rounded"/><span>Conceitos</span></label> 
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={genOptions.legislacao} onChange={(e) => setGenOptions({...genOptions, legislacao: e.target.checked})} className="rounded"/><span>Legislação</span></label> 
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={genOptions.questoes} onChange={(e) => setGenOptions({...genOptions, questoes: e.target.checked})} className="rounded"/><span>Questões</span></label> 
                            <div className="flex items-center gap-2"> 
                                <label htmlFor="numQuestoes" className="text-sm">Qtd:</label> 
                                <input type="number" id="numQuestoes" value={numQuestoes} onChange={(e) => setNumQuestoes(e.target.value)} min="1" max="10" className="block w-full rounded-md border-gray-300 shadow-sm text-sm" disabled={!genOptions.questoes} /> 
                            </div> 
                        </div> 
                        <button id="loadDailyStudy" onClick={handleGenerateStudy} disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center" > 
                            {isLoading ? <><Loader2 className="animate-spin mr-2" size={20} />Gerando...</> : "Gerar Estudo do Dia"} 
                        </button> 
                    </div> 
                    <div id="dailyStudyContent" className="bg-gray-50 p-6 rounded-lg min-h-[400px] text-gray-700 prose prose-sm max-w-none"> 
                        {isLoading && ( 
                            <div className="flex flex-col items-center justify-center h-full"> 
                                <Loader2 className="animate-spin h-12 w-12 text-blue-500" /> 
                                <p className="mt-4 text-lg font-semibold text-gray-600">Aguarde, a IA está preparando seu material de estudo...</p> 
                            </div> 
                        )} 
                        {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>} 
                        {!isLoading && !studyContent && <p className="text-center text-gray-500">Selecione uma data, personalize seu conteúdo e clique em "Gerar Estudo do Dia" para começar.</p>} 
                        {studyContent && ( 
                            <> 
                                <div dangerouslySetInnerHTML={{ __html: studyContent }} /> 
                                {gabarito && ( 
                                    <div className="mt-6"> 
                                        <button onClick={() => setIsGabaritoVisible(!isGabaritoVisible)} className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" > 
                                            {isGabaritoVisible ? <EyeOff className="mr-2" size={16} /> : <Eye className="mr-2" size={16} />} 
                                            {isGabaritoVisible ? 'Ocultar Gabarito Comentado' : 'Mostrar Gabarito Comentado'} 
                                        </button> 
                                        {isGabaritoVisible && ( 
                                            <div className="mt-4 p-4 bg-white border-l-4 border-green-500 rounded-r-lg" dangerouslySetInnerHTML={{ __html: gabarito }} /> 
                                        )} 
                                    </div> 
                                )} 
                            </> 
                        )} 
                    </div> 
                </div> 
            </div> 
            <div className="w-full lg:w-1/3 bg-white p-4 rounded-lg shadow-md lg:sticky lg:top-24 h-fit"> 
                <div className="flex justify-between items-center mb-4"> 
                    <h3 className="text-lg font-bold">Histórico de Trilhas</h3> 
                </div> 
                {loadingHistory ? <Loader2 className="animate-spin mx-auto" /> : ( 
                    <ul className="space-y-2 max-h-[80vh] overflow-y-auto"> 
                        {historyTrails.length > 0 ? historyTrails.map(trail => { 
                            const isCompleted = userData?.completedTrails?.includes(trail.id); 
                            return ( 
                                <li key={trail.id} className="border-b pb-2"> 
                                    <div className="flex justify-between items-start"> 
                                        <button onClick={() => loadTrailFromHistory(trail)} className="text-left flex-grow hover:bg-gray-100 p-2 rounded-md"> 
                                            <p className="font-semibold">{new Date(trail.id + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p> 
                                            <p className="text-sm text-gray-600 truncate">{trail.topic}</p> 
                                        </button> 
                                        <button onClick={() => handleToggleTrailCompletion(trail.id)} className={`p-2 rounded-full transition-colors ${isCompleted ? 'text-green-500 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}> 
                                            <CheckCircle size={20} fill={isCompleted ? 'currentColor' : 'none'} /> 
                                        </button> 
                                    </div> 
                                </li> 
                            )}) : <p className="text-sm text-gray-500 text-center p-4">Nenhum estudo gerado ainda.</p>} 
                    </ul> 
                )} 
            </div> 
        </div> 
    ); 
}

function SimuladorOAB({ userId, pastSimulations, loadingHistory }) {
    const [view, setView] = useState('home'); // 'home', 'running', 'results', 'review'
    const [simulationData, setSimulationData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleStartSimulation = async () => {
        setIsLoading(true);
        setError(null);
        const SIMULATION_SIZE = 80;

        try {
            const questionsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
            const q = query(questionsCollectionRef, limit(300));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                throw new Error("A coleção de questões está vazia ou o caminho no Firestore está incorreto.");
            }

            const allQuestions = querySnapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }));
            const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
            const finalQuestions = shuffledQuestions.slice(0, SIMULATION_SIZE);

            if (finalQuestions.length < 10) { 
                 throw new Error(`Não foi possível carregar questões suficientes. Apenas ${finalQuestions.length} encontradas.`);
            }

            const newSimData = {
                questions: finalQuestions,
                userAnswers: {},
                startTime: Date.now(),
                endTime: null,
                flags: {},
            };
            setSimulationData(newSimData);
            setView('running');

        } catch (err) {
            console.error("Falha detalhada ao gerar o simulado:", err);
            setError(err.message || "Não foi possível carregar as questões do simulado.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinishSimulation = async (finalAnswers, finalFlags) => {
        const endTime = Date.now();
        const totalBlank = simulationData.questions.length - Object.keys(finalAnswers).length;
        const results = {
            ...simulationData,
            userAnswers: finalAnswers,
            flags: finalFlags,
            endTime: endTime,
            totalBlank: totalBlank,
        };
        setSimulationData(results);
        await saveSimulationResults(results);
        setView('results');
    };

    const saveSimulationResults = async (results) => {
        if (!userId) return;
        const simId = new Date(results.startTime).toISOString();
        const simDocRef = doc(db, 'artifacts', appId, 'users', userId, 'simulations', simId);
        try {
            await setDoc(simDocRef, results);
        } catch (error) {
            console.error("Erro ao salvar resultado completo do simulado:", error);
        }
    };
    
    const handleReviewPastSimulation = (sim) => {
        setSimulationData(sim);
        setView('results');
    };

    const handleDeleteSimulation = async (simId) => {
        if (!userId || !simId) {
            console.error("User ID ou Sim ID inválido para exclusão.");
            return;
        };
        // A confirmação foi removida para garantir a funcionalidade no ambiente do Canvas.
        // O ideal seria implementar um modal de confirmação customizado.
        const simDocRef = doc(db, 'artifacts', appId, 'users', userId, 'simulations', simId);
        try {
            await deleteDoc(simDocRef);
        } catch (error) {
            console.error("Erro ao apagar simulado:", error);
        }
    };

    const handleGoHome = () => {
        setView('home');
        setError(null);
        setSimulationData(null);
    };

    switch (view) {
        case 'running':
            return <SimulationView simulationData={simulationData} onFinish={handleFinishSimulation} onGoHome={handleGoHome} />;
        case 'results':
            return <ResultsView simulationData={simulationData} onReview={() => setView('review')} onGoHome={handleGoHome} />;
        case 'review':
            return <ReviewView simulationData={simulationData} onGoHome={handleGoHome} onBackToResults={() => setView('results')} />;
        default:
            return <SimulationHome 
                        onStart={handleStartSimulation} 
                        isLoading={isLoading} 
                        error={error} 
                        pastSimulations={pastSimulations}
                        loadingHistory={loadingHistory}
                        onReview={handleReviewPastSimulation}
                        onDelete={handleDeleteSimulation}
                   />;
    }
}

function SimulationHome({ onStart, isLoading, error, pastSimulations, loadingHistory, onReview, onDelete }) { 
    return ( 
        <div className="space-y-8"> 
            <div className="bg-white p-8 rounded-lg shadow-md text-center flex flex-col items-center"> 
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Simulador de Prova - 1ª Fase</h2> 
                <p className="text-gray-600 mb-6 max-w-2xl"> Teste seus conhecimentos em um ambiente que replica a prova da OAB. São 80 questões de múltipla escolha para serem resolvidas em 5 horas. Boa sorte, Carol! </p> 
                <div className="w-full max-w-sm bg-blue-50 p-6 rounded-lg border border-blue-200"> 
                    <h3 className="font-semibold text-lg text-blue-800 mb-4">Instruções</h3> 
                    <ul className="text-sm text-left text-blue-900 space-y-2"> 
                        <li className="flex items-start"><Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /><span>Você terá <strong>5 horas</strong> para completar o simulado.</span></li> 
                        <li className="flex items-start"><FileText className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /><span>São <strong>80 questões</strong> de diversas disciplinas.</span></li> 
                        <li className="flex items-start"><Target className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /><span>A meta para aprovação é acertar <strong>40 questões (50%)</strong>.</span></li>
                        <li className="flex items-start"><Archive className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /><span>Seu resultado e a prova completa são <strong>salvos automaticamente</strong>.</span></li>
                    </ul> 
                </div> 
                {error && ( 
                    <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3"> 
                        <AlertTriangle className="h-6 w-6"/> <p className="text-sm font-medium">{error}</p> 
                    </div> 
                )} 
                <button onClick={onStart} disabled={isLoading} className="mt-8 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center" > 
                    {isLoading ? ( <> <Loader2 className="animate-spin mr-3" /> Gerando seu simulado... </> ) : ( "Iniciar Novo Simulado" )} 
                </button> 
            </div> 
            <div className="bg-white p-6 rounded-lg shadow-md mt-8"> 
                <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">Histórico de Simulados</h3> 
                {loadingHistory ? (
                    <div className="flex justify-center items-center p-8">
                        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto"> 
                        <table className="min-w-full bg-white"> 
                            <thead> 
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal"> 
                                    <th className="py-3 px-6 text-left">Data</th> 
                                    <th className="py-3 px-6 text-center">Acertos</th> 
                                    <th className="py-3 px-6 text-center">Em Branco</th> 
                                    <th className="py-3 px-6 text-center">Aproveitamento</th> 
                                    <th className="py-3 px-6 text-center">Ações</th> 
                                </tr> 
                            </thead> 
                            <tbody className="text-gray-600 text-sm font-light"> 
                                {pastSimulations && pastSimulations.length > 0 ? ( 
                                    pastSimulations.map((sim) => {
                                        const totalCorrect = Object.keys(sim.userAnswers).reduce((acc, qId) => {
                                            const question = sim.questions.find(q => q.firestoreId === qId);
                                            const correctAnswer = question?.respostaCorreta || question?.gabarito;
                                            return (question && sim.userAnswers[qId] === correctAnswer) ? acc + 1 : acc;
                                        }, 0);
                                        const totalQuestions = sim.questions.length;
                                        const percentage = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(0) : 0;
                                        const isApproved = totalCorrect >= 40;

                                        return (
                                            <tr key={sim.id} className="border-b border-gray-200 hover:bg-gray-50"> 
                                                <td className="py-3 px-6 text-left whitespace-nowrap">
                                                    {new Date(sim.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </td> 
                                                <td className={`py-3 px-6 text-center font-semibold ${isApproved ? 'text-green-600' : 'text-red-600'}`}>
                                                    {totalCorrect} / {totalQuestions}
                                                </td> 
                                                <td className="py-3 px-6 text-center">{sim.totalBlank !== undefined ? sim.totalBlank : 'N/A'}</td>
                                                <td className="py-3 px-6 text-center font-semibold">{percentage}%</td> 
                                                <td className="py-3 px-6 text-center"> 
                                                    <div className="flex item-center justify-center gap-2">
                                                        <button onClick={() => onReview(sim)} className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200" title="Revisar Simulado">
                                                           <RotateCcw size={16}/>
                                                        </button>
                                                        <button onClick={() => onDelete(sim.id)} className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200" title="Apagar Simulado">
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    </div>
                                                </td> 
                                            </tr> 
                                        )
                                    })
                                ) : ( 
                                    <tr><td colSpan="5" className="py-8 px-6 text-center text-gray-500">Nenhum simulado realizado ainda.</td></tr> 
                                )} 
                            </tbody> 
                        </table> 
                    </div> 
                )}
            </div> 
        </div> 
    ); 
}

function SimulationView({ simulationData, onFinish, onGoHome }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [flags, setFlags] = useState({});
    const [timeLeft, setTimeLeft] = useState(5 * 60 * 60);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    onFinish(userAnswers, flags);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = 'Seu progresso no simulado será perdido. Tem certeza que deseja sair?'; 
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(intervalRef.current);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const formatTime = (seconds) => { const h = Math.floor(seconds / 3600).toString().padStart(2, '0'); const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0'); const s = (seconds % 60).toString().padStart(2, '0'); return `${h}:${m}:${s}`; };
    const handleSelectAnswer = (questionId, answer) => { setUserAnswers(prev => ({ ...prev, [questionId]: answer })); };
    const handleToggleFlag = (questionId) => { setFlags(prev => ({ ...prev, [questionId]: !prev[questionId] })); };
    const currentQuestion = simulationData.questions[currentQuestionIndex];

    return ( <div className="flex flex-col lg:flex-row gap-6"> {/* Painel de Navegação das Questões */} <div className="lg:w-1/4 bg-white p-4 rounded-lg shadow-md lg:sticky lg:top-24 h-fit"> <h3 className="font-bold text-lg mb-4">Questões</h3> <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-5 gap-2"> {simulationData.questions.map((q, index) => ( <button key={q.firestoreId} onClick={() => setCurrentQuestionIndex(index)} className={`w-10 h-10 rounded-md flex items-center justify-center font-semibold transition-all text-sm ${index === currentQuestionIndex ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-110' : ''} ${userAnswers[q.firestoreId] ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'} ${flags[q.firestoreId] ? 'ring-2 ring-amber-500' : ''} `} > {index + 1} </button> ))} </div> <button onClick={() => onFinish(userAnswers, flags)} className="w-full mt-6 bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700"> Finalizar Prova </button> </div> {/* Conteúdo da Questão */} <div className="lg:w-3/4 bg-white p-6 rounded-lg shadow-md"> <div className="flex justify-between items-center mb-4 border-b pb-4"> <div> <div className="flex items-center gap-2 mb-2"> <span className="text-sm bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full">{currentQuestion.disciplina}</span> <span className="text-xs bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded-full">Exame {currentQuestion.exam}</span> </div> <h2 className="text-xl font-bold">Questão {currentQuestionIndex + 1}</h2> </div> <div className="text-right"> <div className="flex items-center gap-2 text-2xl font-bold text-red-600"> <Clock size={24} /> <span>{formatTime(timeLeft)}</span> </div> <p className="text-sm text-gray-500">Tempo Restante</p> </div> </div> <div className="prose max-w-none mb-6"> <p>{currentQuestion.enunciado}</p> </div> <div className="space-y-3"> {currentQuestion.alternativas.map(alt => { const isSelected = userAnswers[currentQuestion.firestoreId] === alt.letra; return ( <div key={alt.letra} onClick={() => handleSelectAnswer(currentQuestion.firestoreId, alt.letra)} className={`p-4 border rounded-lg cursor-pointer transition-all flex items-start ${isSelected ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} `} > <span className={`font-bold mr-3 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} `}>{alt.letra}</span> <p className="text-gray-800">{alt.texto.replace(/d$/, '')}</p> </div> ); })} </div> <div className="mt-6 pt-6 border-t flex justify-between items-center"> <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"> <ArrowLeft size={16} /> Anterior </button> <button onClick={() => handleToggleFlag(currentQuestion.firestoreId)} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${flags[currentQuestion.firestoreId] ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}> <Flag size={16} /> {flags[currentQuestion.firestoreId] ? 'Desmarcar' : 'Marcar para Revisão'} </button> <button onClick={() => setCurrentQuestionIndex(prev => Math.min(simulationData.questions.length - 1, prev + 1))} disabled={currentQuestionIndex === simulationData.questions.length - 1} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"> Próxima <ArrowRight size={16} /> </button> </div> </div> </div> ); }

function ResultsView({ simulationData, onReview, onGoHome }) {
    const { questions, userAnswers } = simulationData;
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState("");
    const [analysisError, setAnalysisError] = useState("");

    const { totalCorrect, totalBlank } = useMemo(() => {
        const correct = questions.reduce((acc, q) => { 
            const correctAnswer = q?.respostaCorreta || q?.gabarito; 
            return userAnswers[q.firestoreId] === correctAnswer ? acc + 1 : acc; 
        }, 0);
        const blank = questions.length - Object.keys(userAnswers).length;
        return { totalCorrect: correct, totalBlank: blank };
    }, [questions, userAnswers]);
    
    const percentage = questions.length > 0 ? ((totalCorrect / questions.length) * 100).toFixed(1) : "0.0";
    const isApproved = totalCorrect >= 40;

    const performanceByDiscipline = useMemo(() => {
        const performance = {};
        questions.forEach(q => {
            const disciplineName = q.disciplina;
            if (!performance[disciplineName]) {
                performance[disciplineName] = { correct: 0, total: 0 };
            }
            performance[disciplineName].total++;
            const correctAnswer = q?.respostaCorreta || q?.gabarito;
            if (userAnswers[q.firestoreId] === correctAnswer) {
                performance[disciplineName].correct++;
            }
        });
        return Object.entries(performance);
    }, [questions, userAnswers]);

    const handleAnalyzePerformance = async () => {
        setIsAnalyzing(true);
        setAnalysisResult("");
        setAnalysisError("");

        let performanceSummary = `Resultado Geral: ${totalCorrect} de ${questions.length} acertos (${percentage}%).\n\nDesempenho por disciplina:\n`;
        performanceByDiscipline.forEach(([discipline, data]) => {
            const disciplinePercentage = data.total > 0 ? ((data.correct / data.total) * 100).toFixed(1) : "0";
            performanceSummary += `- ${discipline}: ${data.correct}/${data.total} (${disciplinePercentage}%)\n`;
        });

        const prompt = `Aja como um tutor experiente para o Exame da OAB. Analise o seguinte desempenho de um(a) estudante em um simulado e forneça um feedback construtivo e motivacional em português. O nome da estudante é Carol.

        Dados do Desempenho:
        ${performanceSummary}

        Estruture sua resposta da seguinte forma, usando os marcadores:
        ### Análise Geral
        [Faça um breve resumo do desempenho geral da Carol, destacando se ela atingiu a meta de 40 pontos e o que o percentual geral significa.]

        ### Pontos Fortes
        [Identifique 2 ou 3 disciplinas onde a Carol teve o melhor desempenho e elogie o esforço dela nessas áreas.]

        ### Pontos de Atenção
        [Identifique as 3 disciplinas com o menor percentual de acerto. Para cada uma, sugira 1 ou 2 tópicos específicos que são frequentemente cobrados na OAB e que ela deveria revisar.]

        ### Plano de Ação Sugerido
        [Dê um conselho prático e direcionado. Por exemplo, sugira focar nos pontos de atenção nas próximas 2 semanas, combinando revisão teórica com a resolução de muitas questões.]

        ### Mensagem Motivacional
        [Termine com uma mensagem curta, positiva e encorajadora para a Carol, lembrando-a de que o simulado é uma ferramenta de aprendizado e que ela está no caminho certo.]
        `;

        try {
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }]; 
            const payload = { contents: chatHistory }; 
            const apiKey = ""; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`; 
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); 
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`); 
            const result = await response.json(); 
            if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) { 
                const formattedText = result.candidates[0].content.parts[0].text
                    .replace(/### (.*?)\n/g, '<h3 class="text-xl font-bold text-gray-800 mt-4 mb-2">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />');
                setAnalysisResult(formattedText);
            } else { 
                throw new Error("A resposta da API está vazia ou em formato inesperado."); 
            } 
        } catch (error) { 
            console.error("Erro ao analisar desempenho:", error); 
            setAnalysisError("Não foi possível gerar a análise. Tente novamente mais tarde."); 
        } finally { 
            setIsAnalyzing(false); 
        } 
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Resultado do Simulado</h2>
            <p className="text-sm text-gray-500 mb-4">Seu resultado foi salvo automaticamente no seu histórico.</p>
            <div className={`p-6 rounded-lg mb-6 ${isApproved ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'} border-l-4`}>
                <p className="text-xl font-semibold">Seu desempenho foi de:</p>
                <p className={`text-6xl font-bold my-2 ${isApproved ? 'text-green-600' : 'text-red-600'}`}>{percentage}%</p>
                <p className="text-lg">{totalCorrect} de {questions.length} questões corretas.</p>
                <p className="text-md text-gray-600">({totalBlank} questões em branco)</p>
                <p className={`mt-4 text-2xl font-bold ${isApproved ? 'text-green-700' : 'text-red-700'}`}>
                    {isApproved ? "Parabéns, você foi APROVADA!" : "Não foi desta vez, continue estudando!"}
                </p>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">Desempenho por Disciplina</h3>
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border-b text-left">Disciplina</th>
                            <th className="py-2 px-4 border-b text-center">Acertos</th>
                            <th className="py-2 px-4 border-b text-center">Aproveitamento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performanceByDiscipline.map(([discipline, data]) => (
                            <tr key={discipline} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border-b text-left">{discipline}</td>
                                <td className="py-2 px-4 border-b text-center">{data.correct} / {data.total}</td>
                                <td className="py-2 px-4 border-b text-center">{data.total > 0 ? ((data.correct / data.total) * 100).toFixed(0) : 0}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex justify-center gap-4">
                <button onClick={onGoHome} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Voltar ao Início</button>
                <button onClick={onReview} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Revisar Prova</button>
            </div>

            <div className="mt-8 border-t pt-6">
                <button onClick={handleAnalyzePerformance} disabled={isAnalyzing} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto">
                    {isAnalyzing ? <><Loader2 className="animate-spin mr-3" /> Analisando...</> : <><Sparkles className="mr-2" /> Analisar Meu Desempenho com IA</>}
                </button>
            </div>

            {analysisResult && (
                <div className="mt-6 p-6 bg-gray-50 rounded-lg text-left prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: analysisResult }} />
            )}
            {analysisError && <p className="mt-4 text-red-500">{analysisError}</p>}
        </div>
    );
}
function ReviewView({ simulationData, onGoHome, onBackToResults }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [explanation, setExplanation] = useState("");
    const [isExplaining, setIsExplaining] = useState(false);
    const [explanationError, setExplanationError] = useState("");

    const { questions, userAnswers } = simulationData;
    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestion.firestoreId];
    const correctAnswer = currentQuestion?.respostaCorreta || currentQuestion?.gabarito;
    const isCorrect = userAnswer === correctAnswer;
    
    useEffect(() => {
        setExplanation("");
        setExplanationError("");
    }, [currentQuestionIndex]);

    const handleExplainQuestion = async () => {
        setIsExplaining(true);
        setExplanation("");
        setExplanationError("");

        const alternativesText = currentQuestion.alternativas.map(alt => `${alt.letra}) ${alt.texto}`).join('\n');
        const prompt = `Aja como um professor de direito especialista no Exame da OAB. Explique a seguinte questão de forma clara, didática e objetiva para um(a) estudante.

        **Questão:**
        Enunciado: ${currentQuestion.enunciado}
        Alternativas:
        ${alternativesText}

        **Resposta Correta:** ${correctAnswer}

        **Sua Tarefa:**
        1.  **Análise do Tema Central:** Comece explicando brevemente qual é o conceito jurídico principal abordado na questão.
        2.  **Justificativa da Resposta Correta:** Detalhe por que a alternativa '${correctAnswer}' é a correta, citando o artigo de lei, súmula ou princípio jurídico aplicável. Seja direto e claro.
        3.  **Análise das Incorretas:** Explique de forma concisa por que cada uma das outras alternativas está errada.
        4.  **Dica de Estudo:** Finalize com uma dica prática sobre como não errar mais questões desse tipo no futuro.
        
        Use formatação com markdown (negrito ** e listas com hífens -) para organizar a resposta.
        `;

        try { 
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }]; 
            const payload = { contents: chatHistory }; 
            const apiKey = ""; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`; 
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); 
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`); 
            const result = await response.json(); 
            if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) { 
                const formattedText = result.candidates[0].content.parts[0].text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />');
                setExplanation(formattedText);
            } else { 
                throw new Error("A resposta da API está vazia ou em formato inesperado."); 
            } 
        } catch (error) { 
            console.error("Erro ao explicar questão:", error); 
            setExplanationError("Não foi possível gerar a explicação. Tente novamente mais tarde."); 
        } finally { 
            setIsExplaining(false); 
        } 
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Revisão da Prova</h2>
                <div>
                     <button onClick={onBackToResults} className="text-sm text-blue-600 hover:underline mr-4">Voltar aos Resultados</button>
                     <button onClick={onGoHome} className="text-sm text-gray-600 hover:underline">Voltar ao Início</button>
                </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full">{currentQuestion.disciplina}</span>
                            <span className="text-xs bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded-full">Exame {currentQuestion.exam}</span>
                        </div>
                        <h3 className="text-xl font-bold">Questão {currentQuestionIndex + 1}</h3>
                    </div>
                </div>
                <div className="prose max-w-none mb-6">
                    <p>{currentQuestion.enunciado}</p>
                </div>
                <div className="space-y-3">
                    {currentQuestion.alternativas.map(alt => {
                        const isUserAnswer = userAnswer === alt.letra;
                        const isCorrectAnswer = correctAnswer === alt.letra;
                        let style = 'bg-gray-100 border-gray-200';
                        if (isCorrectAnswer) style = 'bg-green-100 border-green-400';
                        if (isUserAnswer && !isCorrectAnswer) style = 'bg-red-100 border-red-400';
                        return (
                            <div key={alt.letra} className={`p-4 border rounded-lg flex items-start ${style}`}>
                                <span className={`font-bold mr-3`}>{alt.letra})</span>
                                <p>{alt.texto.replace(/d$/, '')}</p>
                                {isUserAnswer && <span className="ml-auto text-sm font-semibold text-blue-700">(Sua resposta)</span>}
                                {isCorrectAnswer && <CheckCircle className="ml-auto text-green-600 w-5 h-5 flex-shrink-0" />}
                                {isUserAnswer && !isCorrectAnswer && <XCircle className="ml-auto text-red-600 w-5 h-5 flex-shrink-0" />}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-6 pt-4 border-t">
                    <button onClick={handleExplainQuestion} disabled={isExplaining} className="flex items-center justify-center mx-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        {isExplaining ? <><Loader2 className="animate-spin mr-2" size={16} /> Carregando explicação...</> : <><Lightbulb className="mr-2" size={16} /> ✨ Me Explique Melhor</>}
                    </button>
                    {explanation && <div className="mt-4 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: explanation }} />}
                    {explanationError && <p className="mt-4 text-sm text-center text-red-500">{explanationError}</p>}
                </div>
            </div>
            <div className="mt-6 pt-6 border-t flex justify-between items-center">
                <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50">
                    <ArrowLeft size={16} /> Anterior
                </button>
                <span className="font-semibold">{currentQuestionIndex + 1} / {questions.length}</span>
                <button onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentQuestionIndex === questions.length - 1} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                    Próxima <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}

// --- NOVO COMPONENTE DE PENDÊNCIAS ---
function Pendencias({ userData, userId }) {
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!description || !dueDate || !userId) return;

        setIsSubmitting(true);
        const newTask = {
            id: new Date().toISOString(),
            description,
            dueDate,
            completed: false,
        };

        const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'studyPlan', 'progress');
        try {
            await updateDoc(userDocRef, { tasks: arrayUnion(newTask) });
            setDescription('');
            setDueDate('');
        } catch (error) {
            if (error.code === 'not-found') {
                await setDoc(userDocRef, { tasks: [newTask] });
                setDescription('');
                setDueDate('');
            } else {
                console.error("Erro ao adicionar tarefa:", error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateTasksInFirestore = async (newTasks) => {
        if (!userId) return;
        const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'studyPlan', 'progress');
        await updateDoc(userDocRef, { tasks: newTasks });
    };

    const handleToggleTask = async (taskId) => {
        const currentTasks = userData.tasks || [];
        const newTasks = currentTasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        await updateTasksInFirestore(newTasks);
    };

    const handleDeleteTask = async (taskId) => {
        const currentTasks = userData.tasks || [];
        const newTasks = currentTasks.filter(task => task.id !== taskId);
        await updateTasksInFirestore(newTasks);
    };
    
    const getTaskStatus = (dueDateStr) => {
        if (!dueDateStr) return { text: 'Sem Prazo', color: 'bg-gray-400' };
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const taskDueDate = new Date(dueDateStr + 'T23:59:59');

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (taskDueDate < today) {
            return { text: 'Atrasada', color: 'bg-red-500' };
        }
        if (taskDueDate.getTime() === today.getTime() || taskDueDate.getTime() === tomorrow.getTime()) {
            return { text: 'Atenção', color: 'bg-yellow-500' };
        }
        return { text: 'No Prazo', color: 'bg-blue-500' };
    };

    const { pendingTasks, completedTasks } = useMemo(() => {
        const tasks = userData.tasks || [];
        const pending = tasks.filter(t => !t.completed).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        const completed = tasks.filter(t => t.completed).sort((a,b) => new Date(b.dueDate) - new Date(a.dueDate));
        return { pendingTasks: pending, completedTasks: completed };
    }, [userData.tasks]);

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Gerenciador de Tarefas</h2>
                <p className="text-gray-600 mb-6">Adicione tarefas importantes como leituras de lei seca, revisões específicas ou qualquer outra pendência para não perder o foco.</p>
                <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-grow w-full">
                        <label htmlFor="task-desc" className="block text-sm font-medium text-gray-700">Nova Tarefa</label>
                        <input
                            id="task-desc"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: Ler os primeiros 50 artigos do Código Civil"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="w-full md:w-auto">
                        <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700">Prazo</label>
                        <input
                            id="task-due-date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center disabled:bg-gray-400">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />}
                        Adicionar
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Tarefas Pendentes ({pendingTasks.length})</h3>
                    {pendingTasks.length > 0 ? (
                        <ul className="space-y-3">
                            {pendingTasks.map(task => {
                                const status = getTaskStatus(task.dueDate);
                                return (
                                    <li key={task.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-grow">
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={() => handleToggleTask(task.id)}
                                                className="h-6 w-6 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                                            />
                                            <div className="flex-grow">
                                                <p className="text-gray-800">{task.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <span className={`px-2 py-0.5 text-white text-xs font-semibold rounded-full ${status.color}`}>{status.text}</span>
                                                    <span>Prazo: {new Date(task.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteTask(task.id)} className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600">
                                            <Trash2 size={18} />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="text-center py-8 px-4 bg-white rounded-lg shadow-md">
                            <p className="text-gray-500">Parabéns! Nenhuma tarefa pendente.</p>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Tarefas Concluídas ({completedTasks.length})</h3>
                    {completedTasks.length > 0 && (
                         <ul className="space-y-3">
                            {completedTasks.map(task => (
                                <li key={task.id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between gap-4 opacity-70">
                                    <div className="flex items-center gap-4 flex-grow">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => handleToggleTask(task.id)}
                                            className="h-6 w-6 rounded-full border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer flex-shrink-0"
                                        />
                                        <div className="flex-grow">
                                            <p className="text-gray-500 line-through">{task.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">Concluída</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteTask(task.id)} className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600">
                                        <Trash2 size={18} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}


// --- COMPONENTE DE TELA DE LOGIN ATUALIZADO ---
function LoginScreen({ handleEmailLogin, isLoggingIn, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onEmailSubmit = (e) => {
    e.preventDefault();
    handleEmailLogin(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <div className="bg-red-600 text-white font-bold rounded-md p-3">OAB</div>
                <h1 className="text-3xl font-bold text-gray-800">Carolina Natal</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-700">Bem-vinda ao seu Plano de Estudos para a OAB!</h2>
            <p className="text-gray-600 mt-2">Faça login para salvar seu progresso.</p>
        </div>
        
        <form onSubmit={onEmailSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-600 block">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block">Senha (mínimo 6 caracteres)</label>
            <div className="relative">
               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
               <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                placeholder="••••••••"
                required
                minLength="6"
              />
            </div>
          </div>
          {error && (
            <p className='text-sm text-center text-red-500'>
                {error}
            </p>
          )}
          <button type="submit" disabled={isLoggingIn} className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center">
            {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- COMPONENTE DE TELA DE ERRO ---
const FirebaseErrorScreen = () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Erro de Configuração</h1>
            <p className="text-gray-600">
                A aplicação não conseguiu se conectar ao banco de dados. Por favor, verifique se as credenciais do Firebase foram inseridas corretamente no código.
            </p>
            <p className="text-sm text-gray-500 mt-4">
                <strong>Informação para o desenvolvedor:</strong> A variável <code>firebaseConfig</code> está incompleta ou ausente.
            </p>
        </div>
    </div>
);


// --- COMPONENTE PRINCIPAL DA APLICAÇÃO ---
export default function App() {
    const [currentTab, setCurrentTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({ completedWeeks: [], history: [], completedTrails: [], completedDays: [], tasks: [] });
    const [pastSimulations, setPastSimulations] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const today = useMemo(() => new Date(), []);
    const currentWeekData = useMemo(() => scheduleData.find(w => today >= w.startDate && today <= w.endDate) || scheduleData[0], [today]);
    const motivationalQuote = useMemo(() => motivationalQuotes[today.getDate() % motivationalQuotes.length], [today]);
    
    useEffect(() => {
        document.title = "Plano de Estudos OAB - Carolina Natal";
    }, []);

    const updateLoginMetrics = async (userId) => {
        if (!userId) return;
        const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'studyPlan', 'progress');
        
        try {
            const docSnap = await getDoc(userDocRef);
            const data = docSnap.exists() ? docSnap.data() : {};

            const today = new Date();
            const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            const lastLogin = data.lastLogin ? new Date(data.lastLogin) : null;
            const lastLoginNormalized = lastLogin ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()) : null;

            let newStreak = data.loginStreak || 0;

            if (!lastLoginNormalized || lastLoginNormalized.getTime() < todayNormalized.getTime()) {
                const yesterdayNormalized = new Date(todayNormalized);
                yesterdayNormalized.setDate(yesterdayNormalized.getDate() - 1);

                if (lastLoginNormalized && lastLoginNormalized.getTime() === yesterdayNormalized.getTime()) {
                    newStreak++;
                } else {
                    newStreak = 1;
                }
            }

            await setDoc(userDocRef, {
                lastLogin: today.toISOString(),
                loginStreak: newStreak,
            }, { merge: true });

        } catch (error) {
            console.error("Erro ao atualizar métricas de login:", error);
        }
    };

    useEffect(() => {
        if (!isFirebaseConfigValid) { setLoading(false); return; }
        setPersistence(auth, browserLocalPersistence);
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser && !currentUser.isAnonymous) {
                updateLoginMetrics(currentUser.uid);
            }
            setLoading(false);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!isFirebaseConfigValid || !user) {
            setUserData({ completedWeeks: [], history: [], completedTrails: [], completedDays: [], tasks: [] });
            setPastSimulations([]);
            return;
        };
        
        // Listener para dados de progresso manual
        const progressDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'studyPlan', 'progress');
        const unsubscribeProgress = onSnapshot(progressDocRef, (docSnap) => {
            const data = docSnap.exists() ? docSnap.data() : {};
            setUserData(prev => ({ ...prev, ...data }));
        }, (error) => console.error("Erro ao buscar dados de progresso:", error));
        
        // Listener para histórico de simulados
        setLoadingHistory(true);
        const historyCollectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'simulations');
        const q = query(historyCollectionRef, orderBy('startTime', 'desc'));
        const unsubscribeSimulations = onSnapshot(q, (querySnapshot) => {
            const sims = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPastSimulations(sims);
            setLoadingHistory(false);
        }, (error) => {
            console.error("Error fetching simulation history: ", error);
            setLoadingHistory(false);
        });

        return () => {
            unsubscribeProgress();
            unsubscribeSimulations();
        };
    }, [user]);
    
    const overallManualPerformance = useMemo(() => {
        const history = userData?.history || [];
        if (history.length === 0) return { percentage: 0, questions: 0 };
        const totalCorrect = history.reduce((acc, entry) => acc + entry.correct, 0);
        const totalQuestions = history.reduce((acc, entry) => acc + entry.questions, 0);
        return {
            percentage: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
            questions: totalQuestions,
        };
    }, [userData.history]);

    const overdueTasksCount = useMemo(() => {
        if (!userData || !userData.tasks) {
            return 0;
        }
        const todayNormalized = new Date(today);
        todayNormalized.setHours(0, 0, 0, 0);

        return userData.tasks.filter(task => {
            if (task.completed || !task.dueDate) {
                return false;
            }
            const taskDueDate = new Date(task.dueDate + 'T23:59:59');
            return taskDueDate < todayNormalized;
        }).length;
    }, [userData.tasks, today]);

    const handleAuthAction = async (action) => {
        if (!auth) return;
        setIsLoggingIn(true);
        setLoginError('');
        try {
            await action();
        } catch (error) {
            console.error("Erro de autenticação:", error.code, error.message);
            const defaultError = 'Ocorreu um erro. Por favor, tente novamente.';
            switch (error.code) {
                case 'auth/wrong-password':
                    setLoginError('Senha incorreta. Por favor, tente novamente.');
                    break;
                case 'auth/user-not-found':
                     setLoginError('Usuário não encontrado. Verifique o e-mail.');
                     break;
                case 'auth/email-already-in-use':
                    setLoginError('Este e-mail já está em uso. Tente fazer login.');
                    break;
                default:
                    setLoginError(defaultError);
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleEmailLogin = (email, password) => handleAuthAction(() => {
        return signInWithEmailAndPassword(auth, email, password);
    });

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    const updateUserData = async (newData) => {
        if (!user) return;
        const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'studyPlan', 'progress');
        try {
            await setDoc(userDocRef, newData, { merge: true });
        } catch (error) {
            console.error("Erro ao atualizar dados:", error);
        }
    };

    const TabButton = ({ id, label, icon, badgeCount = 0 }) => (
        <button
            onClick={() => setCurrentTab(id)}
            className={"relative flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 " + (currentTab === id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700')}
        >
            {icon}
            <span className="ml-2 hidden sm:inline">{label}</span>
            {badgeCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {badgeCount}
                </span>
            )}
        </button>
    );

    if (!isFirebaseConfigValid) return <FirebaseErrorScreen />;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <Loader2 className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginScreen 
            handleEmailLogin={handleEmailLogin}
            isLoggingIn={isLoggingIn}
            error={loginError}
        />;
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                        <div className="flex items-center">
                            <div className="bg-red-600 text-white font-bold rounded-md p-2">OAB</div>
                            <h1 className="text-xl font-bold text-gray-800 ml-2 hidden sm:block">Carolina Natal</h1>
                        </div>
                        <nav className="flex-grow flex justify-center gap-1 sm:gap-2">
                            <TabButton id="dashboard" label="Painel" icon={<Home size={16} />} />
                            <TabButton id="cronograma" label="Cronograma" icon={<Calendar size={16} />} />
                            <TabButton id="pendencias" label="Pendências" icon={<CheckSquare size={16} />} badgeCount={overdueTasksCount} />
                            <TabButton id="trilha" label="Trilha" icon={<BrainCircuit size={16} />} />
                            <TabButton id="progresso" label="Progresso" icon={<TrendingUp size={16} />} />
                            <TabButton id="simulador" label="Simulador" icon={<FileText size={16} />} />
                        </nav>
                        <div className="flex items-center gap-2">
                           {user.photoURL && <img src={user.photoURL} alt="Foto do usuário" className="w-8 h-8 rounded-full" />}
                           {!user.isAnonymous && user.email && <span className="text-sm text-gray-600 hidden lg:block">{user.email}</span>}
                           {user.isAnonymous && <span className="text-sm text-gray-600 hidden lg:block">Anônimo</span>}
                           <button onClick={handleLogout} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700" title="Sair">
                               <LogOut size={20} />
                           </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Rumo à Aprovação!</h2>
                        <p className="text-gray-600">Seu cronograma interativo para a aprovação no 45º Exame!</p>
                        <p className="text-sm text-gray-500 italic mt-2">"{motivationalQuote}"</p>
                    </header>
                    
                    {currentTab === 'dashboard' && <Dashboard today={today} completedWeeksCount={userData.completedWeeks.length} simulations={pastSimulations} userData={userData} overallManualPerformance={overallManualPerformance} />}
                    {currentTab === 'cronograma' && <Cronograma userData={userData} updateUserData={updateUserData} today={today} />}
                    {currentTab === 'pendencias' && <Pendencias userData={userData} userId={user.uid} />}
                    {currentTab === 'progresso' && <MeuProgresso userData={userData} updateUserData={updateUserData} userId={user.uid} />}
                    {currentTab === 'trilha' && <TrilhaDiaria userData={userData} updateUserData={updateUserData} userId={user.uid} />}
                    {currentTab === 'simulador' && <SimuladorOAB userId={user.uid} pastSimulations={pastSimulations} loadingHistory={loadingHistory} />}

                    <footer className="text-center mt-12 text-sm text-gray-500">
                        <p>Este plano de estudos é uma sugestão para otimizar sua preparação. A dedicação e a consistência são as chaves para o sucesso. Boa sorte, Carolina Natal!</p>
                    </footer>
                </div>
            </main>
        </div>
    );
}