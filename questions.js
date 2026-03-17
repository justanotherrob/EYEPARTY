const questions = [
  {
    question: "What does a Snellen result of 6/6 mean?",
    options: [
      "Normal vision / The patient can read at 6m what a normal eye reads at 6m",
      "The patient has poor vision",
      "The test was inconclusive",
      "The patient needs glasses"
    ],
    correctIndex: 0
  },
  {
    question: "A patient reads 6/60. This means they can read at 6m what a normal eye reads at...",
    options: ["6m", "12m", "60m", "600m"],
    correctIndex: 2
  },
  {
    question: "Which Snellen result indicates worse vision?",
    options: ["6/6", "6/9", "6/18", "6/60"],
    correctIndex: 3
  },
  {
    question: "In the UK, the driving standard for visual acuity is approximately:",
    options: ["6/6", "6/9", "6/12", "6/18"],
    correctIndex: 1
  },
  {
    question: "LogMAR 0.0 is equivalent to which Snellen result?",
    options: ["6/60", "6/12", "6/6", "6/4"],
    correctIndex: 2
  },
  {
    question: "When testing VA, which eye is tested first by convention?",
    options: ["Left", "Right", "Either", "Both simultaneously"],
    correctIndex: 1
  },
  {
    question: "A pinhole test improves VA. This suggests the cause is most likely:",
    options: ["Retinal disease", "Neurological", "Refractive error", "Amblyopia"],
    correctIndex: 2
  },
  {
    question: "6/5 vision means:",
    options: [
      "Worse than normal",
      "Normal",
      "Better than normal",
      "The test was performed incorrectly"
    ],
    correctIndex: 2
  },
  {
    question: "Which chart uses tumbling E symbols?",
    options: ["Snellen", "LogMAR", "Illiterate E chart", "Ishihara"],
    correctIndex: 2
  },
  {
    question: "What is the standard test distance for a Snellen chart?",
    options: ["3m", "4m", "6m", "10m"],
    correctIndex: 2
  },
  {
    question: "A patient cannot read the top letter of a Snellen chart at 6m. Next step?",
    options: [
      "Record as 6/60 and refer",
      "Move patient closer and retest",
      "Abandon the test",
      "Test the other eye only"
    ],
    correctIndex: 1
  },
  {
    question: "Visual acuity should be recorded:",
    options: [
      "Without glasses only",
      "With glasses only",
      "Both uncorrected and corrected",
      "With pinhole only"
    ],
    correctIndex: 2
  },
  {
    question: "Which condition would NOT typically be detected by a standard Snellen test?",
    options: ["Myopia", "Hyperopia", "Colour blindness", "Amblyopia"],
    correctIndex: 2
  },
  {
    question: "Count fingers (CF) vision is recorded when:",
    options: [
      "VA is 6/60 or better",
      "Patient cannot read the 6/60 line",
      "Patient is uncooperative",
      "Pinhole test fails"
    ],
    correctIndex: 1
  },
  {
    question: "A child aged 4 cannot read letters. Which chart is most appropriate?",
    options: ["Snellen", "LogMAR", "Kay Pictures", "Pelli-Robson"],
    correctIndex: 2
  }
];

module.exports = questions;
