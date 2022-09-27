import React, {useState, Fragment} from 'react';
import PropTypes from 'prop-types';

// TipTap Editor
import {EditorContent, FloatingMenu, BubbleMenu} from '@tiptap/react'
import {useEditor} from '@tiptap/react'
import {Extension, mergeAttributes, wrappingInputRule} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExtension from '@tiptap/extension-underline'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import TextAlignExtension from '@tiptap/extension-text-align'
import TableExtension from '@tiptap/extension-table'
import TableRowExtension from '@tiptap/extension-table-row'
import TableCellExtension from '@tiptap/extension-table-cell'
import TableHeaderExtension from '@tiptap/extension-table-header'
import TextStyleExtension from '@tiptap/extension-text-style'
import { Color as ColorExtension } from '@tiptap/extension-color'
import packageInfo from '../../../../package.json'
import {Toolbar} from "./Toolbar";
import { Waypoint } from 'react-waypoint';

// Media library
import MediaLib from "../MediaLib";

// Layout
import {Box} from '@strapi/design-system/Box';
import {Flex} from '@strapi/design-system/Flex';
import {IconButton, IconButtonGroup} from '@strapi/design-system/IconButton';

import Wrapper from './styles.js'

// Icons
import {
  AiOutlineTable,
  AiOutlineInsertRowBelow,
  AiOutlineInsertRowAbove,
  AiOutlineInsertRowRight,
  AiOutlineInsertRowLeft,
  AiOutlineDeleteColumn,
  AiOutlineDeleteRow,
  AiOutlineDelete,
  AiOutlineMergeCells,
  AiOutlineSplitCells
} from 'react-icons/ai';
import PaintBrush from '@strapi/icons/PaintBrush.js'





const TableMenuBar = (editor) => {
  return (
    <Fragment key="tableMenubar">
      <IconButtonGroup className="button-group">
        <IconButton
          icon={<AiOutlineInsertRowBelow/>}
          label="Insert row below"
          onClick={() => editor.chain().focus().addRowAfter().run()}
        />
        <IconButton
          icon={<AiOutlineInsertRowAbove/>}
          label="Insert row above"
          onClick={() => editor.chain().focus().addRowBefore().run()}
        />

        <IconButton
          icon={<AiOutlineInsertRowLeft/>}
          label="Insert Column to the left"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
        />

        <IconButton
          icon={<AiOutlineInsertRowRight/>}
          label="Insert Column to the right"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        />
      </IconButtonGroup>

      <IconButtonGroup className="button-group">
        <IconButton
          icon={<AiOutlineDeleteRow/>}
          label="Delete row"
          onClick={() => editor.chain().focus().deleteRow().run()}
        />
        <IconButton
          icon={<AiOutlineDeleteColumn/>}
          label="Delete column"
          onClick={() => editor.chain().focus().deleteColumn().run()}
        />
      </IconButtonGroup>

      <IconButtonGroup className="button-group">
        <IconButton
          icon={<AiOutlineMergeCells/>}
          label="Merge cells"
          onClick={() => editor.chain().focus().mergeCells().run()}
        />
        <IconButton
          icon={<AiOutlineSplitCells/>}
          label="Split cells"
          onClick={() => editor.chain().focus().splitCell().run()}
        />
      </IconButtonGroup>

      <IconButtonGroup className="button-group">
        <IconButton
          icon={<AiOutlineDelete/>}
          label="Delete table"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete the table?')) {
              editor.chain().focus().deleteTable().run()
            }
          }}
        />
      </IconButtonGroup>
    </Fragment>
  )
}


// Floating bubble menu for table
const BubbleMenuComponent = ({editor, toggleMediaLib}) => {
  if (editor) {
    let menuBars = []

    if (editor.isActive('table')) {
      menuBars.push(TableMenuBar(editor))
    }

    return (
      <BubbleMenu editor={editor} tippyOptions={{zIndex: 2, maxWidth: '450px'}}>
        {menuBars.length ? (
          <Flex padding={2} className="menu-bar floating" style={{flexWrap: 'wrap'}}>
            {/* Render menu bars */}
            {menuBars}
          </Flex>
        ) : null}
      </BubbleMenu>
    )
  }
  return null
}


const Editor = ({onChange, name, value, editor, disabled, settings}) => {
  // Media library handling
  const [mediaLibVisible, setMediaLibVisible] = useState(false);
  const [forceInsert, setForceInsert] = useState(false);
  const handleToggleMediaLib = () => setMediaLibVisible(prev => !prev);
  const [toolbarSticky, setToolbarSticky] = useState(false)

  const handleChangeAssets = assets => {
    if (!forceInsert && editor.isActive('figure')) {
      assets.map(asset => {
        if (asset.mime?.includes('image')) {
          editor.chain().focus().setFigure({src: asset.url, caption:asset.caption}).run()
        }
      })
    } else {
      assets.map(asset => {
        if (asset.mime?.includes('image')) {
          editor.commands.setFigure({src: asset.url, alt: asset.alt, caption:asset.caption})
        }
      });
    }

    setForceInsert(false)
    handleToggleMediaLib()
  };

  // Wait till we have the settings before showing the editor
  if (!settings) {
    return null
  }

  const strapiHeader = document.querySelector('[data-strapi-header-sticky]')
  let navWidth = '0px'
  if(strapiHeader){
    navWidth=strapiHeader.getAttribute('width')+'px'
  }

  return (
    <Wrapper>
        <Waypoint scrollableAncestor={'window'} 
        onEnter={()=>{
          setTimeout(()=>{
            setToolbarSticky(false);
          },100)
        }} 
        onLeave={()=>{
          setTimeout(()=>{
            setToolbarSticky(true);
          },50)
        }}/>
         
      <Box hasRadius={true} overflow={'hidden'} style={{marginTop:toolbarSticky?'30px':''}} borderWidth="1px" borderStyle="solid" borderColor="neutral200">
        <Toolbar editor={editor} width={navWidth} sticky={toolbarSticky} toggleMediaLib={handleToggleMediaLib} settings={settings}/>
        <BubbleMenuComponent editor={editor} toggleMediaLib={handleToggleMediaLib}/>
        
          <Box padding={2} background="neutral0" maxHeight={'900px'} style={{resize: 'vertical', overflow: 'auto'}}>
            <EditorContent editor={editor}/>
          </Box>

          <Waypoint scrollableAncestor={'window'} 
          onEnter={()=>{
            setTimeout(()=>{
              setToolbarSticky(true);
            },300)
          }
          } 
          onLeave={()=>{
            setTimeout(()=>{
              setToolbarSticky(false);
            },200)
          }}/>
      </Box>

      { settings.other && settings.other.wordcount ? (<Box marginTop={'5px'} color="neutral600">
        {editor.storage.characterCount.words()} {editor.storage.characterCount.words() > 1 ? 'words' : 'word'}
      </Box>) : null }

      <MediaLib
        isOpen={mediaLibVisible}
        onChange={handleChangeAssets}
        onToggle={handleToggleMediaLib}
      />
    </Wrapper>
  );
};

Editor.defaultProps = {
  value: '',
  disabled: false
};

Editor.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  editor: PropTypes.object.isRequired,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  settings: PropTypes.object
};

export default Editor;
