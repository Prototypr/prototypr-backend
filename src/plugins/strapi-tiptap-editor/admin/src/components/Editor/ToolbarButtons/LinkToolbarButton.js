import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import React, {useState, useRef, useEffect} from "react"
import IconLink from "@strapi/icons/Link"
import { IconButton } from '@strapi/design-system/IconButton';
import { Stack } from '@strapi/design-system/Stack';
import { TextInput } from '@strapi/design-system/TextInput';
import { Button } from '@strapi/design-system/Button';
import { Select, Option } from '@strapi/design-system/Select';

export const LinkToolbarButton = ({ editor, settings }) => {
    const [isVisibleDialog, setIsVisibleDialog] = useState(false);
    const [input, setInput] = useState('');
    const [targetInput, setTargetInput] = useState('');
    const [linkRelInput, setLinkRelInput] = useState('');
    
    const openDialog = () => {
        const previousUrl = editor.getAttributes('link').href
        const previousTarget = editor.getAttributes('link').target
        const previousRel = editor.getAttributes('link').rel
    
        // Update fields before showing dialog
        if(previousUrl) setInput(previousUrl)
        if(previousTarget) setTargetInput(previousTarget)
        if(previousRel) setLinkRelInput(previousRel)
    
    
        setIsVisibleDialog(true)
      }
  
    const onInsertLink = () => {
        // empty
        if (input === '') {
          editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .unsetLink()
            .run()
    
        } else {
          // update link
          editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({href: input, target: targetInput, rel:linkRelInput?linkRelInput:''})
            .run()
        }
    
    
        setIsVisibleDialog(false)
        setInput('')
        setTargetInput('')
      }
  
    if (!editor) {
      return null
    }
  
    return (
        <>
         
         <Dialog onClose={() => setIsVisibleDialog(false)} title="Insert link" isOpen={isVisibleDialog}>
              <DialogBody>
                <Stack spacing={2}>
                  <TextInput
                    label="Link URL"
                    placeholder="Write or paste the url here"
                    name="url" onChange={e => setInput(e.target.value)}
                    value={input}
                    aria-label="URL"/>
                  <Select
                    id="linkTargetSelect"
                    label="Link target"
                    required
                    placeholder="Select link target"
                    value={targetInput}
                    onChange={setTargetInput} >
                    <Option value={'_self'}>Self</Option>
                    <Option value={'_blank'}>Blank</Option>
                    <Option value={'_parent'}>Parent</Option>
                    <Option value={'_top'}>Top</Option>
                  </Select>
                  <TextInput
                  label="Link Rel"
                  placeholder="Link rel - noopener noreferrer nofollow"
                  name="rel" onChange={e => setLinkRelInput(e.target.value)}
                  value={linkRelInput}
                  aria-label="REL"/>
                </Stack>
              </DialogBody>
              <DialogFooter startAction={<Button onClick={() =>  {setInput(''); setTargetInput('');setTargetInput(''); setIsVisibleDialog(false)}} variant="tertiary">
                Cancel
              </Button>} endAction={<Button onClick={() => onInsertLink()} variant="success-light">
                Insert link
              </Button>} />
            </Dialog>

            { settings.links.enabled ? (<IconButton
              icon={<IconLink/>}
              label="Link"
              className={editor.isActive('link') ? 'is-active' : ''}
              onClick={() => openDialog()}
            />) : null }
        </>
    )
  }