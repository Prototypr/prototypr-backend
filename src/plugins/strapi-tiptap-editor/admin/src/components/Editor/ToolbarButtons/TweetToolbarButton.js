import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import React, {useState, useRef, useEffect} from "react"
import IconTwitter from "@strapi/icons/Twitter"
import { IconButton } from '@strapi/design-system/IconButton';
import { Stack } from '@strapi/design-system/Stack';
import { TextInput } from '@strapi/design-system/TextInput';
import { Button } from '@strapi/design-system/Button';

export const TweetToolbarButton = ({ editor, settings }) => {
    const [isVisibleDialog, setIsVisibleDialog] = useState(false);
    const [input, setInput] = useState('');
    
    const openDialog = () => {
        const previousUrl = editor.getAttributes('tweet').link
    
        // Update fields before showing dialog
        if(previousUrl) setInput(previousUrl)    
    
        setIsVisibleDialog(true)
      }
  
    const onInsertTweet = () => {
        // empty
      if (input === '') {
        alert('No tweet link')
      } else {
        // update link
        editor
          .chain()
          .focus()
          .insertTweet(input)
          .run()

          setIsVisibleDialog(false)
          setInput('')
      }

      }
  
    if (!editor) {
      return null
    }
  
    return (
        <>
         
         <Dialog onClose={() => setIsVisibleDialog(false)} title="Insert tweet link" isOpen={isVisibleDialog}>
              <DialogBody>
                <Stack spacing={2}>
                  <TextInput
                    label="Tweet URL"
                    placeholder="Write or paste the url here"
                    name="url" onChange={e => setInput(e.target.value)}
                    value={input}
                    aria-label="URL"/>
                </Stack>
              </DialogBody>
              <DialogFooter startAction={<Button onClick={() =>  {setInput(''); setIsVisibleDialog(false)}} variant="tertiary">
                Cancel
              </Button>} endAction={<Button onClick={() => onInsertTweet()} variant="success-light">
                Insert link
              </Button>} />
            </Dialog>

            { settings.links.enabled ? (<IconButton
              icon={<IconTwitter/>}
              label="Link"
              className={editor.isActive('tweet') ? 'is-active' : ''}
              onClick={() => openDialog()}
            />) : null }
        </>
    )
  }