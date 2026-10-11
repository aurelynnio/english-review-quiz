export type QuestionFormat =
  | "multiple-choice"
  | "true-false"
  | "fill-in-the-blank"
  | "type-the-answer"
  | "flashcard"
  | "matching"
  | "reorder-words"
  | "error-spotting";

export interface WritingQuestion {
  id: string;
  number: number;
  originalSentence: string;
  keyword: string;
  modelAnswer: string;
  acceptedAnswers: string[];
  note?: string;
}

export interface SpeakingTopic {
  id: string;
  topicNumber: number;
  title: string;
  modelAnswer: string;
  highlightedTerm: string;
  followUpQuestions: string[];
}

export interface MultipleChoiceItem {
  id: string;
  number: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
  note?: string;
}

export interface SignQuestion {
  id: string;
  number: number;
  title: string;
  signText: string;
  imageFile: string;
  options: string[];
  correctAnswer: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  subtitle?: string;
  type: "comprehension" | "cloze";
  paragraphs: string[];
  questions: MultipleChoiceItem[];
}

export interface TrueFalseItem {
  id: string;
  number: number;
  statement: string;
  correctAnswer: boolean;
  evidence?: string;
}

export interface FillBlankItem {
  id: string;
  number: number;
  speaker: string;
  beforeText: string;
  afterText: string;
  correctAnswer: string;
  fullSentence: string;
}

export interface ListeningSubSection {
  id: string;
  title: string;
  subtitle?: string;
  type: "true-false" | "gap-fill-mc" | "gap-fill-text";
  paragraphs?: string[];
  trueFalseItems?: TrueFalseItem[];
  mcItems?: MultipleChoiceItem[];
  fillBlankParagraphs?: {
    speaker: string;
    segments: { text: string; blankNumber?: number; answer?: string }[];
  }[];
  fillBlankItems?: FillBlankItem[];
}

export const DOCUMENT_HEADER = {
  title: "Writing, Speaking, Grammar, Reading & Listening",
  subtitle:
    "Tổng hợp Ôn tập Tiếng Anh: Writing • Speaking • Grammar • Reading • Listening",
  description:
    "Tài liệu ôn tập tổng hợp gồm viết lại câu, bài nói mẫu theo chủ đề, trắc nghiệm ngữ pháp, đọc hiểu biển báo & văn bản, và luyện nghe.",
};

// ============================================================================
// 1. WRITING — SENTENCE TRANSFORMATION (41–50)
// ============================================================================
export const WRITING_INSTRUCTION =
  "Viết lại câu sao cho nghĩa không đổi, sử dụng từ gợi ý trong ngoặc.";

export const WRITING_QUESTIONS: WritingQuestion[] = [
  {
    id: "writing-41",
    number: 41,
    originalSentence: "“I’m sorry I broke your glasses, Paul,” said Stacy.",
    keyword: "apologised",
    modelAnswer: "Stacy apologised for breaking Paul’s glasses.",
    acceptedAnswers: [
      "Stacy apologised for breaking Paul’s glasses.",
      "Stacy apologised to Paul for breaking his glasses.",
    ],
    note: "apologise (to sb) for + V-ing; cũng chấp nhận “apologised to Paul for breaking his glasses”.",
  },
  {
    id: "writing-42",
    number: 42,
    originalSentence: "When I’m an adult, I want to be a pop star!",
    keyword: "up",
    modelAnswer: "When I grow up, I want to be a pop star!",
    acceptedAnswers: ["When I grow up, I want to be a pop star!"],
  },
  {
    id: "writing-43",
    number: 43,
    originalSentence: "Let’s leave at seven o’clock tomorrow morning.",
    keyword: "set",
    modelAnswer: "Let’s set off at seven o’clock tomorrow morning.",
    acceptedAnswers: ["Let’s set off at seven o’clock tomorrow morning."],
  },
  {
    id: "writing-44",
    number: 44,
    originalSentence: "You’ve really disappointed me, Rachel.",
    keyword: "down",
    modelAnswer: "You’ve really let me down, Rachel.",
    acceptedAnswers: ["You’ve really let me down, Rachel."],
  },
  {
    id: "writing-45",
    number: 45,
    originalSentence: "They gave me a map of the town center.",
    keyword: "provided",
    modelAnswer: "They provided me with a map of the town center.",
    acceptedAnswers: [
      "They provided me with a map of the town center.",
      "They provided a map of the town center for me.",
    ],
    note: "Hoặc: They provided a map of the town center for me (provide sb with sth / provide sth for sb).",
  },
  {
    id: "writing-46",
    number: 46,
    originalSentence: "Hurry up or we’ll miss the plane!",
    keyword: "late",
    modelAnswer: "Hurry up or we’ll be late for the plane!",
    acceptedAnswers: ["Hurry up or we’ll be late for the plane!"],
  },
  {
    id: "writing-47",
    number: 47,
    originalSentence: "Did you really go into town by yourself, Sam?",
    keyword: "own",
    modelAnswer: "Did you really go into town on your own, Sam?",
    acceptedAnswers: ["Did you really go into town on your own, Sam?"],
  },
  {
    id: "writing-48",
    number: 48,
    originalSentence: "I don’t really like traveling.",
    keyword: "fond",
    modelAnswer: "I’m not really fond of traveling.",
    acceptedAnswers: ["I’m not really fond of traveling."],
  },
  {
    id: "writing-49",
    number: 49,
    originalSentence:
      "You need to stop the engine and then check to see if there’s any oil on the ground.",
    keyword: "turn",
    modelAnswer:
      "You need to turn off the engine and then check to see if there’s any oil on the ground.",
    acceptedAnswers: [
      "You need to turn off the engine and then check to see if there’s any oil on the ground.",
    ],
  },
  {
    id: "writing-50",
    number: 50,
    originalSentence:
      "Before the aeroplane was invented, people told stories about flying machines.",
    keyword: "made",
    modelAnswer:
      "Before the aeroplane was invented, people made up stories about flying machines.",
    acceptedAnswers: [
      "Before the aeroplane was invented, people made up stories about flying machines.",
    ],
  },
];

