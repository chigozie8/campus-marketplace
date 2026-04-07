'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export function MarkdownContent({ content }: { content: string }) {
  if (!content?.trim()) {
    return (
      <p className="text-muted-foreground italic text-sm">No content written yet.</p>
    )
  }

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none
      prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground
      prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-5
      prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
      prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
      prose-p:text-[1.05rem] prose-p:leading-[1.8] prose-p:text-foreground/90
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:not-italic
      prose-img:rounded-2xl prose-img:shadow-xl
      prose-strong:text-foreground prose-strong:font-bold
      prose-li:text-foreground/90 prose-li:leading-relaxed
      prose-hr:border-border prose-hr:my-10
      prose-code:bg-muted prose-code:text-primary prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-2xl prose-pre:shadow-lg
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
