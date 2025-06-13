import type { ICommand, IMarkdownEditor, ToolBarProps } from '@uiw/react-markdown-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface FullscreenButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  command: ICommand;
  editorProps: IMarkdownEditor & ToolBarProps;
  onClick?: (evn: React.MouseEvent<HTMLButtonElement, MouseEvent>, isFull: boolean) => void;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = (props) => {
  const { editorProps, command, onClick, ...reset } = props;
  const $height = useRef<number>(0);
  const [full, setFull] = useState(false);
  const scrollPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fullRef = useRef(full);
  const entriesHandle: ResizeObserverCallback = useCallback((entries: ResizeObserverEntry[]) => {
    for (const entry of entries) {
      if (!$height.current) {
        $height.current = entry.target.clientHeight;
      }
      if (editorProps.editor?.current?.view?.dom) {
        if (fullRef.current) {
          editorProps.editor.current.view.dom.style.height = `${entry.target.clientHeight}px`;
        } else {
          editorProps.editor.current.view.dom.removeAttribute('style');
        }
      }
    }
    robserver.current?.disconnect();
    robserver.current = undefined;
  }, [editorProps.editor]);

  const robserver = useRef<ResizeObserver | undefined>(new ResizeObserver(entriesHandle));

  useEffect(() => {
    if (!robserver.current) {
      robserver.current = new ResizeObserver(entriesHandle);
    }
    if (
      editorProps.containerEditor &&
      editorProps.containerEditor.current &&
      editorProps.containerEditor.current.parentElement &&
      robserver.current
    ) {
      const parentElement = editorProps.containerEditor.current.parentElement;
      robserver.current.observe(parentElement);
    }
    return () => {
      if (robserver.current) {
        robserver.current.disconnect();
        robserver.current = undefined;
      }
    };
  }, [editorProps.containerEditor, entriesHandle, editorProps.editor, full, robserver]);

  useEffect(() => {
    if (!document) return;
    if (editorProps && editorProps.container && editorProps.container.current && editorProps.editor) {
      const container = editorProps.container.current;
      if (full) {
        // Save current scroll position before hiding overflow
        scrollPosition.current = { x: window.scrollX, y: window.scrollY };
        document.body.style.overflow = 'hidden';
      } else {
        // Restore overflow and scroll position
        document.body.style.overflow = 'initial';
      }
      full
      ? document.body.classList.add(`${editorProps.prefixCls}-fullscreen`)
      : document.body.classList.remove(`${editorProps.prefixCls}-fullscreen`);
      if (container && full) {
        container.style.zIndex = '999';
        container.style.position = 'fixed';
        container.style.top = '0px';
        container.style.bottom = '0px';
        container.style.left = '0px';
        container.style.right = '0px';
      } else if (container) {
        container.style.position = 'initial';
        container.style.top = 'initial';
        container.style.bottom = 'initial';
        container.style.left = 'initial';
        container.style.right = 'initial';
        window.scrollTo(scrollPosition.current.x, scrollPosition.current.y);
      }
    }
  }, [full, editorProps]);

  const click = (evn: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const isFull = !full;
    fullRef.current = isFull;
    setFull(isFull);
    onClick?.(evn, isFull);
  };

  return (
    <button {...reset} onClick={click} type="button" className={full ? 'active' : ''}>
      {command.icon}
    </button>
  );
};

/* eslint react-refresh/only-export-components : 0 */
export const fullscreen: ICommand = {
  name: 'fullscreen',
  keyCommand: 'fullscreen',
  button: (command, props, opts) => <FullscreenButton command={command} editorProps={{ ...props, ...opts }} />,
  icon: (
    <svg fill="currentColor" viewBox="0 0 448 512" height="15" width="15">
      <path d="M128 32H32C14.31 32 0 46.31 0 64v96c0 17.69 14.31 32 32 32s32-14.31 32-32V96h64c17.69 0 32-14.31 32-32s-14.3-32-32-32zm288 0h-96c-17.69 0-32 14.31-32 32s14.31 32 32 32h64v64c0 17.69 14.31 32 32 32s32-14.31 32-32V64c0-17.69-14.3-32-32-32zM128 416H64v-64c0-17.69-14.31-32-32-32S0 334.31 0 352v96c0 17.69 14.31 32 32 32h96c17.69 0 32-14.31 32-32s-14.3-32-32-32zm288-96c-17.69 0-32 14.31-32 32v64h-64c-17.69 0-32 14.31-32 32s14.31 32 32 32h96c17.69 0 32-14.31 32-32v-96c0-17.7-14.3-32-32-32z" />
    </svg>
  ),
};
