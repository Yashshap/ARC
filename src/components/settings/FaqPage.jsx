import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    category: 'Water & Hydration',
    question: 'How is my daily water intake target calculated?',
    answer: 'Your recommended target is initialized based on standard metabolic hydration guidelines (~30-35ml per kg of body weight). You can easily adjust your daily target goal at any time in the Water tab by tapping on the Target badge.'
  },
  {
    id: 'faq-2',
    category: 'Diet & Macros',
    question: 'How do custom meals calculate calories and macros?',
    answer: 'When you create a custom meal or recipe in the Diet tab, VitalSync calculates the combined protein, carbohydrates, fats, and total calories in real time. Saved meals can then be logged with a single tap whenever you eat.'
  },
  {
    id: 'faq-3',
    category: 'Workouts & TUT',
    question: 'What is TUT (Time Under Tension) in the workout tracker?',
    answer: 'TUT measures the duration muscles spend under resistance during each set. Tracking TUT along with rest periods optimizes hypertrophy and muscular endurance by ensuring you achieve the required stimulus.'
  },
  {
    id: 'faq-4',
    category: 'Medication & Care',
    question: 'How does pill adherence and the routine heatmap work?',
    answer: 'The Care & Pills tab tracks your daily adherence rate based on scheduled doses. You can tap on any medication or skincare step to edit its name or scheduled timing, and click the radio button to confirm taken.'
  },
  {
    id: 'faq-5',
    category: 'Habits & Focus',
    question: 'What is the Fap Counter toggle?',
    answer: 'The Fap Counter helps you monitor your self-discipline and abstinence streaks. Turning this toggle on activates habit tracking reminders to keep you focused on your wellness goals.'
  },
  {
    id: 'faq-6',
    category: 'Privacy & Storage',
    question: 'Where is my health and biometric data stored?',
    answer: 'VitalSync is engineered with an offline-first, client-side architecture. 100% of your biometric stats, routine logs, and medications remain encrypted on your device via HTML5 Local Storage. We never sell or transmit your personal data.'
  },
  {
    id: 'faq-7',
    category: 'Notifications',
    question: 'How do notifications work in offline/web app mode?',
    answer: 'Notifications utilize standard Web Notifications and Android Capacitor Local Notification channels when running as an APK. You can toggle specific notification categories right in Settings.'
  }
];

export default function FaqPage() {
  const { closeFaqPage } = useApp();
  const [qaSearch, setQaSearch] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(FAQ_ITEMS.map(i => i.category))];

  const filteredFaqs = FAQ_ITEMS.filter(item => {
    const matchesSearch =
      item.question.toLowerCase().includes(qaSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(qaSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(qaSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="settings-page-container faq-page-container">
      {/* Sticky Top Header */}
      <header className="page-header sticky-page-header">
        <button
          className="page-header-btn page-header-back-btn"
          onClick={closeFaqPage}
          aria-label="Back to settings"
          title="Back to settings"
        >
          <ArrowLeft size={22} className="header-nav-icon" />
        </button>

        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Help & FAQ</h1>
        </div>

        <div className="page-header-pill-badge">
          <HelpCircle size={14} />
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="settings-page-content faq-page-content">
        {/* Search Bar */}
        <div className="qa-search-box">
          <Search size={16} className="qa-search-icon" />
          <input
            type="text"
            className="qa-search-input"
            placeholder="Search questions"
            value={qaSearch}
            onChange={(e) => setQaSearch(e.target.value)}
          />
          {qaSearch && (
            <button className="qa-search-clear" onClick={() => setQaSearch('')}>
              ×
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="faq-category-pills-row">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`faq-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion Questions */}
        <div className="qa-accordion-list">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div key={faq.id} className={`qa-accordion-item ${isExpanded ? 'expanded' : ''}`}>
                  <button
                    className="qa-accordion-trigger"
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="qa-trigger-left">
                      <span className="qa-category-pill">{faq.category}</span>
                      <span className="qa-question-text">{faq.question}</span>
                    </div>
                    <ChevronDown size={18} className={`qa-chevron ${isExpanded ? 'rotate' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="qa-accordion-body">
                      <p className="qa-answer-text">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="qa-empty-state">
              <p>No questions found matching "{qaSearch}".</p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setQaSearch('');
                  setSelectedCategory('All');
                }}
              >
                Reset Search
              </button>
            </div>
          )}
        </div>

        {/* Still Need Help Box */}
        <div className="faq-help-box">
          <div className="faq-help-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="faq-help-title">Still have questions?</h4>
            <p className="faq-help-desc">Our team is always working on improving your experience.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
