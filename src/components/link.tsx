import type { LinkProps } from '@tanstack/react-router';

import * as Headless from '@headlessui/react';
import { Link as TanStackLink } from '@tanstack/react-router';
import React from 'react';

export function Link({
  ref,
  ...props
}: LinkProps & React.ComponentPropsWithoutRef<'a'> & { ref?: React.Ref<HTMLAnchorElement> }) {
  return (
    <Headless.DataInteractive>
      <TanStackLink {...props} ref={ref} />
    </Headless.DataInteractive>
  );
}
