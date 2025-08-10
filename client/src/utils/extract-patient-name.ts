// Utility function to extract patient name from scenario context
export function extractPatientName(context: string): string {
  if (!context) return 'Patient';
  
  // Try multiple patterns to extract patient name
  const patterns = [
    // "Robert is a 78-year-old" -> "Robert"
    /([A-Z][a-z]+)\s+is\s+(?:a|an)\s+\d+/i,
    // "Meet Robert, a 78-year-old" -> "Robert"
    /meet\s+([A-Z][a-z]+)(?:\s*,\s*(?:a|an))?/i,
    // "The patient is named Robert" -> "Robert"
    /(?:patient|resident|person|individual)[\s,]*(?:is\s+)?(?:named\s+|called\s+)?([A-Z][a-z]+)/i,
    // "Robert, a 78-year-old patient" -> "Robert"
    /([A-Z][a-z]+)\s*,\s*(?:a|an)\s+\d+/i,
    // Simple name at start of sentence
    /^([A-Z][a-z]+)\s+/,
    // Any capitalized word followed by common age/description patterns
    /([A-Z][a-z]+)(?:\s+(?:is|has|lives|suffers))/i
  ];
  
  for (const pattern of patterns) {
    const match = context.match(pattern);
    if (match && match[1] && match[1].length > 1) {
      return match[1];
    }
  }
  
  return 'Patient';
}