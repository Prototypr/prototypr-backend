import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@strapi/design-system/Stack';
import { Box } from '@strapi/design-system/Box';
import { Field, FieldLabel, FieldHint, FieldError, FieldInput, FieldAction } from '@strapi/design-system/Field';
import { Typography } from '@strapi/design-system/Typography';
import MediaLib from '../MediaLib/index.js';
import Editor from '../Editor';
import { useIntl } from 'react-intl';
import {getSettings} from "../../../../utils/api";
import {defaultSettings} from "../../../../utils/defaults";
import { useQuery } from 'react-query';
import Earth from "@strapi/icons/Earth"

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

//custom extensions
import Iframe from "../extensions/Iframe"
import Gapcursor from "@tiptap/extension-gapcursor";
import Youtube from "@tiptap/extension-youtube";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import CodeBlock from "@tiptap/extension-code-block";
import Bold from "@tiptap/extension-bold";
import HardBreak from "@tiptap/extension-hard-break";
import Underline from "@tiptap/extension-underline";
import Italic from "@tiptap/extension-italic";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Dropcursor from "@tiptap/extension-dropcursor";
import History from "@tiptap/extension-history";
import {Blockquote} from "../extensions/Blockquote"

import {Image} from "../extensions/Image"

import Figure from "../extensions/Figure"
import FigCaption from "../extensions/FigCaption"
import {PasteFilter} from '../extensions/PasteFilter'


import Tweet from "../extensions/Tweet"
import LinkEmbed from "../extensions/LinkEmbed";
import Video from "../extensions/Video";


// import Cite from "../extensions/Cite"
// import Video from "../extensions/Video"



import Document from '@tiptap/extension-document'

// Editor
import {useEditor} from '@tiptap/react'
import {Extension, mergeAttributes, wrappingInputRule} from '@tiptap/core'
// import StarterKit from '@tiptap/starter-kit'
// import LinkExtension from '@tiptap/extension-link'
// import LinkExtension from '../extensions/Link/Link'
// import ImageExtension from '@tiptap/extension-image'
// import TextAlignExtension from '@tiptap/extension-text-align'
// import TableExtension from '@tiptap/extension-table'
// import TableRowExtension from '@tiptap/extension-table-row'
// import TableCellExtension from '@tiptap/extension-table-cell'
// import TableHeaderExtension from '@tiptap/extension-table-header'
// // import TextStyleExtension from '@tiptap/extension-text-style'
// import CharacterCountExtension from '@tiptap/extension-character-count'
// import Blockquote from '@tiptap/extension-blockquote'
// import { Color as ColorExtension } from '@tiptap/extension-color'


const Wysiwyg = ({ name, onChange, value, intlLabel, labelAction, disabled, error, description, required }) => {
  const {data: settings, isLoading} = useQuery('settings', getSettings)
  if (isLoading) return null

  //unwrap iframes from paragraphs
  // let startingVal = unWrapIframes(value)
  // startingVal = transformTweetTag(startingVal)

  return (
    <WysiwygContent
      name={name}
      onChange={onChange}
      value={value}
      intlLabel={intlLabel}
      labelAction={labelAction}
      disabled={disabled}
      error={error}
      description={description}
      required={required}
      settings={settings}
    />
  )
}

// const CSSColumnsExtension = Extension.create({
//   name: 'cssColumns',
//   addOptions() {
//     return {
//       types: [],
//       columnTypes: [2, 3],
//       defaultColumnType: 'two',
//     };
//   },
//   addGlobalAttributes() {
//     return [
//       {
//         types: this.options.types,
//         attributes: {
//           cssColumns: {
//             default: null,
//             renderHTML: attributes => {
//               if (attributes.cssColumns === null) return
//               return {
//                 style: `column-count: ${attributes.cssColumns}`,
//               }
//             },
//             parseHTML: element => element.style.columnCount || null,
//           },
//         },
//       }
//     ]
//   },
//   addCommands() {
//     return {
//       toggleColumns: (columnType) => ({commands, editor}) => {
//         if (!editor.isActive({'cssColumns': columnType})) return this.options.types.every((type) => commands.updateAttributes(type, {cssColumns: columnType}))
//         return this.options.types.every((type) => commands.resetAttributes(type, 'cssColumns'))
//       },
//       unsetColumns: (columnType) => ({commands}) => {
//         return this.options.types.every((type) => commands.resetAttributes(type, 'cssColumns'))
//       },
//     }
//   }
// })

