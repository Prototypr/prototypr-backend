/*
 *
 * HomePage
 *
 */
import {HeaderLayout, ContentLayout} from '@strapi/design-system/Layout'

import React from 'react';
// import PropTypes from 'prop-types';
// import pluginId from '../../pluginId';
import UsersList from '../../components/UsersList'
const HomePage = () => {
  return (
    <div>
       <HeaderLayout
          title={'Invite Only Plugin'}
          subtitle={'Add invitations to users, who can pass them on to friends.'}
        />
        <ContentLayout>
         <UsersList/>
        </ContentLayout>
    </div>
  );
};

export default HomePage;
