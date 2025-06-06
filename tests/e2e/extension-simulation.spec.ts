import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test.describe('Markdown Editor Extension Simulation', () => {
  test.beforeEach(async ({ page }) => {
    // Load mock Redmine issue page
    const mockPath = path.join(__dirname, 'mocks', 'redmine-issue.html')
    await page.goto(`file://${mockPath}`)
    
    // Inject the extension's content script logic simulation
    await page.addScriptTag({
      content: `
        // Simulate extension behavior
        const textarea = document.querySelector('#issue_notes');
        if (textarea) {
          // Create mock editor overlay
          const editorContainer = document.createElement('div');
          editorContainer.className = 'w-md-editor';
          editorContainer.style.position = 'relative';
          editorContainer.style.width = textarea.offsetWidth + 'px';
          editorContainer.style.height = textarea.offsetHeight + 'px';
          
          // Create mock editor textarea
          const editorTextarea = document.createElement('textarea');
          editorTextarea.className = 'w-md-editor-text-input';
          editorTextarea.value = textarea.value;
          editorTextarea.style.width = '100%';
          editorTextarea.style.height = '100%';
          
          editorContainer.appendChild(editorTextarea);
          
          // Insert editor after textarea
          textarea.parentNode.insertBefore(editorContainer, textarea.nextSibling);
          
          // Hide original textarea
          textarea.style.display = 'none';
          
          // Sync from editor to textarea
          editorTextarea.addEventListener('input', () => {
            textarea.value = editorTextarea.value;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          });
          
          // Sync from textarea to editor
          textarea.addEventListener('input', () => {
            editorTextarea.value = textarea.value;
          });
          
          // Drag and drop event propagation
          editorContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            // Calculate position and update textarea cursor
            const rect = editorTextarea.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;
            const lineHeight = 20; // Approximate line height
            const line = Math.floor(relativeY / lineHeight);
            
            // Set cursor position in textarea
            const lines = textarea.value.split('\\n');
            let position = 0;
            for (let i = 0; i < Math.min(line, lines.length); i++) {
              position += lines[i].length + 1;
            }
            textarea.setSelectionRange(position, position);
            
            // Forward event to textarea
            const newEvent = new DragEvent('dragover', e);
            textarea.dispatchEvent(newEvent);
          });
          
          editorContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            // Forward event to textarea with current cursor position
            const newEvent = new DragEvent('drop', e);
            textarea.dispatchEvent(newEvent);
          });
          
          // Paste event propagation
          editorTextarea.addEventListener('paste', (e) => {
            // Forward paste event to textarea
            const newEvent = new ClipboardEvent('paste', {
              clipboardData: e.clipboardData,
              bubbles: true
            });
            textarea.dispatchEvent(newEvent);
          });
        }
      `
    })
  })

  test('should overlay ReactMarkdownEditor on Redmine textarea', async ({ page }) => {
    // Check if markdown editor is rendered
    const markdownEditor = await page.locator('.w-md-editor')
    await expect(markdownEditor).toBeVisible()
    
    // Check if original textarea is hidden
    const originalTextarea = await page.locator('#issue_notes')
    await expect(originalTextarea).toBeHidden()
    
    // Check if editor is positioned correctly
    const editorBox = await markdownEditor.boundingBox()
    expect(editorBox).toBeTruthy()
    expect(editorBox!.width).toBeGreaterThan(0)
    expect(editorBox!.height).toBeGreaterThan(0)
  })

  test('should sync content from ReactMarkdownEditor to textarea', async ({ page }) => {
    // Clear and type in the markdown editor
    const editor = await page.locator('.w-md-editor-text-input')
    await editor.click()
    await editor.fill('# Test Header\n\nThis is test content from editor.')
    
    // Check if content is synced to original textarea
    const textareaValue = await page.locator('#issue_notes').evaluate(
      el => (el as HTMLTextAreaElement).value
    )
    expect(textareaValue).toBe('# Test Header\n\nThis is test content from editor.')
  })

  test('should sync content from textarea to ReactMarkdownEditor', async ({ page }) => {
    // Directly set value to textarea and trigger input event
    await page.evaluate(() => {
      const textarea = document.querySelector('#issue_notes') as HTMLTextAreaElement
      if (textarea) {
        textarea.value = '## Updated from textarea\n\nThis content was set directly.'
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })
    
    // Check if content is synced to markdown editor
    const editorValue = await page.locator('.w-md-editor-text-input').evaluate(
      el => (el as HTMLTextAreaElement).value
    )
    expect(editorValue).toBe('## Updated from textarea\n\nThis content was set directly.')
  })

  test('should propagate drag and drop events to textarea with cursor position', async ({ page }) => {
    // Set initial content
    const initialContent = 'Line 1\nLine 2\nLine 3'
    await page.locator('.w-md-editor-text-input').fill(initialContent)
    
    // Set up event tracking
    await page.evaluate(() => {
      const textarea = document.querySelector('#issue_notes') as HTMLTextAreaElement
      
      // Store events in window object
      (window as any).capturedEvents = []
      
      textarea.addEventListener('dragover', (e) => {
        (window as any).capturedEvents.push({
          type: 'dragover',
          clientX: e.clientX,
          clientY: e.clientY,
          target: e.target === textarea,
          cursorPosition: textarea.selectionStart
        })
      })
      
      textarea.addEventListener('drop', (e) => {
        (window as any).capturedEvents.push({
          type: 'drop',
          clientX: e.clientX,
          clientY: e.clientY,
          target: e.target === textarea,
          cursorPosition: textarea.selectionStart
        })
      })
    })
    
    // Simulate drag and drop on the editor
    const editor = await page.locator('.w-md-editor')
    const box = await editor.boundingBox()
    if (!box) throw new Error('Could not get editor bounds')
    
    // Simulate drag over
    await page.evaluate((coords) => {
      const editorContainer = document.querySelector('.w-md-editor')
      if (editorContainer) {
        const dragOverEvent = new DragEvent('dragover', {
          clientX: coords.x,
          clientY: coords.y,
          bubbles: true,
          cancelable: true
        })
        editorContainer.dispatchEvent(dragOverEvent)
      }
    }, { x: box.x + box.width / 2, y: box.y + 30 })
    
    // Simulate drop
    await page.evaluate((coords) => {
      const editorContainer = document.querySelector('.w-md-editor')
      if (editorContainer) {
        const dropEvent = new DragEvent('drop', {
          clientX: coords.x,
          clientY: coords.y,
          bubbles: true,
          cancelable: true
        })
        editorContainer.dispatchEvent(dropEvent)
      }
    }, { x: box.x + box.width / 2, y: box.y + 30 })
    
    // Get captured events
    const capturedEvents = await page.evaluate(() => {
      return (window as any).capturedEvents || []
    })
    
    // Verify that events were propagated to textarea
    const dragOverEvents = capturedEvents.filter((e: any) => e.type === 'dragover')
    const dropEvents = capturedEvents.filter((e: any) => e.type === 'drop')
    
    expect(dragOverEvents.length).toBeGreaterThan(0)
    expect(dropEvents.length).toBeGreaterThan(0)
    
    // Verify cursor position was set
    if (dragOverEvents.length > 0) {
      const lastDragOver = dragOverEvents[dragOverEvents.length - 1]
      expect(lastDragOver.cursorPosition).toBeDefined()
      expect(lastDragOver.cursorPosition).toBeGreaterThan(0) // Should be after "Line 1\n"
    }
  })

  test('should propagate clipboard paste events to textarea', async ({ page }) => {
    // Set initial content
    await page.locator('.w-md-editor-text-input').fill('Initial content')
    
    // Set up event tracking for paste events
    await page.evaluate(() => {
      const textarea = document.querySelector('#issue_notes') as HTMLTextAreaElement
      
      // Store events in window object
      (window as any).capturedPasteEvents = []
      
      textarea.addEventListener('paste', (e) => {
        (window as any).capturedPasteEvents.push({
          type: 'paste',
          hasClipboardData: !!e.clipboardData,
          dataTypes: e.clipboardData ? Array.from(e.clipboardData.types) : [],
          target: e.target === textarea
        })
        e.preventDefault() // Prevent default to control the test
      })
    })
    
    // Focus on the editor
    const editor = await page.locator('.w-md-editor-text-input')
    await editor.click()
    
    // Simulate paste event with image data
    await page.evaluate(() => {
      const editorTextarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement
      if (editorTextarea) {
        // Create a mock clipboard event with image data
        const dataTransfer = new DataTransfer()
        
        // Add a mock file (image)
        const blob = new Blob(['fake image data'], { type: 'image/png' })
        const file = new File([blob], 'test-image.png', { type: 'image/png' })
        dataTransfer.items.add(file)
        
        const pasteEvent = new ClipboardEvent('paste', {
          clipboardData: dataTransfer,
          bubbles: true
        })
        
        editorTextarea.dispatchEvent(pasteEvent)
      }
    })
    
    // Get captured paste events
    const capturedPasteEvents = await page.evaluate(() => {
      return (window as any).capturedPasteEvents || []
    })
    
    // Verify that paste event was propagated to textarea
    expect(capturedPasteEvents.length).toBeGreaterThan(0)
    
    const pasteEvent = capturedPasteEvents[0]
    expect(pasteEvent.type).toBe('paste')
    expect(pasteEvent.hasClipboardData).toBe(true)
    expect(pasteEvent.dataTypes).toContain('Files')
    expect(pasteEvent.target).toBe(true)
  })
})