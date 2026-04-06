import parse, { Element, domToReact, DOMNode } from 'html-react-parser'
import { ActivityData } from "./types"
import { ClickableImage } from "./ClickableImage"
import { ContentErrorBoundary } from "./ContentErrorBoundary"

interface ThreadContentProps {
  activity: ActivityData
  onImageClick: (src: string, alt: string) => void
}

export function ThreadContent({ activity, onImageClick }: ThreadContentProps) {
  return (
    <ContentErrorBoundary>
      <div className="mt-2 pl-2 thread-content prose prose-sm max-w-none dark:prose-invert">
        {parse(activity.content || '', {
        replace: (domNode) => {
          if (domNode instanceof Element) {
            // Handle images - make them clickable
            if (domNode.name === 'img') {
              const src = domNode.attribs.src
              const alt = domNode.attribs.alt || "Image"
              const width = domNode.attribs.width ? parseInt(domNode.attribs.width) : 400
              const height = domNode.attribs.height ? parseInt(domNode.attribs.height) : 200

              // Always make images clickable if they have a valid src
              if (src) {
                return (
                  <ClickableImage 
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    onImageClick={onImageClick}
                  />
                )
              }
              
              // Fallback for images without valid src
              return (
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 text-center text-gray-500 dark:text-gray-400 my-2">
                  <p>Image not available</p>
                  {alt && <p className="text-xs mt-1">{alt}</p>}
                </div>
              )
            }
            
            // Handle paragraphs - remove default margins and process children
            if (domNode.name === 'p') {
              return (
                <p className="m-0 mb-1">
                  {domToReact(domNode.children as DOMNode[], {
                    replace: (childNode) => {
                      if (childNode instanceof Element && childNode.name === 'img') {
                        const src = childNode.attribs.src
                        const alt = childNode.attribs.alt || "Image"
                        const width = childNode.attribs.width ? parseInt(childNode.attribs.width) : 400
                        
                        if (src) {
                          return (
                            <ClickableImage 
                              src={src}
                              alt={alt}
                              width={width}
                              height={200}
                              onImageClick={onImageClick}
                            />
                          )
                        }
                      }
                    }
                  })}
                </p>
              )
            }
            
            // Handle headings - remove default margins
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(domNode.name)) {
              const HeadingTag = domNode.name as keyof JSX.IntrinsicElements
              return (
                <HeadingTag className="m-0 mb-1 font-semibold">
                  {domToReact(domNode.children as DOMNode[])}
                </HeadingTag>
              )
            }
            
            // Handle lists - minimize spacing
            if (domNode.name === 'ul') {
              return (
                <ul className="m-0 mb-1 pl-4">
                  {domToReact(domNode.children as DOMNode[])}
                </ul>
              )
            }
            
            if (domNode.name === 'ol') {
              return (
                <ol className="m-0 mb-1 pl-4">
                  {domToReact(domNode.children as DOMNode[])}
                </ol>
              )
            }
            
            if (domNode.name === 'li') {
              return (
                <li className="m-0">
                  {domToReact(domNode.children as DOMNode[])}
                </li>
              )
            }
            
            // Handle blockquotes
            if (domNode.name === 'blockquote') {
              return (
                <blockquote className="m-0 mb-1 pl-4 border-l-4 border-gray-300 dark:border-gray-600 italic">
                  {domToReact(domNode.children as DOMNode[])}
                </blockquote>
              )
            }
            
            // Handle pre and code blocks
            if (domNode.name === 'pre') {
              return (
                <pre className="m-0 mb-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
                  {domToReact(domNode.children as DOMNode[])}
                </pre>
              )
            }
            
            // Handle code inline
            if (domNode.name === 'code') {
              return (
                <code className="m-0 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-sm font-mono text-sm">
                  {domToReact(domNode.children as DOMNode[])}
                </code>
              )
            }
            
            // Handle links
            if (domNode.name === 'a') {
              return (
                <a 
                  href={domNode.attribs.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  {domToReact(domNode.children as DOMNode[])}
                </a>
              )
            }
            
            // Handle divs and spans - remove margins and process children
            if (domNode.name === 'div') {
              return (
                <div className="m-0">
                  {domToReact(domNode.children as DOMNode[], {
                    replace: (childNode) => {
                      if (childNode instanceof Element && childNode.name === 'img') {
                        const src = childNode.attribs.src
                        const alt = childNode.attribs.alt || "Image"
                        const width = childNode.attribs.width ? parseInt(childNode.attribs.width) : 400
                        
                        if (src) {
                          return (
                            <ClickableImage 
                              src={src}
                              alt={alt}
                              width={width}
                              height={200}
                              onImageClick={onImageClick}
                            />
                          )
                        }
                      }
                    }
                  })}
                </div>
              )
            }
            
            if (domNode.name === 'span') {
              return (
                <span className="m-0">
                  {domToReact(domNode.children as DOMNode[], {
                    replace: (childNode) => {
                      if (childNode instanceof Element && childNode.name === 'img') {
                        const src = childNode.attribs.src
                        const alt = childNode.attribs.alt || "Image"
                        const width = childNode.attribs.width ? parseInt(childNode.attribs.width) : 400
                        
                        if (src) {
                          return (
                            <ClickableImage 
                              src={src}
                              alt={alt}
                              width={width}
                              height={200}
                              onImageClick={onImageClick}
                            />
                          )
                        }
                      }
                    }
                  })}
                </span>
              )
            }
          }
        }
      })}
      </div>
    </ContentErrorBoundary>
  )
}