// ============================================================================
// 2. SPEAKING — SAMPLE TOPICS (Topic 33, Topic 35, Topic 36)
// ============================================================================
export const SPEAKING_TOPICS: SpeakingTopic[] = [
  {
    id: "speaking-33",
    topicNumber: 33,
    title: "Topic 33: Describe a park you like visiting",
    highlightedTerm: "Thống Nhất Park",
    modelAnswer:
      "I would like to talk about Thống Nhất Park, the park I like most. It is in the center of Hanoi, about ten minutes from my house. I often visit it on weekends, and I went there last Sunday morning. The park is very big and green. There are tall old trees, a large lake, and many flower gardens. It also has a children’s playground and some benches. I like it because the air is fresh and quiet. It helps me relax after a busy week. I also enjoy walking around the lake and taking photos.",
    followUpQuestions: [
      "Do you often go to parks?",
      "What do people usually do in a park?",
      "Are there many parks in your city?",
      "Do you prefer parks or the beach? Why?",
      "Why are parks important in a city?",
      "Will you visit this park again in the future?",
    ],
  },
  {
    id: "speaking-35",
    topicNumber: 35,
    title: "Topic 35: Describe a time when you spent a lot of money on something",
    highlightedTerm: "MacBook Air M2",
    modelAnswer:
      "I would like to talk about the time I spent a lot of money on something. Last year, I bought a MacBook Air M2 for my study. I bought it in August, before my new school year started. I got it from the Apple store in Vincom Center. It cost me about twenty-five million dong, which was a lot for me. I spent so much money because my old laptop was very slow and often broke down. I really needed a good one for my online classes and homework.",
    followUpQuestions: [
      "Do you often spend a lot of money on things?",
      "Do you like shopping? Why or why not?",
      "What is the most expensive thing you have ever bought?",
      "Do you usually save money or spend it?",
      "How do you decide if something is worth the money?",
      "Do you prefer shopping online or in a store?",
    ],
  },
  {
    id: "speaking-36",
    topicNumber: 36,
    title: "Topic 36: Describe a school you went to in your childhood",
    highlightedTerm: "Lê Lợi Primary School",
    modelAnswer:
      "I would like to talk about Lê Lợi Primary School, the school I went to when I was a child. It was in my old neighborhood, about five minutes from my house. The school was not very big, but it was clean and friendly. There were small classrooms, a green yard, and many old trees. I learned math, Vietnamese, English, and drawing. My teachers were kind and helped me a lot. I felt very happy there because I had many good friends. I still remember it as a wonderful place.",
    followUpQuestions: [
      "Do you remember your first teacher?",
      "What subjects did you like most at school?",
      "Do you still keep in touch with your childhood friends?",
      "How is school different now compared to the past?",
      "Did you enjoy going to school when you were young?",
      "What is your favorite memory from that school?",
    ],
  },
];

// ============================================================================
// 3. GRAMMAR PRACTICE — MULTIPLE CHOICE (121–143)
// ============================================================================
export const GRAMMAR_QUESTIONS: MultipleChoiceItem[] = [
  {
    id: "grammar-121",
    number: 121,
    prompt: "The plans for the new hospital ______ soon.",
    options: ["will make", "will be made", "will be making", "are made"],
    correctAnswer: "will be made",
  },
  {
    id: "grammar-122",
    number: 122,
    prompt: "All the bills ______ by my father.",
    options: ["have paid", "be paid", "been paid", "have been paid"],
    correctAnswer: "have been paid",
  },
  {
    id: "grammar-123",
    number: 123,
    prompt: "The Spanish language ______ in many countries.",
    options: ["is spoken", "speaks", "are spoken", "spoken"],
    correctAnswer: "is spoken",
  },
  {
    id: "grammar-124",
    number: 124,
    prompt: "I didn’t turn on the light ______ I didn’t want to wake the baby up.",
    options: ["because of", "as", "despite", "so as not"],
    correctAnswer: "as",
  },
  {
    id: "grammar-125",
    number: 125,
    prompt: "Our flight wasn’t cancelled ______ the heavy storm.",
    options: ["although", "in spite", "despite", "even though"],
    correctAnswer: "despite",
  },
  {
    id: "grammar-126",
    number: 126,
    prompt: "They took a taxi ______ catch their flight.",
    options: ["so as", "so that", "as to", "in order to"],
    correctAnswer: "in order to",
  },
  {
    id: "grammar-127",
    number: 127,
    prompt: "Is tomorrow’s newspaper ______ right now?",
    options: ["been printed", "be printing", "being printed", "been printing"],
    correctAnswer: "being printed",
  },
  {
    id: "grammar-128",
    number: 128,
    prompt: "George ______ at 5 o’clock yesterday.",
    options: [
      "has been interviewed",
      "was interviewing",
      "interviewed",
      "was being interviewed",
    ],
    correctAnswer: "was being interviewed",
  },
  {
    id: "grammar-129",
    number: 129,
    prompt: "Samuel ______ to be responsible for the accident.",
    options: ["is believed", "believed", "has believed", "has been believed"],
    correctAnswer: "is believed",
  },
  {
    id: "grammar-130",
    number: 130,
    prompt: "He ______ a bike by his grandparents.",
    options: ["gave", "was given", "was giving", "will give"],
    correctAnswer: "was given",
  },
  {
    id: "grammar-131",
    number: 131,
    prompt: "The new bridge is still under ______.",
    options: ["supervision", "age", "the same roof", "construction"],
    correctAnswer: "construction",
  },
  {
    id: "grammar-132",
    number: 132,
    prompt: "Barry worked on this project under the ______ of Mr Thomson.",
    options: ["supervision", "repair", "age", "consideration"],
    correctAnswer: "supervision",
  },
  {
    id: "grammar-133",
    number: 133,
    prompt: "The company’s offer is under ______.",
    options: ["construction", "consideration", "repair", "the same roof"],
    correctAnswer: "consideration",
  },
  {
    id: "grammar-134",
    number: 134,
    prompt: "Tim and Matt argue all the time. They can’t live under ______.",
    options: ["the same roof", "age", "consideration", "construction"],
    correctAnswer: "the same roof",
  },
  {
    id: "grammar-135",
    number: 135,
    prompt: "Mr Pitt doesn’t have a credit card and always pays ______.",
    options: ["in common", "in fact", "in cash", "in detail"],
    correctAnswer: "in cash",
  },
  {
    id: "grammar-136",
    number: 136,
    prompt: "The guests will be here in twenty minutes. In ______, we can lay the table.",
    options: ["detail", "common", "danger", "the meantime"],
    correctAnswer: "the meantime",
  },
  {
    id: "grammar-137",
    number: 137,
    prompt: "I’m afraid we have nothing ______ with Philip and his brother.",
    options: ["in common", "in detail", "in the meantime", "in danger"],
    correctAnswer: "in common",
  },
  {
    id: "grammar-138",
    number: 138,
    prompt: "Isn’t Mark here? In ______, we’ll have to start the meeting without him.",
    options: ["detail", "that case", "cash", "common"],
    correctAnswer: "that case",
  },
  {
    id: "grammar-139",
    number: 139,
    prompt: "Why don’t you ask him to put you ______ to Mr Robinson?",
    options: ["up", "out", "through", "up with"],
    correctAnswer: "through",
  },
  {
    id: "grammar-140",
    number: 140,
    prompt: "Since he missed the last bus, I can put him ______ for the night.",
    options: ["forward", "through", "up with", "up"],
    correctAnswer: "up",
  },
  {
    id: "grammar-141",
    number: 141,
    prompt: "I was very tired yesterday because I ______ for two nights.",
    options: [
      "haven’t been sleeping",
      "hadn’t slept",
      "didn’t sleep",
      "was sleeping",
    ],
    correctAnswer: "hadn’t slept",
  },
  {
    id: "grammar-142",
    number: 142,
    prompt: "How long had you been standing there before I ______ you?",
    options: ["see", "had seen", "was seeing", "saw"],
    correctAnswer: "saw",
  },
  {
    id: "grammar-143",
    number: 143,
    prompt:
      "When Jill heard the alarm, she ran out of the house, but the thieves ______ her car.",
    options: [
      "had already stolen",
      "were already stolen",
      "already stole",
      "had already been stealing",
    ],
    correctAnswer: "had already stolen",
  },
];

