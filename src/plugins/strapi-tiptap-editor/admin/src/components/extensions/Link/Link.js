import { find } from 'linkifyjs'

import { Mark, markPasteRule, mergeAttributes } from '@tiptap/core'

import {autolink} from './helpers/autolink'
import { clickHandler } from './helpers/clickHandler'
import { pasteHandler } from './helpers/pasteHandler'

 const Link = Mark.create({
  name: 'link',

  priority: 1000,

  keepOnSplit: false,

  inclusive() {
    return this.options.autolink
  },

  addOptions() {
    return {
      openOnClick: true,
      linkOnPaste: true,
      autolink: true,
      HTMLAttributes: {
        target: '_blank',
        rel: '',
        class: null,
      },
      validate: undefined,
    }
  },

  addAttributes() {
    return {
      href: {
        default: null,
      },
      target: {
        default: this.options.HTMLAttributes.target,
      },
      class: {
        default: this.options.HTMLAttributes.class,
      },
      rel:{
        default:this.options.HTMLAttributes.rel
      }
    }
  },

  parseHTML() {
    return [
      { tag: 'a[href]:not([href *= "javascript:" i])' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      setLink: attributes => ({ chain }) => {
        return chain()
          .setMark(this.name, attributes)
          .setMeta('preventAutolink', true)
          .run()
      },

      toggleLink: attributes => ({ chain }) => {
        return chain()
          .toggleMark(this.name, attributes, { extendEmptyMarkRange: true })
          .setMeta('preventAutolink', true)
          .run()
      },

      unsetLink: () => ({ chain }) => {
        return chain()
          .unsetMark(this.name, { extendEmptyMarkRange: true })
          .setMeta('preventAutolink', true)
          .run()
      },
    }
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: text => find(text)
          .filter(link => {
            if (this.options.validate) {
              return this.options.validate(link.value)
            }

            return true
          })
          .filter(link => link.isLink)
          .map(link => ({
            text: link.value,
            index: link.start,
            data: link,
          })),
        type: this.type,
        getAttributes: match => ({
          href: match.data?.href,
        }),
      }),
    ]
  },

  addProseMirrorPlugins() {
    const plugins = []

    if (this.options.autolink) {
      plugins.push(autolink({
        type: this.type,
        validate: this.options.validate,
      }))
    }

    if (this.options.openOnClick) {
      plugins.push(clickHandler({
        type: this.type,
      }))
    }

    if (this.options.linkOnPaste) {
      plugins.push(pasteHandler({
        editor: this.editor,
        type: this.type,
      }))
    }

    return plugins
  },
})

export default Link