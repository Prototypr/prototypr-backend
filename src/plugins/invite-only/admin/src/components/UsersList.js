import React, { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TextInput } from '@strapi/design-system';
import { Button, Typography } from '@strapi/design-system';
import { Dialog, DialogBody, DialogFooter, Flex } from '@strapi/design-system';
import {Plus, Mail } from '@strapi/icons';
import { Field, FieldLabel, FieldInput } from '@strapi/design-system';
import { NumberInput , Tooltip, Checkbox} from '@strapi/design-system';
import {LoadingIndicatorPage} from '@strapi/helper-plugin'

import {
  SingleSelect,
  SingleSelectOption,
} from '@strapi/design-system';

import inviteOnlyRequests from '../api/invite-only';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // Number of items per page
  const [isVisible, setIsVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState(false)
  const [inviteCount, setInviteCount] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [inviteeEmail, setInviteeEmail] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [option, setOption] = useState('add')
  const [invitedVia, setInvitedVia] = useState('adminPanel')

  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

const fetchUsers = async ({concat}) => {
  if(isLoadingUsers===false && !users?.length) setIsLoadingUsers(true)

  const data = await inviteOnlyRequests.getUsers({searchTerm, currentPage, pageSize})

      if(currentPage>0 && concat!==false){
        let newUsers = users
        newUsers = newUsers.concat(data?.users);
        setUsers(newUsers);
    }else{
      setUsers(data?.users);
    }
  setIsLoadingUsers(false)

  };

  useEffect(() => {
    fetchUsers({concat:true});
  }, [currentPage, pageSize]);

  useEffect(() => {

    fetchUsers({concat:false});
  }, [searchTerm]);

  if(isLoadingUsers){
    return(
      <LoadingIndicatorPage/>
    )
  }

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
                <div style={{display:'flex'}}>
                  <Button onClick={async()=>{
                      setOption('add')
                      setSendEmail(false)
                      setSelectedUser(user)
                      setInviteCount(1)
                      setIsVisible(true)

                  }}>Add</Button>
                  <div style={{marginLeft:8}}>
                    <Button variant="secondary" onClick={async()=>{
                        setOption('send')
                        setSelectedUser(user)
                        setInviteCount(1)
                        setIsVisible(true)
                    }}>Send</Button>
                  </div>
                </div>
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

      <Dialog onClose={() => setIsVisible(false)} title={option=='send'?'Send Invite':"Add Invites"} isOpen={isVisible}>
          {/* <DialogBody icon={<ExclamationMarkCircle />}> */}
          <DialogBody>
            <Flex direction="column" alignItems="start" gap={6}>
              {/* <Flex justifyContent="center"> */}
                    <Flex direction="column" alignItems="flex-start" gap={2}>
                        <FieldLabel>Invite From</FieldLabel>
                        <FieldInput disabled={true} type="text" placeholder="test@strapi.io" value={selectedUser?.username}/>
                    </Flex>
                    {option=='send'?<Flex direction="column" alignItems="flex-start" gap={1}>
                        <FieldLabel>Invitee Email</FieldLabel>
                        <FieldInput disabled={false} type="text" placeholder="test@strapi.io"
                        onChange={e => setInviteeEmail(e.target.value)} value={inviteeEmail}
                        />
                    </Flex>:null}

                    <SingleSelect label="Invited via..." placeholder="Where is the invite from?" onClear={() => {
                      setInvitedVia(undefined);
                    }} value={invitedVia} onChange={setInvitedVia}>
                        <SingleSelectOption value="adminPanel">Admin Panel</SingleSelectOption>
                        <SingleSelectOption value="payment">Payment Complete</SingleSelectOption>
                      </SingleSelect>
                    
                    {option=='send'?<Flex direction="column" alignItems="flex-start" gap={1}>
                        <FieldLabel>Send Email?</FieldLabel>
                        <Checkbox value={sendEmail} onChange={(e)=>{setSendEmail(e.target.checked)}}>Send</Checkbox>
                    </Flex>:null}

                    

                    {option=='add'?<Flex direction="column" alignItems="flex-start" gap={1}>
                    <NumberInput placeholder="0" label="Invites" name="invites" hint="Number of invites to add to this user" error={undefined} onValueChange={value => setInviteCount(value)} value={inviteCount} labelAction={<Tooltip description="Number of invites to add to this user">
              <button aria-label="Information about the email" style={{
          border: 'none',
          padding: 0,
          background: 'transparent'
        }}>
              </button>
            </Tooltip>} />
                    </Flex>:null}
              {/* </Flex> */}
            </Flex>
          </DialogBody>
          <DialogFooter startAction={<Button onClick={() => setIsVisible(false)} variant="tertiary">
                Cancel
              </Button>} endAction={<Button
              disabled={isAdding}
              onClick={async()=>{
                setIsAdding(true)
                const response = await inviteOnlyRequests.generateToken({userId:selectedUser?.id, quantity:inviteCount,inviteeEmail:inviteeEmail, sendEmail:sendEmail, via:invitedVia })
                // const endpoint = `${process.env.STRAPI_ADMIN_BACKEND_URL}/api/invite-only/generate-invite-token` 
                // const response = await axios.post(endpoint, { userId: selectedUser?.id,quantity:inviteCount }, {
                //     headers: {
                //       'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`
                //     }
                //   });

                //refetch the users with new tokens should be there
                fetchUsers({concat:false})
                setIsVisible(false)
                setIsAdding(false)
              }}
              variant="confirm" startIcon={option=='send'?<Mail/>:<Plus />}>
                {option=='add'?'Add':option=='send'?'Send':null}
              </Button>} />
        </Dialog>
    </div>
  );
};

export default UsersList;