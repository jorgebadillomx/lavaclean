import React from 'react';

import { Colors } from '../theme/tokens';
import { Tag } from './Tag';

export function CancelledTag() {
  return (
    <Tag
      label="Cancelada"
      backgroundColor={Colors.tagCancelled}
      inkColor={Colors.tagCancelledInk}
    />
  );
}
