'use strict';

const armyMOSObj = {
  "09L": "INTERPRETER/TRANSLATOR",
  "11B": "INFANTRYMAN",
  "11C": "INDIRECT FIRE INFANTRYMAN",
  "11X": "INFANTRY ENLISTMENT OPTION",
  "11Z": "INFANTRY SENIOR SERGEANT",
  "12A": "ENGINEER SENIOR SERGEANT",
  "12B": "COMBAT ENGINEER",
  "12C": "BRIDGE CREWMEMBER",
  "12D": "DIVER",
  "12G": "QUARRYING SPECIALIST (RC)",
  "12H": "CONSTRUCTION ENGINEERING SUPERVISOR",
  "12K": "PLUMBER",
  "12M": "FIREFIGHTER",
  "12N": "HORIZONTAL CONSTRUCTION ENGINEER",
  "12P": "PRIME POWER PRODUCTION SPECIALIST",
  "12Q": "POWER LINE DISTRIBUTION SPECIALIST (RC)",
  "12R": "INTERIOR ELECTRICIAN",
  "12T": "TECHNICAL ENGINEER",
  "12V": "CONCRETE AND ASPHALT EQUIPMENT OPERATOR",
  "12W": "CARPENTRY AND MASONRY SPECIALIST",
  "12X": "GENERAL ENGINEERING SUPERVISOR",
  "12Y": "GEOSPATIAL ENGINEER",
  "12Z": "COMBAT ENGINEERING SENIOR SERGEANT",
  "13B": "CANNON CREWMEMBER",
  "13D": "FIELD ARTILLERY AUTOMATED TACTICAL DATA SYSTEM SPECIALIST",
  "13F": "FIRE SUPPORT SPECIALIST",
  "13M": "MULTIPLE LAUNCH ROCKET SYSTEM (MLRS)/HIGH MOBILITY ARTILLERY ROCKET SYSTEM (HIMARS) CREWMEMBER",
  "13P": "MULTIPLE LAUNCH ROCKET SYSTEM (MLRS) OPERATIONAL FIRE DIRECTION SPECIALIST",
  "13R": "FIELD ARTILLERY FIREFINDER RADAR OPERATOR",
  "13T": "FIELD ARTILLERY SURVEYOR/METEOROLOGICAL CREWMEMBER",
  "13Z": "FIELD ARTILLERY SENIOR SERGEANT",
  "14E": "PATRIOT FIRE CONTROL ENHANCED OPERATOR/MAINTAINER",
  "14G": "AIR DEFENSE BATTLE MANAGEMENT SYSTEM OPERATOR",
  "14H": "AIR DEFENSE ENHANCED EARLY WARNING OPERATOR",
  "14J": "AIR DEFENSE C41 TACTICAL OPERATIONS CENTER ENHANCED OPERATOR-MAINTAINER",
  "14S": "AIR AND MISSILE DEFENSE (AMD) CREWMEMBER",
  "14T": "PATRIOT LAUNCHING STATION ENHANCED OPERATOR/MAINTAINER",
  "14Z": "AIR DEFENSE ARTILLERY SENIOR SERGEANT",
  "15B": "AIRCRAFT POWERPLANT REPAIRER",
  "15D": "AIRCRAFT POWERTRAIN REPAIRER",
  "15E": "UNMANNED AIRCRAFT SYSTEMS REPAIRER",
  "15F": "AIRCRAFT ELECTRICIAN",
  "15G": "AIRCRAFT STRUCTURAL REPAIRER",
  "15H": "AIRCRAFT PNEUDRAULICS REPAIRER",
  "15J": "OH-58D ARMAMENT/ELECTRICAL/AVIONICS SYSTEMS REPAIRER",
  "15K": "AIRCRAFT COMPONENTS REPAIR SUPERVISOR",
  "15M": "UH-1 HELICOPTER REPAIRER (RC)",
  "15N": "AVIONIC MECHANIC",
  "15P": "AVIATION OPERATIONS SPECIALIST",
  "15Q": "AIR TRAFFIC CONTROL OPERATOR",
  "15R": "AH-64 ATTACK HELICOPTER REPAIRER",
  "15S": "OH-58D HELICOPTER REPAIRER",
  "15T": "UH-60 HELICOPTER REPAIRER",
  "15U": "CH-47 HELICOPTER REPAIRER",
  "15V": "OBSERVATION/SCOUT HELICOPTER REPAIRER (RC)",
  "15W": "UNMANNED AERIAL VEHICLE OPERATOR",
  "15Y": "AH-64 ARMAMENT/ELECTRICAL/AVIONIC SYSTEMS REPAIRER",
  "15Z": "AIRCRAFT MAINTENANCE SENIOR SERGEANT",
  "18B": "SPECIAL FORCES WEAPONS SERGEANT",
  "18C": "SPECIAL FORCES ENGINEER SERGEANT",
  "18D": "SPECIAL FORCES MEDICAL SERGEANT",
  "18E": "SPECIAL FORCES COMMUNICATIONS SERGEANT",
  "18F": "SPECIAL FORCES ASSISTANT OPERATIONS AND INTELLIGENCE SERGEANT",
  "18X": "SPECIAL FORCES ENLISTMENT OPTION",
  "18Z": "SPECIAL FORCES SENIOR SERGEANT",
  "19D": "CAVALRY SCOUT",
  "19K": "M1 ARMOR CREWMAN",
  "19Z": "ARMOR SENIOR SERGEANT",
  "25B": "INFORMATION TECHNOLOGY SPECIALIST",
  "25C": "RADIO OPERATOR-MAINTAINER",
  "25E": "ELECTROMAGNETIC SPECTRUM MANAGER",
  "25F": "NETWORK SWITCHING SYSTEMS OPERATOR-MAINTAINER",
  "25L": "CABLE SYSTEMS INSTALLER-MAINTAINER",
  "25M": "MULTIMEDIA ILLUSTRATOR",
  "25N": "NODAL NETWORK SYSTEMS OPERATOR-MAINTAINER",
  "25P": "MICROWAVE SYSTEMS OPERATOR-MAINTAINER",
  "25Q": "MULTICHANNEL TRANSMISSION SYSTEMS OPERATOR-MAINTAINER",
  "25R": "VISUAL INFORMATION EQUIPMENT OPERATOR-MAINTAINER",
  "25S": "SATELLITE COMMUNICATION SYSTEMS OPERATOR-MAINTAINER",
  "25T": "SATELLITE/MICROWAVE SYSTEMS CHIEF",
  "25U": "SIGNAL SUPPORT SYSTEMS SPECIALIST",
  "25V": "COMBAT DOCUMENTATION/PRODUCTION SPECIALIST",
  "25W": "TELECOMMUNICATIONS OPERATIONS CHIEF",
  "25X": "CHIEF SIGNAL NCO",
  "25Z": "VISUAL INFORMATION OPERATIONS CHIEF",
  "27D": "PARALEGAL SPECIALIST",
  "29E": "ELECTRONIC WARFARE SPECIALIST",
  "31B": "MILITARY POLICE",
  "31D": "CID SPECIAL AGENT",
  "31E": "INTERNMENT/RESETTLEMENT SPECIALIST",
  "31K": "WORKING DOG HANDLER",
  "35F": "INTELLIGENCE ANALYST",
  "35G": "GEOSPATIAL INTELLIGENCE IMAGERY ANALYST",
  "35L": "COUNTER INTELLIGENCE AGENT",
  "35M": "HUMAN INTELLIGENCE COLLECTOR",
  "35N": "SIGNALS INTELLIGENCE ANALYST",
  "35P": "CRYPTOLOGIC LINGUIST",
  "35Q": "CRYPTOLOGIC NETWORK WARFARE SPECIALIST",
  "35S": "SIGNALS COLLECTOR/ANALYST",
  "35T": "MILITARY INTELLIGENCE SYSTEMS MAINTAINER/INTEGRATOR",
  "35V": "SIGNALS INTELLIGENCE (SIGINT) SENIOR SERGEANT/SIGINT CHIEF",
  "35X": "INTELLIGENCE SENIOR SERGEANT/CHIEF INTELLIGENCE SERGEANT",
  "35Y": "CHIEF COUNTER INTELLIGENCE/HUMAN INTELLIGENCE SERGEANT",
  "35Z": "SIGNALS INTELLIGENCE (SIGINT) SENIOR SERGEANT/SIGINT CHIEF",
  "36B": "FINANCIAL MANAGEMENT TECHNICIAN",
  "37F": "PSYCHOLOGICAL OPERATIONS SPECIALIST",
  "38B": "CIVIL AFFAIRS SPECIALIST",
  "42A": "HUMAN RESOURCES SPECIALIST",
  "42R": "MUSICIAN",
  "42S": "SPECIAL BAND MUSICIAN",
  "46Q": "PUBLIC AFFAIRS SPECIALIST",
  "46R": "PUBLIC AFFAIRS BROADCAST SPECIALIST",
  "46Z": "CHIEF PUBLIC AFFAIRS NCO",
  "51C": "ACQUISITION, LOGISTICS & TECHNOLOGY (AL&T) CONTRACTING NCO",
  "56M": "CHAPLAIN ASSISTANT",
  "68A": "BIOMEDICAL EQUIPMENT SPECIALIST",
  "68B": "ORTHOPEDIC SPECIALIST",
  "68C": "PRACTICAL NURSING SPECIALIST",
  "68D": "OPERATING ROOM SPECIALIST",
  "68E": "DENTAL SPECIALIST",
  "68F": "PHYSICAL THERAPY SPECIALIST",
  "68G": "PATIENT ADMINISTRATION SPECIALIST",
  "68H": "OPTICAL LABORATORY SPECIALIST",
  "68J": "MEDICAL LOGISTICS SPECIALIST",
  "68K": "MEDICAL LABORATORY SPECIALIST",
  "68L": "OCCUPATIONAL THERAPY SPECIALIST",
  "68M": "NUTRITION CARE SPECIALIST",
  "68N": "CARDIOVASCULAR SPECIALIST",
  "68P": "RADIOLOGY SPECIALIST",
  "68Q": "PHARMACY SPECIALIST",
  "68R": "VETERINARY FOOD INSPECTION SPECIALIST",
  "68S": "PREVENTIVE MEDICINE SPECIALIST",
  "68T": "ANIMAL CARE SPECIALIST",
  "68U": "EAR, NOSE AND THROAT (ENT) SPECIALIST",
  "68V": "RESPIRATORY SPECIALIST",
  "68W": "HEALTH CARE SPECIALIST",
  "68X": "BEHAVIORAL HEALTH SPECIALIST",
  "68Y": "EYE SPECIALIST",
  "68Z": "CHIEF MEDICAL NCO",
  "74D": "CHEMICAL, BIOLOGICAL, RADIOLOGICAL, AND NUCLEAR (CBRN) SPECIALIST",
  "79R": "RECRUITER",
  "79S": "CAREER COUNSELOR",
  "79T": "RECRUITING AND RETENTION NCO (ARMY NATIONAL GUARD OF THE UNITED STATES)",
  "79V": "RETENTION AND TRANSITION NCO, USAR",
  "88H": "CARGO SPECIALIST",
  "88K": "WATERCRAFT OPERATOR",
  "88L": "WATERCRAFT ENGINEER",
  "88M": "MOTOR TRANSPORT OPERATOR",
  "88N": "TRANSPORTATION MANAGEMENT COORDINATOR",
  "88P": "RAILWAY EQUIPMENT REPAIRER (RC)",
  "88T": "RAILWAY SECTION REPAIRER (RC)",
  "88U": "RAILWAY OPERATIONS CREWMEMBER (RC)",
  "88Z": "TRANSPORTATION SENIOR SERGEANT",
  "89A": "AMMUNITION STOCK CONTROL AND ACCOUNTING SPECIALIST",
  "89B": "AMMUNITION SPECIALIST",
  "89D": "EXPLOSIVE ORDNANCE DISPOSAL SPECIALIST",
  "91A": "M1 ABRAMS TANK SYSTEM MAINTAINER",
  "91B": "WHEELED VEHICLE MECHANIC",
  "91C": "UTILITIES EQUIPMENT REPAIRER",
  "91D": "POWER-GENERATION EQUIPMENT REPAIRER",
  "91E": "ALLIED TRADES SPECIALIST",
  "91F": "SMALL ARMS/ARTILLERY REPAIRER",
  "91G": "FIRE CONTROL REPAIRER",
  "91H": "TRACK VEHICLE REPAIRER",
  "91J": "QUARTERMASTER AND CHEMICAL EQUIPMENT REPAIRER",
  "91K": "ARMAMENT REPAIRER",
  "91L": "CONSTRUCTION EQUIPMENT REPAIRER",
  "91M": "BRADLEY FIGHTING VEHICLE SYSTEM MAINTAINER",
  "91P": "ARTILLERY MECHANIC",
  "91S": "STRYKER SYSTEMS MAINTAINER",
  "91X": "MAINTENANCE SUPERVISOR",
  "91Z": "MECHANICAL MAINTENANCE SUPERVISOR",
  "94A": "LAND COMBAT ELECTRONIC MISSILE SYSTEM REPAIRER",
  "94D": "AIR TRAFFIC CONTROL EQUIPMENT REPAIRER",
  "94E": "RADIO AND COMMUNICATIONS SECURITY (COMSEC) REPAIRER",
  "94F": "COMPUTER DETECTION SYSTEMS REPAIRER",
  "94H": "TEST, MEASUREMENT, AND DIAGNOSTIC EQUIPMENT (TMDE) MAINTENANCE SUPPORT SPECIALIST",
  "94L": "AVIONIC COMMUNICATIONS EQUIPMENT REPAIRER",
  "94M": "RADAR REPAIRER",
  "94P": "MULTIPLE LAUNCH ROCKET SYSTEM REPAIRER",
  "94R": "AVIONIC AND SURVIVABILITY EQUIPMENT REPAIRER",
  "94S": "PATRIOT SYSTEM REPAIRER",
  "94T": "AVENGER SYSTEM REPAIRER",
  "94W": "ELECTRONIC MAINTENANCE CHIEF",
  "94X": "SENIOR MISSILE SYSTEMS MAINTAINER",
  "94Y": "INTEGRATED FAMILY OF TEST EQUIPMENT (IFTE) OPERATOR AND MAINTAINER",
  "94Z": "SENIOR ELECTRONIC MAINTENANCE CHIEF",
  "92A": "AUTOMATED LOGISTICAL SPECIALIST",
  "92F": "PETROLEUM SUPPLY SPECIALIST",
  "92G": "FOOD SERVICE SPECIALIST",
  "92L": "PETROLEUM LABORATORY SPECIALIST",
  "92M": "MORTUARY AFFAIRS SPECIALIST",
  "92R": "PARACHUTE RIGGER",
  "92S": "SHOWER/LAUNDRY AND CLOTHING REPAIR SPECIALIST",
  "92W": "WATER TREATMENT SPECIALIST",
  "92Y": "UNIT SUPPLY SPECIALIST",
  "92Z": "SENIOR NONCOMMISSIONED LOGISTICIAN",
};

const armyMOSArr = Object.entries(armyMOSObj);

export {
  armyMOSObj as ARMY_MOS_OBJ,
  armyMOSArr as ARMY_MOS_ARR,
};
