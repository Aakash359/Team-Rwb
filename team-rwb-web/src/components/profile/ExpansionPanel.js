import React, {memo, useMemo} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RadioButtons from './RadioButtons';
import {MILITARY_PROPS} from '../../../../shared/constants/RadioProps';
import MenuButton from './MenuButton';
import {
  ARMY_ENLISTED,
  ARMY_WARRANT,
  ARMY_OFFICER,
  MARINES_ENLISTED,
  MARINES_WARRANT,
  MARINES_OFFICER,
  NAVY_ENLISTED,
  NAVY_WARRANT,
  NAVY_OFFICER,
  AIRFORCE_ENLISTED,
  AIRFORCE_OFFICER,
  COASTGUARD_ENLISTED,
  COASTGUARD_WARRANT,
  COASTGUARD_OFFICER,
} from '../../../../shared/constants/military/ranks';
import {MILITARY_STATUSES} from '../../../../shared/constants/MilitaryStatusSlugs';
import {months, days} from '../../../../shared/constants/MonthsAndDays';
import {generateYears} from '../../../../shared/utils/Helpers';
import ToggleSwitch from '../ToggleSwitch';
import styles from './EditMyProfile.module.css';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
    marginLeft: '25px',
    display: 'flex',
  },
  svg: {
    marginRight: '10px',
  },
  expansionPanel: {
    padding: '8px 40px 16px',
  },
  typography: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
}));

const {
  status_radio_props,
  branch_radio_props,
  disability_radio_props,
  zone_radio_props,
  deployment_radio_props,
} = MILITARY_PROPS;

const ExpansionPanelComponent = memo(
  ({
    label,
    Icon,
    militaryStatus,
    militaryFamily,
    militaryBranch,
    militaryRank,
    disability,
    militaryETSMonth,
    militaryETSDay,
    militaryETSYear,
    militaryETSError,
    combatZone,
    combatZoneOperation,
    setMilitaryStatus,
    setMilitaryFamily,
    setMilitaryBranch,
    setMilitaryRank,
    setMilitaryETSMonth,
    setMilitaryETSDay,
    setMilitaryETSYear,
    rankError,
    setDisability,
    setCombatZone,
    setCombatZoneOperation,
    expanded,
  }) => {
    const classes = useStyles();

    const airForceRankData = useMemo(() => ({
      ...AIRFORCE_ENLISTED,
      ...AIRFORCE_OFFICER,
    }));
    const armyRankData = useMemo(() => ({
      ...ARMY_ENLISTED,
      ...ARMY_WARRANT,
      ...ARMY_OFFICER,
    }));
    const marinesRankData = useMemo(() => ({
      ...MARINES_ENLISTED,
      ...MARINES_WARRANT,
      ...MARINES_OFFICER,
    }));
    const navyRankData = useMemo(() => ({
      ...NAVY_ENLISTED,
      ...NAVY_WARRANT,
      ...NAVY_OFFICER,
    }));
    const coastGuardRankData = useMemo(() => ({
      ...COASTGUARD_ENLISTED,
      ...COASTGUARD_WARRANT,
      ...COASTGUARD_OFFICER,
    }));

    const getRanks = () => {
      switch (militaryBranch) {
        case 'Army':
          return armyRankData;
        case 'Air Force':
          return airForceRankData;
        case 'Marine Corps':
          return marinesRankData;
        case 'Navy':
          return navyRankData;
        case 'Coast Guard':
          return coastGuardRankData;
        default:
          return [];
      }
    };

    return (
      <div className={classes.root}>
        <ExpansionPanel expanded={expanded}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <Typography className={classes.heading}>
              <Icon className={classes.svg} /> {label}
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.expansionPanel}>
            <Typography component={'div'} className={classes.typography}>
              <RadioButtons
                label="Status"
                data={status_radio_props}
                userProp={militaryStatus}
                setMilitaryValue={setMilitaryStatus}
              />
              {militaryStatus !== MILITARY_STATUSES.civilian && (
                <RadioButtons
                  label="Military Branch"
                  data={branch_radio_props}
                  userProp={militaryBranch}
                  setMilitaryValue={setMilitaryBranch}
                  setMilitaryRank={setMilitaryRank}
                />
              )}

              {militaryStatus === 'Civilian' && (
                <>
                  <p className="bodyCopy">
                    Are you a Military Family Member? (Military family members
                    are related by blood, marriage, or adoption to an actively
                    serving member or veteran of the U.S. armed forces,
                    including one who is deceased.)
                  </p>
                  <ToggleSwitch
                    desc={"Yes, I'm a Military Family Member"}
                    value={militaryFamily}
                    onChange={() => setMilitaryFamily(!militaryFamily)}
                  />
                </>
              )}

              {militaryStatus === MILITARY_STATUSES.veteran && (
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <p
                    className={'formLabel'}
                    style={{color: militaryETSError ? 'red' : null}}>
                    Expiration Term of Service
                  </p>
                  {militaryETSError && (
                    <p style={{color: 'red'}}>
                      EXPIRATION TERM OF SERVICE MUST BE FILLED IN
                    </p>
                  )}
                  <div className={styles.etsContainer}>
                    <MenuButton
                      placeholder="Month"
                      data={months}
                      userProp={militaryETSMonth}
                      setMilitaryValue={setMilitaryETSMonth}
                    />
                    <MenuButton
                      placeholder="Day"
                      data={days}
                      userProp={militaryETSDay}
                      setMilitaryValue={setMilitaryETSDay}
                    />
                    <MenuButton
                      placeholder="Year"
                      data={generateYears()}
                      userProp={militaryETSYear}
                      setMilitaryValue={setMilitaryETSYear}
                    />
                  </div>
                </div>
              )}
              {rankError && (
                <p style={{color: 'red'}}>RANK MUST BE FILLED IN</p>
              )}
              {militaryBranch &&
                militaryBranch !== 'n/a' &&
                militaryStatus !== MILITARY_STATUSES.civilian && (
                  <MenuButton
                    label="Rank"
                    data={getRanks()}
                    userProp={militaryRank}
                    setMilitaryValue={setMilitaryRank}
                    fullWidth={true}
                  />
                )}
              {militaryStatus !== MILITARY_STATUSES.civilian && (
                <RadioButtons
                  label="Disability"
                  data={disability_radio_props}
                  userProp={disability}
                  setMilitaryValue={setDisability}
                />
              )}
              {militaryStatus !== MILITARY_STATUSES.civilian && (
                <RadioButtons
                  label="Combat Zone Deployment"
                  data={zone_radio_props}
                  userProp={combatZone}
                  setMilitaryValue={setCombatZone}
                />
              )}

              {combatZone && militaryStatus !== MILITARY_STATUSES.civilian && (
                <RadioButtons
                  label="Combat Deployment Operation"
                  data={deployment_radio_props}
                  userProp={combatZoneOperation}
                  setMilitaryValue={setCombatZoneOperation}
                />
              )}
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  },
);

export default ExpansionPanelComponent;
