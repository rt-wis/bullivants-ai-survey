import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Survey Questions Configuration
const questions = [
  {
    id: 'copilot_frequency',
    question: 'How often do you use Microsoft Copilot?',
    type: 'single',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'few_times_week', label: 'A few times a week' },
      { value: 'once_week', label: 'About once a week' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never used it' },
    ],
  },
  {
    id: 'copilot_use_cases',
    question: 'What do you use (or want to use) AI for?',
    subtitle: 'Select all that apply',
    type: 'multi',
    options: [
      { value: 'emails', label: 'Writing or summarising emails' },
      { value: 'documents', label: 'Drafting documents or reports' },
      { value: 'data', label: 'Analysing data or spreadsheets' },
      { value: 'summarising', label: 'Summarising long documents' },
      { value: 'brainstorming', label: 'Brainstorming ideas' },
      { value: 'research', label: 'Research and finding information' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'used_chatgpt',
    question: 'Have you used ChatGPT (outside of work)?',
    type: 'single',
    options: [
      { value: 'yes_regularly', label: 'Yes, regularly' },
      { value: 'yes_few_times', label: 'Yes, a few times' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'prompt_knowledge',
    question: 'Do you know what makes a good prompt?',
    subtitle: 'A prompt is the instruction you give to AI',
    type: 'single',
    options: [
      { value: 'yes_confident', label: 'Yes, I feel confident' },
      { value: 'somewhat', label: 'I have some idea' },
      { value: 'not_sure', label: 'Not really sure' },
      { value: 'no', label: 'No idea' },
    ],
  },
  {
    id: 'ai_mistakes',
    question: 'Do you know what kinds of mistakes AI can make?',
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes, I understand the risks' },
      { value: 'somewhat', label: 'I have some awareness' },
      { value: 'not_sure', label: 'Not really sure' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'hallucination_knowledge',
    question: 'Do you know what "hallucination" means in AI?',
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes, I can explain it' },
      { value: 'heard', label: 'I\'ve heard the term' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'learning_interest',
    question: 'What would you most like to learn today?',
    subtitle: 'Select up to 2 priorities',
    type: 'multi',
    maxSelect: 2,
    options: [
      { value: 'prompting', label: 'How to write better prompts' },
      { value: 'agents', label: 'Building Copilot agents/automations' },
      { value: 'limitations', label: 'Understanding AI limitations' },
      { value: 'use_cases', label: 'Practical use cases for my role' },
      { value: 'getting_started', label: 'Just getting started basics' },
    ],
  },
  {
    id: 'barriers',
    question: 'What\'s stopping you from using AI more?',
    type: 'single',
    options: [
      { value: 'dont_know_how', label: 'Don\'t know how to use it well' },
      { value: 'dont_trust', label: 'Don\'t fully trust the output' },
      { value: 'no_time', label: 'No time to learn' },
      { value: 'not_relevant', label: 'Not relevant to my role' },
      { value: 'already_using', label: 'Nothing — I\'m already using it!' },
    ],
  },
  {
    id: 'department',
    question: 'Which area do you work in?',
    subtitle: 'This helps us tailor examples',
    type: 'single',
    options: [
      { value: 'sales', label: 'Sales / Customer Service' },
      { value: 'operations', label: 'Operations / Warehouse' },
      { value: 'finance', label: 'Finance / Admin' },
      { value: 'management', label: 'Management' },
      { value: 'technical', label: 'Technical / Engineering' },
      { value: 'other', label: 'Other' },
    ],
  },
];

// Dashboard password (simple protection)
const DASHBOARD_PASSWORD = 'bullivants2024';

export default function App() {
  const [mode, setMode] = useState('landing'); // landing, survey, complete, dashboard
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Check URL for dashboard access
  useEffect(() => {
    if (window.location.pathname === '/dashboard' || window.location.hash === '#dashboard') {
      setMode('dashboard-auth');
    }
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setDashboardData(data);
    }
  };

  useEffect(() => {
    if (mode === 'dashboard') {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }
  }, [mode]);

  const handleAnswer = (questionId, value, isMulti = false, maxSelect = null) => {
    if (isMulti) {
      const current = answers[questionId] || [];
      let updated;
      if (current.includes(value)) {
        updated = current.filter(v => v !== value);
      } else {
        if (maxSelect && current.length >= maxSelect) {
          updated = [...current.slice(1), value];
        } else {
          updated = [...current, value];
        }
      }
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const canProceed = () => {
    const q = questions[currentQuestion];
    const answer = answers[q.id];
    if (q.type === 'multi') {
      return answer && answer.length > 0;
    }
    return !!answer;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    if (supabase) {
      try {
        // Transform multi-select arrays to JSON strings for storage
        const submissionData = {};
        Object.keys(answers).forEach(key => {
          submissionData[key] = Array.isArray(answers[key]) 
            ? JSON.stringify(answers[key]) 
            : answers[key];
        });
        
        await supabase.from('survey_responses').insert([submissionData]);
      } catch (error) {
        console.error('Error submitting:', error);
      }
    }
    
    setTimeout(() => {
      setIsSubmitting(false);
      setMode('complete');
    }, 800);
  };

  const handleDashboardAuth = () => {
    if (passwordInput === DASHBOARD_PASSWORD) {
      setMode('dashboard');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // Calculate statistics for dashboard
  const calculateStats = (questionId, optionValue) => {
    if (dashboardData.length === 0) return 0;
    
    const count = dashboardData.filter(response => {
      const answer = response[questionId];
      if (!answer) return false;
      
      // Handle JSON array strings (multi-select)
      if (answer.startsWith('[')) {
        try {
          const parsed = JSON.parse(answer);
          return parsed.includes(optionValue);
        } catch {
          return false;
        }
      }
      return answer === optionValue;
    }).length;
    
    return count;
  };

  const getPercentage = (count) => {
    if (dashboardData.length === 0) return 0;
    return Math.round((count / dashboardData.length) * 100);
  };

  // Landing Page
  if (mode === 'landing') {
    return (
      <div className="app landing">
        <div className="landing-content">
          <div className="logo-section">
            <div className="company-badge">BULLIVANTS</div>
            <h1>AI Fluency Workshop</h1>
            <p className="subtitle">Pre-Workshop Survey</p>
          </div>
          
          <div className="intro-card">
            <p>
              Help us tailor today's workshop to your needs. This quick survey 
              takes <strong>about 2 minutes</strong> and helps us understand 
              where to focus our time together.
            </p>
            <div className="question-count">
              <span className="count-number">{questions.length}</span>
              <span className="count-label">quick questions</span>
            </div>
          </div>
          
          <button className="btn-primary" onClick={() => setMode('survey')}>
            Start Survey
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          
          <p className="anonymous-note">Your responses are anonymous</p>
        </div>
        
        <div className="landing-decoration">
          <div className="deco-circle deco-1"></div>
          <div className="deco-circle deco-2"></div>
          <div className="deco-line"></div>
        </div>
      </div>
    );
  }

  // Survey Mode
  if (mode === 'survey') {
    const q = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    
    return (
      <div className="app survey">
        <div className="survey-header">
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{currentQuestion + 1} of {questions.length}</span>
          </div>
        </div>
        
        <div className="survey-content">
          <div className="question-card" key={q.id}>
            <h2 className="question-text">{q.question}</h2>
            {q.subtitle && <p className="question-subtitle">{q.subtitle}</p>}
            
            <div className="options-grid">
              {q.options.map((option) => {
                const isSelected = q.type === 'multi' 
                  ? (answers[q.id] || []).includes(option.value)
                  : answers[q.id] === option.value;
                
                return (
                  <button
                    key={option.value}
                    className={`option-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleAnswer(q.id, option.value, q.type === 'multi', q.maxSelect)}
                  >
                    <span className="option-indicator">
                      {isSelected && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </span>
                    <span className="option-label">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="survey-footer">
          <button 
            className="btn-secondary" 
            onClick={handleBack}
            disabled={currentQuestion === 0}
          >
            Back
          </button>
          <button 
            className="btn-primary" 
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentQuestion === questions.length - 1 ? (
              isSubmitting ? 'Submitting...' : 'Submit'
            ) : 'Next'}
            {!isSubmitting && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Complete Screen
  if (mode === 'complete') {
    return (
      <div className="app complete">
        <div className="complete-content">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="9 12 12 15 16 9"/>
            </svg>
          </div>
          <h1>Thank You!</h1>
          <p>Your responses have been recorded. We'll use this to make today's workshop as relevant as possible for you.</p>
          <div className="next-steps">
            <p><strong>What's next?</strong></p>
            <p>The workshop will begin shortly. Get ready to explore the power of AI!</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Auth
  if (mode === 'dashboard-auth') {
    return (
      <div className="app dashboard-auth">
        <div className="auth-card">
          <h2>Dashboard Access</h2>
          <p>Enter the password to view results</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDashboardAuth()}
            placeholder="Password"
            className={passwordError ? 'error' : ''}
          />
          {passwordError && <p className="error-text">Incorrect password</p>}
          <button className="btn-primary" onClick={handleDashboardAuth}>
            Access Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Dashboard
  if (mode === 'dashboard') {
    return (
      <div className="app dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Survey Results</h1>
            <div className="response-count">
              <span className="count">{dashboardData.length}</span>
              <span className="label">responses</span>
            </div>
          </div>
          <button className="btn-refresh" onClick={fetchDashboardData}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Refresh
          </button>
        </div>
        
        <div className="dashboard-grid">
          {questions.map((q) => (
            <div key={q.id} className="chart-card">
              <h3>{q.question}</h3>
              <div className="chart-bars">
                {q.options.map((option) => {
                  const count = calculateStats(q.id, option.value);
                  const percentage = getPercentage(count);
                  
                  return (
                    <div key={option.value} className="bar-row">
                      <div className="bar-label">{option.label}</div>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${Math.max(percentage, 0)}%` }}
                        ></div>
                      </div>
                      <div className="bar-value">{count} ({percentage}%)</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="dashboard-footer">
          <p>Auto-refreshes every 5 seconds • Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    );
  }

  return null;
}
