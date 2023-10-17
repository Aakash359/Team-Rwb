'use strict';

const armyEnlistedRanks = {
    'PVT': 'E-1 Private',
    'PV2': 'E-2 Private',
    'PFC': 'E-3 Private First Class',
    'SPC': 'E-4 Specialist',
    'CPL': 'E-4 Corporal',
    'SGT': 'E-5 Sergeant',
    'SSG': 'E-6 Staff Sergeant',
    'SFC': 'E-7 Sergeant First Class',
    'MSG': 'E-8 Master Sergeant',
    '1SG': 'E-8 First Sergeant',
    'SGM': 'E-9 Sergeant Major',
    'CSM': 'E-9 Command Sergeant Major',
};
const armyWarrantRanks = {
    'WO1': 'W-1 Warrant Officer 1',
    'CW2': 'W-2 Chief Warrant Officer 2',
    'CW3': 'W-3 Chief Warrant Officer 3',
    'CW4': 'W-4 Chief Warrant Officer 4',
    'CW5': 'W-5 Chief Warrant Officer 5',
};
const armyOfficerRanks = {
    '2LT': 'O-1 Second Lieutenant',
    '1LT': 'O-2 First Lieutenant',
    'CPT': 'O-3 Captain',
    'MAJ': 'O-4 Major',
    'LTC': 'O-5 Lieutenant Colonel',
    'COL': 'O-6 Colonel',
    'BG':  'O-7 Brigadier General',
    'MG':  'O-8 Major General',
    'LTG': 'O-9 Lieutenant General',
    'GEN': 'O-10 General'
};

const marinesEnlistedRanks = {
    'PVT':      'E-1 Private',
    'PFC':      'E-2 Private First Class',
    'LCpl':     'E-3 Lance Corporal',
    'Cpl':      'E-4 Corporal',
    'Sgt':      'E-5 Sergeant',
    'SSgt':     'E-6 Staff Sergeant',
    'GySgt':    'E-7 Gunnery Sergeant',
    'MSgt':     'E-8 Master Sergeant',
    'FSgt':     'E-8 First Sergeant',
    'MGySgt':   'E-9 Master Gunnery Sergeant',
    'SgtMaj':   'E-9 Sergeant Major',
};
const marinesWarrantRanks = armyWarrantRanks;
const marinesOfficerRanks = armyOfficerRanks;

const navyEnlistedRanks = {
    'SR':    'E-1 Seaman Recruit',
    'SA':    'E-2 Seaman Apprentice',
    'SN':    'E-3 Seaman',
    'PO3':   'E-4 Petty Officer Third Class',
    'PO2':   'E-5 Petty Officer Second Class',
    'PO1':   'E-6 Petty Officer First Class',
    'CPO':   'E-7 Chief Petty Officer',
    'SCPO':  'E-8 Senior Chief Petty Officer',
    'MCPO':  'E-9 Master Chief Petty Officer',
    'FMCPO': 'E-9 Fleet/Command Master Chief Petty Officer',
};
const navyWarrantRanks = {
    'WO1':  'W-1 USN Warrant Officer 1',
    'CWO2': 'W-2 USN Chief Warrant Officer 2',
    'CWO3': 'W-3 USN Chief Warrant Officer 3',
    'CWO4': 'W-4 USN Chief Warrant Officer 4',
    'CWO5': 'W-5 USN Chief Warrant Officer 5',
};
const navyOfficerRanks = {
    'ENS':  'O-1 Ensign',
    'LTJG': 'O-2 Lieutenant Junior Grade',
    'LT':   'O-3 Lieutenant',
    'LCDR': 'O-4 Lieutenant Commander',
    'CDR':  'O-5 Commander',
    'CAPT': 'O-6 Captain',
    'RDML': 'O-7 Rear Admiral Lower Half',
    'RADM': 'O-8 Rear Admiral Upper Half',
    'VADM': 'O-9 Vice Admiral',
    'ADM':  'O-10 Admiral'
};

const airForceEnlistedRanks = {
    'AMB':    'E-1 Airman Basic',
    'Amn':    'E-2 Airman',
    'A1C':    'E-3 Airman First Class',
    'SrA':    'E-4 Senior Airman',
    'SSgt':   'E-5 Staff Sergeant',
    'TSgt':   'E-6 Technical Sergeant',
    'MSgt':   'E-7 Master Sergeant',
    '7Sgt':   'E-7 First Sergeant',
    'SMSgt':  'E-8 Senior Master Sergeant',
    '8Sgt':   'E-8 First Sergeant',
    'CMSgt':  'E-9 Chief Master Sergeant',
    '9Sgt':   'E-9 First Sergeant',
    'CCMSgt': 'E-9 Command Chief Master Sergeant',
};
// The Air Force has no Warrant ranks
const airForceOfficerRanks = armyOfficerRanks;

const coastGuardEnlistedRanks = {
    'SR':    'E-1 Seaman Recruit',
    'SA':    'E-2 Seaman Apprentice',
    'SN':    'E-3 Seaman',
    'PO3':   'E-4 Petty Officer Third Class',
    'PO2':   'E-5 Petty Officer Second Class',
    'PO1':   'E-6 Petty Officer First Class',
    'CPO':   'E-7 Chief Petty Officer',
    'SCPO':  'E-8 Senior Chief Petty Officer',
    'MCPO':  'E-9 Master Chief Petty Officer',
    'FMCPO': 'E-9 Fleet/Command Master Chief Petty Officer',
};
// Coast Guard has no W-1 and W-5 Warrant ranks
const coastGuardWarrantRanks = {
    'CWO2': 'W-2 Chief Warrant Officer 2',
    'CWO3': 'W-3 Chief Warrant Officer 3',
    'CWO4': 'W-4 Chief Warrant Officer 4',
};
const coastGuardOfficerRanks = navyOfficerRanks;

export {
    armyEnlistedRanks as ARMY_ENLISTED,
    armyWarrantRanks  as ARMY_WARRANT,
    armyOfficerRanks  as ARMY_OFFICER,

    marinesEnlistedRanks as MARINES_ENLISTED,
    marinesWarrantRanks  as MARINES_WARRANT,
    marinesOfficerRanks  as MARINES_OFFICER,

    navyEnlistedRanks as NAVY_ENLISTED,
    navyWarrantRanks  as NAVY_WARRANT,
    navyOfficerRanks  as NAVY_OFFICER,

    airForceEnlistedRanks as AIRFORCE_ENLISTED,
    airForceOfficerRanks  as AIRFORCE_OFFICER,

    coastGuardEnlistedRanks as COASTGUARD_ENLISTED,
    coastGuardWarrantRanks  as COASTGUARD_WARRANT,
    coastGuardOfficerRanks  as COASTGUARD_OFFICER,
};
