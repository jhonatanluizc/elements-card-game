
import { Card as CardType } from '@/types/game';
import { cn } from '@/lib/utils';
import { Flame, Droplets, Wind, Mountain } from 'lucide-react';

interface CardProps {
  card?: CardType;
  isHidden?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const elementConfig = {
  fire: {
    icon: Flame,
    bg: 'bg-gradient-to-br from-orange-400 via-red-500 to-orange-600',
    border: 'border-red-400',
    glow: 'shadow-red-500/50'
  },
  water: {
    icon: Droplets,
    bg: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
    border: 'border-blue-400',
    glow: 'shadow-blue-500/50'
  },
  air: {
    icon: Wind,
    bg: 'bg-gradient-to-br from-gray-200 via-white to-gray-300',
    border: 'border-gray-300',
    glow: 'shadow-gray-400/50'
  },
  earth: {
    icon: Mountain,
    bg: 'bg-gradient-to-br from-yellow-600 via-yellow-700 to-amber-800',
    border: 'border-yellow-600',
    glow: 'shadow-yellow-600/50'
  }
};

const Card = ({ card, isHidden = false, isSelected = false, onClick, className, size = 'medium' }: CardProps) => {
  const sizeClasses = {
    small: 'w-16 h-24',
    medium: 'w-20 h-28',
    large: 'w-24 h-32'
  };

  if (isHidden) {
    return (
      <div 
        className={cn(
          'rounded-lg border-2 cursor-pointer transition-all duration-300',
          'bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800',
          'border-purple-400 shadow-lg hover:shadow-purple-500/50',
          'flex items-center justify-center',
          'hover:scale-105 hover:-translate-y-1',
          sizeClasses[size],
          className
        )}
        onClick={onClick}
      >
        <div className="text-purple-200 text-xs font-bold">?</div>
      </div>
    );
  }

  if (!card) return null;

  const config = elementConfig[card.element];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        'rounded-lg border-2 cursor-pointer transition-all duration-300',
        'shadow-lg hover:shadow-xl relative',
        config.bg,
        config.border,
        config.glow,
        'hover:scale-105 hover:-translate-y-1',
        isSelected && 'ring-4 ring-yellow-400 ring-opacity-75',
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      <div className="h-full flex flex-col items-center justify-between p-2">
        <div className={cn(
          'text-lg font-bold',
          card.element === 'air' ? 'text-gray-800' : 'text-white'
        )}>
          {card.value}
        </div>
        
        <Icon 
          className={cn(
            'w-6 h-6',
            card.element === 'air' ? 'text-gray-700' : 'text-white'
          )} 
        />
        
        <div className={cn(
          'text-xs font-semibold capitalize',
          card.element === 'air' ? 'text-gray-800' : 'text-white'
        )}>
          {card.element}
        </div>
      </div>
    </div>
  );
};

export default Card;
