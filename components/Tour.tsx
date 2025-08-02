import React from 'react';
import Joyride, { Step } from 'react-joyride';
import { useLanguage } from '../LanguageContext';

interface TourProps {
  run: boolean;
  onClose: () => void;
}

export const Tour: React.FC<TourProps> = ({ run, onClose }) => {
  const { t } = useLanguage();

  const steps: Step[] = [
    {
      target: '#tour-thesis-input',
      content: t('tourThesisInput'),
      placement: 'bottom',
    },
    {
      target: '#tour-file-upload',
      content: t('tourFileUpload'),
      placement: 'top',
    },
    {
      target: '#tour-question-count',
      content: t('tourQuestionCount'),
      placement: 'top',
    },
    {
      target: '#tour-generate-button',
      content: t('tourGenerateButton'),
      placement: 'top',
    },
    {
      target: '#tour-generate-tab',
      content: t('tourGenerateTab'),
      placement: 'bottom',
    },
    {
      target: '#tour-saved-tab',
      content: t('tourSavedTab'),
      placement: 'bottom',
    },
    {
      target: '#tour-language-toggle',
      content: t('tourLanguageToggle'),
      placement: 'bottom',
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={({ status }) => {
        if (status === 'finished' || status === 'skipped') {
          onClose();
        }
      }}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          primaryColor: '#007bff',
          textColor: '#333',
          zIndex: 1000,
        },
      }}
    />
  );
};
