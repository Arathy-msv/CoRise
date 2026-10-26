import type {
  CampaignType,
  ChallengeActivity,
  PollActivity,
  QuizActivity,
  QuizQuestion,
  ThemePreset,
} from "@/types/corise";

export type TopicId = "environment" | "cleanup" | "education" | "animals" | "care" | "reuse" | "general";

type QuestionSeed = { prompt: string; correct: string; wrong: [string, string, string] };

export interface TopicDefinition {
  id: TopicId;
  match: RegExp;
  heroImage: string;
  theme: ThemePreset;
  /** Short noun phrase: "greener shared spaces". */
  focus: string;
  orgWord: string;
  websiteHeadline: string;
  whyItMatters: string;
  kidWhyItMatters: string;
  beneficiaries: string;
  vision: string;
  quizTitle: string;
  quiz: QuestionSeed[];
  challenge: Pick<ChallengeActivity, "title" | "description" | "instructions" | "completionCondition">;
}

const TOPICS: TopicDefinition[] = [
  {
    id: "environment",
    match: /\b(tree|plant|garden|green|climate|nature|park|compost|eco|wildlife|forest)/,
    heroImage: "trees",
    theme: "forest",
    focus: "greener shared spaces",
    orgWord: "Green Roots",
    websiteHeadline: "Growing greener spaces, together",
    whyItMatters:
      "Shared green spaces make a neighborhood cooler, calmer, and more welcoming for everyone who lives there.",
    kidWhyItMatters: "Trees and plants give us shade, fresh air, and homes for birds and bugs.",
    beneficiaries: "Everyone who lives, works, or plays nearby",
    vision: "A neighborhood where green spaces are cared for by the people who enjoy them.",
    quizTitle: "Green spaces quiz",
    quiz: [
      {
        prompt: "What helps a newly planted tree most in its first weeks?",
        correct: "Regular watering",
        wrong: ["Never watering it", "Covering it in plastic", "Cutting off its leaves"],
      },
      {
        prompt: "Why are trees good for a neighborhood?",
        correct: "They give shade and help cool streets",
        wrong: ["They make streets hotter", "They have no effect at all", "They only grow in forests"],
      },
      {
        prompt: "What is a simple way to help on a planting day?",
        correct: "Bring gloves and invite a friend",
        wrong: ["Pick flowers from the park", "Leave litter behind", "Stay home and wait"],
      },
    ],
    challenge: {
      title: "Green week challenge",
      description: "Do one small green action every day for a week.",
      instructions: "Water a plant, walk instead of driving, or pick up litter — one action a day.",
      completionCondition: "Complete at least 5 of 7 days",
    },
  },
  {
    id: "cleanup",
    match: /\b(clean|litter|trash|garbage|waste|beach|river|lake|street)/,
    heroImage: "cleanup",
    theme: "ocean",
    focus: "cleaner, safer public spaces",
    orgWord: "Clean Streets",
    websiteHeadline: "Cleaner streets start with neighbors",
    whyItMatters:
      "Clean, cared-for public spaces are safer and more pleasant for families, children, and visitors.",
    kidWhyItMatters: "When we pick up litter, parks and streets are safer and nicer to play in.",
    beneficiaries: "Families, children, and everyone who uses our public spaces",
    vision: "Public spaces that everyone feels proud to share and look after.",
    quizTitle: "Clean-up quiz",
    quiz: [
      {
        prompt: "What should you wear for a clean-up?",
        correct: "Gloves and closed shoes",
        wrong: ["Sandals only", "Your best clothes", "Nothing on your hands"],
      },
      {
        prompt: "What should you do with recyclable items you collect?",
        correct: "Sort them into recycling",
        wrong: ["Mix them with all the trash", "Leave them on the street", "Burn them"],
      },
      {
        prompt: "Why do clean-ups matter?",
        correct: "Cleaner spaces are safer and nicer for everyone",
        wrong: ["They make streets messier", "They only help one person", "They make no difference"],
      },
    ],
    challenge: {
      title: "Litter-free week",
      description: "Pick up a little litter every day for a week.",
      instructions: "Pick up three pieces of litter each day and dispose of them safely.",
      completionCondition: "Complete at least 5 of 7 days",
    },
  },
  {
    id: "education",
    match: /\b(school|book|librar|read(ing|ers?)?\b|student|tutor|learn|educat|class(room|es)?\b|literacy)/,
    heroImage: "library",
    theme: "amber",
    focus: "learning and reading",
    orgWord: "Bright Pages",
    websiteHeadline: "Helping every young learner grow",
    whyItMatters:
      "When children have books, time, and encouragement, learning becomes something they look forward to.",
    kidWhyItMatters: "Books help us learn new things, imagine new worlds, and share stories with friends.",
    beneficiaries: "Students and young learners",
    vision: "A community where every child has access to books and people who believe in them.",
    quizTitle: "Reading quiz",
    quiz: [
      {
        prompt: "What is an easy way to help a young reader?",
        correct: "Read together for a few minutes",
        wrong: ["Hide all the books", "Skip reading time", "Only read alone"],
      },
      {
        prompt: "Which books are best to donate?",
        correct: "Gently used books in good condition",
        wrong: ["Books with missing pages", "Wet or moldy books", "Torn covers only"],
      },
      {
        prompt: "Why do school libraries matter?",
        correct: "They give every student access to books",
        wrong: ["They are only for teachers", "They replace all classes", "They don't help learning"],
      },
    ],
    challenge: {
      title: "Read-together week",
      description: "Read with someone for a few minutes every day for a week.",
      instructions: "Spend 15 minutes a day reading with a child, friend, or family member.",
      completionCondition: "Complete at least 5 of 7 days",
    },
  },
  {
    id: "animals",
    match: /\b(animal|pet|pets|dog|cat|paw|adopt)\b/,
    heroImage: "community",
    theme: "amber",
    focus: "animals who need a home and care",
    orgWord: "Paws",
    websiteHeadline: "A safer place for every animal",
    whyItMatters: "Animals without a home depend on neighbors who will foster, adopt, and look out for them.",
    kidWhyItMatters: "Every pet deserves a safe home and someone who will care for them.",
    beneficiaries: "Animals in our community and the people who care for them",
    vision: "A community where every animal has safety, care, and a place to belong.",
    quizTitle: "Animal care quiz",
    quiz: [
      {
        prompt: "What helps an animal most when it needs a home?",
        correct: "A safe place and patient care",
        wrong: ["Leaving it outside", "Ignoring it", "Keeping it a secret"],
      },
      {
        prompt: "How can neighbors help a rescue?",
        correct: "Foster, adopt, or share the need",
        wrong: ["Wait for someone else", "Take an animal without a plan", "Do nothing"],
      },
      {
        prompt: "What should you do before adopting?",
        correct: "Learn what the animal needs",
        wrong: ["Choose the first one you see", "Skip any questions", "Assume it needs nothing"],
      },
    ],
    challenge: {
      title: "Care-for-animals week",
      description: "Do one helpful thing for an animal every day for a week.",
      instructions: "Refill water, share a rescue post, or check on a neighbor's pet — one action a day.",
      completionCondition: "Complete at least 5 of 7 days",
    },
  },
  {
    id: "care",
    match: /\b(food|meal|care\b|caring|kit|hygiene|shelter|homeless|elder|senior|blanket|cloth|hunger|health)/,
    heroImage: "care",
    theme: "rose",
    focus: "neighbors helping neighbors",
    orgWord: "Helping Hands",
    websiteHeadline: "Neighbors looking out for neighbors",
    whyItMatters:
      "Small acts of care help people through difficult moments and remind everyone that they belong.",
    kidWhyItMatters: "Helping others is a kind way to show people that they are not alone.",
    beneficiaries: "Neighbors who could use a helping hand",
    vision: "A community where no one has to face a hard time alone.",
    quizTitle: "Helping hands quiz",
    quiz: [
      {
        prompt: "Which items are usually most useful in a care kit?",
        correct: "Everyday essentials like soap and toothpaste",
        wrong: ["Expired food", "Broken items", "Decorations only"],
      },
      {
        prompt: "What is a respectful way to help neighbors in need?",
        correct: "Ask what they need and listen",
        wrong: ["Assume you know best", "Share their details publicly", "Help once and forget"],
      },
      {
        prompt: "How can you help if you can't donate items?",
        correct: "Volunteer time or share the campaign",
        wrong: ["There is no other way", "Ask others to stop helping", "Wait until next year"],
      },
    ],
    challenge: {
      title: "Kindness week",
      description: "Do one helpful thing for someone every day for a week.",
      instructions: "Check on a neighbor, help carry groceries, or share a kind note — once a day.",
      completionCondition: "Complete at least 5 of 7 days",
    },
  },
  {
    id: "reuse",
    match: /\b(bag|plastic|reusable|reuse|recycl|sell|product|merch)/,
    heroImage: "bags",
    theme: "forest",
    focus: "everyday habits that reduce waste",
    orgWord: "Reuse",
    websiteHeadline: "Small swaps, shared impact",
    whyItMatters: "Choosing reusable items over single-use ones keeps waste out of our streets and landfills.",
    kidWhyItMatters: "Using things again instead of throwing them away keeps our planet cleaner.",
    beneficiaries: "Our neighborhood and the environment we share",
    vision: "A community where reusing is the easy, everyday choice.",
    quizTitle: "Reuse quiz",
    quiz: [
      {
        prompt: "Why choose a reusable bag?",
        correct: "It cuts down on single-use plastic",
        wrong: ["It uses more plastic", "It can only be used once", "It is harder to carry"],
      },
      {
        prompt: "How should you look after a reusable bag?",
        correct: "Wash it and use it again",
        wrong: ["Throw it away after one use", "Leave it outside in the rain", "Never use it"],
      },
      {
        prompt: "Which habit reduces waste?",
        correct: "Carrying your own bottle or bag",
        wrong: ["Buying extra packaging", "Using disposable items daily", "Throwing away repairable items"],
      },
    ],
    challenge: {
      title: "Single-use-free week",
      description: "Skip single-use plastic for a week.",
      instructions: "Carry your own bag and bottle, and say no to disposable cutlery.",
      completionCondition: "Complete at least 5 of 7 days",
    },
  },
  {
    id: "general",
    match: /.^/,
    heroImage: "community",
    theme: "forest",
    focus: "people coming together for a shared goal",
    orgWord: "Common Ground",
    websiteHeadline: "Bringing people together to make good things happen",
    whyItMatters: "Good ideas grow when people can see the plan, understand it, and take part together.",
    kidWhyItMatters: "When we work together, even big jobs feel easier and more fun.",
    beneficiaries: "Our local community",
    vision: "A community where anyone can start something good and others can easily join in.",
    quizTitle: "Get involved quiz",
    quiz: [
      {
        prompt: "What is the easiest way to support a community campaign?",
        correct: "Take part and invite a friend",
        wrong: ["Wait for someone else", "Keep it a secret", "Only read about it"],
      },
      {
        prompt: "Who can join this campaign?",
        correct: "Anyone who wants to help",
        wrong: ["Only experts", "Only the organizers", "No one yet"],
      },
      {
        prompt: "How can you help spread the word?",
        correct: "Share the campaign link with friends",
        wrong: ["Keep the link to yourself", "Ignore messages about it", "Wait until it ends"],
      },
    ],
    challenge: {
      title: "Invite three friends",
      description: "Help the campaign grow by inviting people you know.",
      instructions: "Share the campaign link with three people this week.",
      completionCondition: "Invite three people",
    },
  },
];

