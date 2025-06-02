import React from 'react'

export function useDragAndDrop(
  textarea: HTMLTextAreaElement
): {
  handleDragOver: (event: React.DragEvent) => void
  handleDrop: (event: React.DragEvent) => void
} {

  // より正確なカーソル位置計算
  const getTextPositionFromMouseEvent = React.useCallback((event: React.DragEvent) => {
    const editorTextarea = document.querySelector('.w-md-editor textarea') as HTMLTextAreaElement
    if (!editorTextarea) {
      console.log('[DragDrop] Editor textarea not found')
      return 0
    }

    console.log('[DragDrop] Mouse position:', { x: event.clientX, y: event.clientY })

    // エディタのバウンディングボックスを取得
    const rect = editorTextarea.getBoundingClientRect()
    const relativeX = event.clientX - rect.left
    const relativeY = event.clientY - rect.top

    console.log('[DragDrop] Editor bounds:', rect)
    console.log('[DragDrop] Relative position:', { x: relativeX, y: relativeY })

    // 範囲内チェック
    if (relativeX < 0 || relativeX > rect.width || relativeY < 0 || relativeY > rect.height) {
      console.log('[DragDrop] Mouse outside editor bounds')
      return editorTextarea.selectionStart || 0
    }

    try {
      // 新しいAPIを使用してカーソル位置を計算
      if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(event.clientX, event.clientY)
        if (range && editorTextarea.contains(range.startContainer)) {
          const textNode = range.startContainer
          const offset = range.startOffset
          
          // テキストノード内のオフセットをtextarea全体のオフセットに変換
          if (textNode.nodeType === Node.TEXT_NODE) {
            const beforeText = editorTextarea.value.substring(0, offset)
            console.log('[DragDrop] Calculated position:', offset, 'text before:', beforeText.slice(-10))
            return offset
          }
        }
      }

      // フォールバック: 行ベースの計算
      const lineHeight = parseInt(getComputedStyle(editorTextarea).lineHeight) || 20
      const lines = editorTextarea.value.split('\n')
      const targetLine = Math.floor(relativeY / lineHeight)
      
      if (targetLine >= 0 && targetLine < lines.length) {
        let position = 0
        for (let i = 0; i < targetLine; i++) {
          position += lines[i].length + 1 // +1 for newline
        }
        
        // 行内の位置を推定
        const charWidth = 8 // 平均文字幅の推定
        const charInLine = Math.floor(relativeX / charWidth)
        position += Math.min(charInLine, lines[targetLine].length)
        
        console.log('[DragDrop] Line-based calculation:', { line: targetLine, position })
        return position
      }
    } catch (error) {
      console.error('[DragDrop] Error calculating position:', error)
    }
    
    // 最終フォールバック
    console.log('[DragDrop] Using fallback position:', editorTextarea.selectionStart)
    return editorTextarea.selectionStart || 0
  }, [])

  const handleDragOver = React.useCallback((event: React.DragEvent) => {
    if (event.dataTransfer && event.dataTransfer.types.includes('Files')) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      
      console.log('[DragDrop] Drag over detected')
      
      // カーソル位置の更新をリアルタイムで行う
      const editorTextarea = document.querySelector('.w-md-editor textarea') as HTMLTextAreaElement
      if (editorTextarea) {
        const textPosition = getTextPositionFromMouseEvent(event)
        
        // エディタにフォーカスしてカーソル位置を更新
        editorTextarea.focus()
        editorTextarea.setSelectionRange(textPosition, textPosition)
        
        console.log('[DragDrop] Updated cursor position to:', textPosition)
      }
    }
  }, [getTextPositionFromMouseEvent])

  const handleDrop = React.useCallback((event: React.DragEvent) => {
    if (event.dataTransfer && event.dataTransfer.types.includes('Files')) {
      event.preventDefault()
      
      console.log('[DragDrop] Drop detected', event.dataTransfer.files)
      
      const dropPosition = getTextPositionFromMouseEvent(event)
      console.log('[DragDrop] Final drop position:', dropPosition)
      
      // Redmineのネイティブドラッグ&ドロップ機能を活用
      // エディタのカーソル位置を設定
      const editorTextarea = document.querySelector('.w-md-editor textarea') as HTMLTextAreaElement
      if (editorTextarea) {
        editorTextarea.focus()
        editorTextarea.setSelectionRange(dropPosition, dropPosition)
      }
      
      // オリジナルtextareaに同期してRedmineの処理を引き継ぐ
      textarea.focus()
      textarea.setSelectionRange(dropPosition, dropPosition)
      
      // 一時的にオリジナルtextareaを表示してドロップイベントを転送
      const originalDisplay = textarea.style.display
      textarea.style.display = 'block'
      textarea.style.position = 'absolute'
      textarea.style.top = '0'
      textarea.style.left = '0'
      textarea.style.zIndex = '9999'
      
      // クローンイベントを作成
      const clonedEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: event.dataTransfer,
        clientX: event.clientX,
        clientY: event.clientY,
        view: window
      })
      
      // イベントを転送
      setTimeout(() => {
        textarea.dispatchEvent(clonedEvent)
        
        // 元の状態に戻す
        setTimeout(() => {
          textarea.style.display = originalDisplay
          textarea.style.position = ''
          textarea.style.top = ''
          textarea.style.left = ''
          textarea.style.zIndex = ''
        }, 50)
      }, 10)
    }
  }, [textarea, getTextPositionFromMouseEvent])

  return {
    handleDragOver,
    handleDrop,
  }
}