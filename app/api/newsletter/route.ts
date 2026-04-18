// Compatibility shim — older clients (blog, careers pages) post here.
// Forwards to the canonical /api/newsletter/subscribe handler.
import { POST as subscribePost } from './subscribe/route'
export const POST = subscribePost
