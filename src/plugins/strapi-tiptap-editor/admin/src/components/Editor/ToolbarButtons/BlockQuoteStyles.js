import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import React, {useState} from "react"
import IconCog from "@strapi/icons/Cog"
import IconPencil from "@strapi/icons/Pencil"
import { IconButton } from '@strapi/design-system/IconButton';
import { Stack } from '@strapi/design-system/Stack';
import { Button } from '@strapi/design-system/Button';
import { Select, Option } from '@strapi/design-system/Select';

export const BlockQuoteStyles = ({ editor, settings }) => {
    const [isVisibleDialog, setIsVisibleDialog] = useState(false);
    const [selectedClass, setSelectedClass] = useState('');
    
    const openDialog = () => {
        const previousClass = editor.getAttributes('blockquote').class
    
        // Update fields before showing dialog
        if(previousClass) setSelectedClass(previousClass)
    
        setIsVisibleDialog(true)
      }
  
    const onUpdateQuote = () => {
        // empty
        if (selectedClass === '') {
         
    
        } else {
          // update link
          editor
            .chain()
            .focus()
            .updateAttributes('blockquote',{class: selectedClass})
            .run()
        }
    
    
        setIsVisibleDialog(false)
        setSelectedClass('')
      }
  
    if (!editor) {
      return null
    }
  
    return (
        <>
         
         <Dialog onClose={() => setIsVisibleDialog(false)} title="Edit Blockquote" isOpen={isVisibleDialog}>
              <DialogBody>
                <Stack spacing={2}>
                  <Select
                    id="blockQuoteSelect"
                    label="Blockquote style"
                    required
                    placeholder="Select blockquote style"
                    value={selectedClass}
                    onChange={setSelectedClass} >
                    <Option value={'wp-block-quote'}>Big</Option>
                    <Option value={'wp-quote-regular'}>Regular</Option>
                  </Select>
                </Stack>
              </DialogBody>
              <DialogFooter startAction={<Button onClick={() =>  {setSelectedClass(''); setIsVisibleDialog(false)}} variant="tertiary">
                Cancel
              </Button>} endAction={<Button onClick={() => onUpdateQuote()} variant="success-light">
                Update quote
              </Button>} />
            </Dialog>

            { editor.isActive('blockquote') ? (<IconButton
              icon={<IconCog/>}
              label="Link"
              className={editor.isActive('blockquote') ? 'is-active' : ''}
              onClick={() => openDialog()}
            />) : null }
            { editor.isActive('blockquote') ? (<IconButton
              icon={<IconPencil/>}
              label="Cite"
              className={editor.isActive('cite') ? 'is-active' : ''}
              onClick={() => 
                editor
                .chain()
                .focus()
                .extendMarkRange('cite')
                .setCite({})
                .run()
              }
            />) : null }
        </>
    )
  }