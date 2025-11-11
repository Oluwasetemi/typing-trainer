// Icon mappings for the typing trainer application
// Using react-icons for consistent, scalable SVG icons

import {
  IoStatsChart,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTrophy,
  IoRocket,
  IoGameController,
  IoFlag,
  IoTime,
  IoReload,
  IoAdd,
  IoEye,
  IoHappyOutline,
} from 'react-icons/io5';

import {
  TbTargetArrow,
  TbBarbell,
  TbThumbUp,
  TbDice,
} from 'react-icons/tb';

import {
  RiSpeedUpFill,
  RiFileTextLine,
} from 'react-icons/ri';

import {
  GiTrophyCup,
  GiPodiumWinner,
} from 'react-icons/gi';

// Export icon components with consistent sizing
export const Icons = {
  // Stats and metrics
  Stats: IoStatsChart,
  Lightning: RiSpeedUpFill,
  Target: TbTargetArrow,
  Timer: IoTime,
  FileText: RiFileTextLine,
  Check: IoCheckmarkCircle,
  Close: IoCloseCircle,
  
  // Competition and achievement
  Trophy: IoTrophy,
  TrophyCup: GiTrophyCup,
  Podium: GiPodiumWinner,
  Medal1st: GiPodiumWinner, // Will use with gold styling
  Medal2nd: GiPodiumWinner, // Will use with silver styling
  Medal3rd: GiPodiumWinner, // Will use with bronze styling
  Flag: IoFlag,
  
  // Actions and states
  Rocket: IoRocket,
  GameController: IoGameController,
  Reload: IoReload,
  Add: IoAdd,
  Eye: IoEye,
  Celebrate: IoHappyOutline,
  
  // Feedback
  Muscle: TbBarbell,
  ThumbUp: TbThumbUp,
  Dice: TbDice,
};

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
