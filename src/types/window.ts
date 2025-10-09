export interface WindowControlActions {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

export interface WindowControlsProps {
  isMaximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}
