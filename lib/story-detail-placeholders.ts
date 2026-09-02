import type {
  StoryDetail,
  StoryLanguageOption,
  StoryNarratorLens,
  StorySource,
  StoryVisitTip,
} from '@/lib/marketplace-data';

function defaultWhatToNotice(detail: StoryDetail): string[] {
  const place = detail.placeName ?? detail.title;
  return [
    `Look for distinctive landmarks and details that reveal the history of ${place}.`,
    `Notice how the surroundings connect to the story you are about to hear.`,
    `Take a moment to observe the atmosphere — it adds depth to the narration.`,
  ];
}

function defaultSources(): StorySource[] {
  return [
    {
      type: 'academic',
      title: 'Local Heritage & Conservation Report',
    },
    {
      type: 'oral',
      title: 'Community Oral History Collection',
    },
  ];
}

function defaultLanguages(): StoryLanguageOption[] {
  return [
    { code: 'en', label: 'English', isActive: true, availableInApp: true },
    { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', availableInApp: true },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', availableInApp: true },
  ];
}

function defaultNarrators(detail: StoryDetail): StoryNarratorLens[] {
  const name = detail.narrator?.trim() || 'Arjun';
  return [
    {
      id: 'primary',
      name,
      title: 'Historian',
      description: `Academic perspective on ${detail.placeName ?? detail.title}, weaving history, context, and local significance into an engaging listen.`,
      durationMinutes: detail.audioDurationMinutes ?? 6,
      isPrimary: true,
    },
  ];
}

function defaultBeforeYouVisit(detail: StoryDetail): StoryVisitTip[] {
  const place = detail.placeName ?? detail.title;
  return [
    {
      type: 'respect',
      title: 'Respect the place',
      description: `Be mindful of local communities and traditions around ${place}. Listen quietly and tread lightly.`,
    },
    {
      type: 'safety',
      title: 'Stay safe',
      description:
        'Watch your footing, stay aware of traffic or water edges, and follow any on-site signage or official guidance.',
    },
  ];
}

/** Fill empty story-detail arrays with mobile-inspired placeholder content until API ships. */
export function mergeStoryDetailPlaceholders(detail: StoryDetail): StoryDetail {
  const whatToNotice =
    detail.whatToNotice.length > 0 ? detail.whatToNotice : defaultWhatToNotice(detail);

  const sources = detail.sources.length > 0 ? detail.sources : defaultSources();

  const languages = detail.languages.length > 0 ? detail.languages : defaultLanguages();

  const narrators = detail.narrators.length > 0 ? detail.narrators : defaultNarrators(detail);

  const beforeYouVisit =
    detail.beforeYouVisit.length > 0 ? detail.beforeYouVisit : defaultBeforeYouVisit(detail);

  const lensesAvailableCount = detail.lensesAvailableCount ?? 4;

  const subtitle =
    detail.subtitle?.trim() ||
    (detail.placeDescription
      ? detail.placeDescription.split(/[.!?]/)[0]?.trim()
      : undefined) ||
    detail.description;

  return {
    ...detail,
    subtitle,
    whatToNotice,
    sources,
    languages,
    narrators,
    beforeYouVisit,
    lensesAvailableCount,
  };
}
