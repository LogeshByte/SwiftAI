// Simple markdown renderer to avoid React errors
export const renderMarkdown = (text) => {
  if (!text) return text;

  return (
    text
      // Headers
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-medium text-gray-800 mb-2 mt-4">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-semibold text-gray-800 mb-3 mt-5">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold text-gray-800 mb-4 mt-6">$1</h1>'
      )
      // Bold text
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-gray-800">$1</strong>'
      )
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
      // Wrap in paragraph
      .replace(/^/, '<p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/$/, "</p>")
  );
};
