import React, { useState, useEffect } from 'react';

import { Button, NumberInput, Flex} from '@strapi/design-system';

import manageSpamRequests from '../../api/plugin-services';
import { Table, Thead, Tbody, Tr, Th, Td, Typography } from '@strapi/design-system';

const GetPostsButton = ({title}) =>{

    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [isDeleting, setDeleting] = useState(false)

    const [users, setUsers] = useState(null)


    const deleteAll =async () =>{
        if(confirm(`Are you sure you want to delete all ${users?.length} users?`)){
            setDeleting(true)
            await manageSpamRequests.deleteAllPotentialSpamUsers({currentPage,pageSize})
        }

        getPosts()
        
    }
    const getPosts =async () =>{
        setDeleting(false)
        const data = await manageSpamRequests.getPotentialSpamUsers({currentPage,pageSize})
        console.log(data)
        setUsers(data?.users)
    }


    return(
        <>
        <div style={{marginBottom:10}}>
            Get users with no published posts, who are also not approved.
        </div>
        <div style={{marginBottom:10}}>
            <Flex justifyContent="start">
                <div style={{marginRight:10}}>
                    <NumberInput placeholder="0" aria-label="Start Page" name="currentPage" hint="Current page" error={undefined} onValueChange={value => setCurrentPage(value)} value={currentPage}/>
                </div>
                <NumberInput placeholder="10" aria-label="Page Size" name="pageSize" hint="Users per page" error={undefined} onValueChange={value => setPageSize(value)} value={pageSize} />
            </Flex>
        </div>
        <Button onClick={getPosts}>Get users</Button>

        {users?.length?
        <>
            <div style={{marginTop:32, marginBottom:12}}>
                Found {users?.length} potential spam accounts
            </div>
            <div style={{maxHeight:500, overflowY:'auto'}}>
                <Table style={{marginBottom:12}}>
                <Thead>
                <Tr>
                    <Th><Typography variant="sigma">ID</Typography></Th>
                    <Th><Typography variant="sigma">Username</Typography></Th>
                    <Th><Typography variant="sigma">Posts</Typography></Th>
                </Tr>
                </Thead>
                <Tbody>
                {users?.map((user) => {
                    return(
                    <Tr key={user.id}>
                    <Td><Typography textColor="neutral800">{user.id}</Typography></Td>
                    <Td>
                        <Typography textColor="neutral800">
                        <a target='_blank' style={{textDecoration:'none'}} href={`/admin/content-manager/collectionType/plugin::users-permissions.user/${user?.id}`}>
                        {user.username} →
                        </a>
                        </Typography></Td>
                    <Td><Typography textColor="neutral800">{user?.posts?.length} unpublished posts</Typography></Td>
                    </Tr>
                )})}
                </Tbody>
            </Table>
            </div>
            <div style={{marginTop:12}}>
                <Button style={{cursor:isDeleting?'progress':''}} disabled={isDeleting} onClick={deleteAll}>{isDeleting?'Deleting...':'Delete all'}</Button>
            </div>
        </>
    
    :null}
        </>
    )
}

export default GetPostsButton