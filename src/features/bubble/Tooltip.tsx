import React from 'react';

const defaultTooltipMessage = 'Hi There 👋!';
const defaultTooltipBackgroundColor = 'black';
const defaultTooltipTextColor = 'white';
const defaultTooltipFontSize = 16; // Default font size for tooltip

interface TooltipProps {
  showTooltip: boolean;
  position: { bottom: number; right: number };
  buttonSize: number;
  tooltipMessage?: string;
  tooltipBackgroundColor?: string;
  tooltipTextColor?: string;
  tooltipFontSize?: number; // Add tooltipFontSize to props
}

const Tooltip: React.FC<TooltipProps> = ({
  showTooltip,
  position,
  buttonSize,
  tooltipMessage = defaultTooltipMessage,
  tooltipBackgroundColor = defaultTooltipBackgroundColor,
  tooltipTextColor = defaultTooltipTextColor,
  tooltipFontSize = defaultTooltipFontSize,
}) => {
  const formattedTooltipMessage =
    tooltipMessage.length > 20
      ? tooltipMessage
          .split(' ')
          .reduce<string[][]>(
            (acc, curr) => {
              const last = acc[acc.length - 1];
              if (last && last.join(' ').length + curr.length <= 20) {
                last.push(curr);
              } else {
                acc.push([curr]);
              }
              return acc;
            },
            [[]],
          )
          .map((arr) => arr.join(' '))
          .join('\n')
      : tooltipMessage;

  if (!showTooltip) return null;

  return (
    <div
      className="tooltip"
      style={{
        right: `calc(${position.right}px + 20px)`,
        bottom: `${position.bottom + buttonSize + 10}px`,
        backgroundColor: tooltipBackgroundColor,
        color: tooltipTextColor,
        fontSize: `${tooltipFontSize}px`,
      }}
    >
      {formattedTooltipMessage}
    </div>
  );
};

export default Tooltip;
