import React from 'react';
import BlockedUser from './BlockedUser';

const BlockedUsersList = ({data, setNewData}) => (
  <>
    {data.map((item, i) => (
      <BlockedUser setNewData={setNewData} key={i} item={item} />
    ))}
  </>
);

export default BlockedUsersList;
