import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import React, {useState} from "react"
import IconLink from "@strapi/icons/Cog"
import { IconButton } from '@strapi/design-system/IconButton';
import { Stack } from '@strapi/design-system/Stack';
import { Button } from '@strapi/design-system/Button';
import { Select, Option } from '@strapi/design-system/Select';

export const ImageStyles = ({ editor, settings }) => {
    const [isVisibleDialog, setIsVisibleDialog] = useState(false);
    const [selectedClass, setSelectedClass] = useState('');
    
    const openDialog = () => {
        const previousClass = editor.getAttributes('figure').class
    
        // Update fields before showing dialog
        if(previousClass) setSelectedClass(previousClass)
    
        setIsVisibleDialog(true)
      }
  
    const onUpdateQuote = () => {
        // empty
        console.log(selectedClass)
        if (selectedClass === '') {
         
    
        } else {
          // update link
          editor
            .chain()
            .focus()
            .updateAttributes('figure',{class: selectedClass})
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
         
         <Dialog onClose={() => setIsVisibleDialog(false)} title="Edit Image Class" isOpen={isVisibleDialog}>
              <DialogBody>
                <Stack spacing={2}>
                  <Select
                    id="imageClassSelect"
                    label="Image style"
                    required
                    placeholder="Select image style"
                    value={selectedClass}
                    onChange={setSelectedClass} >
                    <Option value={'w-full'}>Big</Option>
                    <Option value={''}>Regular</Option>
                  </Select>
                </Stack>
              </DialogBody>
              <DialogFooter startAction={<Button onClick={() =>  {setSelectedClass(''); setIsVisibleDialog(false)}} variant="tertiary">
                Cancel
              </Button>} endAction={<Button onClick={() => onUpdateQuote()} variant="success-light">
                Update quote
              </Button>} />
            </Dialog>

            { editor.isActive('figure')? (<IconButton
              icon={<IconLink/>}
              label="Link"
              className={editor.isActive('figure') ? 'is-active' : ''}
              onClick={() => openDialog()}
            />) : null }
        </>
    )
  }