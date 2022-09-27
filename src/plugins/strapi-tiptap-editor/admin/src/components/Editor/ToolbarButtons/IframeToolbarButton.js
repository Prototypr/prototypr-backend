import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import React, {useState, useRef, useEffect} from "react"
import IconCodeSquare from "@strapi/icons/Json"
import { IconButton } from '@strapi/design-system/IconButton';
import { Stack } from '@strapi/design-system/Stack';
import { TextInput } from '@strapi/design-system/TextInput';
import { Button } from '@strapi/design-system/Button';

export const IframeToolbarButton = ({ editor, settings }) => {
    const [isVisibleIframeDialog, setIsVisibleIframeDialog] = useState(false);
    const [iframeInput, setIframeInput] = useState('');
  
    const openIframeDialog = () => {
      const previousUrl = editor.getAttributes('iframe').src
  
      // Update fields before showing dialog
      if(previousUrl) setIframeInput(src)
  
      setIsVisibleIframeDialog(true)
    }
  
    const onInsertIframe = () => {
      // empty
      if (iframeInput === '') {
        alert('No iframe src')
      } else {
        // update link
        editor
          .chain()
          .focus()
          .setIframe({src: iframeInput})
          .run()

          setIsVisibleIframeDialog(false)
          setIframeInput('')
      }
    }
  
    if (!editor) {
      return null
    }
  
    return (
        <>
         {/* insert iframe */}
         { settings.links.enabled ? (<IconButton
                icon={<IconCodeSquare/>}
                label="Iframe Embed"
                className={editor.isActive('iframe') ? 'is-active' : ''}
                onClick={() => openIframeDialog()}
              />) : null }
  
              <Dialog onClose={() => setIsVisibleIframeDialog(false)} title="Insert Iframe Embed Link" isOpen={isVisibleIframeDialog}>
                <DialogBody>
                  <Stack spacing={2}>
                    <TextInput
                      label="Iframe URL"
                      placeholder="Write or paste the url here"
                      name="url" onChange={e => setIframeInput(e.target.value)}
                      value={iframeInput}
                      aria-label="URL"/>
                  </Stack>
                </DialogBody>
                <DialogFooter startAction={<Button onClick={() =>  {setIframeInput(''); setIsVisibleIframeDialog(false)}} variant="tertiary">
                  Cancel
                </Button>} endAction={<Button onClick={() => onInsertIframe()} variant="success-light">
                  Insert iframe embed
                </Button>} />
              </Dialog>
              {/* insert iframe */}
        </>
    )
  }