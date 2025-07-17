import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@/contexts/ThemeContext';

interface MarkdownRendererProps {
  children: string;
}

export const MarkdownRenderer = ({ children }: MarkdownRendererProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`} {...props} />,
        h2: ({ node, ...props }) => <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`} {...props} />,
        h3: ({ node, ...props }) => <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`} {...props} />,
        p: ({ node, ...props }) => <p className={`mb-4 leading-7 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} {...props} />,
        ul: ({ node, ...props }) => <ul className={`list-disc list-inside mb-4 pl-4 space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} {...props} />,
        ol: ({ node, ...props }) => <ol className={`list-decimal list-inside mb-4 pl-4 space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        strong: ({ node, ...props }) => <strong className={`${isDark ? 'text-white' : 'text-gray-900'}`} {...props} />,
        a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
        code: (props: any) => {
          const { children, className, inline } = props;
          
          if (inline) {
            return (
              <code className={`px-1 py-0.5 rounded ${isDark ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-red-600'} ${className || ''}`}>
                {children}
              </code>
            );
          }
          
          return (
            <pre className={`p-4 rounded-md overflow-x-auto my-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <code className={`${isDark ? 'text-gray-200' : 'text-gray-800'} ${className || ''}`}>
                {children}
              </code>
            </pre>
          );
        },
        table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className={`w-full text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`} {...props} /></div>,
        thead: ({ node, ...props }) => <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} {...props} />,
        th: ({ node, ...props }) => <th className={`p-2 border ${isDark ? 'border-gray-600' : 'border-gray-300'} font-semibold text-left`} {...props} />,
        td: ({ node, ...props }) => <td className={`p-2 border ${isDark ? 'border-gray-600' : 'border-gray-300'}`} {...props} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};