export function detectTopic(text: string): TopicDefinition {
  const t = text.toLowerCase();
  return TOPICS.find((topic) => topic.match.test(t)) ?? getTopic("general");
}

export function getTopic(id: TopicId): TopicDefinition {
  return TOPICS.find((t) => t.id === id) ?? TOPICS[TOPICS.length - 1];
}

export function topicForHeroImage(heroImage: string): TopicDefinition {
  return TOPICS.find((t) => t.id !== "general" && t.heroImage === heroImage) ?? getTopic("general");
}

/** Places the correct answer at a varying position so it is not always the first option. */
function toQuestion(seed: QuestionSeed, index: number): QuizQuestion {
  const correctIndex = (index + 1) % 4;
  const options = [...seed.wrong];
  options.splice(correctIndex, 0, seed.correct);
  return { id: `q${index + 1}`, prompt: seed.prompt, options, correctIndex };
}

export function buildTopicQuiz(topic: TopicDefinition, campaignTitle: string): QuizActivity {
  return {
    enabled: true,
    title: topic.quizTitle,
    description: `Three quick questions about ${campaignTitle}.`,
    questions: topic.quiz.map(toQuestion),
    completionMessage: "Thanks for taking part! Share the campaign with someone who would enjoy it.",
  };
}

export function buildTopicChallenge(topic: TopicDefinition): ChallengeActivity {
  return {
    enabled: true,
    ...topic.challenge,
    rewardMessage: "You did it — thank you for showing up for the community!",
  };
}

const GATHERING_TYPES: CampaignType[] = ["event", "community_challenge", "volunteering"];

export function buildTopicPoll(type: CampaignType): PollActivity {
  if (GATHERING_TYPES.includes(type)) {
    return {
      enabled: true,
      question: "Which time works best for you to take part?",
      options: ["Saturday morning", "Saturday afternoon", "Sunday morning"],
      votes: [0, 0, 0],
    };
  }
  return {
    enabled: true,
    question: "How would you most like to help?",
    options: ["Take part myself", "Spread the word", "Bring a friend", "Help organize"],
    votes: [0, 0, 0, 0],
  };
}
