import React, { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TextInput } from '@strapi/design-system';
import { Button, Typography } from '@strapi/design-system';
import { Dialog, DialogBody, DialogFooter, Flex } from '@strapi/design-system';
import {Plus } from '@strapi/icons';
import { Field, FieldLabel, FieldInput } from '@strapi/design-system';
import { NumberInput , Tooltip} from '@strapi/design-system';

import axios from 'axios';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // Number of items per page
  const [isVisible, setIsVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState(false)
  const [inviteCount, setInviteCount] = useState(0)
  const [isAdding, setIsAdding] = useState(false)


const fetchUsers = async ({concat}) => {
 const query = searchTerm ? `&filters[$or][0][email][$containsi]=${searchTerm}&filters[$or][1][username][$containsi]=${searchTerm}` : '';
    const response = await axios.get(`${process.env.STRAPI_ADMIN_BACKEND_URL}/api/users?start=${currentPage}&limit=${pageSize}&populate[0]=invite_codes&populate[1]=invite_code${query}`,
    {headers:{
        'Authorization': process.env.ADMIN_READONLY_TOKEN
      }}
    );
    if(currentPage>0 && concat!==false){
        let newUsers = users
        newUsers = newUsers.concat(response.data);
        setUsers(newUsers);
    }else{
      setUsers(response.data);
    }
  };

  useEffect(() => {
    fetchUsers({concat:true});
  }, [currentPage, pageSize]);

  useEffect(() => {

    fetchUsers({concat:false});
  }, [searchTerm]);


  return (
    <div>
        <div style={{marginBottom:12}}>
        <TextInput aria-label="Search users by email address"  name="search" onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search users by email address..." />
        </div>
      <Table style={{marginBottom:12}}>
        <Thead>
          <Tr>
            <Th><Typography variant="sigma">ID</Typography></Th>
            <Th><Typography variant="sigma">Username</Typography></Th>
            <Th><Typography variant="sigma">Invites</Typography></Th>
            <Th><Typography variant="sigma">Add Invites</Typography></Th>
          </Tr>
        </Thead>
        <Tbody>
          {users?.map((user) => {
            return(
            <Tr key={user.id}>
              <Td><Typography textColor="neutral800">{user.id}</Typography></Td>
              <Td><Typography textColor="neutral800">
              <a target='_blank' style={{textDecoration:'none'}} href={`/admin/content-manager/collectionType/plugin::users-permissions.user/${user?.id}`}>
                {user.username} →
                </a>
                </Typography></Td>
              <Td><Typography textColor="neutral800">{user?.invite_codes?.length ?
              <>
              <Flex gap={1}>
               { user.invite_codes.map((invite,index)=>{
                if(invite.used==false){
                return <div>
                    <a target='_blank' style={{textDecoration:'none'}} href={`/admin/content-manager/collectionType/plugin::invite-only.invite-code/${invite?.id}`}>
                    🎟️
                    </a>
                </div>
                }
              })}
              </Flex>
              <Flex style={{marginTop:5}} gap={1}>
               { user.invite_codes.map((invite,index)=>{
                if(invite.used==true){
                return <div>
                    <a target='_blank' style={{textDecoration:'line-through'}} href={`/admin/content-manager/collectionType/plugin::invite-only.invite-code/${invite?.id}`}>
                    🎫
                    </a>
                </div>
                }
              })}
              </Flex>
              </>
            :'No invites'}
              </Typography></Td>
              <Td>
                <Button onClick={async()=>{
                    setSelectedUser(user)
                    setInviteCount(1)
                    setIsVisible(true)

                }}>Add</Button>
              </Td>
            </Tr>
          )})}
        </Tbody>
      </Table>
      {/* Pagination Controls */}
      <div style={{display:'flex', justifyContent:'between', width:'100%', marginTop:12}}>
       <Button onClick={()=>{
        setCurrentPage(currentPage+pageSize)
       }} variant="secondary">Show more</Button>
      </div>

      <Dialog onClose={() => setIsVisible(false)} title="Add Invites" isOpen={isVisible}>
          {/* <DialogBody icon={<ExclamationMarkCircle />}> */}
          <DialogBody>
            <Flex direction="column" alignItems="center" gap={2}>
              <Flex justifyContent="center">
                <Field name="email" required={false}>
                    <Flex direction="column" alignItems="flex-start" gap={1}>
                        <FieldLabel>User</FieldLabel>
                        <FieldInput disabled={true} type="text" placeholder="test@strapi.io" value={selectedUser?.username}/>
                    </Flex>
                    <Flex style={{marginTop:12}} direction="column" alignItems="flex-start" gap={1}>
                    <NumberInput placeholder="0" label="Invites" name="invites" hint="Number of invites to add to this user" error={undefined} onValueChange={value => setInviteCount(value)} value={inviteCount} labelAction={<Tooltip description="Number of invites to add to this user">
              <button aria-label="Information about the email" style={{
          border: 'none',
          padding: 0,
          background: 'transparent'
        }}>
              </button>
            </Tooltip>} />
                    </Flex>
                </Field>
              </Flex>
            </Flex>
          </DialogBody>
          <DialogFooter startAction={<Button onClick={() => setIsVisible(false)} variant="tertiary">
                Cancel
              </Button>} endAction={<Button
              disabled={isAdding}
              onClick={async()=>{
                setIsAdding(true)
                const endpoint = `${process.env.STRAPI_ADMIN_BACKEND_URL}/api/invite-only/generate-invite-token` 
                const response = await axios.post(endpoint, { userId: selectedUser?.id,quantity:inviteCount }, {
                    headers: {
                      'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`
                    }
                  });
                //refetch the users with new tokens should be there
                fetchUsers({concat:false})
                setIsVisible(false)
                setIsAdding(false)
              }}
              variant="confirm" startIcon={<Plus />}>
                Add
              </Button>} />
        </Dialog>
    </div>
  );
};

export default UsersList;