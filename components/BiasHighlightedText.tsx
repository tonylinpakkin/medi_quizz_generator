import React from 'react';
import { useLanguage } from '../LanguageContext';

export const BiasHighlightedText: React.FC<{text: string; flaggedWords: Set<string>}> = ({ text, flaggedWords }) => {
    const { t } = useLanguage();
    if (flaggedWords.size === 0) {
        return <>{text}</>;
    }

    const escapedWords = Array.from(flaggedWords).map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');

    if(!text) return null;

    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                flaggedWords.has(part.toLowerCase()) ? (
                    <mark key={i} className="bg-yellow-200 px-1 rounded" title={t('potentialBiasShort')}>
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};
