import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import React, {useState, useRef, useEffect} from "react"
import IconVideo from "@strapi/icons/Play"
import { IconButton } from '@strapi/design-system/IconButton';
import { Stack } from '@strapi/design-system/Stack';
import { TextInput } from '@strapi/design-system/TextInput';
import { Button } from '@strapi/design-system/Button';

export const VideoButton = ({ editor, settings }) => {
    const [isVisibleDialog, setIsVisibleDialog] = useState(false);
    const [input, setInput] = useState('');
    const [cssClass, setCssClass] = useState('');
    const [w, setW] = useState('');
    const [h, setH] = useState('');

    const openDialog = () => {
        const previousUrl = editor.getAttributes('video').src
        const previousW = editor.getAttributes('video').width
        const previousH = editor.getAttributes('video').height
        const previousClass = editor.getAttributes('video').class
    
        // Update fields before showing dialog
        if(previousUrl) setInput(previousUrl)    
        if(previousW) setW(previousW)    
        if(previousH) setH(previousH)    
        if(previousClass) setCssClass(previousClass)    
    
        setIsVisibleDialog(true)
      }
  
    const onInsertVideo = () => {
        // empty
      if (input === '') {
        alert('No video src')
      } else {
        // update link
        editor
          .chain()
          .focus()
          .setVideo({src:input, height:h, width:w, classNames:cssClass})
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
         
         <Dialog onClose={() => setIsVisibleDialog(false)} title="Insert video link" isOpen={isVisibleDialog}>
              <DialogBody>
                <Stack spacing={2}>
                  <TextInput
                    label="Video URL"
                    placeholder="Write or paste the url here"
                    name="url" onChange={e => setInput(e.target.value)}
                    value={input}
                    aria-label="URL"/>
                  <TextInput
                    label="Width"
                    placeholder="Add a width, or leave blank"
                    name="width" onChange={b => setW(b.target.value)}
                    value={w}
                    aria-label="width"/>
                  <TextInput
                    label="Height"
                    placeholder="Add a height, or leave blank"
                    name="height" onChange={e => setH(e.target.value)}
                    value={h}
                    aria-label="height"/>
                  <TextInput
                    label="Class names"
                    placeholder="add tailwind classes e.g. w-full rounded shadow"
                    name="class" onChange={e => setCssClass(e.target.value)}
                    value={cssClass}
                    aria-label="Class"/>
                </Stack>
              </DialogBody>
              <DialogFooter startAction={<Button onClick={() =>  {setInput('');setW('');setH('');setCssClass(''); setIsVisibleDialog(false)}} variant="tertiary">
                Cancel
              </Button>} endAction={<Button onClick={() => onInsertVideo()} variant="success-light">
                Insert link
              </Button>} />
            </Dialog>

            { settings.links.enabled ? (<IconButton
              icon={<IconVideo/>}
              label="Link"
              className={editor.isActive('video') ? 'is-active' : ''}
              onClick={() => openDialog()}
            />) : null }
        </>
    )
  }