// ============================================================================
// 4. READING — SIGNS & NOTICES (1–10)
// ============================================================================
export const SIGNS_QUESTIONS: SignQuestion[] = [
  {
    id: "sign-1",
    number: 1,
    title: "Sign 1: BUS RULES",
    signText: "BUS RULES",
    imageFile: "bus_rules.png",
    options: [
      "Passengers are allowed to change their seats.",
      "Passengers are allowed to eat snacks on the bus.",
      "Passengers can make noise on the bus.",
      "Passengers have to follow the bus rules.",
    ],
    correctAnswer: "Passengers have to follow the bus rules.",
  },
  {
    id: "sign-2",
    number: 2,
    title: "Sign 2: IF DOOR DOES NOT OPEN DO NOT ENTER",
    signText: "IF DOOR DOES NOT OPEN DO NOT ENTER",
    imageFile: "do_not_enter.png",
    options: [
      "Knock the door if you want to enter when it does not often.",
      "Open the door when you want to enter.",
      "You are not allowed to enter when the door does not open.",
      "You are not allowed to enter if the door is open.",
    ],
    correctAnswer: "You are not allowed to enter when the door does not open.",
  },
  {
    id: "sign-3",
    number: 3,
    title: "Sign 3: FLOODING AHEAD — TURN AROUND DON'T DROWN",
    signText: "FLOODING AHEAD — TURN AROUND DON'T DROWN",
    imageFile: "flooding_ahead.png",
    options: [
      "It’s unsafe to go ahead because the area is flooding.",
      "You will be drown if you turn around.",
      "You should go ahead if you want to avoid flooding area.",
      "If you can swim, you can go ahead.",
    ],
    correctAnswer: "It’s unsafe to go ahead because the area is flooding.",
  },
  {
    id: "sign-4",
    number: 4,
    title: "Sign 4: CHILDREN'S PLAY AREA — NO DOGS ALLOWED",
    signText: "CHILDREN'S PLAY AREA — NO DOGS ALLOWED",
    imageFile: "no_dogs_allowed.png",
    options: [
      "This is dogs’ play area.",
      "Children can play with dogs in this area.",
      "Dogs are not allowed to enter this area.",
      "People can take their dogs with them in this area.",
    ],
    correctAnswer: "Dogs are not allowed to enter this area.",
  },
  {
    id: "sign-5",
    number: 5,
    title: "Sign 5: LONG SLEEVE SHIRT AND TROUSERS MUST BE WORN",
    signText: "LONG SLEEVE SHIRT AND TROUSERS MUST BE WORN",
    imageFile: "long_sleeve_shirt.png",
    options: [
      "People must wear long sleeve shirt and trousers in this area.",
      "People must wear casual clothes in this area except long sleeve shirt and trousers.",
      "People have to wear formal clothes in this area except long sleeve shirt and trousers.",
      "Long sleeve shirt and trousers should be worn in this area.",
    ],
    correctAnswer:
      "People must wear long sleeve shirt and trousers in this area.",
  },
  {
    id: "sign-6",
    number: 6,
    title: "Sign 6: SLOW — CHILDREN AT PLAY",
    signText: "SLOW — CHILDREN AT PLAY",
    imageFile: "slow_children_at_play.png",
    options: [
      "Pay attention to the kids when you are playing.",
      "You have to slow down your speed and be careful when you are driving in this area.",
      "You are not allowed to drive in this area.",
      "Driving is prohibited in this area.",
    ],
    correctAnswer:
      "You have to slow down your speed and be careful when you are driving in this area.",
  },
  {
    id: "sign-7",
    number: 7,
    title: "Sign 7: NO SMOKING, EATING OR DRINKING",
    signText: "NO SMOKING, EATING OR DRINKING",
    imageFile: "no_smoking_eating_drinking.png",
    options: [
      "This area is for smoking only.",
      "This area is for eating only.",
      "This area is for drinking only.",
      "You are not allowed to smoke, eat and drink in this area.",
    ],
    correctAnswer: "You are not allowed to smoke, eat and drink in this area.",
  },
  {
    id: "sign-8",
    number: 8,
    title: "Sign 8: NO ALCOHOL PERMITTED ON THIS SITE",
    signText: "NO ALCOHOL PERMITTED ON THIS SITE",
    imageFile: "no_alcohol_permitted.png",
    options: [
      "Only adults are permitted to drink alcohol on this site.",
      "People under 18 are not allowed to drink alcohol on this site.",
      "No one can drink alcohol on this site.",
      "You are permitted to buy alcohol on this site.",
    ],
    correctAnswer: "No one can drink alcohol on this site.",
  },
  {
    id: "sign-9",
    number: 9,
    title: "Sign 9: NO HITCH HIKING",
    signText: "NO HITCH HIKING",
    imageFile: "no_hitch_hiking.png",
    options: [
      "People will give you a free drive when they see this sign.",
      "Drivers won’t stop when you want to hitchhike here.",
      "You are allowed to hitchhike when you see this sign.",
      "Hitch hiking is accepted here.",
    ],
    correctAnswer: "Drivers won’t stop when you want to hitchhike here.",
  },
  {
    id: "sign-10",
    number: 10,
    title: "Sign 10: SCHOOL VISITOR SIGN-IN",
    signText: "SCHOOL VISITOR SIGN-IN",
    imageFile: "sign_in_at_office.png",
    options: [
      "Parents and visitors are free to enter the school.",
      "Visitors have to sign in at the office to enter the school.",
      "Parents don’t have to sign in at the office to enter the school.",
      "All parents and visitors have to sign in to receive a pass at the office in order to enter the school.",
    ],
    correctAnswer:
      "All parents and visitors have to sign in to receive a pass at the office in order to enter the school.",
  },
];

