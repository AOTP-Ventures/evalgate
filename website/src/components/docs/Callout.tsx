import { ReactNode } from 'react';
import { 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Zap,
  AlertCircle
} from 'lucide-react';

type CalloutType = 'info' | 'warning' | 'success' | 'error' | 'tip' | 'important' | 'note';

interface CalloutProps {
  type: CalloutType;
  title?: string;
  children: ReactNode;
}

const calloutConfig: Record<CalloutType, {
  icon: ReactNode;
  className: string;
  titleClassName: string;
}> = {
  info: {
    icon: <Info className="h-5 w-5" />,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    titleClassName: 'text-blue-900'
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    titleClassName: 'text-yellow-900'
  },
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    className: 'bg-green-50 border-green-200 text-green-800',
    titleClassName: 'text-green-900'
  },
  error: {
    icon: <XCircle className="h-5 w-5" />,
    className: 'bg-red-50 border-red-200 text-red-800',
    titleClassName: 'text-red-900'
  },
  tip: {
    icon: <Lightbulb className="h-5 w-5" />,
    className: 'bg-purple-50 border-purple-200 text-purple-800',
    titleClassName: 'text-purple-900'
  },
  important: {
    icon: <Zap className="h-5 w-5" />,
    className: 'bg-orange-50 border-orange-200 text-orange-800',
    titleClassName: 'text-orange-900'
  },
  note: {
    icon: <AlertCircle className="h-5 w-5" />,
    className: 'bg-gray-50 border-gray-200 text-gray-800',
    titleClassName: 'text-gray-900'
  }
};

export function Callout({ type, title, children }: CalloutProps) {
  const config = calloutConfig[type];
  
  return (
    <div className={`border-l-4 p-4 my-6 rounded-r-lg ${config.className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold mb-2 ${config.titleClassName}`}>
              {title}
            </h4>
          )}
          <div className="prose prose-sm max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Convenience components for common types
export const InfoCallout = ({ title, children }: Omit<CalloutProps, 'type'>) => (
  <Callout type="info" title={title}>{children}</Callout>
);

export const WarningCallout = ({ title, children }: Omit<CalloutProps, 'type'>) => (
  <Callout type="warning" title={title}>{children}</Callout>
);

export const TipCallout = ({ title, children }: Omit<CalloutProps, 'type'>) => (
  <Callout type="tip" title={title}>{children}</Callout>
);

export const SuccessCallout = ({ title, children }: Omit<CalloutProps, 'type'>) => (
  <Callout type="success" title={title}>{children}</Callout>
);
