import React from 'react';
import { IconCheckCircle } from '../atoms/Icons.jsx';

/**
 * Molecule: StepProgress
 * Pipeline step progress indicator for disaster article lifecycle.
 */
export default function StepProgress({
  currentStep = 1, // 1 to 5, or string 'scraped'|'translated'|'extracted'|'curated'|'published'
  steps = [
    { id: 1, key: 'scraped', label: '1. Scraped', desc: 'Raw Thai News' },
    { id: 2, key: 'translated', label: '2. Translated', desc: 'NLLB-200 (EN)' },
    { id: 3, key: 'extracted', label: '3. Geoparsed', desc: 'BERT NER + OSM' },
    { id: 4, key: 'curated', label: '4. Curated', desc: 'Human Validation' },
    { id: 5, key: 'published', label: '5. Published', desc: 'GraphDB KG' },
  ],
  style = {},
}) {
  // Normalize currentStep to integer 1-5
  let stepNumber = 1;
  if (typeof currentStep === 'number') {
    stepNumber = currentStep;
  } else if (typeof currentStep === 'string') {
    const keyMap = {
      SCRAPED: 1,
      scraped: 1,
      TRANSLATED: 2,
      translated: 2,
      EXTRACTED: 3,
      extracted: 3,
      VALIDATED: 4,
      READY_FOR_KG: 4,
      curated: 4,
      PUBLISHED_TO_KG: 5,
      published: 5,
    };
    stepNumber = keyMap[currentStep] || 1;
  }

  const completionPercent = Math.round(((stepNumber - 1) / (steps.length - 1)) * 100);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '16px 20px',
        marginBottom: 20,
        boxShadow: 'var(--shadow-subtle)',
        ...style,
      }}
    >
      {/* Header with Title and Overall Completion % */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b',
            }}
          >
            Pipeline Lifecycle Stage:
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            {steps[stepNumber - 1]?.label || `Step ${stepNumber}`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>Completion:</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              color: stepNumber === 5 ? '#059669' : '#0284c7',
              backgroundColor: stepNumber === 5 ? '#ecfdf5' : '#f0f9ff',
              padding: '2px 8px',
              borderRadius: 4,
              border: `1px solid ${stepNumber === 5 ? '#a7f3d0' : '#bae6fd'}`,
            }}
          >
            {completionPercent}%
          </span>
        </div>
      </div>

      {/* Steps Visual Horizontal Bar */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Background Connecting Line */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 20,
            right: 20,
            height: 3,
            backgroundColor: '#e2e8f0',
            zIndex: 1,
          }}
        >
          {/* Active Filled Progress Line */}
          <div
            style={{
              height: '100%',
              width: `${completionPercent}%`,
              backgroundColor: stepNumber === 5 ? '#10b981' : '#0284c7',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step) => {
          const isCompleted = step.id < stepNumber;
          const isCurrent = step.id === stepNumber;
          const isPending = step.id > stepNumber;

          return (
            <div
              key={step.id}
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: '18%',
              }}
            >
              {/* Step Circle Node */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: isCompleted
                    ? '#10b981'
                    : isCurrent
                    ? '#0284c7'
                    : '#ffffff',
                  color: isCompleted || isCurrent ? '#ffffff' : '#94a3b8',
                  border: isPending ? '2px solid #cbd5e1' : 'none',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(2, 132, 199, 0.2)' : 'none',
                  transition: 'all 0.2s ease',
                  marginBottom: 6,
                }}
              >
                {isCompleted ? <IconCheckCircle size={16} /> : step.id}
              </div>

              {/* Step Label */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: isCurrent ? 700 : 600,
                  color: isCurrent ? '#0f172a' : isCompleted ? '#334155' : '#94a3b8',
                  lineHeight: 1.2,
                }}
              >
                {step.label}
              </div>

              {/* Step Subtitle */}
              <div
                style={{
                  fontSize: 10.5,
                  color: isCurrent ? '#0284c7' : '#94a3b8',
                  marginTop: 2,
                }}
              >
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
