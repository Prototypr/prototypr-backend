import {request} from '@strapi/helper-plugin'

const manageSpamRequests= {
      getUnpublishedPosts:async({currentPage, pageSize})=>{
        const endpoint = `${process.env.STRAPI_ADMIN_BACKEND_URL}/strapi-manage-spam/get-unpublished-posts?currentPage=${currentPage}&pageSize=${pageSize}`
        return await request(endpoint, {method:'GET'})
     },
      getPotentialSpamUsers:async({currentPage, pageSize, options})=>{
        // console.log(options)
        const optionsString = encodeURIComponent(JSON.stringify(options))
        const endpoint = `${process.env.STRAPI_ADMIN_BACKEND_URL}/strapi-manage-spam/get-potential-spammers?currentPage=${currentPage}&pageSize=${pageSize}&options=${optionsString}`
        return await request(endpoint, {method:'GET'})
     },
      deleteAllPotentialSpamUsers:async(selectedRows)=>{
        const rowsToDelete = encodeURIComponent(JSON.stringify(selectedRows))

        const endpoint = `${process.env.STRAPI_ADMIN_BACKEND_URL}/strapi-manage-spam/delete-potential-spammers?ids=${rowsToDelete}`
        return await request(endpoint, {method:'GET'})
     },
   //   generateToken:async(postBody)=>{
   //    const endpoint = `${process.env.STRAPI_ADMIN_BACKEND_URL}/invite-only/generate-invite-token` 
   //    return await request(endpoint, {method:'POST', body:postBody} )
   //   }
}

export default manageSpamRequests