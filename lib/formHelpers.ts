export function validateTiptapContent(content: string) {
    // remove all html elements
    const cleanContent = content.replace(/<[^>]*>/g, '')
    return cleanContent.trim()
}