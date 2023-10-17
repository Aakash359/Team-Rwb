'use strict';

const status_radio_props = [
    { label: 'Veteran', value: 'Veteran' },
    { label: 'Active Duty', value: 'Active Duty' },
    { label: 'Guard', value: 'Guard' },
    { label: 'Reserve', value: 'Reserve' },
    { label: 'Civilian', value: 'Civilian' }
];

const branch_radio_props = [
    { label: 'Air Force', value: 'Air Force' },
    { label: 'Army', value: 'Army' },
    { label: 'Coast Guard', value: 'Coast Guard' },
    { label: 'Marine Corps', value: 'Marine Corps' },
    { label: 'Navy', value: 'Navy' }
];

const disability_radio_props = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
];

const zone_radio_props = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
];

const deployment_radio_props = [
    { label: 'World War II', value: 'World War II' },
    { label: 'Korean War', value: 'Korean War' },
    { label: 'Vietnam War', value: 'Vietnam War' },
    { label: 'Dominican Republic', value: 'Dominican Republic' },
    { label: 'Lebanon', value: 'Lebanon' },
    { label: 'Grenada', value: 'Grenada' },
    { label: 'Panama', value: 'Panama' },
    { label: 'Gulf War', value: 'Gulf War' },
    { label: 'Somalia', value: 'Somalia' },
    { label: 'Haiti', value: 'Haiti' },
    { label: 'Bosnia', value: 'Bosnia' },
    { label: 'Kosovo', value: 'Kosovo' },
    { label: 'Afghanistan', value: 'Afghanistan' },
    { label: 'Iraq', value: 'Iraq' },
    { label: 'Other', value: 'Other' }
];

const military_props = {
    status_radio_props,
    branch_radio_props,
    disability_radio_props,
    zone_radio_props,
    deployment_radio_props,
};


const address_type_radio_props = [
    { label: 'United States', value: 'domestic' },
    { label: 'International', value: 'international' }
];

const gender_radio_props = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Undisclosed', value: 'Undisclosed' }
];

const personal_info_props = {
    address_type_radio_props,
    gender_radio_props,
};


const anon_radio_props = [
    { label: 'Yes, I would like to make my profile public and share my name, chapter, military service, and social profile with other members on the Team RWB website and app. This setting will give you full access to all of the version 2.0 features.', value: false },
    { label: 'No, please keep my profile anonymous on the Team RWB site and app. This setting will limit your access to social and event creation features.', value: true },
];

const anonymity_props = {
    anon_radio_props,
};


const sizes_radio_props = [
    { label: 'Mens Small', value: 'Mens Small' },
    { label: 'Mens Medium', value: 'Mens Medium' },
    { label: 'Mens Large', value: 'Mens Large' },
    { label: 'Mens X-Large', value: 'Mens X-Large' },
    { label: 'Mens XX-Large', value: 'Mens XX-Large' },
    { label: 'Mens 3XL', value: 'Mens 3XL' },
    { label: 'Mens 4XL', value: 'Mens 4XL' },
    { label: 'Womens Small', value: 'Womens Small' },
    { label: 'Womens Medium', value: 'Womens Medium' },
    { label: 'Womens Large', value: 'Womens Large' },
    { label: 'Womens X-Large', value: 'Womens XL' },
    { label: 'Womens XX-Large', value: 'Womens XX-Large' }
];

const shirtsize_props = {
    sizes_radio_props,
};

export { 
    military_props as MILITARY_PROPS,
    personal_info_props as PERSONAL_INFO_PROPS,
    anonymity_props as ANON_PROPS,
    shirtsize_props as REDSHIRT_PROPS,
};
