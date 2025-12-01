// Icon mappings for the typing trainer application
// Using lucide-react for consistent, scalable SVG icons

import type { LucideIcon } from 'lucide-react';

import {
  BarChart3,
  Check,
  CheckCircle,
  Clipboard,
  Dices,
  Dumbbell,
  Eye,
  Flag,
  Gamepad2,
  Menu,
  Moon,
  PartyPopper,
  Plus,
  RefreshCw,
  Rocket,
  Settings,
  Sparkles,
  Sun,
  Target,
  ThumbsUp,
  Timer,
  Trophy,
  UserPlus,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react';

// Export icon components with consistent sizing
export const Icons = {
  // Stats and metrics
  Stats: BarChart3,
  Lightning: Zap,
  Target,
  Timer,
  FileText: Clipboard,
  Check: CheckCircle,
  Close: XCircle,

  // Competition and achievement
  Trophy,
  TrophyCup: Trophy,
  Podium: Trophy,
  Medal1st: Trophy, // Will use with gold styling
  Medal2nd: Trophy, // Will use with silver styling
  Medal3rd: Trophy, // Will use with bronze styling
  Flag,

  // Actions and states
  Rocket,
  GameController: Gamepad2,
  Reload: RefreshCw,
  Add: Plus,
  Eye,
  Celebrate: PartyPopper,

  // People
  Person: Users,
  PersonAdd: UserPlus,

  // Feedback
  Muscle: Dumbbell,
  ThumbUp: ThumbsUp,
  Dice: Dices,

  // Navigation
  Menu,
  CloseMenu: X,
  Notifications: Check,
  Settings,

  // Theme
  Sun,
  Moon,
  Sparkles,
} as const;

// Icon wrapper component for consistent styling
type IconProps = {
  icon: keyof typeof Icons;
  className?: string;
  size?: number;
};

export function Icon({ icon, className = '', size = 20 }: IconProps) {
  const IconComponent = Icons[icon];
  return <IconComponent className={className} size={size} />;
}

// Export the LucideIcon type for use in other components
export type { LucideIcon };
