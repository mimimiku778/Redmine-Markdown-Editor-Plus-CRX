import { Page, Locator } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * File operation utilities for Playwright tests
 */

// Common file operations
interface FileInfo {
  buffer: Buffer
  mimeType: string
  name: string
}

/**
 * Read file and determine MIME type
 */
function prepareFileInfo(filePath: string): FileInfo {
  const absolutePath = path.resolve(filePath)
  const buffer = fs.readFileSync(absolutePath)
  const extension = path.extname(filePath).toLowerCase()
  const name = path.basename(filePath)
  
  let mimeType: string
  switch (extension) {
    case '.png':
      mimeType = 'image/png'
      break
    case '.jpg':
    case '.jpeg':
      mimeType = 'image/jpeg'
      break
    case '.gif':
      mimeType = 'image/gif'
      break
    case '.webp':
      mimeType = 'image/webp'
      break
    case '.pdf':
      mimeType = 'application/pdf'
      break
    case '.txt':
      mimeType = 'text/plain'
      break
    default:
      mimeType = 'application/octet-stream'
  }
  
  return { buffer, mimeType, name }
}

/**
 * Set file to clipboard and paste it to the page
 * @param page Playwright page object
 * @param filePath Path to the file to paste (relative to project root)
 * @param mimeType Custom MIME type (optional, auto-detected if not provided)
 * @param waitTime Wait time after paste in milliseconds (default: 1000)
 */
export async function pasteFileFromClipboard(
  page: Page,
  filePath: string,
  mimeType?: string,
  waitTime: number = 1000
): Promise<void> {
  const fileInfo = prepareFileInfo(filePath)
  const finalMimeType = mimeType || fileInfo.mimeType
  
  console.log('📎 Preparing to paste file:', filePath, `(${finalMimeType})`)

  try {
    await page.evaluate(
      async ({ bufferArray, type }: { bufferArray: number[]; type: string }) => {
        try {
          const uint8Array = new Uint8Array(bufferArray)
          const blob = new Blob([uint8Array], { type })
          const clipboardItem = new ClipboardItem({ [type]: blob })

          await navigator.clipboard.write([clipboardItem])
          console.log('✅ File set to clipboard successfully')
        } catch (error) {
          console.log('❌ Failed to set file to clipboard:', error)
          throw error
        }
      },
      { bufferArray: Array.from(fileInfo.buffer), type: finalMimeType }
    )

    console.log('📋 Attempting to paste file from clipboard')
    await page.keyboard.press('Control+v')
    await page.waitForTimeout(waitTime)
    console.log('✅ File pasted successfully')
  } catch (error) {
    console.error('❌ Failed to paste file from clipboard:', error)
    throw error
  }
}

/**
 * Drag and drop file to specified selector
 * @param page Playwright page object
 * @param filePath Path to the file to drop (relative to project root)
 * @param targetSelector CSS selector of the drop target
 * @param waitTime Wait time after drop operation in milliseconds (default: 1000)
 */
export async function dragAndDropFile(
  page: Page,
  filePath: string,
  targetSelector: string,
  waitTime: number = 1000
): Promise<void> {
  const fileInfo = prepareFileInfo(filePath)
  console.log('🗂️ Preparing to drag and drop file:', filePath, 'to', targetSelector)

  try {
    // Simulate drag and drop using DataTransfer API
    await page.evaluate(
      async ({ 
        bufferArray, 
        mimeType, 
        fileName, 
        selector 
      }: { 
        bufferArray: number[]
        mimeType: string
        fileName: string
        selector: string 
      }) => {
        const target = document.querySelector(selector)
        if (!target) {
          throw new Error(`Target element not found: ${selector}`)
        }

        // Create file object
        const uint8Array = new Uint8Array(bufferArray)
        const file = new File([uint8Array], fileName, { type: mimeType })

        // Create DataTransfer object
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)

        // Create custom FileList-like object
        const fileList = {
          0: file,
          length: 1,
          item: (index: number) => index === 0 ? file : null
        }
        
        // Override the files property
        Object.defineProperty(dataTransfer, 'files', {
          value: fileList,
          writable: false
        })

        // Simulate drag events
        const dragEnterEvent = new DragEvent('dragenter', {
          bubbles: true,
          cancelable: true,
          dataTransfer
        })

        const dragOverEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer
        })

        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer
        })

        // Trigger events
        target.dispatchEvent(dragEnterEvent)
        target.dispatchEvent(dragOverEvent)
        target.dispatchEvent(dropEvent)

        console.log('✅ File dropped successfully')
      },
      {
        bufferArray: Array.from(fileInfo.buffer),
        mimeType: fileInfo.mimeType,
        fileName: fileInfo.name,
        selector: targetSelector
      }
    )

    await page.waitForTimeout(waitTime)
    console.log('✅ Drag and drop operation completed')
  } catch (error) {
    console.error('❌ Failed to drag and drop file:', error)
    throw error
  }
}

/**
 * Convenient function to paste image file from clipboard
 * @param page Playwright page object
 * @param imagePath Path to the image file (relative to project root)
 * @param waitTime Wait time after paste in milliseconds (default: 1000)
 */
export async function pasteImageFromClipboard(
  page: Page,
  imagePath: string,
  waitTime: number = 1000
): Promise<void> {
  await pasteFileFromClipboard(page, imagePath, undefined, waitTime)
}

/**
 * Convenient function to drag and drop image file
 * @param page Playwright page object
 * @param imagePath Path to the image file (relative to project root)
 * @param targetSelector CSS selector of the drop target
 * @param waitTime Wait time after drop operation in milliseconds (default: 1000)
 */
export async function dragAndDropImage(
  page: Page,
  imagePath: string,
  targetSelector: string,
  waitTime: number = 1000
): Promise<void> {
  await dragAndDropFile(page, imagePath, targetSelector, waitTime)
}