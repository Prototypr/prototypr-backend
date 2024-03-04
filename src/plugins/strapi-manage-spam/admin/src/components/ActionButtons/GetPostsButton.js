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
    const [providerIsGoogle, setProviderIsGoogle] = useState(false)
    const [userHasFirstName, setUserHasFirstName] = useState(false)
    const [userHasWebsite, setUserHasWebsite] = useState(false)

    const [users, setUsers] = useState(null)

    const [selectedRows, setSelectedRows] = useState([]);

    const deleteAll =async () =>{
        if(confirm(`Are you sure you want to delete all ${users?.length} users?`)){
            setDeleting(true)
            await manageSpamRequests.deleteAllPotentialSpamUsers({currentPage,pageSize, options:{
                usersWithPosts,
                userHasFirstName,
                userHasWebsite,
                providerIsMagicLink,
                providerIsGoogle
            }})
        }

        getPosts()
        
    }
    const getPosts =async () =>{
        setSelectedRows([])
        setDeleting(false)
        const data = await manageSpamRequests.getPotentialSpamUsers({currentPage,pageSize,
        options:{
            usersWithPosts,
            userHasFirstName,
            userHasWebsite,
            providerIsMagicLink,
            providerIsGoogle
        }})
        setUsers(data?.users)
    }


    const handleCheckboxChange = (userId) => {
        setSelectedRows(prevSelectedRows => {
            if (prevSelectedRows.includes(userId)) {
                return prevSelectedRows.filter(id => id !== userId);
            } else {
                return [...prevSelectedRows, userId];
            }
        });
    };

    const handleSelectAllChange = () => {
        if (selectedRows.length === users.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(users.map(user => user.id));
        }
    };

    const deleteSelectedRows = async() => {
        // Here you can call your API to delete the users by their IDs
        // For demonstration, let's just log the IDs
        console.log("Deleting rows with IDs:", selectedRows);

        if(confirm(`Are you sure you want to delete all ${selectedRows?.length} users?`)){
            setDeleting(true)
            console.log(selectedRows)
            await manageSpamRequests.deleteAllPotentialSpamUsers(selectedRows)
        }

        getPosts()
    
        // Assume deletion is successful, update the state to reflect the changes
        // This might involve fetching the updated list of users or removing the deleted users from the local state
    };


    return(
        <>
        <div style={{marginBottom:20, marginTop:-10}}>
            <p>
                This plugin displays <span style={{fontWeight:700}}>unapproved users</span> who have <span style={{fontWeight:700}}>no published posts</span>.
            </p>
        </div>
        <div style={{marginBottom:20}}>
            <Flex justifyContent="start">
                <div style={{marginRight:10}}>
                    <NumberInput placeholder="0" aria-label="Page offset" name="currentPage" hint="Page offset" error={undefined} onValueChange={value => setCurrentPage(value)} value={currentPage}/>
                </div>
                <NumberInput placeholder="10" aria-label="Page Size" name="pageSize" hint="Users per page" error={undefined} onValueChange={value => setPageSize(value)} value={pageSize} />
            </Flex>
        </div>
        <div style={{marginBottom:20}}>
            <div style={{display:'flex'}}>
            <h3 style={{marginBottom:16}}>Filters:</h3>
                <div style={{marginBottom:10, marginLeft:15}}>
                    <Checkbox onValueChange={value => setUsersWithPosts(value)} value={usersWithPosts}>Attempted at least 1 post</Checkbox>
                </div>
                <div style={{marginBottom:10, marginLeft:15}}>
                    <Checkbox onValueChange={value => setUserHasFirstName(value)} value={userHasFirstName}>First name complete</Checkbox>
                </div>
                <div style={{marginBottom:10, marginLeft:15}}>
                    <Checkbox onValueChange={value => setUserHasWebsite(value)} value={userHasWebsite}>User has website</Checkbox>
                </div>
                <div style={{marginBottom:10, marginLeft:15}}>
                    <Checkbox onValueChange={value => setProviderIsMagicLink(value)} value={providerIsMagicLink}>Signed up with email</Checkbox>
                </div>
                <div style={{marginBottom:10, marginLeft:15}}>
                    <Checkbox onValueChange={value => setProviderIsGoogle(value)} value={providerIsGoogle}>Signed up with Google provider</Checkbox>
                </div>
            </div>
        </div>
        <Button onClick={getPosts}>Find users</Button>

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
                        <BaseCheckbox 
                        checked={users.length > 0 && selectedRows.length === users.length}
                        onValueChange={handleSelectAllChange}
                        aria-label="Select all entries" />
                    </Th>
                    <Th><Typography variant="sigma">ID</Typography></Th>
                    <Th><Typography variant="sigma">Username</Typography></Th>
                    <Th><Typography variant="sigma">Email</Typography></Th>
                    <Th><Typography variant="sigma">Website</Typography></Th>
                    <Th><Typography variant="sigma">Bio</Typography></Th>
                    {/* <Th><Typography variant="sigma">Posts</Typography></Th> */}
                </Tr>
                </Thead>
                <Tbody>
                {users?.map((user) => {
                    return(
                    <Tr key={user.id}>
                        <Td>
                  <BaseCheckbox 
                  checked={selectedRows.includes(user.id)}
                  onValueChange={() => handleCheckboxChange(user.id)}
                  aria-label={`Select ${user.id}`} />
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
                    <Td><Typography textColor="neutral800">
                        <div style={{maxWidth:250, textWrap:'wrap'}}>
                            {user.bio}
                        </div>
                        </Typography></Td>
                    {/* <Td><Typography textColor="neutral800">{user?.unpublished_post_count} unpublished posts</Typography></Td> */}
                    </Tr>
                )})}
                </Tbody>
            </Table>
            </div>
            <div style={{marginTop:12}}>
                <Button
                    style={{cursor: isDeleting ? 'progress' : ''}}
                    disabled={isDeleting || selectedRows.length === 0}
                    onClick={deleteSelectedRows}
                >
                    {isDeleting ? 'Deleting...' : 'Delete selected'}
                </Button>
                {/* <Button style={{cursor:isDeleting?'progress':''}} disabled={isDeleting} onClick={deleteAll}>{isDeleting?'Deleting...':'Delete all'}</Button> */}
            </div>
        </>
    
    :null}
        </>
    )
}

export default GetPostsButton