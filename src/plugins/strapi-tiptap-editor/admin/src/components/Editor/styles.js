import styled from "styled-components";
import { Box } from "@strapi/design-system/Box";


export default styled(Box)`
  ${({ theme }) => {
    // Uncomment this for debugging styles
    /*console.log(theme)*/
  }}

  .is-sticky{
    position:fixed;
    top:64px;
    right: 0;
    z-index:1;
    button::after{
      z-index:2;
    }
    background: ${({ theme }) => theme.colors.neutral100};
    border-top:1px solid ${({ theme }) => theme.colors.neutral200};
    .button-group {
      border-color:transparent!important;
    }
    >div{
      background:${({ theme }) => theme.colors.neutral100};
      padding:8px;
      border-radius:12px;
    }
  }
  .menu-bar {
    border-bottom:1px solid #dcdce4;
    .is-active {
      background: ${({ theme }) => theme.colors.primary200};
      color: ${({ theme }) => theme.colors.neutral0};
    }

    .button-group {
      border: 0.25em solid transparent;
    }

    &.floating {
      border: 1px solid ${({ theme }) => theme.colors.neutral200};
      background: ${({ theme }) => theme.colors.neutral100};
      box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
        rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
    }
  }

  .ProseMirror {
    outline: none;
    line-height: 1.25rem;
    color: ${({ theme }) => theme.colors.neutral800};
    min-height: 80px;

    > * + * {
      margin-top: 0.75em;
    }

    .ProseMirror-selectednode {
      border: 5px solid ${({ theme }) => theme.colors.neutral800};
      box-sizing: border-box;
    }

    strong {
      font-weight: bold;
    }

    em {
      font-style: italic;
    }

    ul,
    ol {
      margin-left: 1rem;
      padding: 0 1rem;

      li {
        margin-bottom: 0.5rem;

        &:last-child {
          margin-bottom: 0rem;
        }
      }
    }

    ul {
      li {
        list-style: disc;
      }
    }

    ol {
      li {
        list-style: decimal;
      }
    }

    code {
      background-color: rgba(#616161, 0.1);
      color: #616161;
    }

    pre {
      background: #0d0d0d;
      color: #fff;
      font-family: "JetBrainsMono", monospace;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;

      code {
        color: inherit;
        padding: 0;
        background: none;
        font-size: 0.8rem;
      }
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    blockquote {
      padding-left: 1rem;
      border-left: 2px solid rgba(#0d0d0d, 0.1);
    }

    hr {
      border: 0;
      border-top: 2px solid rgba(13, 13, 13, 0.1);
      margin: 1rem 0;
    }

    table {
      width: 100%;
      table-layout: fixed;
      border: 1px solid ${({ theme }) => theme.colors.neutral600};
      th,
      td {
        border: 1px solid ${({ theme }) => theme.colors.neutral600};
        padding: ${({ theme }) => theme.spaces[2]};

        &.selectedCell {
          background: ${({ theme }) => theme.colors.primary500};
        }
      }

      th {
        background: ${({ theme }) => theme.colors.neutral300};
        vertical-align: middle;
      }
    }



    //prototypr blog

    blockquote.wp-block-quote{
      margin: 2.5em auto;
      font-size:1.5rem;
      a{
          color:#1d3d7d;
      }
      p{
          color:#1d3d7d;
          display:inline;
      }
      cite{
        color:#6c7781;font-size:13px;margin-top:1em;position:relative;font-style:normal;
      }
      color:#1d3d7d;
      background:#fff;
      border:0px;
      font-weight: 500;
      line-height: 1.375;
      letter-spacing: -0.025em;
      cite{
          display: block;
      margin-top: 1rem;
      text-align: left;
      padding: 0px;
      margin-left: 0px;
      font-weight: normal;
      color: rgb(113, 128, 150);
      }
     }
     blockquote.wp-block-quote:before {
      margin-right: 0.2em;
      color: #334f9c;
      content: open-quote;
      quotes:\"\\201C\" \"\\201D\" \"\\2018\" \"\\2019\";      font-size: 4em;
      line-height: 0.1em;
      margin-right: 0.2em;
      vertical-align: -0.4em;
      }
      blockquote.wp-block-quote, figure.wp-block-image.size-large.full-size, figure.wp-block-image.size-full{
        max-width:46rem;
        p{
            max-width: 46rem;
            font-size:1.75rem;
            line-height:2.5rem;
        }
      }
      blockquote {
        background: #f2f5f7;
        border-top-right-radius:6px;
        border-bottom-right-radius:6px;
        border-left: 3px solid #1d3d7d;
        margin: 1.5em 10px;
        padding: 0.5em 10px;
        quotes: \"\\201C\" \"\\201D\" \"\\2018\" \"\\2019\";
        color: #1d3d7d;
        margin-bottom: 1.25rem;
        p {
            display: inline;
            font-weight: normal;
            font-style: italic;
        }
        strong{
            font-weight: normal;
        }
      }
      blockquote:before {
        color: #1d3d7d;
        content: open-quote;
        font-size: 4em;
        line-height: .1em;
        margin-right: 0.25em;
        vertical-align: -0.4em;
      }
      figcaption{
        margin-top:16px!important;
        font-size: .875rem;
        color: #718096;
        margin-top: -0.5rem;
        text-align: center;
      }
      li>p, ol>p{
        display:inline;
      }
      .fig-img{
          max-width: 100%!important;
      }
      figure>img{
          margin-bottom:0px!important;
      }
      figure>img.w-full, figure.size-large>img{
          width:46rem;
      }
      figure{
        margin-bottom: 3.6rem;
  }
      color:#2D3748;
      font-size:1.14rem;
      font-weight: 400;
      h1,h2,h3,h4,h5{
          font-family:'Noto Serif', serif;
      }
      p,li,ol, ul{
          // font-family:'Noto Serif', serif;
              line-height:30px;
              font-size:18px;
      }
       a{
          color:#2384de;
          text-decoration:underline;
      }
      p{
          margin-bottom: 1.25rem;
      }
      h1{
          // font-family:'Noto Serif';
          font-weight: 600;
          margin-top: 3.2rem;
          margin-bottom: 2.6rem;
          font-size: 2rem;
          font-weight: 500;
      }
      h2{
          margin-top: 2.8rem;
          margin-bottom: 1.5rem;
          font-size: 1.6rem!important;
          padding-bottom: 0!important;
          font-weight: 500;
          color: #1a202c;
      }
      h3{
          margin-top: 2.6rem;
          margin-bottom: 1.25rem;
          font-size: 1.5rem;
          font-weight: 500;
          color: #1a202c;
      }
      h4{
          margin-top: 2rem;
          margin-bottom: 1.25rem;
          font-size: 1.22rem;
          font-weight: 500;
          color: #1a202c;
      }

  }
`;