// ============================================================================
// 5. READING COMPREHENSION (Passages 1, 2, 3)
// ============================================================================
export const READING_PASSAGES: ReadingPassage[] = [
  {
    id: "passage-1",
    title: "Passage 1: OUR SCHOOL NEWSPAPER",
    subtitle: "OUR SCHOOL NEWSPAPER — by Michael Williams",
    type: "comprehension",
    paragraphs: [
      "Some years ago, our head teacher, Mrs Waters, decided to start a school newspaper, and get as many students as possible to take on the job of producing it - and parents, too. She felt the newspaper would help them learn more about school life, through articles on things like sports achievements and arts projects, which not all students know about if they're not taking part. Students took the whole thing very seriously - and we now have a prize-winning newspaper!",
      "Some of my friends joined the newspaper team immediately and enjoyed it. I'd always loved creative writing and drawing cartoons, which I thought would be perfect in the newspaper, so I signed up. My dad, who's a journalist, was pleased - he thought that even though I wasn't keen on a job like his, the newspaper would be a great opportunity for me. And he was right - I loved it! Dad often came along to give advice, which was popular with the students. It was difficult sometimes, if he was busy, but he learned a lot about the school that way.",
      "My first job was writing a report about a sports event - a writing style I'd never attempted before. But Dad reminded me it was similar in some ways to writing a story - getting information in the right order. Once I'd understood that, there was no stopping me - and after my first efforts, I developed quite a professional style, which was brilliant. Sometimes the team couldn't use what I'd written, or my cartoons, for whatever reason, but I didn't mind. And sometimes it was hard to finish stuff on time, but I usually got there.",
      "I'm now one of the editors - we decide what goes into the newspaper, so our names no longer appear in print. And it's stressful sometimes as we don't have much time, but we try to manage that properly. We also correct mistakes in people's articles, which we all had to get used to, but we were soon doing it without thinking - and in our own schoolwork, too. I still put off calling people outside school for comments on stuff, but I guess it's all good experience - at least, that's what Dad says!",
    ],
    questions: [
      {
        id: "p1-q1",
        number: 1,
        prompt:
          "Michael's head teacher wanted to start a student newspaper to",
        options: [
          "provide an activity for students not interested in sport or art.",
          "make students feel more confident about taking part in something.",
          "keep students better informed about what was happening at school.",
          "give students the experience of being responsible for something.",
        ],
        correctAnswer:
          "keep students better informed about what was happening at school.",
      },
      {
        id: "p1-q2",
        number: 2,
        prompt: "Michael decided to join the newspaper because",
        options: [
          "he had ideas about some work he could do for it.",
          "he was considering a career in journalism.",
          "his friends had encouraged him to do so.",
          "he liked the idea of being part of a team.",
        ],
        correctAnswer: "he had ideas about some work he could do for it.",
      },
      {
        id: "p1-q3",
        number: 3,
        prompt: "When Michael first started working on the newspaper, he was",
        options: [
          "disappointed when his stories sometimes weren't used.",
          "delighted at the way his writing skills improved.",
          "pleased to find he could make use of his art skills.",
          "worried he'd be late completing some of his writing.",
        ],
        correctAnswer: "delighted at the way his writing skills improved.",
      },
      {
        id: "p1-q4",
        number: 4,
        prompt: "What does Michael say about his role on the newspaper now?",
        options: [
          "He feels uncomfortable about correcting other students' work.",
          "He still needs to improve the way he manages his time.",
          "He's happier to handle making telephone calls to others.",
          "He's become better at making articles more accurate.",
        ],
        correctAnswer: "He's become better at making articles more accurate.",
      },
      {
        id: "p1-q5",
        number: 5,
        prompt: "What would Michael's dad say about the newspaper?",
        options: [
          "I was surprised at how keen Michael was to get involved - he's never shown that much interest in writing before.",
          "I occasionally had problems finding the time to help out at Michael's school, but the students really seemed to like my suggestions.",
          "Michael would never admit it, but I know he's proud to see his name in the newspaper these days - and I am, too!",
          "It's been great to finally find out about life at the school through reading the newspaper. I didn't really know much about it before.",
        ],
        correctAnswer:
          "I occasionally had problems finding the time to help out at Michael's school, but the students really seemed to like my suggestions.",
      },
    ],
  },
  {
    id: "passage-2",
    title: "Passage 2: WHALE-WATCHING TRIP (TEXT 6)",
    subtitle: "WHALE-WATCHING TRIP — by Jack Madison, 15",
    type: "comprehension",
    paragraphs: [
      "A while ago, my friend Olivia was telling me about a whale-watching trip she'd been on, in Canada. I wanted to tell her I was about to do the same thing, off the north coast of the UK, where my grandparents live. Whales had recently appeared there again, and my grandparents were convinced we'd see some - so I was sure my trip would be as good as Olivia's! But then I saw some reviews of the trip my dad had booked for us, when no-one had seen any whales at all. So, in the end, I decided not to tell Olivia anything about my trip, in case it wasn't successful!",
      "Anyway, Dad and I set off on our trip - which was Dad's idea - and it was fantastic! Travelling out to sea on the tour boat with our guide, we soon reached the spot where whales often appeared. Then we waited - and nothing happened. I was sure this wouldn't last, though. People kept calling out they'd seen one, which was exciting – but then it turned out they were wrong. Then finally I saw something move under the water - a minke whale! So I felt like a hero for the rest of the trip!",
      "The whale was a wonderful sight, with its huge back not far from the boat. Our guide said it was around five tonnes in weight and around 10 metres long. Yet, despite its size, it swam alongside us at speed, and with little effort. We waited to see if more appeared, and some time later, we saw three more some distance away, that kept diving under the water and coming up again. Then just after I'd filmed them, they disappeared.",
      "Although the water's less deep around the coast, larger whale species appear in the area with minke whales, feeding on fish. But minkes are curious creatures, so they're more likely to approach tourist boats - which was why we were successful! Then later, up on the cliffs, we looked out to sea, searching for signs of whales. Sometimes seabirds diving into the water means whales are around, as they're stealing the whales' meal. We were unlucky, sadly – but we'll be back!",
    ],
    questions: [
      {
        id: "p2-q1",
        number: 1,
        prompt:
          "Jack wasn't keen to mention his whale-watching trip to Olivia because",
        options: [
          "he thought her trip sounded a lot more exciting.",
          "he'd read some negative reports about where he was going.",
          "he wasn't sure if his dad had definitely arranged it.",
          "he didn't know whether she was very interested in whales.",
        ],
        correctAnswer:
          "he'd read some negative reports about where he was going.",
      },
      {
        id: "p2-q2",
        number: 2,
        prompt: "On board the whale-watching boat, Jack",
        options: [
          "was proud to be the first person to see a whale.",
          "began to worry that they might all be disappointed.",
          "tried not to get excited when anyone saw something.",
          "was glad he'd persuaded his dad to come with him.",
        ],
        correctAnswer: "was proud to be the first person to see a whale.",
      },
      {
        id: "p2-q3",
        number: 3,
        prompt: "When Jack saw the minke whale, he was",
        options: [
          "surprised at how close it came to the boat.",
          "amazed that it was so much bigger than he'd imagined.",
          "impressed that it moved through the water so easily.",
          "delighted to see it had arrived with several others.",
        ],
        correctAnswer: "impressed that it moved through the water so easily.",
      },
      {
        id: "p2-q4",
        number: 4,
        prompt:
          "Jack suggests minke whales appeared in the same area as the boat because",
        options: [
          "they knew there were plenty of fish there.",
          "they were attracted by the arrival of the visitors.",
          "they didn't have to compete for food with seabirds.",
          "they preferred how deep the water was there.",
        ],
        correctAnswer: "they were attracted by the arrival of the visitors.",
      },
      {
        id: "p2-q5",
        number: 5,
        prompt: "What would Jack text to his grandparents about the whales?",
        options: [
          "I'll send you my video of the group of whales - they only appeared briefly, so they weren't as interesting as the first one we saw.",
          "Dad said he'd really wanted to go to Canada to watch whales, like my friend Olivia - but now we’re really happy we came here.",
          "I must take you up to the cliffs to look for whales – we’ve seen them every time we’ve been there, so far.",
          "You were so sure our whale-watching trip would be a success, while I still had doubts – but you were right.",
        ],
        correctAnswer:
          "You were so sure our whale-watching trip would be a success, while I still had doubts – but you were right.",
      },
    ],
  },
  {
    id: "passage-3",
    title: "Passage 3: THE ART OF DRAWING (Cloze Test)",
    subtitle: "THE ART OF DRAWING",
    type: "cloze",
    paragraphs: [
      "Drawing has always been a very popular hobby. Young children draw with a pencil as (1) ______ as they can hold one. Drawing is often seen as a special skill, and it is (2) ______ that some people seem to draw perfect pictures without any effort. Yet drawing, like writing, can be (3) ______; you can draw accurately if you work really hard at it.",
      "Drawing is first (4) ______ all about looking carefully. It sounds easy to say that all you (5) ______ to do is look at things, but it really is that simple. The best way to draw a familiar (6) ______ is to imagine that you are looking at it for the first (7) ______.",
      "Nowadays there are (8) ______ courses and materials available than ever before, (9) ______ means that you can experiment to improve your skills. The only (10) ______ is your imagination.",
    ],
    questions: [
      {
        id: "p3-q1",
        number: 1,
        prompt: "Young children draw with a pencil as (1) ______ as they can hold one.",
        options: ["fast", "immediately", "soon", "shortly"],
        correctAnswer: "soon",
      },
      {
        id: "p3-q2",
        number: 2,
        prompt:
          "Drawing is often seen as a special skill, and it is (2) ______ that some people seem to draw perfect pictures without any effort.",
        options: ["true", "actual", "exact", "real"],
        correctAnswer: "true",
      },
      {
        id: "p3-q3",
        number: 3,
        prompt:
          "Yet drawing, like writing, can be (3) ______; you can draw accurately if you work really hard at it.",
        options: ["discovered", "made", "learnt", "reached"],
        correctAnswer: "learnt",
      },
      {
        id: "p3-q4",
        number: 4,
        prompt: "Drawing is first (4) ______ all about looking carefully.",
        options: ["of", "in", "from", "for"],
        correctAnswer: "of",
      },
      {
        id: "p3-q5",
        number: 5,
        prompt:
          "It sounds easy to say that all you (5) ______ to do is look at things, but it really is that simple.",
        options: ["should", "need", "must", "could"],
        correctAnswer: "need",
      },
      {
        id: "p3-q6",
        number: 6,
        prompt:
          "The best way to draw a familiar (6) ______ is to imagine that you are looking at it for the first time.",
        options: ["topic", "subject", "area", "person"],
        correctAnswer: "subject",
      },
      {
        id: "p3-q7",
        number: 7,
        prompt:
          "The best way to draw a familiar subject is to imagine that you are looking at it for the first (7) ______.",
        options: ["period", "term", "moment", "time"],
        correctAnswer: "time",
      },
      {
        id: "p3-q8",
        number: 8,
        prompt:
          "Nowadays there are (8) ______ courses and materials available than ever before...",
        options: ["more", "many", "plenty", "much"],
        correctAnswer: "more",
      },
      {
        id: "p3-q9",
        number: 9,
        prompt:
          "...(9) ______ means that you can experiment to improve your skills.",
        options: ["who", "what", "where", "which"],
        correctAnswer: "which",
      },
      {
        id: "p3-q10",
        number: 10,
        prompt: "The only (10) ______ is your imagination.",
        options: ["final", "end", "limit", "finish"],
        correctAnswer: "limit",
      },
    ],
  },
];