const CustomDocument = Document.extend({
  content: "block*",
  atom: true,
});

const WysiwygContent = ({ name, onChange, value, intlLabel, labelAction, disabled, error, description, required, settings }) => {
  const { formatMessage } = useIntl();
  // const [ mergedSettings, setMergedSettings] = useState(null)

  const editor = useEditor({
    extensions: [
      CustomDocument,
      Text,
      History,
      Paragraph,
      Heading,
      Tweet,
      CodeBlock,
      HorizontalRule,
      Bold,
      HardBreak,
      Underline,
      Italic,
      ListItem,
      Gapcursor,
      BulletList,
      OrderedList,
      Dropcursor,
      // Twitter,
      Video,
      Iframe,
      Youtube,
      Blockquote,
      LinkEmbed,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: null,
          class: null,
        },
      }),

      // images are converted to figures now
      Figure,
      Image.configure({
        allowBase64: true,
      }),
      FigCaption,
      PasteFilter,
      // Figure.configure({
      //   allowBase64: true,
      // }),
      Placeholder.configure({
          includeChildren: true,
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "What's the title?";
          }
          if (node.type.name === "figcaption") {
            return "What's the title?";
          }
          if (node.type.name === "figure") {
            return "What's the title?";
          }
          if (node.type.name === "tweet") {
            return "Paste a tweet link and press enter";
          }
            return "Tell a story...";
        },
      }),
    // ],

      // // Table
      // settings.table ? TableExtension.configure({
      //   allowTableNodeSelection: true,
      // }) : null,
      // settings.table ? TableRowExtension : null,
      // settings.table ? TableCellExtension : null,
      // settings.table ? TableHeaderExtension : null,

      // settings.other && settings.other.wordcount ? CharacterCountExtension.configure() : null,

      // // CSS Columns
      // CSSColumnsExtension.configure({
      //   types: ['paragraph']
      // }),
    ],
    content: value,

    onCreate: ({ editor }) => {
      // setEditorInstance(editor);
      // setEditorCreated(true);

      const s = document.createElement("script");
      s.setAttribute("src", "https://platform.twitter.com/widgets.js");
      s.setAttribute("id", "twitter-widget");
      s.setAttribute("async", "true");
  
      if(!document.getElementById('twitter-widget')){
        document.head.appendChild(s);
      }
      // setTimeout(() => {
      // }, 1200);
    },

    onUpdate(ctx) {
      onChange({target: {name, value: ctx.editor.getHTML()}})
    },
  })

  if (editor === null) {
    return null
  }

  // Update content if value is changed outside (Mainly for i18n)
  if (editor !== null && editor.getHTML() !== value) {
    editor.commands.setContent(value)
  }

  return (
      <>
        <Stack spacing={1}>
          <Box>
            <FieldLabel action={labelAction} required={required}> {formatMessage(intlLabel)}</FieldLabel>
          </Box>
          <Editor
              key="editor"
              disabled={disabled}
              name={name}
              editor={editor}
              onChange={onChange}
              value={value}
              settings={settings}
          />
          {error &&
              <Typography variant="pi" textColor="danger600">
                {formatMessage({ id: error, defaultMessage: error })}
              </Typography>
          }
          {description &&
              <Typography variant="pi">
                {formatMessage(description)}
              </Typography>
          }
        </Stack>
      </>
  )
}

Wysiwyg.defaultProps = {
  description: '',
  disabled: false,
  error: undefined,
  intlLabel: '',
  required: false,
  value: '',
  settings: {}
};

Wysiwyg.propTypes = {
  description: PropTypes.shape({
    id: PropTypes.string,
    defaultMessage: PropTypes.string,
  }),
  disabled: PropTypes.bool,
  error: PropTypes.string,
  intlLabel: PropTypes.shape({
    id: PropTypes.string,
    defaultMessage: PropTypes.string,
  }),
  labelAction: PropTypes.object,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  value: PropTypes.string,
  settings: PropTypes.object
};

export default Wysiwyg;
