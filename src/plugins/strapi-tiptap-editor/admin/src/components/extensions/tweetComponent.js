import React from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import axios from 'axios'
export default ({editor, node, getPos, selected}) => {
  // if (nodes < 2) {
    const { view } = editor

  return (
    <NodeViewWrapper className="react-component mely-editor-block">
      <div contentEditable="false"
       style={{border:selected?'2px solid black':'',position:'relative', background:'#e8f9ff', borderRadius:'12px', padding:'12px'}}
      className="content">
      <h3 style={{marginBottom:'8px'}}>Embedded Tweet:</h3>
      {node.textContent}
      <p style={{marginTop:'8px', fontSize:'12px'}}>This is the editor preview. The published version will look different.</p>
      
      <div style={{position:'absolute', top:'6px', right:'6px'}}>
        <button style={{background:'blue', padding:'6px', borderRadius:'6px', color:'white', fontSize:'13px'}} 
        onClick={async(e)=>{
            e.preventDefault();
            var newSrc= prompt("Please enter a twitter link", node.attrs.src)
            if (newSrc.startsWith('https://twitter.com')) {

            let embed = await axios.get('https://req.prototypr.io/https://publish.twitter.com/oembed?url='+newSrc)
              .then(function (response) {
                return response
              })
              .catch(function (error) {
                console.log(error);
                alert('Try a different twitter url')
                return false
              });

              if(embed){
                if(embed.data?.html){
                  var el = document.createElement('div')
                  el.innerHTML = embed.data?.html
                  var blockquote = el.outerHTML
                  const from = getPos()
                  const to = from + node.nodeSize
                  editor.chain().deleteRange({ from, to }).insertContentAt(from,blockquote).blur().run()
                }
              }

                // props.updateAttributes({src:newSrc})
            }else{
                alert('Not a supported embed. It should start with https://twitter.com')
            }
            }}>Update</button>
      </div>
      
      </div>
      {/* </div> */}
    </NodeViewWrapper>
  );
  // } else {
  //   return null;
  // }
};