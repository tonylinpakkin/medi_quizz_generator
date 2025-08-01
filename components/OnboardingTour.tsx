import React from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { useLanguage } from '../LanguageContext';

interface OnboardingTourProps {
  run: boolean;
  onFinish: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ run, onFinish }) => {
  const { t } = useLanguage();

  const steps = [
    {
      target: '[data-tour="thesis-input"]',
      content: t('onboardStep1'),
      disableBeacon: true,
    },
    {
      target: '[data-tour="mcq-review"]',
      content: t('onboardStep2'),
    },
    {
      target: '[data-tour="saved-mcqs"]',
      content: t('onboardStep3'),
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onFinish();
    }
  };

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      showSkipButton
      callback={handleCallback}
      locale={{
        next: t('next'),
        skip: t('skip'),
      }}
    />
  );
};

export default OnboardingTour;
