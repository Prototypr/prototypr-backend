import React, { useState, useEffect } from 'react';

import { Button, NumberInput,Checkbox, Flex} from '@strapi/design-system';

import manageSpamRequests from '../../api/plugin-services';
import { Table, Thead, Tbody, Tr, Th, Td, Typography,BaseCheckbox } from '@strapi/design-system';

const GetPostsButton = ({title}) =>{

    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [isDeleting, setDeleting] = useState(false)
    const [usersWithPosts, setUsersWithPosts] = useState(true)
    const [providerIsMagicLink, setProviderIsMagicLink] = useState(true)
    const [firstNameComplete, setFirstNameComplete] = useState(false)

    const [users, setUsers] = useState(null)


    const deleteAll =async () =>{
        if(confirm(`Are you sure you want to delete all ${users?.length} users?`)){
            setDeleting(true)
            await manageSpamRequests.deleteAllPotentialSpamUsers({currentPage,pageSize, options:{
                usersWithPosts,
                firstNameComplete,
                providerIsMagicLink
            }})
        }

        getPosts()
        
    }
    const getPosts =async () =>{
        setDeleting(false)
        const data = await manageSpamRequests.getPotentialSpamUsers({currentPage,pageSize,
        options:{
            usersWithPosts,
            firstNameComplete,
            providerIsMagicLink
        }})
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
                    <NumberInput placeholder="0" aria-label="Page offset" name="currentPage" hint="Page offset" error={undefined} onValueChange={value => setCurrentPage(value)} value={currentPage}/>
                </div>
                <NumberInput placeholder="10" aria-label="Page Size" name="pageSize" hint="Users per page" error={undefined} onValueChange={value => setPageSize(value)} value={pageSize} />
            </Flex>
        </div>
        <div style={{marginBottom:10}}>
            <h3 style={{marginBottom:16}}>Show users with:</h3>
            <div style={{marginBottom:10}}>
                <Checkbox onValueChange={value => setUsersWithPosts(value)} value={usersWithPosts}>At least 1 post</Checkbox>
            </div>
            <div style={{marginBottom:10}}>
                <Checkbox onValueChange={value => setFirstNameComplete(value)} value={firstNameComplete}>First name complete</Checkbox>
            </div>
            <div style={{marginBottom:10}}>
                <Checkbox onValueChange={value => setProviderIsMagicLink(value)} value={providerIsMagicLink}>Signed up with email</Checkbox>
            </div>
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
                    <Th>
                        <BaseCheckbox aria-label="Select all entries" />
                    </Th>
                    <Th><Typography variant="sigma">ID</Typography></Th>
                    <Th><Typography variant="sigma">Username</Typography></Th>
                    <Th><Typography variant="sigma">Email</Typography></Th>
                    <Th><Typography variant="sigma">Website</Typography></Th>
                    <Th><Typography variant="sigma">Posts</Typography></Th>
                </Tr>
                </Thead>
                <Tbody>
                {users?.map((user) => {
                    return(
                    <Tr key={user.id}>
                        <Td>
                  <BaseCheckbox aria-label={`Select ${user.id}`} />
                </Td>
                    <Td><Typography textColor="neutral800">{user.id}</Typography></Td>
                    <Td>
                        <Typography textColor="neutral800">
                        <a target='_blank' style={{textDecoration:'none'}} href={`/admin/content-manager/collectionType/plugin::users-permissions.user/${user?.id}`}>
                        {user.username} →
                        </a>
                        </Typography></Td>
                    <Td><Typography textColor="neutral800">{user.email}</Typography></Td>
                    <Td><Typography textColor="neutral800">{user.website}</Typography></Td>
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