// ============================================================================
// 6. LISTENING PRACTICE
// ============================================================================
export const LISTENING_SUBSECTIONS: ListeningSubSection[] = [
  {
    id: "listening-text2-part-a",
    title: "TEXT 2: Tatiana Cooley — Memory Champion (Part A)",
    subtitle: "Part A: True (T) or False (F)",
    type: "true-false",
    trueFalseItems: [
      {
        id: "t2-tf-1",
        number: 1,
        statement:
          "Tatiana can remember 75 of 100 names and faces after 15 minutes.",
        correctAnswer: false,
        evidence: "She can remember 70 of 100 after 15 minutes.",
      },
      {
        id: "t2-tf-2",
        number: 2,
        statement: "She has exactly six brothers and sisters.",
        correctAnswer: true,
        evidence: 'She has 6 brothers and sisters ("Six…er…seven...er six").',
      },
      {
        id: "t2-tf-3",
        number: 3,
        statement:
          "She feels that remembering everyday things and memorizing things are different processes.",
        correctAnswer: true,
        evidence:
          "The ability to memorize is different from remembering things on a daily basis.",
      },
      {
        id: "t2-tf-4",
        number: 4,
        statement:
          "She makes up a story to link random numbers and words, for visualization.",
        correctAnswer: false,
        evidence:
          "Making up a story to link numbers/words is for association, not visualization.",
      },
      {
        id: "t2-tf-5",
        number: 5,
        statement:
          "She didn’t have to do much except for taking lecture notes in college.",
        correctAnswer: true,
        evidence: "Taking lecture notes was enough to prepare for tests.",
      },
      {
        id: "t2-tf-6",
        number: 6,
        statement:
          "Her parents only encouraged her to read and learn languages to help her memory.",
        correctAnswer: false,
        evidence: "They also played games to help her memory.",
      },
      {
        id: "t2-tf-7",
        number: 7,
        statement: "She finds memorization interesting.",
        correctAnswer: true,
        evidence: "She thinks memorization is fun.",
      },
      {
        id: "t2-tf-8",
        number: 8,
        statement:
          "She recently defeated 60 challengers to keep her memory champion title.",
        correctAnswer: false,
        evidence: "She defeated 16 challengers.",
      },
      {
        id: "t2-tf-9",
        number: 9,
        statement: "Her parents allowed her to watch TV when she was little.",
        correctAnswer: true,
        evidence:
          "They allowed her to watch news and educational programs on TV.",
      },
      {
        id: "t2-tf-10",
        number: 10,
        statement:
          "Tatiana keeps a daily To Do list for remembering things on a daily basis.",
        correctAnswer: true,
        evidence:
          "She keeps a daily To Do list and lives by reminder notes.",
      },
    ],
  },
  {
    id: "listening-text2-part-b",
    title: "TEXT 2: Tatiana Cooley — Memory Champion (Part B)",
    subtitle: "Part B: Listening Gap-fill (Multiple Choice)",
    type: "gap-fill-mc",
    paragraphs: [
      "Now here's an interesting story about the (1) ______ of how memory works... or doesn't work.",
      "Give Tatiana Cooley 100 faces and names to memorize and she can remember 70 of them 15 minutes later. Give her 4,000 numbers or (2) ______ words and she'll repeat them better than most people. It's the same with a 54-line poem. So, why does Tatiana Cooley need sticky notes?",
      'She says she\'s incredibly (3) ______! She recently defeated 16 challengers to keep her memory champion title, but when asked how many brothers and sisters she has, she replied, "Six…er…seven...er six."',
      'She keeps a daily To Do list and says she "lives by reminder notes." According to Tatiana, the ability (4) ______ things is different from remembering things on a daily basis. She says her memorizing is "not on the same level as remembering to call people."',
      "Tatiana (5) ______ that she is not unique. She believes that anybody can train their mind to memorize. She uses two techniques: visualization and association. For visualization, she looks at material and mentally photographs it. For association, she makes up a story to (6) ______ random numbers and words.",
      "Tatiana noticed that her ability to memorize was better than average when she was studying in college. She found that taking (7) ______ notes was enough to prepare for tests. She didn't have to do anything else.",
      'Tatiana gives credit for her (8) ______ to her mother and father. They only allowed her to watch news and educational programs on TV when she was growing up. They played games to help her memory and encouraged her to read and learn languages. She reads in Portuguese, Spanish, and French. She thinks (9) ______ is fun. She says, "I\'ve always loved to learn. I\'ve been like a sponge my whole life."',
      "So, there you go, folks, it's reassuring to know that even a memory champion needs a little help (10) ______ everyday things sometimes. And, our next story is...",
    ],
    mcItems: [
      {
        id: "t2-mc-1",
        number: 1,
        prompt:
          "Now here's an interesting story about the (1) ______ of how memory works... or doesn't work.",
        options: ["history", "theory", "mystery", "phenomenon"],
        correctAnswer: "mystery",
      },
      {
        id: "t2-mc-2",
        number: 2,
        prompt:
          "Give her 4,000 numbers or (2) ______ words and she'll repeat them better than most people.",
        options: ["500", "900", "100", "50"],
        correctAnswer: "500",
      },
      {
        id: "t2-mc-3",
        number: 3,
        prompt: "She says she's incredibly (3) ______!",
        options: [
          "open-minded",
          "absent-minded",
          "strong-minded",
          "wrong-minded",
        ],
        correctAnswer: "absent-minded",
      },
      {
        id: "t2-mc-4",
        number: 4,
        prompt:
          "According to Tatiana, the ability (4) ______ things is different from remembering things on a daily basis.",
        options: ["to recognize", "to realize", "to clarify", "to memorize"],
        correctAnswer: "to memorize",
      },
      {
        id: "t2-mc-5",
        number: 5,
        prompt: "Tatiana (5) ______ that she is not unique.",
        options: ["consists", "exists", "insists", "emits"],
        correctAnswer: "insists",
      },
      {
        id: "t2-mc-6",
        number: 6,
        prompt:
          "For association, she makes up a story to (6) ______ random numbers and words.",
        options: ["link", "think", "bring", "click"],
        correctAnswer: "link",
      },
      {
        id: "t2-mc-7",
        number: 7,
        prompt:
          "She found that taking (7) ______ notes was enough to prepare for tests.",
        options: ["letter", "lecture", "better", "whatever"],
        correctAnswer: "lecture",
      },
      {
        id: "t2-mc-8",
        number: 8,
        prompt:
          "Tatiana gives credit for her (8) ______ to her mother and father.",
        options: ["family", "facilities", "abilities", "variety"],
        correctAnswer: "abilities",
      },
      {
        id: "t2-mc-9",
        number: 9,
        prompt: "She thinks (9) ______ is fun.",
        options: [
          "memorization",
          "visualization",
          "association",
          "modernization",
        ],
        correctAnswer: "memorization",
      },
      {
        id: "t2-mc-10",
        number: 10,
        prompt:
          "So, there you go, folks, it's reassuring to know that even a memory champion needs a little help (10) ______ everyday things sometimes.",
        options: ["memorizing", "realizing", "recognizing", "remembering"],
        correctAnswer: "remembering",
      },
    ],
  },
  {
    id: "listening-text9",
    title: "TEXT 9: Animal Intelligence (Dr. Raul Carvi)",
    subtitle: "I = Interviewer, RC = Dr. Raul Carvi",
    type: "gap-fill-mc",
    paragraphs: [
      "I: Hello. Our guest today is Dr. Raul Carvi, a scientist who studies (1) ______. Tell us, Dr. Carvi, is this a new area of research?",
      "RC: Well, historically, a lot of the focus was on (2) ______ to teach animals – mostly chimpanzees – language. There were some famous studies in the 1970s…",
      "I: Can you tell us about one?",
      "RC: Sure. One of the most famous studies was with a chimp named Washoe. (3) ______ had difficulty making sounds, so researchers taught Washoe sign language.",
      "I: By (4) ______ you mean the language that deaf people use…using their hands to speak?",
      "RC: Yes, that’s right. In the end, Washoe learned more than 130 words in sign language.",
      "I: 130 words! That’s (5) ______.",
      "RC: Yes, it surprised a lot of people. More recently there’s been work with other animals and language…even birds… There is an African (6) ______ named Alex who has learned to name 40 different objects.",
      "I: 40 objects? That seems like a lot for a bird. Is all the research focused on (7) ______?",
      "RC: It started that way, but I think nowadays researchers are looking at different ways animals might demonstrate intelligence…",
      "I: For example?",
      "RC: Well, people who work with animals a lot, such as zookeepers and veterinarians, always have stories about clever animals…animals that seem to apply some kind of thinking skills (8) ______ from captivity or get more food or something…these kinds of things demonstrate a different kind of intelligence.",
      "I: And there are always so many personal stories from (9) ______ too…stories about dogs or cats saving their owner’s lives…rescuing someone from a fire or something. When I was a child, my grandmother had a cat that found its way home from 20 miles away. These (10) ______ of things must also suggest intelligence.",
      "RC: Yes, that’s right. And researchers are now looking at these kinds of personal stories, too.",
      "I: Well, there seems to be a lot of research for scientists studying animal intelligence…",
      "RC: Yes. It’s all very exciting.",
    ],
    mcItems: [
      {
        id: "t9-mc-1",
        number: 1,
        prompt:
          "Our guest today is Dr. Raul Carvi, a scientist who studies (1) ______.",
        options: [
          "animal intelligence",
          "animal independence",
          "animal extinction",
          "animal civilization",
        ],
        correctAnswer: "animal intelligence",
      },
      {
        id: "t9-mc-2",
        number: 2,
        prompt:
          "Well, historically, a lot of the focus was on (2) ______ to teach animals – mostly chimpanzees – language.",
        options: ["finding", "arriving", "trying", "deciding"],
        correctAnswer: "trying",
      },
      {
        id: "t9-mc-3",
        number: 3,
        prompt:
          "(3) ______ had difficulty making sounds, so researchers taught Washoe sign language.",
        options: ["The chimp", "The team", "The cat", "The fish"],
        correctAnswer: "The chimp",
      },
      {
        id: "t9-mc-4",
        number: 4,
        prompt:
          "By (4) ______ you mean the language that deaf people use…using their hands to speak?",
        options: [
          "find language",
          "nice language",
          "five languages",
          "sign language",
        ],
        correctAnswer: "sign language",
      },
      {
        id: "t9-mc-5",
        number: 5,
        prompt: "130 words! That’s (5) ______.",
        options: ["exciting", "amazing", "confiding", "challenging"],
        correctAnswer: "amazing",
      },
      {
        id: "t9-mc-6",
        number: 6,
        prompt:
          "There is an African (6) ______ named Alex who has learned to name 40 different objects.",
        options: ["gray carrot", "great pilot", "great carrot", "gray parrot"],
        correctAnswer: "gray parrot",
      },
      {
        id: "t9-mc-7",
        number: 7,
        prompt: "Is all the research focused on (7) ______?",
        options: [
          "language learning",
          "message sending",
          "luggage carrying",
          "garbage burning",
        ],
        correctAnswer: "language learning",
      },
      {
        id: "t9-mc-8",
        number: 8,
        prompt:
          "…animals that seem to apply some kind of thinking skills (8) ______ from captivity or get more food or something…",
        options: ["to expect", "to kidnap", "to escape", "to reflect"],
        correctAnswer: "to escape",
      },
      {
        id: "t9-mc-9",
        number: 9,
        prompt:
          "And there are always so many personal stories from (9) ______ too…stories about dogs or cats saving their owner’s lives…",
        options: ["cat owners", "pet owners", "rat owners", "bird owners"],
        correctAnswer: "pet owners",
      },
      {
        id: "t9-mc-10",
        number: 10,
        prompt: "These (10) ______ of things must also suggest intelligence.",
        options: ["nine", "five", "kinds", "prizes"],
        correctAnswer: "kinds",
      },
    ],
  },
  {
    id: "listening-text16",
    title: "TEXT 16: Cars (Fill in the Blanks)",
    subtitle: "Fill in the missing words (1–10)",
    type: "gap-fill-text",
    fillBlankParagraphs: [
      {
        speaker: "Speaker 1",
        segments: [
          { text: "My first car was a " },
          { text: "", blankNumber: 1, answer: "1960" },
          {
            text: " Rambler. This was in the 1980s, so the car was twenty years old then. It was a big, blue and black thing. You changed gears by ",
          },
          { text: "", blankNumber: 2, answer: "pushing" },
          {
            text: " a button! There were buttons on the dashboard that you pushed when you wanted to go into low gear. It was so heavy it got terrible gas ",
          },
          { text: "", blankNumber: 3, answer: "mileage" },
          {
            text: " – about eight miles to the gallon. It didn’t have much power so it was pretty slow. It felt like driving a boat. But I thought my car was wonderful. Now when I look at pictures of myself in it, I realize I looked so tiny behind the ",
          },
          { text: "", blankNumber: 4, answer: "steering" },
          { text: " wheel. You could hardly see me!" },
        ],
      },
      {
        speaker: "Speaker 2",
        segments: [
          {
            text: "When I was a teenager I went to France and the family that I stayed with had a little Citroen. That was such a great car. I’m not really a car person but I loved that one. It was different from anything that I’d ever seen in the States. It was very ",
          },
          { text: "", blankNumber: 5, answer: "economical" },
          {
            text: ". It got good mileage. But mainly I like it because it was so European. It just had so much style. Citroens were very ",
          },
          { text: "", blankNumber: 6, answer: "popular" },
          { text: " at the time. All the young people in France drove them." },
        ],
      },
      {
        speaker: "Speaker 3",
        segments: [
          { text: "My friend Sharon had a 1970s " },
          { text: "", blankNumber: 7, answer: "pickup" },
          {
            text: " truck for years. It was such a beauty. It was about 25 years old, bright red, and in fantastic condition. She got it from the original owner and took really good care of it. It ran really well and it was very ",
          },
          { text: "", blankNumber: 8, answer: "reliable" },
          {
            text: ". It never broke down. She didn’t drive it every day and she didn’t drive it ",
          },
          { text: "", blankNumber: 9, answer: "at all" },
          {
            text: " in the winter, but we had a lot of fun going for rides in it. Everybody stopped and looked. Sometimes people ",
          },
          { text: "", blankNumber: 10, answer: "would" },
          {
            text: " ask if it was for sale but she always said no. In fact, I think she still has it.",
          },
        ],
      },
    ],
    fillBlankItems: [
      {
        id: "t16-1",
        number: 1,
        speaker: "Speaker 1",
        beforeText: "My first car was a",
        afterText: "Rambler.",
        correctAnswer: "1960",
        fullSentence: "My first car was a 1960 Rambler.",
      },
      {
        id: "t16-2",
        number: 2,
        speaker: "Speaker 1",
        beforeText: "You changed gears by",
        afterText: "a button!",
        correctAnswer: "pushing",
        fullSentence: "You changed gears by pushing a button!",
      },
      {
        id: "t16-3",
        number: 3,
        speaker: "Speaker 1",
        beforeText: "It was so heavy it got terrible gas",
        afterText: "– about eight miles to the gallon.",
        correctAnswer: "mileage",
        fullSentence:
          "It was so heavy it got terrible gas mileage – about eight miles to the gallon.",
      },
      {
        id: "t16-4",
        number: 4,
        speaker: "Speaker 1",
        beforeText:
          "Now when I look at pictures of myself in it, I realize I looked so tiny behind the",
        afterText: "wheel.",
        correctAnswer: "steering",
        fullSentence:
          "Now when I look at pictures of myself in it, I realize I looked so tiny behind the steering wheel.",
      },
      {
        id: "t16-5",
        number: 5,
        speaker: "Speaker 2",
        beforeText: "It was very",
        afterText: ". It got good mileage.",
        correctAnswer: "economical",
        fullSentence: "It was very economical. It got good mileage.",
      },
      {
        id: "t16-6",
        number: 6,
        speaker: "Speaker 2",
        beforeText: "Citroens were very",
        afterText: "at the time.",
        correctAnswer: "popular",
        fullSentence: "Citroens were very popular at the time.",
      },
      {
        id: "t16-7",
        number: 7,
        speaker: "Speaker 3",
        beforeText: "My friend Sharon had a 1970s",
        afterText: "truck for years.",
        correctAnswer: "pickup",
        fullSentence: "My friend Sharon had a 1970s pickup truck for years.",
      },
      {
        id: "t16-8",
        number: 8,
        speaker: "Speaker 3",
        beforeText: "It ran really well and it was very",
        afterText: ". It never broke down.",
        correctAnswer: "reliable",
        fullSentence:
          "It ran really well and it was very reliable. It never broke down.",
      },
      {
        id: "t16-9",
        number: 9,
        speaker: "Speaker 3",
        beforeText: "She didn’t drive it every day and she didn’t drive it",
        afterText: "in the winter, but we had a lot of fun going for rides in it.",
        correctAnswer: "at all",
        fullSentence:
          "She didn’t drive it every day and she didn’t drive it at all in the winter, but we had a lot of fun going for rides in it.",
      },
      {
        id: "t16-10",
        number: 10,
        speaker: "Speaker 3",
        beforeText: "Sometimes people",
        afterText: "ask if it was for sale but she always said no.",
        correctAnswer: "would",
        fullSentence:
          "Sometimes people would ask if it was for sale but she always said no.",
      },
    ],
  },
  {
    id: "listening-text53",
    title: "TEXT 53: Antarctica",
    subtitle: "Lecture True / False",
    type: "true-false",
    trueFalseItems: [
      {
        id: "t53-tf-1",
        number: 1,
        statement:
          "The professor mainly discusses the history of Antarctica.",
        correctAnswer: false,
      },
      {
        id: "t53-tf-2",
        number: 2,
        statement:
          "88 percent of the world’s ice is contained in Antarctica.",
        correctAnswer: false,
      },
      {
        id: "t53-tf-3",
        number: 3,
        statement:
          "The professor emphasizes that Antarctica is cold by comparing Antarctica to Australia.",
        correctAnswer: false,
      },
      {
        id: "t53-tf-4",
        number: 4,
        statement: "Another name for the South Pole is Antarctica.",
        correctAnswer: false,
      },
      {
        id: "t53-tf-5",
        number: 5,
        statement: "Antarctica used to be connected to Australia.",
        correctAnswer: true,
      },
    ],
  },
  {
    id: "listening-text54",
    title: "TEXT 54: Types of Plays",
    subtitle: "Lecture True / False",
    type: "true-false",
    trueFalseItems: [
      {
        id: "t54-tf-1",
        number: 1,
        statement:
          "The professor mentions the play by Ibsen to present a new type of play.",
        correctAnswer: false,
      },
      {
        id: "t54-tf-2",
        number: 2,
        statement:
          "Three types of plays mentioned in the talk are thriller, comedy, and tragedy.",
        correctAnswer: false,
      },
      {
        id: "t54-tf-3",
        number: 3,
        statement: "Saint Joan is an example of a tragicomedy.",
        correctAnswer: true,
      },
      {
        id: "t54-tf-4",
        number: 4,
        statement: "Comedies have humorous characters and happy endings.",
        correctAnswer: true,
      },
      {
        id: "t54-tf-5",
        number: 5,
        statement: "“Ghosts” is a play by George Bernard Shaw.",
        correctAnswer: false,
      },
    ],
  },
];

