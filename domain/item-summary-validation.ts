// Numeric facts may be written as English words in the authoritative API text.
// This accepts ten -> 10, but never converts feet/pounds or derives new bonuses.
export function supportedSummaryNumbers(text: string): Set<string> {
  const values: Record<string, string> = {
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
    ten: "10",
    eleven: "11",
    twelve: "12",
    thirteen: "13",
    fourteen: "14",
    fifteen: "15",
    sixteen: "16",
    seventeen: "17",
    eighteen: "18",
    nineteen: "19",
    twenty: "20",
    thirty: "30",
    forty: "40",
    fifty: "50",
    sixty: "60",
    seventy: "70",
    eighty: "80",
    ninety: "90",
    hundred: "100",
    thousand: "1000",
    once: "1",
    twice: "2",
    century: "100",
    decade: "10",
    millennium: "1000",
  };
  const result = new Set(text.match(/\d+(?:[.,]\d+)?/g) || []);
  for (const word of text.toLowerCase().match(/[a-z]+/g) || [])
    if (values[word]) result.add(values[word]);
  if (
    /\b(?:a|an)\s+(?:cubic foot|foot|inch|hour|minute|day|charge|use|pound|mile|year)\b/i.test(
      text,
    )
  )
    result.add("1");
  return result;
}
