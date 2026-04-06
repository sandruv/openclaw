declare module 'react-window' {
  import * as React from 'react';

  export interface ListChildComponentProps<T = any> {
    data: T;
    index: number;
    style: React.CSSProperties;
  }

  export interface FixedSizeListProps {
    children: React.ComponentType<ListChildComponentProps>;
    className?: string;
    height: number | string;
    itemCount: number;
    itemData?: any;
    itemSize: number;
    width: number | string;
    style?: React.CSSProperties;
  }

  export class FixedSizeList extends React.Component<FixedSizeListProps> {}
}
