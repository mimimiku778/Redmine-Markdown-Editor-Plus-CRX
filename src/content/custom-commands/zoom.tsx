import type { ICommand, IMarkdownEditor, ToolBarProps } from '@uiw/react-markdown-editor'
import React, { useCallback, useState } from 'react'

const ZOOM_LEVEL: number[] = [100, 120, 140, 160]

interface ZoomDropdownProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  command: ICommand
  editorProps: IMarkdownEditor & ToolBarProps
  onZoomChange?: (zoom: number) => void
}

export const ZoomDropdown: React.FC<ZoomDropdownProps> = (props) => {
  const { editorProps, command, onZoomChange, ...reset } = props
  const [isOpen, setIsOpen] = useState(false)
  const [selectedZoom, setSelectedZoom] = useState(100)

  const handleZoomChange = useCallback(
    (zoom: number) => {
      setSelectedZoom(zoom)
      setIsOpen(false)
      onZoomChange?.(zoom)

      // Apply zoom to editor
      if (editorProps.container?.current) {
        const container = editorProps.container.current
        container.style.fontSize = `${zoom}%`
        ;(container.querySelector('.md-editor-toolbar-warp') as HTMLElement)!.style.zoom =
          `${zoom * 1.2}%`
        const preview = container.querySelector('.md-editor-preview') as HTMLElement
        preview && (preview.style.zoom = `${zoom}%`)
        const gutters = container.querySelector('.cm-gutters') as HTMLElement
        gutters &&
          (gutters.style.fontSize = `${10 * (zoom / 100)}px`) &&
          (gutters.style.lineHeight = `calc(${14 * (zoom / 100)}px * 1.5)`)
      }
    },
    [onZoomChange, editorProps.container]
  )

  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        {...reset}
        onClick={toggleDropdown}
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          minWidth: '60px',
          justifyContent: 'center',
        }}
      >
        {command.icon}
        {selectedZoom}%
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '80px',
          }}
        >
          {ZOOM_LEVEL.map((zoom) => (
            <button
              key={zoom}
              onClick={() => handleZoomChange(zoom)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: selectedZoom === zoom ? '#f0f0f0' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                height: '2rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0'
              }}
              onMouseLeave={(e) => {
                if (selectedZoom !== zoom) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {zoom}%
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* eslint react-refresh/only-export-components : 0 */
export const zoom: ICommand = {
  name: 'zoom',
  keyCommand: 'zoom',
  button: (command, props, opts) => (
    <ZoomDropdown command={command} editorProps={{ ...props, ...opts }} />
  ),
  icon: (
    <svg fill="currentColor" viewBox="0 0 512 512" height="15" width="15">
      <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM184 296c0 13.3 10.7 24 24 24s24-10.7 24-24V232h64c13.3 0 24-10.7 24-24s-10.7-24-24-24H232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24v64H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h64v64z" />
    </svg>
  ),
}
