/*
 *
 * HomePage
 *
 */
import {HeaderLayout, ContentLayout} from '@strapi/design-system/Layout'

import React from 'react';
import GetPostsButton from '../../components/ActionButtons/GetPostsButton';
// import PropTypes from 'prop-types';
// import pluginId from '../../pluginId';

const HomePage = () => {
  return (
    <div>
      <HeaderLayout
          title={'Manage Spammers'}
          subtitle={'Filters to help identify and delete spam users.'}
        />
        <ContentLayout>
         <GetPostsButton/>
        </ContentLayout>
    </div>
  );
};

export default HomePage;
