import {request} from '@strapi/helper-plugin'

const inviteOnlyRequests= {
     getUsers:async({searchTerm, currentPage, pageSize})=>{
        const endpoint = `${process.env.STRAPI_ADMIN_BACKEND_URL}/invite-only/get-users-invites?currentPage=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`
        return await request(endpoint, {method:'GET'})
     },
     generateToken:async(postBody)=>{
      const endpoint = `${process.env.STRAPI_ADMIN_BACKEND_URL}/invite-only/generate-invite-token` 
      return await request(endpoint, {method:'POST', body:postBody} )
     }
}

export default inviteOnlyRequests